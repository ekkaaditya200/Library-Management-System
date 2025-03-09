import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Borrow } from "../models/borrowModel.js";
import { Book } from "../models/bookModel.js";
import { User } from "../models/userModel.js";
import { fineCalculate } from "../utils/fineCalculate.js";

export const borrowedBooks = catchAsyncErrors(async (req, res, next) => {
  const {borrowedBooks} = req.user;
  res.status(200).json({
    success:true,
    borrowedBooks,
  })
});

export const recordBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body;

  const book = await Book.findById(id);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  const user = await User.findOne({ email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }
  if (book.quantity === 0) {
    return next(new ErrorHandler("Book not available.", 400));
  }
  const isAlreadyBorrowed = user.borrowedBooks.find(
    (b) => b.bookId.toString() === id && b.returned === false
  );
  if (isAlreadyBorrowed) {
    return next(new ErrorHandler("Book already borrowed.", 400));
  }

  book.quantity -= 1;
  book.availability = book.quantity > 0;
  await book.save();

  //! Add the borrowed book to the user's borrowed books array
  user.borrowedBooks.push({
    bookId: book._id,
    bookTitle: book.title,
    borrowedDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await user.save();

  const borrow = await Borrow.create({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    book: book._id,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    price: book.price,
  });
  await borrow.save();

  res.status(200).json({
    success: true,
    message: "Borrowed book recorded successfully.",
  });
});

export const returnBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const {id: bookId } = req.params;
  const {email} = req.body;
  const book = await Book.findById(bookId);
  if (!book) {
    return next(new ErrorHandler("Book not found", 404));
  }

  const user = await User.findOne({ email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  const borrowedBook = user.borrowedBooks.find(
    (b) => b.bookId.toString() === bookId && b.returned === false
  );

  if (!borrowedBook) {
    return next(new ErrorHandler("You have not borrowed this book", 400));
  }

  borrowedBook.returned = true;
  await user.save();

  book.quantity += 1;
  book.availability = book.quantity > 0;
  await book.save();

  const borrow = await Borrow.findOne({
    book: bookId,
    "user.email": email,
    returnedDate: null,
  });

  if (!borrow) {
    return next(new ErrorHandler("You have not borrowed this book.", 400));
  }

  borrow.returnDate = new Date();
  const find = fineCalculate(borrow.dueDate);
  borrow.find = find;
  await borrow.save();

  res.status(200).json({
    success: true,
    message:
      find !== 0
        ? `The book has been retured successfully. The total charges, including a fine are $${
            fine + book.price
          }`
        : `The book has been retured successfully. The total charges are $${book.price}`,
  });
});

export const getBorrowedBooksForAdmin = catchAsyncErrors(
  async (req, res, next) => {
    const borrowedBooks = await Borrow.find();
    res.status(200).json({
      success:true,
      borrowedBooks,
    })
  });
