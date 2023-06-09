const jwt = require("jsonwebtoken");
const _ = require("lodash");
const config = require("../config/appconfig");
const RequestHandler = require("../utils/RequestHandler");
const Logger = require("../utils/logger");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

const getTokenFromHeader = (req) => {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
};

const verifyToken = (req, res, next) => {
  try {
    if (_.isUndefined(req.headers.authorization)) {
      requestHandler.throwError(
        401,
        "Unauthorized",
        "Not Authorized to access this resource!"
      )();
    }
    const Bearer = req.headers.authorization.split(" ")[0];

    if (!Bearer || Bearer !== "Bearer") {
      requestHandler.throwError(
        401,
        "Unauthorized",
        "Not Authorized to access this resource!"
      )();
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      requestHandler.throwError(
        401,
        "Unauthorized",
        "Not Authorized to access this resource!"
      )();
    }


    // verifies secret and checks exp
    jwt.verify(token, config.auth.jwtSecret, (err, decoded) => {
      if (err) {
        requestHandler.throwError(
          401,
          "Unauthorized",
          "please provide a valid token or your token might be expired"
        )();
      }
      req.decoded = decoded;
      next();
    });
  } catch (err) {
    requestHandler.sendError(req, res, err);
  }
};

/**
 * @param {*} req
 * @return boolean TRUE | FALSE
 */
const verifyKaspyToken = (req) => {
  const checkKey = req.headers["x-api-kaspy"];
  const proveKey = checkKey === process.env.KASPY_SECRET;
  if (!proveKey) {
    return false;
  }
  return true;
};

module.exports = {
  getJwtToken: getTokenFromHeader,
  isAuth: verifyToken,
  verifyKaspyToken: verifyKaspyToken,
};
