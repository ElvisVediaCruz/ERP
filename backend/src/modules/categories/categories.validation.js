const { z } = require('zod');

const createSchema = z.object({
  name: z.string().toLowerCase().trim().min(1).max(100),
  description: z.string().toLowerCase().trim().max(65535).optional(),
});

const updateSchema = createSchema;

const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const statusSchema = z.object({
  status: z.boolean(),
});

const listQuerySchema = z.object({
  status: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

module.exports = { createSchema, updateSchema, idParamsSchema, statusSchema, listQuerySchema };
