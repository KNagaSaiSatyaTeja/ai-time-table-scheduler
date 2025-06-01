const express = require("express");
const router = express.Router();
const { roomValidation } = require("../middleware/roomValidation");
const { protect } = require("../middleware/auth");
const {
  getAllRooms,
  getRoomById,
  addRoom,
  updateRoom,
  deleteRoom,
} = require("../controller/room");

router.use(protect);

router.route("/").get(getAllRooms).post(roomValidation, addRoom);

router
  .route("/:id")
  .get(getRoomById)
  .put(roomValidation, updateRoom)
  .delete(deleteRoom);

module.exports = router;
