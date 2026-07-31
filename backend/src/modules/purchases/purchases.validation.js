const { z } = require('zod');

const itemSchema = z.object({
  product_id: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
  purchase_price: z.coerce.number().nonnegative(),
  description: z.string().trim().max(255).optional(),
});

const createSchema = z.object({
  supplier_id: z.coerce.number().int().positive(),
  user_id: z.coerce.number().int().positive().optional(),
  invoice_number: z.string().trim().max(100).optional(),
  purchase_date: z.coerce.date().optional(),
  description: z.string().trim().max(255).optional(),
  items: z.array(itemSchema).min(1),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = { createSchema, listQuerySchema, idParamsSchema };
