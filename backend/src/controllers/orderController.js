const pool = require("../db/pool");
const { ORDER_STATUSES } = require("../constants");
const { createOrderSchema } = require("../validators/orderValidator");

async function createOrder(req, res) {
  try {
    const parsed = createOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request payload",
        errors: parsed.error.issues,
      });
    }

    const { customerName, productName, quantity } = parsed.data;

    const result = await pool.query(
      `
      INSERT INTO orders (customer_name, product_name, quantity, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id, customer_name, product_name, quantity, status, created_at, updated_at
      `,
      [customerName, productName, quantity, ORDER_STATUSES.PLACED]
    );

    return res.status(201).json({
      message: "Order created successfully",
      order: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
}

module.exports = {
  createOrder,
};
