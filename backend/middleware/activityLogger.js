const Activity = require("../models/Activity");

exports.logActivity = (type) => async (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    if (data.success) {
      Activity.create({
        action: req.activityDescription || `${req.method} ${type}`,
        status: "completed",
        user: req.user._id,
        type: type,
      }).catch((err) => console.error("Error logging activity:", err));
    }

    return originalJson.call(this, data);
  };

  next();
};
