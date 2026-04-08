const express = require("express");
const { getHealth } = require("../controllers/healthController");
const { createOrder } = require("../controllers/orderController");

const router = express.Router();

router.get("/health", getHealth);
router.post("/orders", createOrder);

module.exports = router;
