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
class HelperSellerController extends BaseController {

     /**
   * Find Seller Product Data
   */
  static async findSellerProduct(req, res,sellerId,limit,page,orderBy) {
        try {

            const options = {
                where : {
                    "sellerId" : sellerId
                },
                limit : limit,
                offset : limit * page,
                order : orderBy,
                subQuery:false
            }

            /**-- get new --**/
            const sellerProdData = await super.getList(req, "products", options);

            return sellerProdData;
        }
        catch (err) {
            requestHandler.sendError(req, res, err);
          }
    }


}

module.exports = HelperSellerController;
