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
class SellerGroupController extends BaseController {

    /**
   * Create Seller Group Data
   */
  static async crSellerGroupData(req, res) {
    try {
      const data = req.body;
      const schema = Joi.object({
        name: Joi.string().allow(null),
        isDisplay: Joi.string().allow(null),
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

      const createSellerGroups = await super.create(req, "seller_groups");

      if (!_.isNull(createSellerGroups)) {
        requestHandler.sendSuccess(
          res,
          "successfully created seller group",
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
   * Get Seller Group Data
   */
   static async getSellerGroupData(req, res) {
    try {
      /**-- check cache --**/
      if (appCache.has("sellerGroup")) {
        const sellerGroupData = appCache.get("sellerGroup");
        requestHandler.sendSuccess(
          res,
          "Seller data retrieved successfully!"
        )(sellerGroupData);
      } else {
        const options = {
          attributes: [
            "id",
            "name",
            "isDisplay",
          ],
          order:[["createdAt",'asc']]

        };
        
        /**-- get new --**/
        const sellerGroupData = await super.getList(req, "seller_groups", options);
        
        /**-- save cache --**/
        appCache.set("sellerGroup", sellerGroupData);
        
        requestHandler.sendSuccess(
          res,
          "Seller Group data retrieved successfully!"
        )(sellerGroupData);
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Update Seller Group Display Password
   */
    static async udSellerGroupIsdisplay (req,res) {
      try {
        
        const data = req.body;
        const sellerGroupId = data.sellerGroupId;
        const options = {
          where: {
            id: sellerGroupId,
          }
        }
  
        const dataUpdate = {
          isDisplay : data.isDisplay,
        }
        
        /**-- update --**/
        const result = await super.updateByCustomWhere(
          req,
          "seller_groups",
          dataUpdate,
          options
        );
  
        requestHandler.sendSuccess(
          res,
          "Seller group update successfully!"
        )(result);
      } catch (err) {
        requestHandler.sendError(req, res, err);
      }
    }
}

module.exports = SellerGroupController;
