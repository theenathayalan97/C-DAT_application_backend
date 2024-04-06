const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../response/response')
const {v4 : uuidv4} = require('uuid')

async function ebs(req, res, message){
    try {
      const newId = uuidv4()
      const s3BucketArn = "arn:aws:s3:::cdat-s3-bucket-name-ebs";

        let tfConfig = `
        resource "aws_s3_bucket" "example" {
            bucket = "cdat-s3-bucket-name-ebs"
          }
          
          resource "aws_s3_object" "deployment_package" {
            bucket = aws_s3_bucket.example.id
            key    = "bean/cdat-terraform.zip-${newId}"
            source = "${path.directory}/cdat-terraform.zip"
          }
          
          resource "aws_elastic_beanstalk_application" "example" {
            name = "new-cdat-terraform"
          }
          
          resource "aws_elastic_beanstalk_application_version" "example" {
            name        = "new-cdat-terraform-version"
            application = aws_elastic_beanstalk_application.example.name
            description = "Application Version 1.0"
            bucket      = aws_s3_bucket.example.id
            key         = aws_s3_object.deployment_package.id
          }
          
          resource "aws_elastic_beanstalk_environment" "example" {
            name        = "cdat-terraform-env-1"
            application = aws_elastic_beanstalk_application.example.name
            solution_stack_name = "64bit Amazon Linux 2023 v6.0.4 running Node.js 18"
            
          #   setting {
          #   namespace = "aws:autoscaling:launchconfiguration"
          #   name      = "SecurityGroups"
          #   value     = join(",", var.security_groups)
          # }
          
            setting {
              namespace = "aws:elasticbeanstalk:environment"
              name      = "ServiceRole"
              value     = "arn:aws:iam::482088842115:role/service-role/aws-elasticbeanstalk-service-role"
            }
              setting {
              namespace = "aws:autoscaling:launchconfiguration"
              name      = "IamInstanceProfile"
              value     = "roleForEBSonEC2"
            }
            depends_on = [aws_elastic_beanstalk_application_version.example]
          }
          
          resource "aws_s3_bucket_policy" "example" {
            bucket = aws_s3_bucket.example.id
          
            policy = <<EOF
          {
            "Version": "2012-10-17",
            "Statement": [
              {
                "Effect": "Allow",
                "Principal": {
                  "Service": "elasticbeanstalk.amazonaws.com"
                },
                "Action": [
                  "s3:GetObject",
                  "s3:PutObject"
                ],
                "Resource": "${s3BucketArn}/*"
              }
            ]
          }
          EOF
          }
        `

        fs.writeFileSync(`${path.directory}/ebs.tf`, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);

         // Run Terraform commands
         exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
              if(applyStderr.includes('terraform init -update')){
                exec('terraform init -update',()=>{
                  ebs(req, res, message)
                })
              }else if(applyStderr.includes('terraform init ')){
                exec('terraform init ',()=>{
                  ebs(req, res, message)
                })
              }else if(applyStderr.includes("already exists")){
                return res.status(400).json({ message: "name is already exit" });
              }
                console.log('ebs creation failed:', applyStderr);
                return res.status(400).json({ message: "ebs creation failed" });
            } else {
                console.log('Terraform apply succeeded.');
                respounce.createMessage(req, res, message);
            }
        });
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

// async function ebs(req, res, message) {
//   try {
//       const newId = uuidv4();

//       // Assume you have already created the S3 bucket and have its ARN
//       const s3BucketArn = "arn:aws:s3:::cdat-s3-bucket-name-ebs";

//       let tfConfig = `
//       resource "aws_s3_bucket" "example" {
//           bucket = "cdat-s3-bucket-name-ebs"
//       }

//       resource "aws_s3_object" "deployment_package" {
//           bucket = aws_s3_bucket.example.id
//           key    = "bean/cdat-terraform.zip-${newId}"
//           source = "${path.directory}/cdat-terraform.zip"
//       }

//       // ... rest of the Terraform script ...

//       resource "aws_s3_bucket_policy" "example" {
//           bucket = aws_s3_bucket.example.id

//           policy = <<EOF
//           {
//               "Version": "2012-10-17",
//               "Statement": [
//                   {
//                       "Effect": "Allow",
//                       "Principal": {
//                           "Service": "elasticbeanstalk.amazonaws.com"
//                       },
//                       "Action": [
//                           "s3:GetObject",
//                           "s3:PutObject"
//                       ],
//                       "Resource": "${s3BucketArn}/*"
//                   }
//               ]
//           }
//           EOF
//       }
//       `;

//       fs.writeFileSync(`${path.directory}/ebs.tf`, tfConfig);
//       const configPath = `${path.directory}`;
//       process.chdir(configPath);

//       // Run Terraform commands
//       exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
//           if (applyError) {
//               console.log('ebs creation failed:', applyStderr);
//               return res.status(400).json({ message: "ebs creation failed" });
//           } else {
//               console.log('Terraform apply succeeded.');
//               respounce.createMessage(req, res, message);
//           }
//       });
//   } catch (error) {
//       return res.status(400).json({ message: "something went wrong ", result: error.message });
//   }
// }

module.exports = { ebs }