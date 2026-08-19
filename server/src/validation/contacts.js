const { AppError } = require("../errors");

const CONTACT_FIELDS = ["name", "email", "phone", "is_company"];
const CONTACT_RESPONSE_FIELDS = ["id", ...CONTACT_FIELDS];
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parseLimit(value) {
  if (value === undefined) {
    return DEFAULT_LIMIT;
  }

  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1) {
    throw validationError("limit must be a positive integer");
  }

  return Math.min(limit, MAX_LIMIT);
}

function parseContactId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw validationError("id must be a positive integer");
  }

  return id;
}

function validateCreateContact(body) {
  const sanitized = sanitizeContactBody(body, { requireName: true });
  if (!sanitized.name || sanitized.name.trim() === "") {
    throw validationError("name is required");
  }

  sanitized.name = sanitized.name.trim();
  return sanitized;
}

function validateUpdateContact(body) {
  const sanitized = sanitizeContactBody(body, { requireName: false });

  if (Object.keys(sanitized).length === 0) {
    throw validationError("At least one allowed field is required");
  }

  if (Object.prototype.hasOwnProperty.call(sanitized, "name")) {
    if (!sanitized.name || sanitized.name.trim() === "") {
      throw validationError("name cannot be empty");
    }
    sanitized.name = sanitized.name.trim();
  }

  return sanitized;
}

function sanitizeContactBody(body, { requireName }) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw validationError("Request body must be a JSON object");
  }

  const unknownFields = Object.keys(body).filter((field) => !CONTACT_FIELDS.includes(field));
  if (unknownFields.length > 0) {
    throw validationError(`Unknown field(s): ${unknownFields.join(", ")}`);
  }

  if (requireName && !Object.prototype.hasOwnProperty.call(body, "name")) {
    throw validationError("name is required");
  }

  const sanitized = {};

  for (const field of CONTACT_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) {
      continue;
    }

    const value = body[field];

    if (["name", "email", "phone"].includes(field)) {
      if (value !== null && typeof value !== "string") {
        throw validationError(`${field} must be a string`);
      }
      sanitized[field] = value;
      continue;
    }

    if (field === "is_company") {
      if (typeof value !== "boolean") {
        throw validationError("is_company must be a boolean");
      }
      sanitized[field] = value;
    }
  }

  return sanitized;
}

function validationError(detail) {
  return new AppError("Invalid request data", {
    statusCode: 400,
    code: "VALIDATION_ERROR",
    details: detail,
  });
}

module.exports = {
  CONTACT_RESPONSE_FIELDS,
  MAX_LIMIT,
  parseLimit,
  parseContactId,
  validateCreateContact,
  validateUpdateContact,
};
