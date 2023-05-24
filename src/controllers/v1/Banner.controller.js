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
class BannerController extends BaseController {

    /**
   * Create Category
   */
  static async crBanner(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);

      const data = req.body;
      const schema = Joi.object({
        title: Joi.string().allow(null),
        linkurl: Joi.string().allow(null),
        isEnabled: Joi.string().allow(null),
        position: Joi.string().allow(null),
        startAt: Joi.string().allow(null),
        endAt: Joi.string().allow(null),
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

      /***** Create Image *****/
      if (req.files !== undefined) {
        const { imageWeb,imageMobile } = req.files;
        if (typeof imageWeb !== "undefined") {
            data.webImageUrl = imageWeb[0].key;
        }

        if (typeof imageMobile !== "undefined") {
            data.mobileImageUrl = imageMobile[0].key;
        }
      }
      /***** Create Image *****/

      const createBanners = await super.create(req, "banners");

      if (!_.isNull(createBanners)) {
        requestHandler.sendSuccess(
          res,
          "successfully created banner",
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
   * Update Banner Data
   */
  static async udBanner(req, res) {
    try {
      
      const data = req.body;
      const schema = Joi.object({
        title: Joi.string().allow(null),
        linkurl: Joi.string().allow(null),
        isEnabled: Joi.string().allow(null),
        position: Joi.string().allow(null),
        startAt: Joi.string().allow(null),
        endAt: Joi.string().allow(null),
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

      /***** Create Image *****/
      if (req.files !== undefined) {
        const { webImageUrl,mobileImageUrl } = req.files;
        const { imageWeb,imageMobile } = req.files;
        if (typeof imageWeb !== "undefined") {
            data.webImageUrl = imageWeb[0].key;
        }

        if (typeof imageMobile !== "undefined") {
            data.mobileImageUrl = imageMobile[0].key;
        }
      }
      /***** Create Image *****/


      if (Object.keys(data).length) {
        /***** update banner data *****/
        const options = { where: { id: data.sellerId } };
        await super.updateByCustomWhere(req, "banners", data ,options);
        /***** update banner data *****/


        requestHandler.sendSuccess(res, "Update banner successfully!")();
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
   * Get Category
   */
  static async getBannerList(req, res) {
    try {
      /**-- check cache --**/
      if (appCache.has("banners")) {
        const categoryData = appCache.get("banners");
        requestHandler.sendSuccess(
          res,
          "Banner data retrieved successfully!"
        )(categoryData);
      } else {
        var date = new Date();
        var now_utc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),date.getUTCDate());
        const nowDate = new Date(now_utc);

        const options = {
          attributes: [
            "id",
            "title",
            "linkurl",
            "webImageUrl",
            "mobileImageUrl",
          ],
          where : { 
            isEnabled : true,  
            startAt : {
                [Op.lte]: nowDate
            },
            endAt : {
                [Op.gte]: nowDate
            },
            },
          order:[["position",'asc']]

        };
        
        /**-- get new --**/
        const bannerResult = await super.getList(req, "banners", options);
        
        /**-- save cache --**/
        appCache.set("banners", bannerResult);
        
        requestHandler.sendSuccess(
          res,
          "Banner retrieved successfully!"
        )(bannerResult);
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Update Banner Display Password
   */
    static async udBannerIsEnabled (req,res) {
      try {
        const data = req.body;
        const bannerId = data.bannerId;
        const options = {
          where: {
            id: bannerId,
          }
        }
  
        const dataUpdate = {
            isEnabled : data.isEnabled,
        }
        
        /**-- update --**/
        const result = await super.updateByCustomWhere(
          req,
          "banners",
          dataUpdate,
          options
        );
  
        requestHandler.sendSuccess(
          res,
          "Banner update successfully!"
        )(result);
      } catch (err) {
        requestHandler.sendError(req, res, err);
      }
    }

}

module.exports = BannerController;
