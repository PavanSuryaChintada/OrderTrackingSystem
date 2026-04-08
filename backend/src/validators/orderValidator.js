const { z } = require("zod");

const createOrderSchema = z.object({
  customerName: z.string().trim().min(1, "customerName is required").max(120),
  productName: z.string().trim().min(1, "productName is required").max(120),
  quantity: z.number().int().positive("quantity must be greater than 0"),
});

module.exports = {
  createOrderSchema,
};
