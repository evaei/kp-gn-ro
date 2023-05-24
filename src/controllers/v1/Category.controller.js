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
const { v4: uuidv4 } = require("uuid");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

const appCache = new nodecache({ stdTTL: 3600 });
class CategoryController extends BaseController {

    /**
   * Create Category
   */
  static async crCategory(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);

      const data = req.body;
      const schema = Joi.object({
        categoryCode: Joi.string().allow(null),
        name: Joi.string().allow(null),
        categoryOrder: Joi.string().allow(null),
        isDisplay: Joi.string().allow(null),
        serviceFee: Joi.string().allow(null),
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
      data.createByAdminId =  tokenUser.payload.id;
      const createCategorys = await super.create(req, "categorys");

      if (!_.isNull(createCategorys)) {
        requestHandler.sendSuccess(
          res,
          "successfully created category",
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
   * Update Category
   */
   static async udCategory(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const categoryId = req.params.categoryId;
      const data = req.body;
      const schema = Joi.object({
        categoryCode: Joi.string().allow(null),
        name: Joi.string().allow(null),
        categoryOrder: Joi.string().allow(null),
        isDisplay: Joi.string().allow(null),
        serviceFee: Joi.string().allow(null),
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
      data.createByAdminId =  tokenUser.payload.id;
      const options = {
        where: {
          id: categoryId,
        }
      }

      const updateCategorys = await super.updateByCustomWhere(req, "categorys",data,options);

      if (!_.isNull(updateCategorys)) {
        requestHandler.sendSuccess(
          res,
          "successfully updated category",
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
   * Get Category
   */
   static async getCategoryList(req, res) {
    try {
      /**-- check cache --**/
      if (appCache.has("categorys")) {
        const categoryData = appCache.get("categorys");
        requestHandler.sendSuccess(
          res,
          "Seller data retrieved successfully!"
        )(categoryData);
      } else {
        const options = {
          attributes: [
            "id",
            "categoryCode",
            "name",
            "categoryOrder",
            "isDisplay",
          ],
          order:[["categoryOrder",'asc']]

        };
        
        /**-- get new --**/
        const categoryResult = await super.getList(req, "categorys", options);
        
        /**-- save cache --**/
        appCache.set("categorys", categoryResult);
        
        requestHandler.sendSuccess(
          res,
          "Category retrieved successfully!"
        )(categoryResult);
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Update Category Display Password
   */
    static async udCategoryIsdisplay (req,res) {
      try {
        const data = req.body;
        const categoryId = data.categoryId;
        const options = {
          where: {
            id: categoryId,
          }
        }
  
        const dataUpdate = {
          isDisplay : data.isDisplay,
        }
        
        /**-- update --**/
        const result = await super.updateByCustomWhere(
          req,
          "categorys",
          dataUpdate,
          options
        );
  
        requestHandler.sendSuccess(
          res,
          "Category update successfully!"
        )(result);
      } catch (err) {
        requestHandler.sendError(req, res, err);
      }
    }

    /**
   * Update Category Disable Password
   */
    static async udCategoryIsenabled (req,res) {
        try {
          const data = req.body;
          const categoryId = data.categoryId;
          const options = {
            where: {
              id: categoryId,
            }
          }
    
          const dataUpdate = {
            isEnabled : data.isEnabled,
          }
          
          /**-- update --**/
          const result = await super.updateByCustomWhere(
            req,
            "categorys",
            dataUpdate,
            options
          );
    
          requestHandler.sendSuccess(
            res,
            "Category update disable successfully!"
          )(result);
        } catch (err) {
          requestHandler.sendError(req, res, err);
        }
      }
}

module.exports = CategoryController;
