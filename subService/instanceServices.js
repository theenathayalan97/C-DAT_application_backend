const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const simpleGit = require('simple-git');
const respounce = require('../response/response')


async function subnetSecurityList(req, res, message) {
    try {
        let subnet = req.quary.subnet
        const tfConfig = `
        data "aws_subnet" "example_subnet" {
            id = "${subnet}"  # Replace with the ID of your subnet
          }
          
          data "aws_security_groups" "example_security_groups" {
            filter {
              name   = "vpc-id"
              values = [data.aws_subnet.example_subnet.vpc_id]
            }
          }
          
          output "subnet_security_group_ids" {
            value = data.aws_security_groups.example_security_groups.ids
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
                } else if (applyStderr.includes('terraform init')) {
                    exec('terraform init', () => {
                        securityGroupListGet(req, res, message)
                    })
                }
                console.error('Terraform security group list get failed:', applyStderr);
                return res.status(400).json({ message: "Terraform security group list get failed" });
            } else {
                const securityGroupIdRegex = /"sg-\w+"/g;
                const matchArray = applyStdout.match(securityGroupIdRegex);
                const securityGroupIds = matchArray.map(match => match.replace(/"/g, ''));

                function findDuplicates(array) {
                    let duplicateIds = [...new Set(array)];
                    return duplicateIds;
                }

                let duplicateIds = findDuplicates(securityGroupIds);
                if (duplicateIds.length > 0) {
                    respounce.createMessage(req, res, message, duplicateIds);
                } else {
                    respounce.createMessage(req, res, message, securityGroupIds);
                }
            }
        })
    } catch (error) {
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
}


module.exports = { subnetSecurityList }