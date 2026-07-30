const { z } = require('zod');

const createSchema = z.object({
  name: z.string().toLowerCase().trim().min(1).max(100),
  description: z.string().toLowerCase().trim().max(65535).optional(),
});

const updateSchema = createSchema;

const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = { createSchema, updateSchema, idParamsSchema };
