const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const BaseController = require("../Base.controller");
const config = require("../../config/appconfig");
const auth = require("../../utils/auth");
const RequestHandler = require("../../utils/RequestHandler");
const Logger = require("../../utils/logger");
const nodecache = require("node-cache");
const e = require("express");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

const appCache = new nodecache({ stdTTL: 3600 });
class ProductController extends BaseController {
  /*------------------ Create Product ------------------*/
  static async crProduct(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);

      const data = req.body;
      const schema = Joi.object({
        categoryId: Joi.string().required(),
        name: Joi.string().required(),
        description: Joi.string(),
        price: Joi.string().required(),
        quantity: Joi.string().required(),
        weight: Joi.string().required(),
        width: Joi.string(),
        height: Joi.string(),
        length: Joi.string(),
        isPublish: Joi.string().required(),
        image: Joi.string().allow(null, ""),
      });

      const { error } = schema.validate(data);

      if (error) {
        requestHandler.validateJoi(
          error,
          400,
          "bad request",
          error ? error.details[0].message : ""
        );
      }
      /***** Create Sku *****/
      const curTime = new Date().getTime();
      let autoSku = data.name;
      const skuRegex = /[`~!@#$%^&*()_|+-=?;:'",.<>{}[]\/]/gi;
      let finalSku = autoSku.replace(skuRegex, "").replace(/ /gi, "");
      finalSku += "_S" + curTime.toString();
      /***** Create Sku *****/

      /***** Create Product *****/
      const productData = {
        id: uuidv4(),
        sellerId: tokenUser.payload.id,
        name: data.name,
        description: data.description,
        price: data.price,
        quantity: data.quantity,
        weight: data.weight,
        sku: finalSku,
        width: data.width,
        height: data.height,
        length: data.length,
        isPublish: data.isPublish,
      };
      const createNewProducts = await super.create(
        req,
        "products",
        productData
      );
      /***** Create Product *****/

      const { id } = createNewProducts;

      /***** Create Product Category *****/
      const categoryProdData = {
        categoryId: data.categoryId,
        productId: id,
      };
      const createCategoryProducts = await super.create(
        req,
        "category_products",
        categoryProdData
      );
      /***** Create Product Category *****/

      /***** Create Image *****/
      if (req.files !== undefined) {
        const { image } = req.files;
        if (image.length > 0) {
          const bulkImage = [];
          image.map((data, index) => {
            let imageData;
            if (index === 0) {
              imageData = {
                id: uuidv4(),
                productId: id,
                url: data.key,
                imagesOrder: index,
                thumbnail: true,
              };
            } else {
              imageData = {
                id: uuidv4(),
                productId: id,
                url: data.key,
                imagesOrder: index,
                thumbnail: false,
              };
            }

            bulkImage.push(imageData);
          });
          await super.bulkCreate(req, "product_images", bulkImage);
        }
      }

      /***** Create Image *****/

      if (!_.isNull(createNewProducts)) {
        requestHandler.sendSuccess(
          res,
          "successfully created new product",
          200
        )(createNewProducts);
      } else {
        requestHandler.throwError(
          422,
          "Unprocessable Entity",
          "Unable to process the contained instructions"
        );
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  static async udProduct(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);

      const product_id = req.params.id;
      const data = req.body;
      const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string(),
        price: Joi.string().required(),
        quantity: Joi.string().required(),
        weight: Joi.string().required(),
        width: Joi.string(),
        height: Joi.string(),
        length: Joi.string(),
        deleteImage: Joi.string().allow(null, ""),
        isPublish: Joi.string().required(),
        image: Joi.string().allow(null, ""),
      });

      const { error } = schema.validate(data);

      if (error) {
        requestHandler.validateJoi(
          error,
          400,
          "bad request",
          error ? error.details[0].message : ""
        );
      }

      // const createNewProducts = await super.create(req, "products");

      /***** Deleate Image *****/
      const deleteData =
        typeof data.deleteImage !== "undefined"
          ? JSON.parse(data.deleteImage)
          : [];

      if (deleteData.length > 0) {
        let imageId = [];
        deleteData.map(async (data) => {
          imageId.push(data);
        });
        const deleteOptions = {
          where: {
            id: {
              [Op.in]: imageId,
            },
          },
        };
        await super.deleteByIdWithOptions(req, "product_images", deleteOptions);
      }
      /***** Deleate Image *****/

      /***** Create Image *****/
      if (req.files !== undefined) {
        const { image } = req.files;
        if (image.length > 0) {
          const bulkImage = [];
          image.map((data, index) => {
            let imageData;
            if (data.imageOrder === "0") {
              imageData = {
                id: uuidv4(),
                productId: product_id,
                url: data.key,
                imagesOrder: data.imageOrder,
                thumbnail: true,
              };
            } else {
              imageData = {
                id: uuidv4(),
                productId: product_id,
                url: data.key,
                imagesOrder: data.imageOrder,
                thumbnail: false,
              };
            }

            bulkImage.push(imageData);
          });
          await super.bulkCreate(req, "product_images", bulkImage);
        }
      }
      /***** Create Image *****/

      /***** update seller data *****/
      const updateProduct = await super.updateById(req, "products", data);
      /***** update seller data *****/

      if (!_.isNull(updateProduct)) {
        requestHandler.sendSuccess(
          res,
          "successfully updated product",
          200
        )(updateProduct);
      } else {
        requestHandler.throwError(
          422,
          "Unprocessable Entity",
          "Unable to process the contained instructions"
        );
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  static async getProductInCategory(req, res) {
    try {
      const categoryId = req.params.category_id;

      if (appCache.has(categoryId)) {
        const productCateData = appCache.get(categoryId);
        requestHandler.sendSuccess(
          res,
          "category product data retrieved successfully!"
        )(productCateData);
      } else {
        const options = {
          include: [
            {
              model: req.app.get("db")["category_products"],
            },
            {
              model: req.app.get("db")["product_images"],
            },
          ],
          where: {
            "$category_products.categoryId$": categoryId,
            isPublish : true,
            isEnabled : true,
            isDeleted : false,
          },
        };
        const productCateData = await super.getList(req, "products", options);
        const productData = productCateData.dataValues;
        appCache.set(categoryId, productData);
        requestHandler.sendSuccess(
          res,
          "category product data retrieved successfully!"
        )(productCateData);
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  // frontend find product detail from product Id
  static async getFrontProductDetailDataFromProdId(req, res) {
    try {
      const productId = req.params.product_id;
      const options = {
        where: {
          id: productId,
          isPublish : true,
          isEnabled : true,
          isDeleted : false,
        },
        include: [
          {
            model: req.app.get("db")["category_products"],
            include: [
              {
                model: req.app.get("db")["categorys"],
              },
            ],
          },
        ],
      };
      const productData = await super.getByCustomOptions(
        req,
        "products",
        options
      );
      requestHandler.sendSuccess(
        res,
        "Product data retrieved successfully!"
      )(productData);
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }


  // back-office find product detail from product Id
  static async getBackProductDetailDataFromId(req, res) {
    try {
      const id = req.params.id;
      const options = {
        where: {
          id: id,
        },
        include: [
          {
            model: req.app.get("db")["category_products"],
            include: [
              {
                model: req.app.get("db")["categorys"],
              },
            ],
          },
        ],
      };
      const productData = await super.getByCustomOptions(
        req,
        "products",
        options
      );
      requestHandler.sendSuccess(
        res,
        "Product data retrieved successfully!"
      )(productData);
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  // back-office enabled product
  static async changeEnabledProduct (req,res) {
    try {
      const productId = req.params.id;
      const data = req.body;
      const options = {
        where: {
          id: productId,
        },
      };

      const dataUpdate = {
        isEnabled: data.isEnabled,
      };

      const productData = await super.updateByCustomWhere(
        req,
        "products",
        dataUpdate,
        options
      );

      requestHandler.sendSuccess(
        res,
        "Product update successfully!"
      )(productData);
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  // delete product
  static async deleteProduct(req, res) {
    try {
      const productId = req.params.id;
      const options = {
        where: {
          id: productId,
        },
      };

      const data = {
        isDeleted: true,
      };

      const productData = await super.updateByCustomWhere(
        req,
        "products",
        data,
        options
      );

      requestHandler.sendSuccess(
        res,
        "Product deleted successfully!"
      )(productData);
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }
}

module.exports = ProductController;
