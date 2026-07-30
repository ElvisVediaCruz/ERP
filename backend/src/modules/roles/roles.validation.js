const {z} = require('zod');

const createSchema = z.object({
    name: z.string().trim().toLowerCase().min(1).max(100),
    description: z.string().max(255).optional(),
    validate: z.string().min(1)
});

module.exports = { createSchema };