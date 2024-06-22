const PDFDocument = require('pdfkit');
const constants = require('../../constants');
const fs = require('fs');
const path = require('path');
const moment = require("moment");

fillDetails = function(customer){


  let fields = ["pregnant","diabities","onMedication","tattoo","bp","anemia","hiv","mosquito","hadFollowUp","cancer","flu","labTestConfirm","days14over","dischargeReport","aadhaar"]

  fields.forEach(field => {
    if(customer[field] == 1){
      customer[field] = "Yes";
    }else if (customer[field] == 0){
      customer[field] = "No";
    }else if(customer[field] == -1){
      customer[field] = "I Dont Know";
    }else if(customer[field] == null){
      customer[field] = "Unavailable";
    }
  });



  

          let val =[
            [`Name : ${customer.name}`],
            [`Age : ${customer.age}`],
            [`Gender : ${customer.sex}`],
            [`Contact No. : ${customer.contact}`],
            [`Email : ${customer.email}`],
            [`Blood : ${customer.blood}`],
            [`Weight :${customer.weight}`],
            [`Location : ${customer.location}`],
            [`Have you ever been pregnant? : ${customer.pregnant}`],
            [`Have you obtained a tattoo or piercing in the last 12 months? : ${customer.tattoo}`],
            [`Do you have hypertension or high Blood Pressure (BP >180)? : ${customer.bp}`],
            [`Do you have diabetes? : ${customer.diabities}`],
            [`Are you taking any medications? : ${customer.onMedication}`],
            [`Do you suffer from anemia or any blood/bleeding disorders? : ${customer.anemia}`],
            [`Have you tested positive for any communicable diseases like HIV, Hepatitis, Syphilis in the past? : ${customer.hiv}`],
            [`Do you suffer from an active case from any infectious diseases like Tuberculosis(TB), Malaria? : ${customer.mosquito}`],
            [`Do suffer from any chronic illnesses or cancers? : ${customer.cancer}`],
            [`Do you currently have any symptoms of fever/cough/ cold? : ${customer.flu}`],
            [`Was your COVID diagnosis confirmed by a laboratory test? : ${customer.labTestConfirm}`],
            [`Has it been 14 days since the last day of COVID symptoms? : ${customer.days14over}`],
            // [`Date of last symptoms : ${new Date(moment(customer.last_symptom_discharge_date.for).format('DD-MM-YYYY'))}`],
            [`Have you had a follow up test that was negative for COVID-19? : ${customer.hadFollowUp}`],
            [`Do you have a hospital discharge report? : ${customer.dischargeReport}`],
            [`Do you have an Aadhar Card? : ${customer.aadhaar}`],
        ]

        return val;
}






exports.rendercustomerEmail = async(customer)=>{

  lines=fillDetails(customer);

  // setting intergral values to string // 1 -> Yes , 0->No , -1->Dont know


  const doc = new PDFDocument();

    try {

      doc.pipe(fs.createWriteStream(`${constants.customer_FORM_ATTACHMENT_PATH}/${customer._id}.pdf`));


    

    doc
      .font(__dirname+'/fonts/poppins.ttf')
      .fontSize(12)
   
      for (let i = 0; i < 8; i++) {
        doc.text(`${i+1}. ${lines[i]}`);
      }


      doc.moveDown();
      
      for (let i = 8; i < lines.length; i++) {
        
        doc.text(`${i+1}. ${lines[i]}`);
        
      }
      

       
    doc.end();
  } catch (e) {
    console.log(e);

  }

}

