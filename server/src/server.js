const { createApp } = require("./app");
const { loadConfig } = require("./config");

const config = loadConfig();
const app = createApp(config);

app.listen(config.port, () => {
  console.log(`Odoo integration API listening on port ${config.port}`);
});
