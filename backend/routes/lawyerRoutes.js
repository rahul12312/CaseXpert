const express = require("express");
const router = express.Router();
const {
  addLawyer,
  getAllLawyers,
  getLawyerById,
  updateLawyer,
  deleteLawyer,
  addReview
} = require("../controllers/lawyerController");
const { verifyToken, isLawyer, isAdmin } = require("../middleware/auth");

// Public routes
router.get("/", getAllLawyers);
router.get("/:id", getLawyerById);

// Protected routes
router.post("/add", verifyToken, addLawyer);
router.put("/:id", verifyToken, updateLawyer);
router.post("/:id/reviews", verifyToken, addReview);
router.delete("/:id", verifyToken, isAdmin, deleteLawyer);

module.exports = router;
