async function getHealth(_req, res) {
  return res.status(200).json({
    status: "ok",
    service: "order-tracking-backend",
  });
}

module.exports = {
  getHealth,
};
