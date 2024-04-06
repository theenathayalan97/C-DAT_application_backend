const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../response/response')

async function appRunner(req, res, message){
  try {
      let service_name   = req.body.serviceName
      let apprunner_name = req.body.appRunner_name
      let port           = req.body.port
      let runtime        = req.body.runtime
      let connection_arn = req.body.connection_arn
      let type           = req.body.type
      let value          = req.body.value
      let repository_url = req.body.repository_url
      let vpc_connector_arn = req.body.vpc_connector_arn
      let egress_type    = req.body.egress_type

      let tfConfig = `
      resource "aws_apprunner_service" "${apprunner_name}" {
          service_name = "${service_name}" //my-service
       
          source_configuration {
            authentication_configuration {
              connection_arn = "${connection_arn}" //arn:aws:apprunner:ap-south-1:482088842115:connection/demo/6b10ee60c303423d9fc4676ad9f9a22a
            }
            code_repository {
              code_configuration {
                code_configuration_values {
                  build_command = "npm install --save"
                  port          = "${port}"             //3000
                  runtime       = "${runtime}"          //NODEJS_14
                  start_command = "npm start"
                }
                configuration_source = "API"
              }
              repository_url = "${repository_url}"      //https://github.com/Jeyaanitha/yaantrac-frontend
              source_code_version {
                type  = "${type}"                       //BRANCH
                value = "${value}"                      //master
              }
            }
          }
       
          network_configuration {
            egress_configuration {
              egress_type       = "${egress_type}"               //  VPC
              vpc_connector_arn = "${vpc_connector_arn}"         //arn:aws:apprunner:ap-south-1:482088842115:vpcconnector/vpc-name/1/3755484e0a1e4b0d8d47d9f28c523c63
            }
          }
       
          tags = {
            Name = "${apprunner_name}"
          }
        }
      `

      fs.writeFileSync(`${path.directory}/apprunner.tf`, tfConfig);
      const configPath = `${path.directory}`;
      process.chdir(configPath);

      // Run Terraform commands
      exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
          if (applyError) {
            if(applyStderr.includes('terraform init -update')){
              console.log("logs 3");
              exec('terraform init -update',()=>{
                containerDeploy(req, res, message)
              })
            }else if(applyStderr.includes("already exists")){
              return res.status(400).json({ message: "name is already exit" });
            }
              console.log('App runner creation failed:', applyStderr);
              return res.status(400).json({ message: "App runner creation failed" });
          } else {
              console.log('Terraform apply succeeded.');
              respounce.createMessage(req, res, message);
          }
      });
  } catch (error) {
      return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

module.exports = { appRunner }