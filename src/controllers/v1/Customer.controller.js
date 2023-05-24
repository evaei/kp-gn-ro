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
class CustomerController extends BaseController {
  /**
   * Get Customer Data
   */
  static async getCustomerData(req, res) {
    try {
      const customer_id = req.params.id;
      if (appCache.has(customer_id)) {
        const userData = appCache.get(customer_id);
        requestHandler.sendSuccess(
          res,
          "User data retrieved successfully!"
        )(userData);
      } else {
        const options = {
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "dateOfBirth",
            "gender",
            "phoneNumber",
            "username",
            "userProfile",
          ],
          where: {
            id: customer_id,
          },
        };
        const userData = await super.getByCustomOptions(req, "users", options);
        appCache.set(customer_id, userData);
        requestHandler.sendSuccess(
          res,
          "User data retrieved successfully!"
        )(userData);
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Update Customer Data
   */
  static async udCustomerData(req, res) {
    try {
      const customer_id = req.params.id;
      const data = req.body;
      const schema = Joi.object({
        firstName: Joi.string().allow(null),
        lastName: Joi.string().allow(null),
        dateOfBirth: Joi.string().allow(null),
        gender: Joi.string().allow(null),
        phoneNumber: Joi.string().allow(null),
        username: Joi.string().allow(null),
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

      if (Object.keys(data).length) {
        await super.updateById(req, "users", data);
        if (appCache.has(customer_id)) {
          appCache.del(customer_id);
        }
        requestHandler.sendSuccess(res, "Update user successfully!")();
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
   * Update Customer Password
   */
  static async udCustomerPwd(req, res) {
    try {
      const customer_id = req.params.id;
      const data = req.body;
      const schema = Joi.object({
        email: Joi.string().email().required(),
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
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

      const options = { where: { id: customer_id } };
      const user = await super.getByCustomOptions(req, "users", options);
      if (!user) {
        requestHandler.throwError(400, "bad request", "user doesn't exist")();
      }

      await bcrypt.compare(data.oldPassword, user.passwordHash).then(
        requestHandler.throwIf(
          (r) => !r,
          400,
          "incorrect",
          "failed to change password bad credentials"
        ),
        requestHandler.throwError(500, "Invalid old password!")
      );

      const passwordHash = bcrypt.hashSync(
        data.newPassword,
        Number(config.auth.saltRounds)
      );
      const updatePwd = {
        passwordHash,
      };

      await super.updateById(req, "users", updatePwd);
      requestHandler.sendSuccess(res, "Password updated successfully!")();
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Create Customer Address
   */
  static async crCusAddress(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const data = req.body;
      const schema = Joi.object({
        addresses: Joi.string().required(),
        province: Joi.string().required(),
        district: Joi.string().required(),
        subDistrict: Joi.string().required(),
        zipcode: Joi.string().required(),
        contactNumber: Joi.string().required(),
        remark: Joi.string().allow(null, ""),
        isDefaultBilling: Joi.boolean().required(),
        isDefaultShipping: Joi.boolean().required(),
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
      data.userId = tokenUser.payload.id;

      if (data.isDefaultBilling) {
        const userOptions = {
          attributes: ["id", "userId"],
          where: {
            userId: data.userId,
            isDefaultBilling: true,
          },
        };
        const getUserAddress = await super.getByCustomOptions(
          req,
          "users_addresses",
          userOptions
        );
        if (getUserAddress?.dataValues) {
          const { id, userId } = getUserAddress.dataValues;
          const options = {
            where: {
              id,
              userId,
            },
          };
          const data = {
            isDefaultBilling: false,
          };
          await super.updateByCustomWhere(
            req,
            "users_addresses",
            data,
            options
          );
        }

        const addressData = {
          defaultBilling: data.id,
        };
        const options = {
          where: { id: data.userId },
        };
        await super.updateByCustomWhere(req, "users", addressData, options);
      }

      if (data.isDefaultShipping) {
        const userOptions = {
          attributes: ["id", "userId"],
          where: {
            userId: data.userId,
            isDefaultShipping: true,
          },
        };
        const getUserAddress = await super.getByCustomOptions(
          req,
          "users_addresses",
          userOptions
        );
        if (getUserAddress?.dataValues) {
          const { id, userId } = getUserAddress.dataValues;
          const options = {
            where: { id, userId },
          };
          const data = {
            isDefaultShipping: false,
          };
          await super.updateByCustomWhere(
            req,
            "users_addresses",
            data,
            options
          );
        }

        const addressData = {
          defaultShipping: data.id,
        };
        const options = {
          where: { id: data.userId },
        };
        await super.updateByCustomWhere(req, "users", addressData, options);
      }

      const createUserAddress = await super.create(req, "users_addresses");

      if (!_.isNull(createUserAddress)) {
        requestHandler.sendSuccess(
          res,
          "successfully created user address",
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
   * Get Customer Address by customer id
   */
  static async getCusAddress(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const customer_id = tokenUser.payload.id;
      const options = {
        attributes: [
          "id",
          "addresses",
          "province",
          "district",
          "subDistrict",
          "zipcode",
          "contactNumber",
          "remark",
          "isDefaultBilling",
          "isDefaultShipping",
        ],
        where: {
          userId: customer_id,
        },
      };
      const addressData = await super.getList(req, "users_addresses", options);
      requestHandler.sendSuccess(
        res,
        "User address retrieved successfull!"
      )(addressData);
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Update Customer Address
   */
  static async udCusAddress(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const addresssId = req.params.id;
      const customerId = tokenUser.payload.id;
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
          userId: customerId,
        },
      };
      const updateUserAddress = await super.updateByCustomWhere(
        req,
        "users_addresses",
        data,
        options
      );

      if (!_.isNull(updateUserAddress)) {
        requestHandler.sendSuccess(
          res,
          "successfully updated user address",
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
   * Delete Customer Address
   */
  static async delCusAddress(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const addresssId = req.params.id;
      const customerId = tokenUser.payload.id;

      const options = {
        where: {
          id: addresssId,
          userId: customerId,
        },
      };
      await super.deleteByIdWithOptions(req, "users_addresses", options);
      requestHandler.sendSuccess(
        res,
        "successfully deleted user address",
        200
      )();
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Update defaultBilling and defaultShipping
   */
  static async udDefaultBillShip(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const tokenUser = jwt.decode(tokenFromHeader);
      const addresssId = req.params.id;
      const defaultType = req.params.type;
      const customerId = tokenUser.payload.id;

      if (defaultType === "billing" || defaultType === "shipping") {
        const options = {
          where: {
            id: addresssId,
            userId: customerId,
          },
        };

        let data = {};
        if (defaultType === "billing") {
          data = {
            isDefaultBilling: true,
          };

          const userOptions = {
            attributes: ["id", "userId"],
            where: {
              userId: customerId,
            },
          };

          const getUserAddress = await super.getByCustomOptions(
            req,
            "users_addresses",
            userOptions
          );

          if (getUserAddress?.dataValues) {
            const { id, userId } = getUserAddress.dataValues;
            const options = {
              where: { id, userId },
            };
            const data = {
              isDefaultBilling: false,
            };
            await super.updateByCustomWhere(
              req,
              "users_addresses",
              data,
              options
            );
          }

          const addressData = {
            defaultBilling: addresssId,
          };
          const options = {
            where: { id: customerId },
          };
          await super.updateByCustomWhere(req, "users", addressData, options);
        }
        if (defaultType === "shipping") {
          data = {
            isDefaultShipping: true,
          };

          const userOptions = {
            attributes: ["id", "userId"],
            where: {
              userId: customerId,
            },
          };

          const getUserAddress = await super.getByCustomOptions(
            req,
            "users_addresses",
            userOptions
          );

          if (getUserAddress?.dataValues) {
            const { id, userId } = getUserAddress.dataValues;
            const options = {
              where: { id, userId },
            };
            const data = {
              isDefaultShipping: false,
            };
            await super.updateByCustomWhere(
              req,
              "users_addresses",
              data,
              options
            );
          }

          const addressData = {
            defaultShipping: addresssId,
          };
          const options = {
            where: { id: customerId },
          };
          await super.updateByCustomWhere(req, "users", addressData, options);
        }

        await super.updateByCustomWhere(req, "users_addresses", data, options);
        requestHandler.sendSuccess(
          res,
          "successfully updated default user address",
          200
        )();
      } else {
        requestHandler.sendSuccess(
          res,
          "something went wrong with your request, please try again later.",
          200,
          "error"
        )();
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  /**
   * Update Customer isEnabled Password
   */
  static async udCustomerIsEnabled (req,res) {
    try {
      
      const data = req.body;
      const customerId = data.customerId;
      const options = {
        where: {
          id: customerId,
        }
      }

      const dataUpdate = {
        isEnabled : data.isEnabled,
      }
      
      /**-- update --**/
      const result = await super.updateByCustomWhere(
        req,
        "users",
        dataUpdate,
        options
      );

      requestHandler.sendSuccess(
        res,
        "Users update enabled successfully!"
      )(result);
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

}

module.exports = CustomerController;
