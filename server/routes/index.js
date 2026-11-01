const router = require("express").Router();

router.get("/health", (req, res) =>
  res.json({ success: true, data: { status: "ok", uptime: process.uptime() } })
);

router.use(require("./courseRoutes"));
router.use(require("./lessonRoutes"));

module.exports = router;