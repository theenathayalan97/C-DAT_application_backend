const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');

async function rosa(req, res){
    try {
        const tagName = "demo-1234";
        const tfConfigPath = `${path.directory}/rosa.tf`
    
    // Check if the Terraform configuration file exists, and create it if not
    if (!fs.existsSync(tfConfigPath)) {
      fs.writeFileSync(tfConfigPath, ''); // Create an empty file
    }
    const tfContent = fs.readFileSync(tfConfigPath, 'utf8');
        if (tfContent.includes(`"${tagName}"`)) {
          console.log(`rosa with the name "${tagName}" already exists in the configuration.`);
          return res.status(400).send(`ASG with the name "${tagName}" already exists in the configuration.`)
        } else {
        const tfConfig = `    
              terraform {
              required_providers {
                aws = {
                  source  = "hashicorp/aws"
                  version = ">= 4.20.0"
                }
                rhcs = {
                  version = "1.4.0"
                  source  = "terraform-redhat/rhcs"
                }
              }
              }
              provider "rhcs" {
              token = var.token
              url   = var.url
              }
    
              data "rhcs_policies" "all_policies" {}
    
              data "rhcs_versions" "all" {}
    
              module "create_account_roles" {
                source  = "terraform-redhat/rosa-sts/aws"
                version = "0.0.15"
    
                create_operator_roles = false
                create_oidc_provider  = false
                create_account_roles  = true
    
                account_role_prefix    = var.account_role_prefix
                rosa_openshift_version = var.openshift_version
                account_role_policies  = data.rhcs_policies.all_policies.account_role_policies
                operator_role_policies = data.rhcs_policies.all_policies.operator_role_policies
                all_versions           = data.rhcs_versions.all
                path                   = var.path
                tags                   = var.tags
    
              }
              data "aws_caller_identity" "current" {
              } 
    
    
              resource "rhcs_cluster_rosa_classic" "rosa_sts_cluster" {
              name                = var.cluster_name
              cloud_region        = var.cloud_region
              aws_account_id = "729416225111"
              #   aws_account_id      = data.aws_caller_identity.current.account_id
              availability_zones  = var.availability_zones
              replicas            = var.replicas
              autoscaling_enabled = var.autoscaling_enabled
              min_replicas        = var.min_replicas
              max_replicas        = var.max_replicas
              # version             = var.openshift_version
              properties = {
                rosa_creator_arn = data.aws_caller_identity.current.arn
              }
    
              sts = local.sts_roles
              wait_for_create_complete = true
              }
    
    
              locals {
              path = coalesce(var.path, "/")
              sts_roles = {
              aws_access_key_id     = ""    
              aws_secret_access_key = ""
              token                 = var.token
              url                   = var.url
              role_arn         = "arn:aws:iam::729416225111:role/account-role-blmo-Installer-Role",
              support_role_arn = "arn:aws:iam::729416225111:role/account-role-blmo-Support-Role",
                instance_iam_roles = {
                  master_role_arn = "arn:aws:iam::729416225111:role/account-role-blmo-ControlPlane-Role",
                  worker_role_arn = "arn:aws:iam::729416225111:role/account-role-blmo-Worker-Role"
                },
                operator_role_prefix = "dat-1",
                oidc_config_id       = module.oidc_config.id
              }
              }
    
              module "oidc_config" {
              token                = var.token
              url                  = var.url
              source               = "./oidc_provider"
              managed              = false
              installer_role_arn   = "arn:aws:iam::729416225111:role/account-role-blmo-Installer-Role"
              operator_role_prefix = var.operator_role_prefix
              account_role_prefix  = var.account_role_prefix
              cloud_region         = var.cloud_region
              tags                 = var.tags
              path                 = var.path
    
              }
        `
        const variable_rosa = `  variable "openshift_version" {
          type = string
          default = "4.13"
          description = "Enter the desired OpenShift version as X.Y. This version should match what you intend for your ROSA cluster. For example, if you plan to create a ROSA cluster using '4.13.10', then this version should be '4.13'. You can see the supported versions of OpenShift by running 'rosa list version'."
        }
      
        variable "account_role_prefix" {
          type    = string
          default = "dat-1"
          description = "Your account roles are prepended with whatever value you enter here. The default value in the ROSA CLI is 'ManagedOpenshift-' before all of your account roles."
        }
      
        variable "tags" { 
          type        = map
          default     = null
          description = "(Optional) List of AWS resource tags to apply."
        }
      
        variable "token" {
        type = string
        default = "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJhZDUyMjdhMy1iY2ZkLTRjZjAtYTdiNi0zOTk4MzVhMDg1NjYifQ.eyJpYXQiOjE3MDIwMjAwNjIsImp0aSI6IjA4MWM5NjI4LTNmZDktNGU1Yi05NjJiLTJhNTY1NzNjZDBjZCIsImlzcyI6Imh0dHBzOi8vc3NvLnJlZGhhdC5jb20vYXV0aC9yZWFsbXMvcmVkaGF0LWV4dGVybmFsIiwiYXVkIjoiaHR0cHM6Ly9zc28ucmVkaGF0LmNvbS9hdXRoL3JlYWxtcy9yZWRoYXQtZXh0ZXJuYWwiLCJzdWIiOiJmOjUyOGQ3NmZmLWY3MDgtNDNlZC04Y2Q1LWZlMTZmNGZlMGNlNjpoYXJzaHVzYW5qdSIsInR5cCI6Ik9mZmxpbmUiLCJhenAiOiJjbG91ZC1zZXJ2aWNlcyIsIm5vbmNlIjoiYTI4MGYxYmYtNGNhZi00NGM0LWJkNjItNGY1NGQwMjMyODI1Iiwic2Vzc2lvbl9zdGF0ZSI6Ijg5MDE4NWQzLTZiZWEtNGE0NS1hMWExLTFmZDUxNThkMDUzZiIsInNjb3BlIjoib3BlbmlkIGFwaS5pYW0uc2VydmljZV9hY2NvdW50cyBvZmZsaW5lX2FjY2VzcyIsInNpZCI6Ijg5MDE4NWQzLTZiZWEtNGE0NS1hMWExLTFmZDUxNThkMDUzZiJ9.eyUglzRpjU2dzALWFt5W-Gtggc5RgyodGYmBc5Bj02A"
      }
      
      variable "url" {
        type        = string
        description = "Provide OCM environment by setting a value to url"
        default     = "https://api.openshift.com"
      }
      
      variable "path" {
        description = "(Optional) The arn path for the account/operator roles as well as their policies."
        type        = string
        default     = null
      }
      
      variable "cluster_name" {
        type    = string
        default = "demo-1234"
      }
      
      variable "cloud_region" {
        type    = string
        default = "ap-south-1"
      }
      
      variable "availability_zones" {
        type    = list(string)
        default = ["ap-south-1a"]
      }
      
      variable "operator_role_prefix" {
        type = string
        default = "dat-1"
        # validation {
        #   condition     = can(regex("^[\\w+=,.@-]+$", var.operator_role_prefix)) || length(var.operator_role_prefix) == 0
        #   error_message = "Invalid operator_role_prefix. It should match the pattern ^[\\w+=,.@-]+$ or be an empty string."
        # }
      }
      
      variable "installer_role_arn" {
        description = "STS Role ARN with get secrets permission, relevant only for unmanaged OIDC config"
        type        = string
        default     = "arn:aws:iam::729416225111:role/account-role-blmo-Installer-Role"
      }
      
      variable "replicas" {
        description = "The amount of the machine created in this machine pool."
        type        = number
        default     = 2
      }
      
      variable "autoscaling_enabled" {
        description = ""
        type        = string
        default     = "false"
      }
      
      variable "min_replicas" {
        description = "The minimum number of replicas for autoscaling."
        type        = number
        default     = null
      }
      
      variable "max_replicas" {
        description = "The maximum number of replicas not exceeded by the autoscaling functionality."
        type        = number
        default     = null
      }`;
    
      const ouput_rosa = `
      output "oidc_endpoint_url" {
        value = module.oidc_config.oidc_endpoint_url
      }
      
      output "thumbprint" {
        value = module.oidc_config.thumbprint
      }
      
      
      output "cluster_id" {
        value = rhcs_cluster_rosa_classic.rosa_sts_cluster.id
      }
      
      output "account_role_prefix" {
        value = module.create_account_roles.account_role_prefix
      }`;
        // Write the Terraform configuration to a file
        fs.writeFileSync("/home/jeya/Pictures/Backend-Terraform-Nodejs/rosa.tf", tfConfig);
        fs.writeFileSync("/home/jeya/Pictures/Backend-Terraform-Nodejs/variable_rosa.tf", variable_rosa);
        fs.writeFileSync("/home/jeya/Pictures/Backend-Terraform-Nodejs/ouput_rosa.tf", ouput_rosa);
        }
        // Define the relative path to the Terraform configuration directory
        const configPath = "/home/jeya/Pictures/Backend-Terraform-Nodejs";
    
        // Change the current working directory to the Terraform configuration directory
        process.chdir(configPath);
    
        // Run Terraform commands
        exec('terraform init', (error, initStdout, initStderr) => {
          if (error) {
            console.error('Terraform initialization failed:', initStderr);
            res.status(400).send("Terraform initialization failed");
          } else {
            console.log('Terraform initialization succeeded.');
            exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
              if (applyError) {
                console.error('Terraform apply failed:', applyStderr);
                res.status(400).send("Terraform apply failed");
              } else {
                console.log('Terraform apply succeeded.');
                return true
              }
            });
          }
        });
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message }); 
    }
}

module.exports = { rosa }