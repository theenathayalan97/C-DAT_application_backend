const nodemailer = require('nodemailer');

async function mailSend(mailId, message, organizaion){
    const transporter = nodemailer.createTransport({
        port: 465,               // true for 465, false for other ports
        host: "smtp.gmail.com",
        auth: {
            user: 'theenathayalan0497@gmail.com',
            pass: 'fwdr nhpn brvn pauo',
        },
        secure: true,
    });
    const mailData = {
        from: 'C-Dat application',  // sender address
        to: mailId,   // list of receivers
        subject: 'C-Dat application',
        text: 'Authentication Request ',
        html: `<b>Hey ${organizaion} admin! </b><br> ${message}<br/>`,
    };
    
    
    transporter.sendMail(mailData, function (err, info) {
        if (err)
            console.log(err)
        else
        return true
    });
}

async function RestartTerraform(req,res){
    
}

module.exports = { mailSend }