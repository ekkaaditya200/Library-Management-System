class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

//! For normal function
// export const login = (req, res, next) => {}

//! For Error function
export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  //Todo : Add error handling for different types of errors
  console.log(err);

  if (err.code === 11000) {
    const statusCode = 400;
    const message = "Duplicate field value entered";
    err = new ErrorHandler(message, statusCode);
  } else if (err.name === "JsonvebTokenError") {
    const statusCode = 400;
    const message = "Json Web Token is Invalid. Try again";
    err = new ErrorHandler(message, statusCode);
  } else if (err.name === "TokenExpiredError") {
    const statusCode = 400;
    const message = "Json Web Token is expired. Try again";
    err = new ErrorHandler(message, statusCode);
  } else if (err.name === "CastError") {
    const statusCode = 400;
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, statusCode);
  }

  //To concer to error array to string
  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((error) => err.message)
        .join(" ")
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export default ErrorHandler;