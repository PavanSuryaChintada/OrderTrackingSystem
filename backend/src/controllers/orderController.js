const pool = require("../db/pool");
const { ORDER_STATUSES } = require("../constants");
const { createOrderSchema } = require("../validators/orderValidator");

function parseOrderId(orderIdParam) {
  const orderId = Number(orderIdParam);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return null;
  }

  return orderId;
}

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

async function getOrderById(req, res) {
  try {
    const orderId = parseOrderId(req.params.id);

    if (!orderId) {
      return res.status(400).json({
        message: "Order id must be a positive integer",
      });
    }

    const result = await pool.query(
      `
      SELECT id, customer_name, product_name, quantity, status, created_at, updated_at
      FROM orders
      WHERE id = $1
      `,
      [orderId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    return res.status(200).json({
      order: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
}

async function listOrders(_req, res) {
  try {
    const result = await pool.query(
      `
      SELECT id, customer_name, product_name, quantity, status, created_at, updated_at
      FROM orders
      ORDER BY id DESC
      `
    );

    return res.status(200).json({
      count: result.rowCount,
      orders: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
}

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
};
