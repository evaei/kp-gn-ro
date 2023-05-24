const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const BaseController = require("../Base.controller");
const config = require("../../config/appconfig");
const auth = require("../../utils/auth");
const RequestHandler = require("../../utils/RequestHandler");
const Logger = require("../../utils/logger");
const { v4: uuidv4 } = require("uuid");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class AuthController extends BaseController {
  static async userRegister(req, res) {
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
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
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
      const user = await super.getByCustomOptions(req, "users", checkOptions);
      if (user) {
        requestHandler.throwError(
          400,
          "bad request",
          "invalid email, email already existed"
        )();
      }

      const hashedPassword = bcrypt.hashSync(
        data.password,
        Number(config.auth.saltRounds)
      );
      data.passwordHash = hashedPassword;
      data.id = uuidv4();

      const createdUser = await super.create(req, "users");
      if (createdUser) {
        requestHandler.sendSuccess(res, "Successfully registered", 200)();
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

  static async userLogin(req, res) {
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
      const user = await super.getByCustomOptions(req, "users", checkOptions);
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
          "this email address was banned from our site"
        )();
      }

      const payload = _.omit(user.dataValues, [
        "groupId",
        "passwordHash",
        "jwtToken",
        "resetJwtToken",
        "userProfile",
        "recentLogin",
        "loginProvider",
        "recentLogout",
        "logoutProvider",
        "defaultBilling",
        "defaultShipping",
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

      const { platform } = req.headers;

      if (platform) {
        const options = {
          where: {
            id: user.id,
          },
        };
        const curDate = new Date();
        const updateData = {
          jwtToken: token,
          resetJwtToken: refreshToken,
          recentLogin: curDate,
          loginProvider: platform,
        };

        await bcrypt.compare(data.password, user.passwordHash).then(
          requestHandler.throwIf(
            (r) => !r,
            400,
            "incorrect",
            "failed to login bad credentials"
          ),
          requestHandler.throwError(500, "bcrypt error")
        );

        await super.updateByCustomWhere(req, "users", updateData, options);

        requestHandler.sendSuccess(
          res,
          "Logged in successfully!"
        )({ token, refreshToken });
      } else {
        requestHandler.throwError(
          400,
          "bad request",
          "please provide all required headers"
        )();
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }

  static async userLogout(req, res) {
    try {
      const tokenFromHeader = auth.getJwtToken(req);
      if (!tokenFromHeader) {
        return res.status(200).send({
          type: "error",
          message: "Failure to properly authenticate yourself in the request!",
        });
      }

      const userData = jwt.decode(tokenFromHeader);
      const { id } = userData.payload;
      const { platform } = req.headers;

      if (platform) {
        const curDate = new Date();
        const data = {
          jwtToken: null,
          resetJwtToken: null,
          recentLogout: curDate,
          logoutProvider: platform,
        };

        const options = { where: { id: id } };
        const deleteToken = await super.updateByCustomWhere(
          req,
          "users",
          data,
          options
        );

        if (deleteToken[0] === 1) {
          requestHandler.sendSuccess(res, "Logged out successfully!")();
        } else {
          requestHandler.throwError(
            400,
            "bad request",
            "Already logged out!"
          )();
        }
      } else {
        requestHandler.throwError(
          400,
          "bad request",
          "please provide all required headers"
        )();
      }
    } catch (err) {
      requestHandler.sendError(req, res, err);
    }
  }
}

module.exports = AuthController;
