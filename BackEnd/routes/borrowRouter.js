import express from "express";
import { recordBorrowedBook, getBorrowedBooksForAdmin, returnBorrowedBook, borrowedBooks } from "../controllers/borrowController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/record-borrow-book/:id",
  isAuthenticated,
  // isAuthorized("Admin"),
  recordBorrowedBook
);
router.get(
  "/borrowed-books-by-users",
  isAuthenticated,
  isAuthorized("Admin"),
  getBorrowedBooksForAdmin
);
router.get("/my-borrowed-books", isAuthenticated, borrowedBooks);
router.put(
  "/return-borrowed-book/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  returnBorrowedBook
);

export default router;