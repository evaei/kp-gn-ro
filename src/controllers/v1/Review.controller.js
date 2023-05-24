const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { Op } = require('sequelize');
const { Sequelize } = require('../../models');
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
class ReviewController extends BaseController {

    /**
   * Create Review
   */
  static async crReviewProd(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);

      const data = req.body;
      const schema = Joi.object({
        orderId: Joi.string().allow(null),
        sellerId: Joi.string().allow(null),
        productId: Joi.string().allow(null),
        comment: Joi.string().allow(null),
        rate: Joi.string().allow(null),
        productName: Joi.string().allow(null),
        productImgUrl: Joi.string().allow(null),

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
      data.userId =  tokenUser.payload.id;
      data.isEnabled = true;
      const createReviewProd = await super.create(req, "review_products");

      if (!_.isNull(createReviewProd)) {
        requestHandler.sendSuccess(
          res,
          "successfully review product",
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
   * Get All review
   */
   static async getAllReviewList(req, res) {
    try {
        const page = req.params.page;
        const limit = req.params.limit;
        const options = {
          order:[["createdAt",'desc']],
          offset: limit * page,
          limit: parseInt(limit),
          subQuery:false,
        };
        
        /**-- get new --**/
        const resultReviewProd = await super.getList(req, "review_products", options);
        
        /**-- save cache --**/
        
        
        requestHandler.sendSuccess(
          res,
          "Review retrieved successfully!"
        )(resultReviewProd);
      
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

   /**
   * Get Product review
   */
   static async getProdReviewList(req, res) {
    try {
        const productId = req.params.id;
        const page = req.params.page;
        const limit = req.params.limit;
        const options = {
           where : {
            productId : productId
           },
          order:[["createdAt",'desc']],
          offset: limit * page,
          limit: parseInt(limit),
          subQuery:false,
        };
        
        /**-- get new --**/
        const resultReviewProd = await super.getList(req, "review_products", options);
        
        /**-- save cache --**/
        
        
        requestHandler.sendSuccess(
          res,
          "Review product retrieved successfully!"
        )(resultReviewProd);
      
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Get Seller Product review
   */
  static async getSellerProdReviewList(req, res) {
    try {
        const sellerId = req.params.id;
        const page = req.params.page;
        const limit = req.params.limit;
        const options = {
           where : {
            sellerId : sellerId
           },
          order:[["createdAt",'desc']],
          offset: limit * page,
          limit: parseInt(limit),
          subQuery:false,
        };
        
        /**-- get new --**/
        const resultReviewProd = await super.getList(req, "review_products", options);
        
        /**-- save cache --**/
        
        
        requestHandler.sendSuccess(
          res,
          "Review product retrieved successfully!"
        )(resultReviewProd);
      
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Enabled/Disabled Product Review
   */
    static async enabledProdReview (req,res) {
      try {
        const reviewId = req.params.id;
        const data = req.body;
        const schema = Joi.object({
            isEnabled: Joi.string().allow(null),
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
            id: reviewId,
          }
        }

        /**-- update --**/
        const result = await super.updateByCustomWhere(
          req,
          "review_products",
          data,
          options
        );
  
        requestHandler.sendSuccess(
          res,
          "Review update successfully!"
        )(result);
      } catch (err) {
        requestHandler.sendError(req, res, err);
      }
    }

}

module.exports = ReviewController;
