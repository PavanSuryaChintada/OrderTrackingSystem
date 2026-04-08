const { z } = require("zod");
const { STATUS_FLOW } = require("../constants");

const createOrderSchema = z.object({
  customerName: z.string().trim().min(1, "customerName is required").max(120),
  productName: z.string().trim().min(1, "productName is required").max(120),
  quantity: z.number().int().positive("quantity must be greater than 0"),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(STATUS_FLOW, {
    message: "status must be one of PLACED, PACKED, SHIPPED, DELIVERED",
  }),
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
};
