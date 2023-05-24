const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const BaseController = require("../Base.controller");
const config = require("../../config/appconfig");
const auth = require("../../utils/auth");
const RequestHandler = require("../../utils/RequestHandler");
const Logger = require("../../utils/logger");
const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class InternalUserController extends BaseController {
  static async adminLogin(req, res) {
    try {
      const proveKey = auth.verifyKaspyToken(req);
      if (!proveKey) {
        return res.status(200).send({
          type: "error",
          message: "Not Authorized to access this resource!",
          error: {
            status: 401,
            errorType: "Unauthorized",
          },
        });
      }

      const data = req.body;
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
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

      const checkOptions = { where: { email: data.email } };
      const user = await super.getByCustomOptions(
        req,
        "internal_users",
        checkOptions
      );
      if (!user) {
        requestHandler.throwError(
          400,
          "bad request",
          "invalid email address"
        )();
      }

      if (!user.dataValues.isEnabled) {
        requestHandler.throwError(
          200,
          "bad request",
          "this admin was disabled, can not logging in"
        )();
      }

      const payload = _.omit(user.dataValues, [
        "passwordHash",
        "jwtToken",
        "resetJwtToken",
        "recentLogin",
        "isEnabled",
        "createdAt",
        "updatedAt",
      ]);
      const token = jwt.sign({ payload }, config.auth.jwtSecret, {
        expiresIn: config.auth.jwtExpiresIn,
        algorithm: "HS512",
      });
      const refreshToken = jwt.sign(
        { payload },
        config.auth.refreshTokenSecret,
        { expiresIn: config.auth.refreshTokenExpiresIn }
      );

      await bcrypt.compare(data.password, user.passwordHash).then(
        requestHandler.throwIf(
          (r) => !r,
          400,
          "incorrect",
          "failed to login bad credentials"
        ),
        requestHandler.throwError(500, "bcrypt error")
      );

      const options = {
        where: {
          id: user.id,
        },
      };

      const updateData = {
        jwtToken: token,
        resetJwtToken: refreshToken,
        recentLogin: new Date(),
      };

      await super.updateByCustomWhere(
        req,
        "internal_users",
        updateData,
        options
      );
      requestHandler.sendSuccess(
        res,
        "Logged in successfully!"
      )({ token, refreshToken });
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  static async addNewAdmin(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const adminData = jwt.decode(tokenFromHeader);
      if (!tokenFromHeader) {
        requestHandler.throwError(
          400,
          "bad request",
          "Failure to properly authenticate yourself in the request!"
        )();
      }

      if (adminData?.payload?.role !== "admin") {
        requestHandler.throwError(400, "bad request", "You are not admin!")();
      }

      const data = req.body;
      const schema = Joi.object({
        adminCode: Joi.string().allow(null, ""),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        role: Joi.string().required(),
        gender: Joi.string().allow(null, ""),
        phoneNumber: Joi.string().allow(null, ""),
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

      const checkOptions = { where: { email: data.email } };
      const user = await super.getByCustomOptions(
        req,
        "internal_users",
        checkOptions
      );
      if (user) {
        requestHandler.throwError(400, "bad request", "email already exist")();
      }

      const hashedPassword = bcrypt.hashSync(
        data.password,
        Number(config.auth.saltRounds)
      );
      data.passwordHash = hashedPassword;
      data.id = uuidv4();
      data.isEnabled = 1;

      const createAdmin = await super.create(req, "internal_users");
      if (createAdmin) {
        requestHandler.sendSuccess(res, "Successfully registered admin", 200)();
      } else {
        requestHandler.throwError(
          422,
          "Unprocessable Entity",
          "unable to process the contained instructions"
        )();
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  static async getListEmployee(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const adminData = jwt.decode(tokenFromHeader);
      if (!tokenFromHeader) {
        requestHandler.throwError(
          400,
          "bad request",
          "Failure to properly authenticate yourself in the request!"
        )();
      }

      if (adminData?.payload?.role !== "admin") {
        requestHandler.throwError(400, "bad request", "You are not admin!")();
      }

      const options = {
        attributes: [
          "id",
          "adminCode",
          "firstName",
          "lastName",
          "email",
          "role",
          "gender",
          "phoneNumber",
          "recentLogin",
          "isEnabled",
        ],
      };

      const listEmployee = await super.getList(req, "internal_users", options);

      requestHandler.sendSuccess(
        res,
        "Retrieve Employee data successfully!"
      )(listEmployee);
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  static async getEmployeeById(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const adminData = jwt.decode(tokenFromHeader);
      if (!tokenFromHeader) {
        requestHandler.throwError(
          400,
          "bad request",
          "Failure to properly authenticate yourself in the request!"
        )();
      }

      if (adminData?.payload?.role !== "admin") {
        requestHandler.throwError(400, "bad request", "You are not admin!")();
      }

      const employeeId = req.params.id;
      const options = {
        attributes: [
          "id",
          "adminCode",
          "firstName",
          "lastName",
          "email",
          "role",
          "gender",
          "phoneNumber",
          "recentLogin",
          "isEnabled",
        ],
        where: { id: employeeId },
      };
      const employeeData = await super.getByCustomOptions(
        req,
        "internal_users",
        options
      );

      requestHandler.sendSuccess(
        res,
        "Retrieve Employee data successfully!"
      )(employeeData);
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  // not done yet
  static async updateDetailAdmin(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const adminData = jwt.decode(tokenFromHeader);
      if (!tokenFromHeader) {
        requestHandler.throwError(
          400,
          "bad request",
          "Failure to properly authenticate yourself in the request!"
        )();
      }

      if (adminData?.payload?.role !== "admin") {
        requestHandler.throwError(400, "bad request", "You are not admin!")();
      }

      const data = req.body;
      const schema = Joi.object({
        adminId: Joi.string().required(),
        adminCode: Joi.string().allow(null, ""),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        role: Joi.string().required(),
        gender: Joi.string().allow(null, ""),
        phoneNumber: Joi.string().allow(null, ""),
        oldPassword: Joi.string().allow(null, ""),
        newPassword: Joi.string().allow(null, ""),
        confirmPassword: Joi.string().required(),
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

      const newDetail = {
        adminCode: data.adminCode,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        gender: data.gender,
        phoneNumber: data.phoneNumber,
        updatedAt: new Date(),
      };
      const options = {
        id: data.adminId,
      };
      await super.updateByCustomWhere(
        req,
        "internal_users",
        newDetail,
        options
      );

      const adminDetail = await super.getByCustomOptions(
        req,
        "internal_users",
        options
      );

      const curOptions = {
        id: adminData.payload.id,
      };
      const curAdmin = await super.getByCustomOptions(
        req,
        "internal_users",
        curOptions
      );

      if (
        data.oldPassword !== "" &&
        data.newPassword !== "" &&
        data.confirmPassword
      ) {
        const checkCurAdmin = await bcrypt
          .compare(data.confirmPassword, curAdmin.dataValues.passwordHash)
          .then(
            requestHandler.throwIf(
              (r) => !r,
              400,
              "incorrect",
              "failed to change password bad credentials"
            ),
            requestHandler.throwError(
              500,
              "Current Admin Password did not match!"
            )
          );

        if (checkCurAdmin) {
          await bcrypt
            .compare(data.oldPassword, adminDetail.dataValues.passwordHash)
            .then(
              requestHandler.throwIf(
                (r) => !r,
                400,
                "incorrect",
                "failed to change password bad credentials"
              ),
              requestHandler.throwError(500, "Old password did not match!")
            );

          const newPwdHash = bcrypt.hashSync(
            data.newPassword,
            Number(config.auth.saltRounds)
          );
          const updatePwd = {
            passwordHash: newPwdHash,
          };
          await super.updateByCustomWhere(req, "internal_users", updatePwd);
        }
      }
      requestHandler.sendSuccess(res, "Update admin detail successfully!")();
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  static async updateDisable(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const adminData = jwt.decode(tokenFromHeader);
      if (!tokenFromHeader) {
        requestHandler.throwError(
          400,
          "bad request",
          "Failure to properly authenticate yourself in the request!"
        )();
      }

      if (adminData?.payload?.role !== "admin") {
        requestHandler.throwError(400, "bad request", "You are not admin!")();
      }

      const { isEnabled } = req.body;
      const data = { isEnabled };
      await super.updateById(req, "internal_users", data);
      requestHandler.sendSuccess(res, "Update Employee data successfully!")();
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  // not done yet
  static async changePassword(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const adminData = jwt.decode(tokenFromHeader);
      if (!tokenFromHeader) {
        requestHandler.throwError(
          400,
          "bad request",
          "Failure to properly authenticate yourself in the request!"
        )();
      }

      if (adminData?.payload?.role !== "admin") {
        requestHandler.throwError(400, "bad request", "You are not admin!")();
      }

      const data = req.body;
      const schema = Joi.object({
        adminId: Joi.string().required(),
        adminCode: Joi.string().allow(null, ""),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        role: Joi.string().required(),
        gender: Joi.string().allow(null, ""),
        phoneNumber: Joi.string().allow(null, ""),
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
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  static async adminLogout(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      const adminData = jwt.decode(tokenFromHeader);
      if (!tokenFromHeader) {
        return res.status(200).send({
          type: "error",
          message: "Failure to properly authenticate yourself in the request!",
        });
      }

      const { id } = adminData.payload;
      const data = {
        jwtToken: null,
        resetJwtToken: null,
      };
      const options = { where: { id, jwtToken: { [Op.not]: null } } };
      const deleteToken = await super.updateByCustomWhere(
        req,
        "internal_users",
        data,
        options
      );

      if (deleteToken[0] === 1) {
        requestHandler.sendSuccess(res, "Logged out successfully!")();
      } else {
        requestHandler.throwError(400, "bad request", "Already logged out!")();
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }
}

module.exports = InternalUserController;
