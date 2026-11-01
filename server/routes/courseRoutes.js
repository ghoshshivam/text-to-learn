const router = require("express").Router();
const ctrl = require("../controllers/courseController");
const { protect } = require("../middlewares/auth");
const { aiLimiter } = require("../middlewares/rateLimiter");
const validate = require("../middlewares/validate");
const { generateCourseBody, idParam } = require("../schemas/requestSchemas");

router.post("/generate-course", protect, aiLimiter, validate({ body: generateCourseBody }), ctrl.generateCourse);
router.get("/user-courses", protect, ctrl.getUserCourses);
router.get("/courses/:id", protect, validate({ params: idParam }), ctrl.getCourseById);
router.delete("/courses/:id", protect, validate({ params: idParam }), ctrl.deleteCourse);

module.exports = router;