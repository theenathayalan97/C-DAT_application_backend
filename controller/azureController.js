const { exec } = require('child_process');
const fs = require('fs');

async function azure_login(req, res) {
    try {
        const tfConfig = `
        provider "azurerm" {
            features {}
            subscription_id = "${req.body.subscription_id}"
            tenant_id       = "${req.body.tenant_id}"
            skip_provider_registration = true
          }
        `;
        // Write the Terraform configuration to a file
        fs.writeFileSync('/home/jeya/Music/terraform/azure_main.tf', tfConfig);

        // Define the relative path to the Terraform configuration directory
        const configPath = '/home/jeya/Music/terraform';

        // Change the current working directory to the Terraform configuration directory
        process.chdir(configPath);

        // Run Terraform commands
        exec('terraform init', (error, initStdout, initStderr) => {
            if (error) {
                console.error('Terraform initialization failed:', initStderr);
                res.send("Terraform initialization failed");
            } else {
                console.log('Terraform initialization succeeded.');
                exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
                    if (applyError) {
                        console.error('Terraform apply failed:', applyStderr);
                        res.send("Terraform apply failed");
                    } else {
                        console.log('Terraform apply succeeded.');
                        console.log(applyStdout);
                        res.send("Terraform apply succeeded");
                    }
                });
            }
        });

    }
    catch (error) {
        console.log("error is : ", error)
        res.send("An error occurred (AZURE LOGIN)");
    }
}

async function resource_group(req, res) {
    try {
        const tfConfig = `
        resource "azurerm_resource_group" "${req.body.resource_name}" {
            name     = "${req.body.name}"
            location = "${req.body.location}"
          }
        `;
        // Write the Terraform configuration to a file
        fs.writeFileSync('/home/jeya/Music/terraform/azure_resource_name.tf', tfConfig);

        // Define the relative path to the Terraform configuration directory
        const configPath = '/home/jeya/Music/terraform';

        // Change the current working directory to the Terraform configuration directory
        process.chdir(configPath);

        // Run Terraform commands

        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                console.error('Terraform apply failed:', applyStderr);
                res.send("Terraform apply failed");
            } else {
                console.log('Terraform apply succeeded.');
                console.log(applyStdout);
                res.send("Terraform apply succeeded");
            }
        });
    }

    catch (error) {
        console.log("error is : ", error)
        res.send("An error occurred (AZURE RESOURCE GROUP)");
    }
}

async function virtual_network(req, res) {
    try {
        const tfConfig = `
        provider "azurerm" {
            features {}
            subscription_id = "${req.body.subscription_id}"
            tenant_id       = "${req.body.tenant_id}"
            skip_provider_registration = true
          }

        resource "azurerm_resource_group" "${req.body.resource_group}" {
            name     = "${req.body.name}"
            location = "${req.body.location}"
        }
        
          resource "azurerm_network_security_group" "${req.body.network_security_group}" {
            name                = "${req.body.nsg_name}"
            location            = azurerm_resource_group.${req.body.resource_group}.location
            resource_group_name = azurerm_resource_group.${req.body.resource_group}.name
            tags = {
              name = "${req.body.nsg_tag_name}"
            }
          }
          
          resource "azurerm_network_security_rule" "${req.body.network_security_rule}" {
            name                        = "${req.body.rule_name}"
            priority                    = ${req.body.priority}
            direction                   = "${req.body.direction}"
            access                      = "${req.body.access}"
            protocol                    = "${req.body.protocol}"
            source_port_range           = "${req.body.source_port_range}"
            destination_port_range      = "${req.body.destination_port_range}"
            source_address_prefix       = "${req.body.source_address_prefix}"
            destination_address_prefix  = "${req.body.destination_address_prefix}"
            resource_group_name         = azurerm_resource_group.${req.body.resource_group}.name
            network_security_group_name = azurerm_network_security_group.${req.body.network_security_group}.name
          }
         
          resource "azurerm_virtual_network" "${req.body.virtual_network}" {
            name                = "${req.body.vn_name}"
            location            = azurerm_resource_group.${req.body.resource_group}.location
            resource_group_name = azurerm_resource_group.${req.body.resource_group}.name
            address_space       = ["${req.body.vn_address_space}"]
          
            
            tags = {
              # environment = "Production"
              name = "${req.body.vn_tag_name}"
            }
          }
        
          resource "azurerm_subnet" "${req.body.subnet}" {
            name                 = "${req.body.subnet_name}"
            resource_group_name  = azurerm_resource_group.${req.body.resource_group}.name
            virtual_network_name = azurerm_virtual_network.${req.body.virtual_network}.name
            address_prefixes     = ["${req.body.sn_address_prefixes}"]
           }
          
        
            resource "azurerm_subnet_network_security_group_association" "${req.body.sn_network_sg_association}" {
            subnet_id                 = azurerm_subnet.${req.body.subnet_id}.id
            network_security_group_id = azurerm_network_security_group.${req.body.network_security_group_id}.id
            }
           
            resource "azurerm_network_interface" "${req.body.network_interface}" {
                name                = "${req.body.network_name}"
                location            = azurerm_resource_group.${req.body.resource_group}.location
                resource_group_name = azurerm_resource_group.${req.body.resource_group}.name
                
                ip_configuration {
                  name                          = "internal"
                  subnet_id                     = azurerm_subnet.${req.body.subnet}.id
                  private_ip_address_allocation = "Dynamic"
                }
          }`;

        // Write the Terraform configuration to a file
        fs.writeFileSync('/home/jeya/Music/terraform/azure_Virtual_network.tf', tfConfig);

        // Define the relative path to the Terraform configuration directory
        const configPath = '/home/jeya/Music/terraform';

        // Change the current working directory to the Terraform configuration directory
        process.chdir(configPath);

        // Run Terraform commands
        exec('terraform init', (error, initStdout, initStderr) => {
            if (error) {
                console.error('Terraform initialization failed:', initStderr);
                res.send("Terraform initialization failed");
            } else {
                console.log('Terraform initialization succeeded.');
                exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
                    if (applyError) {
                        console.error('Terraform apply failed:', applyStderr);
                        res.send("Terraform apply failed");
                    } else {
                        console.log('Terraform apply succeeded.');
                        console.log(applyStdout);
                        res.send("Terraform apply succeeded");
                    }
                });
            }
        });
    }

    catch (error) {
        console.log("error is : ", error)
        res.send("An error occurred (AZURE VIRTUAL NETWORK)");
    }
}


module.exports = {
    azure_login,
    resource_group,
    virtual_network,

}