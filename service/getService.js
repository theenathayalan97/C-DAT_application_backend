const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const simpleGit = require('simple-git');
const respounce = require('../response/response')
const env = process.env


async function awsLogin(req, res, message) {
    try {
        let access_key = req.body.accesskey
        let secret_key = req.body.secretkey
        let region = req.body.region

        // console.log("access_key : ",access_key)
        const tfConfig = `
        provider "aws" {
            access_key = "${access_key}"
            secret_key = "${secret_key}"
            region = "${region}"
          }
        
        data "aws_vpcs" "foo" {
        }
        output "foo" {
          value = data.aws_vpcs.foo.ids
        }`;

        fs.writeFileSync(`${path.directory}/awslogin.tf`, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);

        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                if (applyStderr.includes('terraform init -update')) {
                    exec('terraform init -update', () => {
                        vpcListGet(req, res, message)
                    })
                } else if (applyStderr.includes('terraform init ')) {
                    exec('terraform init ', () => {
                        vpcListGet(req, res, message)
                    })
                }else if(applyStderr.includes("request is invalid")){
                    return res.status(400).json({ message : "accesskey and secretkey is invalid"})
                }
                console.error('Terraform get vpc list failed:', applyStderr);
                return res.status(400).json({ message: "Terraform get vpc list failed", result: applyStderr });
            } else {
                console.log('Terraform succeeded.');
                respounce.createMessage(req, res, message)
            }
        });

    } catch (error) {
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
}

// Get list of AWS services

async function vpcListGet(req, res, message) {
    try {
        let access_key = env.accesskey
        let secret_key = env.secretkey
        let region = env.region

        // console.log("access_key : ",access_key)
        const tfConfig = `
        provider "aws" {
            access_key = "${access_key}"
            secret_key = "${secret_key}"
            region = "${region}"
          }
        
        data "aws_vpcs" "foo" {
        }
        output "foo" {
          value = data.aws_vpcs.foo.ids
        }`;

        fs.writeFileSync(`${path.directory}/vpc_list.tf`, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);

        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                if (applyStderr.includes('terraform init -update')) {
                    exec('terraform init -update', () => {
                        vpcListGet(req, res, message)
                    })
                } else if (applyStderr.includes('terraform init ')) {
                    exec('terraform init ', () => {
                        vpcListGet(req, res, message)
                    })
                }
                console.error('Terraform get vpc list failed:', applyStderr);
                return res.status(400).json({ message: "Terraform get vpc list failed", result: applyStderr });
            } else {
                console.log('Terraform get vpc list succeeded.');
                const vpcIdRegex = /"vpc-\w+"/g;
                const matchArray = applyStdout.match(vpcIdRegex);
                console.log("matchArray : ", matchArray);
                if (!matchArray) {
                    respounce.createMessage(req, res, `${message}.but Data is empty`)
                } else {
                    const vpcIds = matchArray.map(match => match.replace(/"/g, ''));
                    function findDuplicates(array) {
                        let duplicateIds = [...new Set(array)]

                        return duplicateIds;
                    }
                    let duplicateIds = findDuplicates(vpcIds);
                    if (duplicateIds.length > 0) {
                        respounce.createMessage(req, res, message, duplicateIds)
                    } else {
                        respounce.createMessage(req, res, message, vpcIds)
                    }
                }

            }
        });

    } catch (error) {
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
}

async function securityGroupListGet(req, res, message) {
    try {
        const tfConfig = `
        data "aws_security_groups" "dys-sg" {
        }
        output "dys-sg" {
           value = data.aws_security_groups.dys-sg.ids
        }`;

        fs.writeFileSync(`${path.directory}/security_group_list.tf`, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);

        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                if (applyStderr.includes('terraform init -update')) {
                    exec('terraform init -update', () => {
                        securityGroupListGet(req, res, message)
                    })
                } else if (applyStderr.includes('terraform init ')) {
                    exec('terraform init ', () => {
                        securityGroupListGet(req, res, message)
                    })
                }
                console.error('Terraform security group list get failed:', applyStderr);
                return res.status(400).json({ message: "Terraform security group list get failed" });
            } else {
                console.log('Terraform security group list get succeeded.');
                const securityGroupIdRegex = /"sg-\w+"/g;
                const matchArray = applyStdout.match(securityGroupIdRegex);
                const securityGroupIds = matchArray.map(match => match.replace(/"/g, ''));
                function findDuplicates(array) {
                    let duplicateIds = [...new Set(array)]

                    return duplicateIds;
                }
                let duplicateIds = findDuplicates(securityGroupIds);
                if (duplicateIds.length > 0) {
                    respounce.createMessage(req, res, message, duplicateIds)
                } else {
                    respounce.createMessage(req, res, message, securityGroupIds)
                }
                // return securityGroupIds;
            }
        });
    } catch (error) {
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
}

async function subnetGetList(req, res, message) {
    try {
        const tfConfig = `data "aws_subnets" "sn" {
        }
        
        output "sn" {
          value = data.aws_subnets.sn.ids
        }`;

        // Write the Terraform configuration to a file
        fs.writeFileSync(`${path.directory}/subnet_list.tf`, tfConfig);


        // Define the relative path to the Terraform configuration directory
        const configPath = `${path.directory}`;

        // Change the current working directory to the Terraform configuration directory
        process.chdir(configPath);

        // Run Terraform commands

        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                if (applyStderr.includes('terraform init -update')) {
                    exec('terraform init -update', () => {
                        subnetGetList(req, res, message)
                    })
                } else if (applyStderr.includes('terraform init ')) {
                    exec('terraform init ', () => {
                        subnetGetList(req, res, message)
                    })
                }
                console.error('Terraform apply failed:', applyStderr);
                res.send("Terraform apply failed");
            } else {
                console.log('Terraform apply succeeded.');
                const subnetIdRegex = /"subnet-\w+"/g;
                const matchArray = applyStdout.match(subnetIdRegex);
                const subnetIds = matchArray.map(match => match.replace(/"/g, ''));
                function findDuplicates(array) {
                    let duplicateIds = [...new Set(array)]

                    return duplicateIds;
                }
                let duplicateIds = findDuplicates(subnetIds);
                if (duplicateIds.length > 0) {
                    respounce.createMessage(req, res, message, duplicateIds)
                } else {
                    respounce.createMessage(req, res, message, subnetIds)
                }
            }
        });

    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

async function osListGet(req, res, message) {
    try {
        const os_list = [
            "Amazon Linux 2023 kernel-6.1",
            "Amazon Linux 2 Kernel-5.10",
            "Ubuntu focal 20.04 LTS",
            "Ubuntu jammy 22.04 LTS",
            "Windows server core base-2022",
            "Windows server core base-2019",
            "Windows server core base-2016",
            "Windows with SQL server-2022 Standard",
            "Red Had Enterprise Linux 9"
        ]
        respounce.createMessage(req, res, message, os_list);
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

async function instanceGetList(req, res, message) {
    try {
        const tfConfig = `data "aws_instances" "ins" {
        }
        
        output "ins" {
          value = data.aws_instances.ins.ids
        }`;

        // Write the Terraform configuration to a file
        fs.writeFileSync(`${path.directory}/instance_list.tf`, tfConfig);


        // Define the relative path to the Terraform configuration directory
        const configPath = `${path.directory}`;

        // Change the current working directory to the Terraform configuration directory
        process.chdir(configPath);

        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                if (applyStderr.includes('terraform init -update')) {
                    exec('terraform init -update', () => {
                        instanceGetList(req, res, message)
                    })
                } else if (applyStderr.includes('terraform init ')) {
                    exec('terraform init ', () => {
                        instanceGetList(req, res, message)
                    })
                }
                console.error('Terraform apply failed:', applyStderr);
                res.send("Terraform apply failed");
            } else {
                console.log('Terraform apply succeeded.');
                console.log(applyStdout);
                const subnetIdRegex = /"subnet-\w+"/g;
                const matchArray = applyStdout.match(subnetIdRegex);
                const instanceIds = matchArray.map(match => match.replace(/"/g, ''));
                function findDuplicates(array) {
                    let duplicateIds = [...new Set(array)]

                    return duplicateIds;
                }
                let duplicateIds = findDuplicates(instanceIds);
                if (duplicateIds.length > 0) {
                    respounce.createMessage(req, res, message, duplicateIds)
                } else {
                    respounce.createMessage(req, res, message, instanceIds)
                }
            }
        });
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

async function architectureSecurityGroup(req, res, message) {
    try {
        let subnetId = req.body.ec2Instance.subnetId[0]
        let tfConfig = `
        data "aws_subnet" "example" {
               id = "${subnetId}"  # replace with your subnet ID
             }
             
             data "aws_security_groups" "example" {
               filter {
                 name   = "vpc-id"
                values = [data.aws_subnet.example.vpc_id]
              }
            }
             
            output "vpc_id" {
              value = data.aws_subnet.example.vpc_id
             }
             
            output "security_group_ids" {
              value = data.aws_security_groups.example.ids
            }
        `

        fs.writeFileSync(`${path.directory}/security_list.tf`, tfConfig);


        // Define the relative path to the Terraform configuration directory
        const configPath = `${path.directory}`;

        // Change the current working directory to the Terraform configuration directory
        process.chdir(configPath);

        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                if (applyStderr.includes('terraform init -update')) {
                    exec('terraform init -update', () => {
                        architectureSecurityGroup(req, res, message)
                    })
                } else if (applyStderr.includes('terraform init ')) {
                    exec('terraform init ', () => {
                        architectureSecurityGroup(req, res, message)
                    })
                }
                console.error('Terraform apply failed:', applyStderr);
                res.send("Terraform apply failed");
            } else {
                console.log('Terraform apply succeeded.');
                console.log(applyStdout);
                const sgRegex = /"sg-(\w+)"/g;
                const vpcIdRegex = /vpc_id = "(vpc-\w+)"/;
                const match = applyStdout.match(vpcIdRegex);

                const securityGroupIds = (applyStdout.match(sgRegex) || []).map(id => id.replace(/"/g, ''));
                // const vpcIds = (applyStdout.match(vpcRegex) || []).map(id => id.replace(/"/g, ''));

                const result = {
                    securityGroupIds: [...new Set(securityGroupIds)],
                    vpcId: match ? match[1] : null
                };
                respounce.createMessage(req, res, message, result)
            }
        });
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message })
    }
}

async function internetGateWayList(req, res, message) {
    try {
        const tfConfig = `
            data "aws_internet_gateway" "gw" {
                filter {
                    name   = "attachment.vpc-id"
                    values = ["vpc-04c20f3451c486381"] 
                }
            }

            output "gw" {
            value = data.aws_internet_gateway.gw.id
        }
        `;

        // Write the Terraform configuration to a file
        fs.writeFileSync(`${path.directory}/internetGateWay_list.tf`, tfConfig);


        // Define the relative path to the Terraform configuration directory
        const configPath = `${path.directory}`;

        // Change the current working directory to the Terraform configuration directory
        process.chdir(configPath);

        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                if (applyStderr.includes('terraform init -update')) {
                    exec('terraform init -update', () => {
                        internetGateWayList(req, res, message)
                    })
                } else if (applyStderr.includes('terraform init ')) {
                    exec('terraform init ', () => {
                        internetGateWayList(req, res, message)
                    })
                }
                console.error('Terraform apply failed:', applyStderr);
                res.send("Terraform apply failed");
            } else {
                const subnetIdRegex = /"igw-\w+"/g; // Update the regex to match internet gateway IDs
                const matchArray = applyStdout.match(subnetIdRegex);

                if (!matchArray) {
                    console.error('No internet gateway IDs found.');
                    // Handle this case according to your requirements, such as sending an appropriate response
                } else {
                    const instanceIds = matchArray.map(match => match.replace(/"/g, ''));
                    function findDuplicates(array) {
                        let duplicateIds = [...new Set(array)]

                        return duplicateIds;
                    }
                    let duplicateIds = findDuplicates(instanceIds);
                    if (duplicateIds.length > 0) {
                        respounce.createMessage(req, res, message, duplicateIds)
                    } else {
                        respounce.createMessage(req, res, message, instanceIds)
                    }
                }

            }
        });
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

async function natGateWayList(req, res, message) {
    try {
        const tfConfig = `
        data "aws_nat_gateways" "all" {
            
          }
          
          output "nat_gateways" {
            value = data.aws_nat_gateways.all.ids
          }
          `;

        // Write the Terraform configuration to a file
        fs.writeFileSync(`${path.directory}/instance_list.tf`, tfConfig);


        // Define the relative path to the Terraform configuration directory
        const configPath = `${path.directory}`;

        // Change the current working directory to the Terraform configuration directory
        process.chdir(configPath);

        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                if (applyStderr.includes('terraform init -update')) {
                    exec('terraform init -update', () => {
                        natGateWayList(req, res, message)
                    })
                } else if (applyStderr.includes('terraform init')) {
                    exec('terraform init ', () => {
                        natGateWayList(req, res, message)
                    })
                }
                console.error('Terraform apply failed:', applyStderr);
                res.send("Terraform apply failed");
            } else {
                const nat_gatewayIdRegex = /"nat-\w+"/g; // Update the regex to match NAT gateway IDs
                const matchArray = applyStdout.match(nat_gatewayIdRegex);

                if (!matchArray) {
                    console.error('No NAT gateway IDs found.');
                    // Handle this case according to your requirements, such as sending an appropriate response
                } else {
                    const gatewayIds = matchArray.map(match => match.replace(/"/g, ''));
                    respounce.createMessage(req, res, message, gatewayIds);
                }

            }
        });
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}


module.exports = {
    vpcListGet, securityGroupListGet, internetGateWayList, natGateWayList, awsLogin,
    subnetGetList, osListGet, instanceGetList, architectureSecurityGroup
};