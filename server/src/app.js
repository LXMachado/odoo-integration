const express = require("express");
const { OdooClient } = require("./services/odooClient");
const { createContactsRouter } = require("./routes/contacts");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

function createApp(config) {
  const app = express();
  const odooClient = new OdooClient(config.odoo);

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/contacts", createContactsRouter(odooClient));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};
