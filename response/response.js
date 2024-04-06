const fs = require('fs');
const path = require('../path');
const { exec } = require('child_process');
const AWS = require('aws-sdk');
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");



function createMessage(req, res, message, value) {
    let data = []
    data.push(value)
    if (data.length > 0) {
        return res.status(200).json({ message: `${message} successfully `, result: value });
    } else {
        return res.status(200).json({ message: `${message} successfully ` });
    }
}

async function architectureCreate(req, res, message, value) {
    try {
        if (value.length > 0) {
            await sendMessage(req, res, value)
            return res.status(200).json({ message: `${message} successfully `, result: value });
        } else {
            return res.status(400).json({ message: `${message} data is empty` });
        }
    } catch (error) {
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
  

}


async function sendMessage(req, res, value) {
    try {
        const snsClient = new SNSClient();
        const params = {
            Message: `${JSON.stringify(value)}`,
            Subject: 'C-Dat application',
            TopicArn: 'arn:aws:sns:ap-south-1:411571901235:C-Dat_application'
        };

        const command = new PublishCommand(params);
        const data = await snsClient.send(command);

    } catch (error) {
        console.error(error);
    }
};

async function mail_send(email, message){
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
        to: `${email}`,   // list of receivers
        subject: 'C-Dat application',
        text: 'OTP',
        html: `<b>Hi C-Dat user </b><br> ${message}<br/>`,
    };
    
    
    transporter.sendMail(mailData, function (err, info) {
        if (err)
            console.log(err)
        else
        return res.status(200).json({ message: "otp send successfully "})
    });
}

module.exports = { createMessage, architectureCreate, mail_send }