const assert = require("node:assert/strict");
const test = require("node:test");
const {
  MAX_LIMIT,
  parseContactId,
  parseLimit,
  validateCreateContact,
  validateUpdateContact,
} = require("../src/validation/contacts");

test("parseLimit defaults, validates, and clamps", () => {
  assert.equal(parseLimit(undefined), 20);
  assert.equal(parseLimit("5"), 5);
  assert.equal(parseLimit("500"), MAX_LIMIT);
  assert.throws(() => parseLimit("0"), /Invalid request data/);
  assert.throws(() => parseLimit("abc"), /Invalid request data/);
});

test("parseContactId requires a positive integer", () => {
  assert.equal(parseContactId("9"), 9);
  assert.throws(() => parseContactId("0"), /Invalid request data/);
  assert.throws(() => parseContactId("1.5"), /Invalid request data/);
});

test("validateCreateContact accepts only known fields and requires name", () => {
  assert.deepEqual(
    validateCreateContact({
      name: " Example Customer ",
      email: "customer@example.com",
      phone: "0400000000",
      is_company: false,
    }),
    {
      name: "Example Customer",
      email: "customer@example.com",
      phone: "0400000000",
      is_company: false,
    },
  );

  assert.throws(() => validateCreateContact({ email: "customer@example.com" }), /Invalid request data/);
  assert.throws(() => validateCreateContact({ name: "Example", extra: true }), /Invalid request data/);
});

test("validateUpdateContact requires at least one allowed field", () => {
  assert.deepEqual(validateUpdateContact({ phone: "0400000001" }), {
    phone: "0400000001",
  });

  assert.throws(() => validateUpdateContact({}), /Invalid request data/);
  assert.throws(() => validateUpdateContact({ is_company: "false" }), /Invalid request data/);
});
