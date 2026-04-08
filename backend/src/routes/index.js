const express = require("express");
const { getHealth } = require("../controllers/healthController");
const {
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const router = express.Router();

router.get("/health", getHealth);
router.post("/orders", createOrder);
router.get("/orders", listOrders);
router.get("/orders/:id", getOrderById);
router.patch("/orders/:id/status", updateOrderStatus);

module.exports = router;
