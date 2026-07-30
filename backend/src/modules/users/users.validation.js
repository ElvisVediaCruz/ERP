const { z } = require('zod');

const createSchema = z.object({
  role_id: z.coerce.number().int().positive(),
  name: z.string().toLowerCase().trim().min(1).max(100),
  last_name: z.string().toLowerCase().trim().max(100).optional(),
  username: z.string().trim().min(1).max(100),
  password: z.string().min(6).max(255),
  image: z.string().trim().max(255).optional(),
  documents: z.string().trim().max(255).optional(),
});

const updateSchema = createSchema.omit({ password: true });

const changePasswordSchema = z.object({
  password: z.string().min(6).max(255),
});

const idParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = { createSchema, updateSchema, changePasswordSchema, idParamsSchema };
