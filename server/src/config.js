const dotenv = require("dotenv");
const { AppError } = require("./errors");

dotenv.config();

const REQUIRED_ODOO_ENV = ["ODOO_URL", "ODOO_DATABASE", "ODOO_API_KEY"];

function loadConfig(env = process.env) {
  const missing = REQUIRED_ODOO_ENV.filter((key) => !env[key]);

  if (missing.length > 0) {
    throw new AppError(`Missing required environment variables: ${missing.join(", ")}`, {
      statusCode: 500,
      code: "CONFIGURATION_ERROR",
    });
  }

  return {
    odoo: {
      url: env.ODOO_URL,
      database: env.ODOO_DATABASE,
      apiKey: env.ODOO_API_KEY,
    },
    port: Number.parseInt(env.PORT || "3001", 10),
  };
}

module.exports = {
  loadConfig,
};
