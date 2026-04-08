const pool = require("../db/pool");
const { ORDER_STATUSES, STATUS_FLOW } = require("../constants");
const {
  createOrderSchema,
  updateOrderStatusSchema,
} = require("../validators/orderValidator");

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

function getNextAllowedStatus(currentStatus) {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);

  if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) {
    return null;
  }

  return STATUS_FLOW[currentIndex + 1];
}

async function updateOrderStatus(req, res) {
  try {
    const orderId = parseOrderId(req.params.id);

    if (!orderId) {
      return res.status(400).json({
        message: "Order id must be a positive integer",
      });
    }

    const parsed = updateOrderStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request payload",
        errors: parsed.error.issues,
      });
    }

    const requestedStatus = parsed.data.status;

    const existing = await pool.query(
      `
      SELECT id, status
      FROM orders
      WHERE id = $1
      `,
      [orderId]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const currentStatus = existing.rows[0].status;
    const nextAllowedStatus = getNextAllowedStatus(currentStatus);

    if (!nextAllowedStatus) {
      return res.status(409).json({
        message: "Order is already in terminal status",
        currentStatus,
      });
    }

    if (requestedStatus !== nextAllowedStatus) {
      return res.status(409).json({
        message: "Invalid status transition",
        currentStatus,
        nextAllowedStatus,
        requestedStatus,
      });
    }

    const updated = await pool.query(
      `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING id, customer_name, product_name, quantity, status, created_at, updated_at
      `,
      [requestedStatus, orderId]
    );

    return res.status(200).json({
      message: "Order status updated successfully",
      order: updated.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  }
}

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
};
