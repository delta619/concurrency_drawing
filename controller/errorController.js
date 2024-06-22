const { sendErrorMail } = require('./emailController');

module.exports = async (err, req, res, next) => {
  if (err.isOperational) {
    sendErrorMail(err);
  } else {
    sendErrorMail(err);
  }
  console.log(err);

  return res.json({
    status: 500,
    message: err.message,
  });
};
