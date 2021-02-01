const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const sendMail = (mailTo, subject, template) => {
    return new Promise((resolve, _reject) => {
        nodemailer.createTestAccount((_err, _account) => {
        
            const transporter = nodemailer.createTransport(smtpTransport({
                host:'localhost',
                port: '1024'
            }));
    
            const mailOptions = {
                from:'nodeMailer <nodeMailer@mail.com>',
                to:`${mailTo}`,
                subject:`${subject}`,
                html: template
            };
    
            transporter.sendMail(mailOptions, error => {
                if (error){
                    resolve({
                        isSended: false,
                        message: 'Error al enviar email de confirmación.'
                    });
                }else{
                    resolve({
                        isSended: true,
                        message: 'Email de confirmación enviado correctamente.'
                    });
                }
            });
        });
    });
}

module.exports = sendMail;