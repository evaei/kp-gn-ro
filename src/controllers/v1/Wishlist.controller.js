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
class WishlistController extends BaseController {

    /**
   * Add Product to wishlist
   */
  static async crWishlistProd(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);

      const data = req.body;
      const schema = Joi.object({
        productId: Joi.string().allow(null),
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
      const optionsCount = {
        where : { userId : tokenUser.payload.id }
      }
      const resultCount = await super.getList(req,"users_wishlists",optionsCount);

      if(resultCount.length >= 20){
        requestHandler.throwError(400, "bad request", "Unable to add more items to your wishlist as they are full.")();
      }


      const options = {
        where : { productId : data.productId }
      }
      const result = await super.getList(req,"users_wishlists",options);

      if(result.length > 0){
        requestHandler.throwError(400, "bad request", "This product is already in your wishlist.")();
      }

      data.id = uuidv4();
      data.userId =  tokenUser.payload.id;
      const createWishlist = await super.create(req, "users_wishlists");

      if (!_.isNull(createWishlist)) {
        requestHandler.sendSuccess(
          res,
          "successfully add product to wishlist",
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
   * Get Wishlist
   */
   static async getProdWishList(req, res) {
    try {
        const options = {
            include : [
                {
                  model: req.app.get("db")["users_wishlists"],
                  as : 'wishlist',
                  on : {
                    'productId': {[Op.eq]: Sequelize.col('products.id')}
                  }
                }
              ],
          order:[["createdAt",'desc']]

        };
        
        /**-- get new --**/
        const wishlistResult = await super.getList(req, "products", options);
        
        /**-- save cache --**/
        
        
        requestHandler.sendSuccess(
          res,
          "Wishlist retrieved successfully!"
        )(wishlistResult);
      
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Delete Product in wishlist
   */
    static async delProdInWishlist (req,res) {
      try {
        const data = req.body;
        const options = {
          where: {
            id: data.productId,
          }
        }
        
        /**-- delete --**/
        const result = await super.deleteByIdWithOptions(
          req,
          "users_wishlists",
          options
        );
  
        requestHandler.sendSuccess(
          res,
          "Wishlist deleted successfully!"
        )(result);
      } catch (err) {
        requestHandler.sendError(req, res, err);
      }
    }

    /**
   * Delete Multiple Product in wishlist
   */
    static async delMultipleProdInWishlist (req,res) {
        try {
          const data = req.body;
          const options = {
            where: {
                [Op.in]: data.productListId,
            }
          }
          
          /**-- delete --**/
          const result = await super.deleteByIdWithOptions(
            req,
            "users_wishlists",
            options
          );
    
          requestHandler.sendSuccess(
            res,
            "Wishlist deleted successfully!"
          )(result);
        } catch (err) {
          requestHandler.sendError(req, res, err);
        }
      }

}

module.exports = WishlistController;
