const { z } = require('zod');

const itemSchema = z.object({
  product_id: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
  sale_price: z.coerce.number().nonnegative().optional(),
});

const createSchema = z.object({
  customer_id: z.coerce.number().int().positive().optional(),
  payment_method_id: z.coerce.number().int().positive(),
  receipt_number: z.string().trim().max(100).optional(),
  user_id: z.coerce.number().int().positive().optional(),
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
