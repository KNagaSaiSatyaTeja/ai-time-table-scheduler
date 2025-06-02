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

router.get("/", getAllRooms);
router.post("/addRoom", addRoom);

router
  .route("/:id")
  .get(getRoomById)
  .put(roomValidation, updateRoom)
  .delete(deleteRoom);

module.exports = router;
