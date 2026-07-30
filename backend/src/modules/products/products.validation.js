const { z } = require('zod');

const optionalPositiveInt = z.preprocess(
  (v) => (v === '' ? undefined : v),
  z.coerce.number().int().positive().optional()
);

const optionalTrimmedString = (max) =>
  z.preprocess((v) => (v === '' ? undefined : v), z.string().trim().max(max).optional());

const optionalNonnegativeNumber = z.preprocess(
  (v) => (v === '' ? undefined : v),
  z.coerce.number().nonnegative().optional()
);

const createSchema = z.object({
  category_id: optionalPositiveInt,
  supplier_id: optionalPositiveInt,
  code: optionalTrimmedString(50),
  barcode: optionalTrimmedString(50),
  name: z.string().trim().min(1).max(150),
  description: optionalTrimmedString(100),
  purchase_price: z.coerce.number().nonnegative(),
  sale_price: optionalNonnegativeNumber,
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

const statusSchema = z.object({
  status: z.boolean(),
});

module.exports = {
  createSchema,
  updateSchema,
  listQuerySchema,
  idParamsSchema,
  reassignCategorySchema,
  statusSchema,
};
