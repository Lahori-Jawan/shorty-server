export default class ErrorHandler extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super();
    this.message = message;
    this.statusCode = statusCode;
  }

  getStatus() {
    return this.statusCode;
  }
}

export const handleError = (err, res) => {
  const { statusCode = 400, message } = err;

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};
