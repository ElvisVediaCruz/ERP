const { z } = require('zod');

const createSchema = z.object({
  company: z.string().trim().min(1).max(150),
  contact_name: z.string().trim().max(150).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().email().max(150).optional(),
  address: z.string().trim().max(255).optional(),
  description: z.string().trim().max(255).optional(),
});

const updateSchema = createSchema;

const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const listQuerySchema = z.object({
  status: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

module.exports = { createSchema, updateSchema, idParamsSchema, listQuerySchema };
