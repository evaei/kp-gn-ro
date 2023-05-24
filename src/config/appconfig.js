require("dotenv").config();

module.exports = {
  app: {
    port: process.env.DEV_APP_PORT || 3001,
    appName: process.env.APP_NAME || "KASPY_GENESIS",
    env: process.env.ENV_MODE || "development",
  },
  db: {
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "kaspy_genesis_database",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    port: process.env.DB_PORT || 3306,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
  },
  winston: {
    logpath: "kaspy/logs/",
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "365d",
    saltRounds: process.env.SALT_ROUND || 10,
    refreshTokenSecret:
      process.env.REFRESH_TOKEN_SECRET || "uhwLE3mY6f8SrQuCrBs9R5==",
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "365d",
  },
};
