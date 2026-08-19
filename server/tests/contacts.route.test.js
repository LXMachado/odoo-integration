const assert = require("node:assert/strict");
const test = require("node:test");
const { normalizeCreatedId } = require("../src/routes/contacts");

test("normalizeCreatedId handles common Odoo create return shapes", () => {
  assert.equal(normalizeCreatedId(12), 12);
  assert.equal(normalizeCreatedId([13]), 13);
  assert.equal(normalizeCreatedId({ id: 14 }), 14);
  assert.equal(normalizeCreatedId({ ids: [15] }), 15);
});
