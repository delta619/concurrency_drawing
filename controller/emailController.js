const email = require('../utils/email');
const constants = require('../constants');

exports.sendMatchMailcustomer = async (currentcustomer, currentAppointment) => {
  try {
    let fname = currentAppointment.name.split(' ')[0];
    let lname = currentAppointment.name.split(' ')[1];

    await email.sendEmailPlain({
      email: currentcustomer.email,
      subject: 'PintNetwork - Appointment Found',
      message: `<br>Dear ${currentcustomer.name},<br>
        <br>Great news! We’ve found you a appointment who needs plasma.<br>
        <br>Provided below are the contact details of the appointment:<br>
        <br>Name: <b>${fname}${lname ? ' ' + lname[0] : ''}</b>
        <br>Phone no: <b>${currentAppointment.contact ? currentAppointment.contact : 'Not available'}</b>
        <br>Email: <b>${currentAppointment.email ?currentAppointment.email : 'Not available'}</b>
        <br>Hospital: <b>${currentAppointment.hospital}</b>
        <br>
        <br>The appointment will contact you within the next 24-48 hours. In case of any further delay, please
        <br>reach out to us so we can match you to another appointment in need.<br>
        <br>Thank you for believing in us and for your relentless service to humanity.<br>
        <br>You are one step closer to saving a life ☺<br>
        <br>P.S : Do let us know if the match turned out to be successful and if we can assist you in any
        <br>further way<br>
        <br>
        <br>Regards,
        <br>Team PINT`,
    });
  } catch (e) {
    throw e;
  }
};

exports.sendMatchMailAppointment = async (currentcustomer, currentAppointment) => {
  try {
    email.sendEmailPlain({
      email: currentAppointment.email,
      subject: 'PintNetwork - customer Found',
      message: `Dear ${currentAppointment.name},<br>
        <br>Great news! We’ve found you a customer.<br>
        <br>Provided below are the contact details of your nearest customer:<br>
        <br>Name: <b>${currentcustomer.name}</b>
        <br>Phone no: <b>${currentcustomer.contact}</b>
        <br>Email: <b>${currentcustomer.email}</b>
        <br>Location: <b>${currentcustomer.location}</b>
        <br>
        <br>Please contact the customer as early as possible. In case the customer does not respond within 24-48 hours, please reach out to us so we can match you to another customer.<br>
        <br>Thank you for believing in us and we hope our services could help you recover faster.<br>
        <br>P.S: Do let us know if the match turned out to be successful and if you’d be interested in donating as well post-recovery
        <br>
        <br>Regards,
        <br>Team PINT
        `,
    });
  } catch (error) {
    throw e;
  }
};

exports.sendErrorMail = async (error) => {
  try {
    email.sendEmailPlain({
      email: 'ashutoshmalla6197@gmail.com',
      subject: 'LIVESPA - Exception occurred',
      message: `
      Hi Ashutosh,<br>
      ${error}
        `,
    });
  } catch (error) {
    throw e;
  }
};
