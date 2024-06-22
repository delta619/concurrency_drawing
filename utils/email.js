const nodemailer = require('nodemailer');
const path = require('path');


const is_prod_config = process.env.NODE_ENV == "production"

const transporter = nodemailer.createTransport({
});


exports.sendEmailPlain =  (options) => {

  const mailOptions = {
  }
  return transporter.sendMail(mailOptions);
}


exports.sendEmailWithAttachments = async options => {

  const mailOptions = {
  }
  try{
    await  transporter.sendMail(mailOptions);
  }catch(e){
    throw e
  }

}

