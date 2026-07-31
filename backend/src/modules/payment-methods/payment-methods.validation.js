const { z } = require('zod');

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(255).optional(),
});

const updateSchema = createSchema;

const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const listQuerySchema = z.object({
  status: z.enum(['true', 'false']).optional(),
});

const statusSchema = z.object({
  status: z.boolean(),
});

module.exports = { createSchema, updateSchema, idParamsSchema, listQuerySchema, statusSchema };
