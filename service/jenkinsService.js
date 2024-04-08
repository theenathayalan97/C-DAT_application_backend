const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../response/response')

async function jenkinsInstance(req, res, message) {
    try {
        // aws configure
        let env = process.env
        let accesskey = env.accesskey
        let secretkey = env.secretkey
        let region = env.region

        let repo = req.body.repoName
        let instance_name = req.body.instanceTagName
        let ami = req.body.ami //ami-0287a05f0ef0e9d9a
        let instance_type = req.body.instanceType //t2.micro
        let subnet_id = "subnet-a0f30cc8"  //subnet-027f6c6c1f4cd07c3
        let security_group_id = "sg-0c3bdf31c0e72d41a" //["sg-0c1894e242d5ce805"]
        let accountId = "411571901235"

        const tfConfig = `
        resource "aws_instance" "${instance_name}" {
            ami                         = "${ami}"
            instance_type               = "${instance_type}"              
            key_name                    = "campus_datayaan"        
            associate_public_ip_address = true
            subnet_id                   = "${subnet_id}" 
            vpc_security_group_ids      = ["${security_group_id}"]
           
            user_data = <<-EOF
                      #!/bin/bash 
                      sudo apt update -y
                      sudo apt install -y awscli docker.io
                      sleep 60 
                      sudo usermod -aG docker ubuntu
                      sudo usermod -aG docker jenkins
                      # echo 'sudo systemctl restart docker' | sudo tee -a /tmp/restart_docker.sh
                      sudo chmod +x /tmp/restart_docker.sh
                      sudo /tmp/restart_docker.sh
                      newgrp docker  # Switch to the "docker" group
                      sleep 60  # Wait for Docker to initialize
                      sudo aws configure set aws_access_key_id ${accesskey}
                      sudo aws configure set aws_secret_access_key ${secretkey}
                      sudo aws configure set default.region ${region}
                      sudo aws configure set default.output json
                      aws ecr get-login-password --region ap-south-1 | sudo docker login --username AWS --password-stdin ${accountId}.dkr.ecr.ap-south-1.amazonaws.com
                      sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
                      echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
                      sudo apt-get update
                      sudo apt-get install -y fontconfig openjdk-17-jre
                      sudo apt-get install -y jenkins
           
                      # Wait for Jenkins to start
                      until sudo systemctl is-active jenkins; do sleep 5; done
           
                      # Fetch and output the current initial admin password
                      sudo cat /var/lib/jenkins/secrets/initialAdminPassword
                  EOF
           
            tags = {
              Name = "${instance_name}"
            }
          }
           
          output "jenkins_initial_admin_password" {
            value = aws_instance.${instance_name}.user_data
          }
           
        `

        fs.writeFileSync(`${path.directory}/jenkinsInstance.tf`, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);


        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                if (applyStderr.includes('terraform init -update')) {
                    exec('terraform init -update', () => {
                        jenkinsInstance(req, res, message)
                    })
                } else if (applyStderr.includes('terraform init')) {
                    exec('terraform init', () => {
                        jenkinsInstance(req, res, message)
                    })
                }
                console.error('Jenkins Instance created:', applyStderr);
                res.status(400).send("Jenkins Instance created failed");
            } else {
                console.log('Jenkins Instance created succeeded.');
                respounce.createMessage(req, res, message)
            }
        });
    } catch (error) {
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
}


async function jenkinsData(req, res, message) {
    try {
        const tfConfig = `
        terraform {
            required_providers {
              jenkins = {
                source  = "overmike/jenkins"
                version = "0.6.1"
              }
            }
          }
          
          provider "jenkins" {
            server_url = "http://13.233.142.3:8080/"  # Specify the correct Jenkins server URL
            username   = "root"
            password   = "root"
          }
          
          resource "jenkins_job" "dys_jenkins" {
            name     = "dys_jenkins"
            template = file("job.xml")
          }`

        fs.writeFileSync(`${path.directory}/service/jenkins_pip.tf`, tfConfig);
        const configPath = `${path.directory}/service`;
        process.chdir(configPath);

        let findValue = {}
        findValue.AWS_DEFAULT_REGION = 'ap-south-1'
        findValue.AWS_ACCOUNT_ID = '411571901235'
        findValue.CODECOMMIT_REPO_URL = 'https://github.com/theenathayalan97/datayaan_website2.0'
        findValue.ECR_REPO_NAME = 'demo_container'
        findValue.DOCKER_IMAGE_NAME = 'sample-repo'
        findValue.DOCKER_HOST_IP = '01'
        findValue.DOCKER_HOST_PORT = '80'
        findValue.YOUR_CONTAINER = 'demo_container'
        findValue.IMAGE_TAG = "latest"



        module.exports = {
            findValue
        }

        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                if (applyStderr.includes('terraform init -update')) {
                    exec('terraform init -update', () => {
                        jenkinsData(req, res, message)
                    })
                } else if (applyStderr.includes('terraform init')) {
                    exec('terraform init', () => {
                        jenkinsData(req, res, message)
                    })
                }
                console.error('Terraform login failed:', applyStderr);
                res.status(400).send("Terraform login failed");
            } else {
                console.log('Jenkins  succeeded.');
                respounce.createMessage(req, res, message)
            }
        });

    } catch (error) {
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
}

module.exports = {
    jenkinsData, jenkinsInstance
}