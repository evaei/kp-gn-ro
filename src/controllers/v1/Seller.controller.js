const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const BaseController = require("../Base.controller");
const SellerHelperController = require("../helper/SellerHelper.controller");
const config = require("../../config/appconfig");
const auth = require("../../utils/auth");
const RequestHandler = require("../../utils/RequestHandler");
const Logger = require("../../utils/logger");
const nodecache = require("node-cache");
const { v4: uuidv4 } = require("uuid");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

const appCache = new nodecache({ stdTTL: 3600 });
class SellerController extends BaseController {

    /**
   * Get Seller Data
   */
  static async getSellerData(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const sellerId = tokenUser.payload.id;

      /****** Not collect cache ******/ 
      // if (appCache.has(seller_id)) {
      //   const sellerData = appCache.get(seller_id);
      //   requestHandler.sendSuccess(
      //     res,
      //     "Seller data retrieved successfully!"
      //   )(sellerData);
      // } else {
        /****** Not collect cache ******/ 
        const options = {
          attributes: [
            "id",
            "storeName",
            "storeDescription",
            "firstName",
            "lastName",
            "email",
            "phoneNumber",
            "groupId",
            "taxId",
            "isVacation",
          ],
          where: {
            id: sellerId,
          },
        };
        const sellerData = await super.getByCustomOptions(req, "sellers", options);
        /****** Not collect cache ******/ 
        // appCache.set(sellerId, sellerData);
        /****** Not collect cache ******/ 
        requestHandler.sendSuccess(
          res,
          "Seller data retrieved successfully!"
        )(sellerData);
      /****** Not collect cache ******/ 
        // }
      /****** Not collect cache ******/   
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

    /**
   * Create Seller Data
   */
  static async crSellerData(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const data = req.body;
      const schema = Joi.object({
        storeName: Joi.string().allow(null),
        storeDescription: Joi.string().allow(null),
        firstName: Joi.string().allow(null),
        lastName: Joi.string().allow(null),
        email: Joi.string().allow(null),
        taxId: Joi.string().allow(null),
        phoneNumber: Joi.string().allow(null),
        groupId: Joi.string().allow(null),
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
      
      /***** Set url path *****/
      let autoSku = data.storeName;

      // for chinese
      const regex = /[^a-zA-Z0-9ก-๙\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]/g;
      // for default
      // const regex = /[^a-zA-Z0-9ก-๙]/g;
      let finalSku = autoSku.replace(regex, "").replace(/ /gi, "");
      console.log(finalSku,"<<<<<< finalSku");
      data.urlPath = finalSku;
      /***** Set url path *****/


      data.id = tokenUser.payload.id;
      data.userId = tokenUser.payload.id;

      /***** Create Image *****/
      if (req.files !== undefined) {
        const { image,coverImage } = req.files;
        if (typeof image !== "undefined") {
            const dataImage = {
                sellerId: data.id,
                url: image[0].key,
                imagesOrder: 0,
                imageType: "thumbnail",
            };
            await super.create(req,"seller_images",dataImage);
          }
        if (coverImage.length > 0) {
          const bulkImage = [];
          coverImage.map((datas, index) => {
            const imageData = {
                id:uuidv4(),
                sellerId: data.id,
                url: datas.key,
                imagesOrder: index,
                imageType: "cover",
              };
            bulkImage.push(imageData);
          });
          await super.bulkCreate(req, "seller_images", bulkImage);
        }
      }
      /***** Create Image *****/

      const createSellers = await super.create(req, "sellers");

      if (!_.isNull(createSellers)) {
        requestHandler.sendSuccess(
          res,
          "successfully created seller",
          200
        )();
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

  /**
   * Update Customer Data
   */
  static async udSellerData(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);

      const data = req.body;
      const schema = Joi.object({
        storeDescription: Joi.string().allow(null),
        firstName: Joi.string().allow(null),
        lastName: Joi.string().allow(null),
        email: Joi.string().allow(null),
        taxId: Joi.string().allow(null),
        phoneNumber: Joi.string().allow(null),
        deleteImage: Joi.string().allow(null, ""),
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


      /***** Deleate Image *****/
      const deleteData =
        typeof data.deleteImage !== "undefined"
          ? JSON.parse(data.deleteImage)
          : [];

      if (deleteData.length > 0) {
        let imageId = [];
        await deleteData.map(async (data) => {
          imageId.push(data);
        });
        const deleteOptions = {
          where: {
            id: {
              [Op.in]: imageId,
            },
          },
        };
        await super.deleteByIdWithOptions(
          req,
          "seller_images",
          deleteOptions
        );
      }
      /***** Deleate Image *****/

      /***** Create Image *****/
      if (req.files !== undefined) {
        const { image,coverImage } = req.files;
        if (typeof image !== "undefined") {
            const dataImage = {
                id:uuidv4(),
                sellerId: tokenUser.payload.id,
                url: image[0].key,
                imagesOrder: 0,
                imageType: "thumbnail",
            };
            await super.create(req,"seller_images",dataImage);
          }
        if (coverImage.length > 0) {
          const bulkImage = [];
         await coverImage.map((datas, index) => {
            const imageData = {
                id:uuidv4(),
                sellerId: tokenUser.payload.id,
                url: datas.key,
                imagesOrder: index,
                imageType: "cover",
              };
            bulkImage.push(imageData);
          });
          await super.bulkCreate(req, "seller_images", bulkImage);
        }
      }
      /***** Create Image *****/

      /***** check seller data *****/
      const options = { where: { id: tokenUser.payload.id } };
      const sellers = await super.getByCustomOptions(req, "sellers", options);
      if (!sellers) {
        requestHandler.throwError(400, "bad request", "seller doesn't exist")();
      }
      /***** check seller data *****/

      if (Object.keys(data).length) {
        

        /***** update seller data *****/
        await super.updateByCustomWhere(req, "sellers", data,options);
        /***** update seller data *****/


        requestHandler.sendSuccess(res, "Update seller successfully!")();
      } else {
        requestHandler.sendSuccess(
          res,
          "Something went wrong, while updating user information, Pleaes try again later.!",
          200,
          "error"
        )();
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Create Seller Address
   */
  static async crSellerAddress(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);

      /***** check seller address data *****/
      const checkOptions = {
        "sellerId" : tokenUser.payload.id
      }
      const haveAddrResult = await super.getList(req,"seller_addresses",checkOptions);
      if(haveAddrResult.length > 0){
        requestHandler.throwError(400, "bad request", "seller already has an address.")();
      }

      /***** check seller address data *****/
      
      const data = req.body;
      const schema = Joi.object({
        addresses: Joi.string().required(),
        province: Joi.string().required(),
        district: Joi.string().required(),
        subDistrict: Joi.string().required(),
        zipcode: Joi.string().required(),
        contactNumber: Joi.string().required(),
        remark: Joi.string().allow(null, ""),
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

      data.id = uuidv4();
      data.sellerId = tokenUser.payload.id;

      const createSellerAddress = await super.create(req, "seller_addresses");

      if (!_.isNull(createSellerAddress)) {
        requestHandler.sendSuccess(
          res,
          "successfully created seller address",
          200
        )();
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

  /**
   * Update Seller Address
   */
  static async udSellerAddress(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const addresssId = req.params.id;
      const sellerId = tokenUser.payload.id;
      const data = req.body;
      const schema = Joi.object({
        addresses: Joi.string().required(),
        province: Joi.string().required(),
        district: Joi.string().required(),
        subDistrict: Joi.string().required(),
        zipcode: Joi.string().required(),
        contactNumber: Joi.string().required(),
        remark: Joi.string().allow(null, ""),
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

      const options = {
        where: {
          id: addresssId,
          sellerId: sellerId,
        },
      };
      const updateSellerAddress = await super.updateByCustomWhere(
        req,
        "seller_addresses",
        data,
        options
      );

      if (!_.isNull(updateSellerAddress)) {
        requestHandler.sendSuccess(
          res,
          "successfully updated seller address",
          200
        )();
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

  /**
   * Update Seller isEnabled Password
   */
  static async udSellerIsEnabled (req,res) {
    try {
      
      const data = req.body;
      const sellerId = data.sellerId;
      const options = {
        where: {
          id: sellerId,
        }
      }

      const dataUpdate = {
        isEnabled : data.isEnabled,
      }
      
      /**-- update --**/
      const result = await super.updateByCustomWhere(
        req,
        "sellers",
        dataUpdate,
        options
      );

      requestHandler.sendSuccess(
        res,
        "Seller update enabled successfully!"
      )(result);
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

   /**
   * Update Seller isBanned Password
   */
   static async udSellerIsBanned (req,res) {
    try {
      
      const data = req.body;
      const sellerId = data.sellerId;
      const options = {
        where: {
          id: sellerId,
        }
      }

      const dataUpdate = {
        isBanned: data.isBanned,
      }
      
      /**-- update --**/
      const result = await super.updateByCustomWhere(
        req,
        "sellers",
        dataUpdate,
        options
      );

      requestHandler.sendSuccess(
        res,
        "Seller update banned successfully!"
      )(result);
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Update Seller isVacation Password
   */
  static async udSellerIsVacation (req,res) {
    try {
      
      const data = req.body;
      const sellerId = data.sellerId;
      const options = {
        where: {
          id: sellerId,
        }
      }

      const dataUpdate = {
        isVacation: data.isVacation,
      }
      
      /**-- update --**/
      const result = await super.updateByCustomWhere(
        req,
        "sellers",
        dataUpdate,
        options
      );

      requestHandler.sendSuccess(
        res,
        "Seller update vacation successfully!"
      )(result);
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Get Seller Product
   */
  static async getSellerProduct(req,res) {

    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const sellerId = tokenUser.payload.id;
      const limit =  req.params.limit;
      const page =  req.params.page;

      const result = await SellerHelperController.findSellerProduct(req,res,sellerId,limit,page);

      if (!_.isNull(result)) {
        requestHandler.sendSuccess(
          res,
          "successfully get seller product",
          200
        )(result);
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


}

module.exports = SellerController;
