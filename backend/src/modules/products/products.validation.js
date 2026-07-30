const { z } = require('zod');

const createSchema = z.object({
  category_id: z.coerce.number().int().positive(),
  supplier_id: z.coerce.number().int().positive().optional(),
  code: z.string().trim().min(1).max(50),
  barcode: z.string().trim().max(100).optional(),
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(65535).optional(),
  purchase_price: z.coerce.number().nonnegative(),
  sale_price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative().optional(),
  minimum_stock: z.coerce.number().int().nonnegative().optional(),
  expiration_date: z.string().trim().optional(),
  image: z.string().trim().max(255).optional(),
});

// stock queda fuera: los cambios de stock solo pasan por sales/purchases
// para quedar reflejados en inventory_movements.
const updateSchema = createSchema.omit({ stock: true });

const listQuerySchema = z.object({
  category_id: z.coerce.number().int().positive().optional(),
  supplier_id: z.coerce.number().int().positive().optional(),
  status: z.enum(['true', 'false']).optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const reassignCategorySchema = z
  .record(z.coerce.number().int().positive())
  .refine((data) => Object.keys(data).length > 0, 'Debe incluir al menos un producto');

module.exports = {
  createSchema,
  updateSchema,
  listQuerySchema,
  idParamsSchema,
  reassignCategorySchema,
};
