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
        TopicArn: 'arn:aws:sns:ap-south-1:482088842115:sample-topic'
    };

        const command = new PublishCommand(params);
        const data = await snsClient.send(command);

    } catch (error) {
        console.error(error);
    }
};

module.exports = { createMessage, architectureCreate }