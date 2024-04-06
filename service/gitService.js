const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../response/response')

async function codePush(req, res, message) {
    try {
        const repositoryName = "Backend-Terraform-Nodejs";
        const branchName = "master";
        AWS.config.update({ region: 'ap-south-1' });

        // Change to the repository directory
        process.chdir(`${path.directory}`);

        console.log('Current working directory:', process.cwd());
        //credentials
        USERNAME = "Harshu_terraform-at-729416225111"
        PASSWORD = "CXP6QRuEQT8NpuOjZhLbpBvYnERPLiZYld8OeUyaJlw="
        //add the code into codecommit
        const addCommand = `git add .`
        execSync(addCommand, { stdio: 'inherit' });

        //commit the code
        const commitCode = `git commit -m "init commit"`
        execSync(commitCode, { stdio: 'inherit' });

        console.log('Code committed successfully.');

        // Post the latest code from CodeCommit
        const pushCommand = `git push https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/Backend-Terraform-Nodejs`;
        execSync(pushCommand, { stdio: 'inherit' });
        respounce.createMessage(req, res, message)

    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

async function codePull(req, res, message) {
    try {
        const repositoryName = "Backend-Terraform-Nodejs";
        const branchName = "master";
        AWS.config.update({ region: 'ap-south-1' });

        // Clone the CodeCommit repository
        const cloneCommand = `git clone codecommit::ap-south-1://Backend-Terraform-Nodejs`;
        execSync(cloneCommand, { stdio: 'inherit' });
        process.chdir(repositoryName);

        // Pull the latest code from CodeCommit
        const pullCommand = `git pull origin ${branchName}`;
        execSync(pullCommand, { stdio: 'inherit' });
        respounce.createMessage(req, res, message)

    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

module.exports = { codePush, codePull }