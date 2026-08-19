const assert = require("node:assert/strict");
const test = require("node:test");
const { buildJson2Endpoint, mapOdooError } = require("../src/services/odooClient");

test("buildJson2Endpoint creates the expected JSON-2 URL", () => {
  const endpoint = buildJson2Endpoint("http://localhost:8069/", "res.partner", "search_read");

  assert.equal(endpoint.toString(), "http://localhost:8069/json/2/res.partner/search_read");
});

test("mapOdooError maps authentication and general failures", () => {
  const authError = mapOdooError(401, { message: "invalid key" });
  assert.equal(authError.statusCode, 401);
  assert.equal(authError.code, "ODOO_AUTHENTICATION_ERROR");

  const apiError = mapOdooError(500, { message: "server error" });
  assert.equal(apiError.statusCode, 502);
  assert.equal(apiError.code, "ODOO_API_ERROR");
});
