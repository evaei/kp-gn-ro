const BaseController = require("../Base.controller");
const RequestHandler = require("../../utils/RequestHandler");
const Logger = require("../../utils/logger");

const logger = new Logger();
const requestHandler = new RequestHandler(logger);

class HealthCheck extends BaseController {
  static async healthCheck(req, res) {
    return res.send("OK");
  }
}

module.exports = HealthCheck;
