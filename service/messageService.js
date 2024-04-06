const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const simpleGit = require('simple-git');
const respounce = require('../response/response')

async function createSnsTopic(req, res, message) {
  try {
    const tfConfig = `
      resource "aws_sns_topic" "${req.body.topic_name}" {
        name         = "${req.body.topic_name}"
        display_name = "${req.body.display_name}"
        tags = {
          Name = "${req.body.topic_name}"
        }
      }
      
      resource "aws_sns_topic_subscription" "${req.body.subscription_name}" {
        topic_arn = aws_sns_topic.${req.body.topic_name}.arn
        protocol  = "${req.body.protocol}"
        endpoint  = "${req.body.endpoint}"
      }
      
     
      `;

    // Write the Terraform configuration to a file
    fs.writeFileSync(`${path.directory}/sns_topic.tf`, tfConfig);
    const configPath = `${path.directory}`;
    process.chdir(configPath);
    
    // Run Terraform commands
    exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        if(applyStderr.includes('terraform init -update')){
          exec('terraform init -update',()=>{
            createSnsTopic(req, res, message)
          })
        }else if(applyStderr.includes('terraform init')){
          exec('terraform init',()=>{
            createSnsTopic(req, res, message)
          })
        }
        console.log('SNS topic creation failed:', applyStderr);
        return res.status(400).json({ message: "SNS topic creation failed" });
      } else {
        console.log('Terraform apply succeeded.');
        respounce.createMessage(req, res, message);
      }
    });
  } catch (error) {
    return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

async function queueCreate(req, res, message) {
  try {
    const tfConfig = `
    resource "aws_sqs_queue" "${req.body.queue_name}" {
      name =  "${req.body.queue_name}"
      visibility_timeout_seconds = 30
      delay_seconds             = 30
      max_message_size          = 2048
      message_retention_seconds = 86400 
      receive_wait_time_seconds = 10
    }`;

    // Write the Terraform configuration to a file
    fs.writeFileSync(`${path.directory}/sqs_queue.tf`, tfConfig);
    const configPath = `${path.directory}`;
    process.chdir(configPath);

    //  Run Terraform commands

    exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        if(applyStderr.includes('terraform init -update')){
          exec('terraform init -update',()=>{
            queueCreate(req, res, message)
          })
        }else if(applyStderr.includes('terraform init')){
          exec('terraform init',()=>{
            queueCreate(req, res, message)
          })
        }
        console.error('Terraform apply failed:', applyStderr);
        res.status(400).send("Terraform apply failed");
      } else {
        console.log('Queue created successfully');
        respounce.createMessage(req, res, message)
      }
    });

  } catch (error) {
    return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

async function mailSend(req, res, message) {
  try {
    const tfConfig = `
    resource "aws_sns_topic" "${req.body.topic_name}" {
      name         = "${req.body.topic_name}"
      display_name = "${req.body.display_name}"
      tags = {
        Name = "${req.body.topic_name}"
      }
    }
    
    resource "aws_sns_topic_subscription" "${req.body.subscription_name}" {
      topic_arn = aws_sns_topic.${req.body.topic_name}.arn
      protocol  = "${req.body.protocol}"
      endpoint  = "${req.body.endpoint}" 
    }
    resource "null_resource" "send_message" {
      depends_on = [aws_sns_topic_subscription.${req.body.subscription_name}]
    }
    `;

    // Write the Terraform configuration to a file
    fs.writeFileSync(`${path.directory}/sns_topic_subscription.tf`, tfConfig);
    const configPath = `${path.directory}`;
    process.chdir(configPath);

    exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        if(applyStderr.includes('terraform init -update')){
          exec('terraform init -update',()=>{
            mailSend(req, res, message)
          })
        }else if(applyStderr.includes('terraform init')){
          exec('terraform init',()=>{
            mailSend(req, res, message)
          })
        }
        console.error('Terraform apply failed:', applyStderr);
        res.status(400).send("Terraform apply failed");
      } else {
        console.log('Terraform apply succeeded.', applyStderr);
        respounce.createMessage(req, res, message);
      }
    });
  } catch (error) {
    return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}



module.exports = { createSnsTopic, queueCreate, mailSend }