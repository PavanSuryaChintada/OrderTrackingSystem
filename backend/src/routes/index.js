const express = require("express");
const { getHealth } = require("../controllers/healthController");
const {
  createOrder,
  getOrderById,
  listOrders,
} = require("../controllers/orderController");

const router = express.Router();

router.get("/health", getHealth);
router.post("/orders", createOrder);
router.get("/orders", listOrders);
router.get("/orders/:id", getOrderById);

module.exports = router;
