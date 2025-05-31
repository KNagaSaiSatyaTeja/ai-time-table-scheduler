const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { getStats, getRecentActivity } = require("../controller/stats");

router.use(protect);
router.get("/", getStats);
router.get("/recent-activity", getRecentActivity);

module.exports = router;
