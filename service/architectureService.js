const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../response/response')
const createArchitecture = require('../architecture/architecture')

async function architecture(req, res, message) {
  try {
    let config = []
    let vpc = req.body.vpc.vpcTittle
    let subnet = req.body.subnet.subnetTittle
    let internetGateWay = req.body.internetGateWay.internetGateWayTittle
    let routeTable = req.body.routeTable.routeTableTittle
    let securityGroup = req.body.securityGroup.securityGroupTittle
    let ec2Instance = req.body.ec2Instance.ec2InstanceTittle
    let destroyState = `${path.directory}/terraform.tfstate`
    if (vpc == 'vpc') {
      let vpcDetail = await createArchitecture.createVpc(req, res)
      config += vpcDetail
    }

    if (subnet == 'subnet') {
      let subnetDetail = await createArchitecture.createSubnet(req, res)
      config += subnetDetail
    }
    if (internetGateWay == 'internetGateWay') {
      let internetGateWayDetail = await createArchitecture.createInternetGateWay(req, res)
      config += internetGateWayDetail
    }
    if (routeTable == 'routeTable') {
      let routeTableDetail = await createArchitecture.createRouteTable(req, res)
      config += routeTableDetail
    }
    if (securityGroup == 'securityGroup') {
      let securityGroupDetail = await createArchitecture.createSecurityGroup(req, res)
      config += securityGroupDetail
    }
    if (ec2Instance == 'ec2Instance') {
      let ec2InstanceDetail = await createArchitecture.createEc2Instance(req, res)
      config += ec2InstanceDetail
    }
    if (config.length > 0) {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().replace(/[:.]/g, '-');

      const fileName = `${path.directory}/aws_vpc_${formattedDate}.tf`;
      // console.log("config : ",config);
      fs.appendFileSync(fileName, config);
      const configPath = `${path.directory}`;
      process.chdir(configPath);


      let configData = [`${JSON.stringify(req.body)}`]
      const jsonData = JSON.parse(configData[0]);
      // console.log("the data is : ",jsonData)
      let serviceDetail = [];
      for (const category in jsonData) {
        const title = jsonData[category][`${category}Tittle`];
        const tagName = jsonData[category][`${category}TagName`];
        if (title) {
          let perticulerService = {
            service_tittle: `${title}`,
            tag_name: `${tagName}`
          }
          serviceDetail.push(perticulerService)
        }
      }
      // console.log("valide : ",config);
      exec("terraform apply -auto-approve -parallelism=10", (applyError, applyStdout, applyStderr) => {
        if (applyError) {
          if(applyStderr.includes('terraform init -update')){
            console.log("logs 3");
            exec('terraform init -update',()=>{
              architecture(req, res, message)
            })
          }else if(applyStderr.includes('terraform init')){
            console.log("logs 3");
            exec('terraform init',()=>{
              architecture(req, res, message)
            })
          }else if (applyStderr.includes("already has an internet gateway attached")) {
            fs.unlinkSync(fileName)
            return res.status(400).send("already has an internet gateway attached");
          }else if (applyStderr.includes("not a valid IPv4 CIDR block")) {
            fs.unlinkSync(fileName)
            return res.status(400).send(`IPv4 CIDR block is not valid `);
          }else if (applyStderr.includes("CIDR block")) {
            fs.unlinkSync(fileName)
            return res.status(400).send(`check the CIDR block `);
          }else if (applyStderr.includes("The maximum number")) {
            fs.unlinkSync(fileName)
            return res.status(400).send(`The maximum number is not achived  `);
          } else {
            
            console.error("Terraform Architecture created failed:", applyStderr);
            fs.unlinkSync(fileName)
            return res.status(400).send("Terraform Architecture created failed");
          }
        } else {
          console.log(" Terraform Architecture created successfully ");
          fs.unlinkSync(fileName)
          fs.unlinkSync(destroyState)
          respounce.architectureCreate(req, res, message, serviceDetail)
        }
      });
    } else {
      return res.status(400).json({ message: "Architecture is empty" })
    }

  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: "something went wrong", result: error.message })
  }
}

async function loadbancer(req, res, message) {
  try {
    let targetGroupTagName = req.body.targetGroupTagName
    let loadbancerTagName = req.body.loadbancerTagName
    let vpcId = req.body.vpcId
    let instanceId = req.body.instanceId
    let subnetId = req.body.subnetId


    if (!targetGroupTagName) {
      return res.status(400).json({ message: "target group name is required" })
    }else if (!vpcId) {
      return res.status(400).json({ message: "Vpc id is required" })
    }else if (!instanceId) {
      return res.status(400).json({ message: "Instance id is required" })
    }else if ((subnetId.length <= 0) || (subnetId.length < 2)) {
      return res.status(400).json({ message: "only two subnet id is specified" });
    }

    let loadbancer = `
        resource "aws_lb_target_group" "${targetGroupTagName}" {
          name     = "${targetGroupTagName}"
          port     = 80
          protocol = "HTTP"
          vpc_id   = "${vpcId}"
        }
        // attach instance in load balance
        resource "aws_lb_target_group_attachment" "test" {
          target_group_arn = "arn:aws:elasticloadbalancing:ap-south-1:411571901235:targetgroup/demoTarget1/86f5e2f1503695d8"
          target_id        = "${instanceId}"
          port             = 80
        }
         
        //load balance create
        resource "aws_lb" "${loadbancerTagName}" {
          name               = "${loadbancerTagName}"
          internal           = false
          # load_balancer_type = "network"
          subnets            = [ "${subnetId[0]}", "${subnetId[1]}"]
         
          # enable_deletion_protection = true
         
          tags = {
            Environment = "production"
          }
        }
        `
        fs.writeFileSync(`${path.directory}/load_balancer.tf`,loadbancer);
        const configPath = `${path.directory}`;
        process.chdir(configPath);
    
        exec("terraform apply -auto-approve ", (applyError, applyStdout, applyStderr) => {
          if (applyError) {
            if(applyStderr.includes('terraform init -update')){
              console.log("logs 3");
              exec('terraform init -update',()=>{
                loadbancer(req, res, message)
              })
            }else if(applyStderr.includes('terraform init')){
              console.log("logs 3");
              exec('terraform init',()=>{
                loadbancer(req, res, message)
              })
            }else if(applyStderr.includes("only alphanumeric characters and hyphens allowed")){
              return res.status(400).send("Only alphanumeric characters and hyphens letters allowed");
            }else if(applyStderr.includes( "same Availability Zone")){
              return res.status(400).send("Subnet available zone is same so change the subnet available zone");
            }else if(applyStderr.includes("already exists")){
              return res.status(400).json({ message: "name is already exit" });
            }
            console.error("load balancer created failed:", applyStderr);
            return res.status(400).send("load balancer created failed");
          } else {
            console.log("message : ", message)
            console.log(" load balancer created successfully ");
            respounce.createMessage(req, res, message)
          }
        });
  } catch (error) {
    return res.status(500).json({ message: "something went wrong", result: error.message })
  }
}


async function keyPair(req, res, message) {
  try {
    let key_name = req.body.key_name

    let pair = `
      resource "tls_private_key" "rsa" {
        algorithm = "RSA"
        rsa_bits  = 4096
        }
      resource "aws_key_pair" "${key_name}" {
        key_name = "${key_name}"
        public_key = tls_private_key.rsa.public_key_openssh
        }
        resource "local_file" "tf-key" {
        content  = tls_private_key.rsa.private_key_pem
        filename = "${key_name}"
        }
        `

    fs.writeFileSync(`${path.directory}/keyPair.tf`, pair);
    const configPath = `${path.directory}`;
    process.chdir(configPath);

    exec("terraform apply -auto-approve ", (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        if(applyStderr.includes('terraform init -update')){
          console.log("logs 3");
          exec('terraform init -update',()=>{
            keyPair(req, res, message)
          })
        }else if(applyStderr.includes('terraform init')){
          console.log("logs 3");
          exec('terraform init',()=>{
            keyPair(req, res, message)
          })
        }else if(applyStderr.includes("already exists")){
          return res.status(400).json({ message: "name is already exit" });
        }
        console.error("key pair created failed:", applyStderr);
        return res.status(400).send("key pair created failed");
      } else {
        console.log(" key pair created successfully ");
        respounce.createMessage(req, res, message)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "something went wrong", result: error.message })
  }
}
module.exports = { architecture, loadbancer, keyPair }