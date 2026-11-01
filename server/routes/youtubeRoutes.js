const router = require("express").Router();
const ctrl = require("../controllers/youtubeController");
const { protect } = require("../middlewares/auth");
const { youtubeLimiter } = require("../middlewares/rateLimiter");
const validate = require("../middlewares/validate");
const { youtubeQuery } = require("../schemas/requestSchemas");

router.get("/youtube", protect, youtubeLimiter, validate({ query: youtubeQuery }), ctrl.getVideo);

module.exports = router;