const express = require("express");
const {
  CONTACT_RESPONSE_FIELDS,
  parseContactId,
  parseLimit,
  validateCreateContact,
  validateUpdateContact,
} = require("../validation/contacts");

function createContactsRouter(odooClient) {
  const router = express.Router();

  router.get("/", async (req, res, next) => {
    try {
      const limit = parseLimit(req.query.limit);
      const contacts = await odooClient.call("res.partner", "search_read", {
        domain: [],
        fields: CONTACT_RESPONSE_FIELDS,
        limit,
      });

      res.json({ data: contacts });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const values = validateCreateContact(req.body);
      const created = await odooClient.call("res.partner", "create", {
        vals_list: values,
      });

      res.status(201).json({
        data: {
          id: normalizeCreatedId(created),
        },
      });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id", async (req, res, next) => {
    try {
      const id = parseContactId(req.params.id);
      const values = validateUpdateContact(req.body);
      const updated = await odooClient.call("res.partner", "write", {
        ids: [id],
        vals: values,
      });

      res.json({
        data: {
          id,
          updated: Boolean(updated),
        },
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function normalizeCreatedId(created) {
  if (typeof created === "number") {
    return created;
  }

  if (Array.isArray(created)) {
    return created[0];
  }

  if (created && typeof created === "object") {
    return created.id || created.ids?.[0];
  }

  return created;
}

module.exports = {
  createContactsRouter,
  normalizeCreatedId,
};
