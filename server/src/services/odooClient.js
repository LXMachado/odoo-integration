const { AppError } = require("../errors");

class OdooClient {
  constructor({ url, database, apiKey, fetchImpl = fetch }) {
    this.baseUrl = normalizeBaseUrl(url);
    this.database = database;
    this.apiKey = apiKey;
    this.fetch = fetchImpl;
  }

  async call(model, method, body = {}) {
    const endpoint = buildJson2Endpoint(this.baseUrl, model, method);

    let response;
    try {
      response = await this.fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "X-Odoo-Database": this.database,
          "Content-Type": "application/json; charset=utf-8",
          "User-Agent": "odoo-integration-node",
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new AppError("Could not connect to Odoo", {
        statusCode: 502,
        code: "ODOO_CONNECTION_ERROR",
        details: error.message,
      });
    }

    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
      throw mapOdooError(response.status, responseBody);
    }

    return responseBody;
  }
}

function normalizeBaseUrl(url) {
  return String(url).replace(/\/+$/, "");
}

function buildJson2Endpoint(baseUrl, model, method) {
  const endpoint = new URL(`${normalizeBaseUrl(baseUrl)}/json/2/`);
  endpoint.pathname += `${encodeURIComponent(model)}/${encodeURIComponent(method)}`;
  return endpoint;
}

async function parseResponseBody(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (_error) {
    return { raw: text };
  }
}

function mapOdooError(status, responseBody) {
  const message = extractOdooMessage(responseBody);

  if (status === 401) {
    return new AppError("Odoo authentication failed", {
      statusCode: 401,
      code: "ODOO_AUTHENTICATION_ERROR",
      details: message,
    });
  }

  if (status === 403) {
    return new AppError("Odoo permission denied", {
      statusCode: 403,
      code: "ODOO_PERMISSION_ERROR",
      details: message,
    });
  }

  if (status === 404) {
    return new AppError("Odoo record or endpoint was not found", {
      statusCode: 404,
      code: "ODOO_NOT_FOUND",
      details: message,
    });
  }

  return new AppError("The Odoo request failed", {
    statusCode: 502,
    code: "ODOO_API_ERROR",
    details: message,
  });
}

function extractOdooMessage(responseBody) {
  if (!responseBody || typeof responseBody !== "object") {
    return undefined;
  }

  return responseBody.message || responseBody.name || responseBody.error?.message;
}

module.exports = {
  OdooClient,
  buildJson2Endpoint,
  mapOdooError,
};
