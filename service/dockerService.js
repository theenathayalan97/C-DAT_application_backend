const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../response/response')

async function createDockerInstance(req, res, message) {
  try {
    let repo = req.body.repoName
    let instance_name = req.body.instanceTagName
    let ami = req.body.ami //ami-0287a05f0ef0e9d9a
    let instance_type = req.body.instanceType //t2.micro
    let subnet_id = req.body.subnetId  //subnet-027f6c6c1f4cd07c3
    let security_group_id = req.body.securityGroupId //["sg-0c1894e242d5ce805"]
    let git_url = 'https://github.com/theenathayalan97/datayaan_website2.0'

    // aws configure
    let env = process.env
    let accesskey = env.accesskey
    let secretkey = env.secretkey
    let region = env.region

    let accountId = "411571901235"

    // Ecr image push
    let container_repo_name = req.body.container_repo_name
    
    // let public_ip = req.body.publicIp //boolearn
        const tfConfig = ` 
    resource "aws_ecr_repository" ${container_repo_name} {
      name = "${container_repo_name}"
      force_delete = true
    }
     
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
                  sudo usermod -aG docker ubuntu
                  # echo 'sudo systemctl restart docker' | sudo tee -a /tmp/restart_docker.sh
                  sudo chmod +x /tmp/restart_docker.sh
                  sudo /tmp/restart_docker.sh
                  newgrp docker  # Switch to the "docker" group
                  sleep 60  # Wait for Docker to initialize
                  sudo aws configure set aws_access_key_id ${accesskey}
                  sudo aws configure set aws_secret_access_key ${secretkey}
                  sudo aws configure set default.region ${region}
                  sudo aws configure set default.output json
                  aws ecr get-login-password --region ap-south-1 | sudo docker login --username AWS --password-stdin 482088842115.dkr.ecr.ap-south-1.amazonaws.com
                  sudo apt install python3-pip -y
                  sudo pip install git-remote-codecommit -q
                  sleep 10
                  git clone ${git_url}
                  sleep 30
                  cd /
                  cd datayaan_website2.0
                  cd datayaan_website2.0
                  sudo docker build -t ${container_repo_name} .
                  sleep 60
                  sudo docker tag ${container_repo_name}:latest ${accountId}.dkr.ecr.ap-south-1.amazonaws.com/${container_repo_name}:latest
                  sudo docker push ${accountId}.dkr.ecr.${region}.amazonaws.com/${container_repo_name}:latest
                  sudo docker run -d -p 80:80 ${accountId}.dkr.ecr.${region}.amazonaws.com/${container_repo_name}:latest
                  sudo docker pull ${accountId}.dkr.ecr.ap-south-1.amazonaws.com/${container_repo_name}:latest
                  EOF
     
      tags = {
        Name = "${container_repo_name}"
      }
     
      provisioner "remote-exec" {
        inline = [
          "sleep 30"
        ]
       
        connection {
          type        = "ssh"
          user        = "ubuntu"
          host        = aws_instance.${instance_name}.public_ip
          private_key = file("${path.directory}/campus_datayaan.pem")
          agent       = false
        }
      }
    }
        `;

    // Write the Terraform configuration to a file
    fs.writeFileSync(`${path.directory}/docker.tf`, tfConfig);
    const configPath = `${path.directory}`;
    process.chdir(configPath);

    // Run Terraform commands
    exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        if(applyStderr.includes('terraform init -update')){
          exec('terraform init -update',()=>{
            createDockerInstance(req, res, message)
          })
        }else if(applyStderr.includes('terraform init ')){
          console.log("logs 3");
          exec('terraform init ',()=>{
            createDockerInstance(req, res, message)
          })
        }else if(applyStderr.includes("RepositoryAlreadyExistsException")){
          return res.status(400).json({ message: "Repository name already exit" });
        }
        console.log('docker creation failed:', applyStderr);
        return res.status(400).json({ message: "docker creation failed" });
      } else {
        console.log('Terraform apply succeeded.');
        respounce.createMessage(req, res, message);
      }
    });
  } catch (error) {
    return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

async function containerDeploy(req, res, message) {
  try {
    let repo = req.body.repoName
    let tfConfig = ` 
    resource "aws_ecs_cluster" "my_cluster" {
  name = "fargate-cluster"
}
 
resource "aws_ecs_task_definition" "app_task" {
  family                   = "app-task"
  container_definitions    = <<DEFINITION
  [
    {
      "name": "app-task",
      "image": "482088842115.dkr.ecr.ap-south-1.amazonaws.com/welcome_cantainer",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 80,
          "hostPort": 80
        }
      ],
      "memory": 512,
      "cpu": 256
    }
  ]
  DEFINITION
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"    
  memory                   = 512        
  cpu                      = 256        
  execution_role_arn       = "arn:aws:iam::482088842115:role/ecsTaskExecutionRole"
}
 
resource "aws_default_vpc" "default_vpc" {
}
 
 
resource "aws_default_subnet" "default_subnet_a" {
  availability_zone = "ap-south-1a"
}
 
resource "aws_default_subnet" "default_subnet_b" {
  availability_zone = "ap-south-1b"
}
 
resource "aws_alb" "application_load_balancer" {
  name               = "load-balancer-dev" #load balancer name
  load_balancer_type = "application"
  subnets = [
    aws_default_subnet.default_subnet_a.id,
    aws_default_subnet.default_subnet_b.id
  ]
  # security group
  security_groups = [aws_security_group.load_balancer_security_group.id]
}
 
resource "aws_security_group" "load_balancer_security_group" {
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
 
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
 
resource "aws_lb_target_group" "target_group" {
  name        = "target-group"
  port        = 80
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_default_vpc.default_vpc.id
}
 
resource "aws_lb_listener" "listener" {
  load_balancer_arn = aws_alb.application_load_balancer.arn
  port              = "80"
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target_group.arn
  }
}
 
resource "aws_ecs_service" "app_service" {
  name            = "app-first-service"    
  cluster         = aws_ecs_cluster.my_cluster.id 
  task_definition = aws_ecs_task_definition.app_task.arn
  launch_type     = "FARGATE"
  desired_count   = 2 
 # Set up the number of containers to 3
 
  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn
    container_name   = aws_ecs_task_definition.app_task.family
    container_port   = 80
  }
 
  network_configuration {
    subnets          = [aws_default_subnet.default_subnet_a.id, aws_default_subnet.default_subnet_b.id]
    assign_public_ip = true    
    security_groups  = [aws_security_group.service_security_group.id]
  }
}
 
resource "aws_security_group" "service_security_group" {
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    # Only allowing traffic in from the load balancer security group
    security_groups = [aws_security_group.load_balancer_security_group.id]
  }
 
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
 
output "app_url" {
  value = aws_alb.application_load_balancer.dns_name
}
        `

    fs.writeFileSync(`${path.directory}/ecs.tf`, tfConfig);
    const configPath = `${path.directory}`;
    process.chdir(configPath);

    // Run Terraform commands
    exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        if(applyStderr.includes('terraform init -update')){
          exec('terraform init -update',()=>{
            containerDeploy(req, res, message)
          })
        }else if(applyStderr.includes('terraform init ')){
          exec('terraform init ',()=>{
            containerDeploy(req, res, message)
          })
        }else if(applyStderr.includes("already exists")){
          return res.status(400).json({ message: "name is already exit" });
        }
        console.log('docker creation failed:', applyStderr);
        return res.status(400).json({ message: "docker creation failed" });
      } else {
        console.log('Terraform apply succeeded!!!.',applyStderr);
        respounce.createMessage(req, res, message);
      }
    });
  } catch (error) {
    return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

module.exports = { createDockerInstance, containerDeploy }