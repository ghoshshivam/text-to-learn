const router = require("express").Router();
const ctrl = require("../controllers/lessonController");
const { protect } = require("../middlewares/auth");
const { aiLimiter } = require("../middlewares/rateLimiter");
const validate = require("../middlewares/validate");
const { generateLessonBody, idParam } = require("../schemas/requestSchemas");

router.post("/generate-lesson", protect, aiLimiter, validate({ body: generateLessonBody }), ctrl.generateLesson);
router.get("/lessons/:id", protect, validate({ params: idParam }), ctrl.getLesson);

module.exports = router;