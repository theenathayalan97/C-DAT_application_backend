terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 4.20.0"
    }
    rhcs = {
      version = ">= 1.1.0"
      source  = "terraform-redhat/rhcs"
    }
  }
}
provider "rhcs" {
  token = var.token
  url   = var.url
}


resource "aws_s3_bucket" "example_bucket" {
  bucket = "demo-rosa-datayaan"
  # aws_s3_bucket_acl    = "public-read"
  # # additional S3 bucket configuration...

  tags = {
    Name = "demo-rosa-datayaan"
  }
}

# resource "aws_s3_bucket" "example" {
#   bucket = "demo-rosa-datayaan" 
#   tags = {
#     Name = "demo-rosa-datayaan"
#   } 
# }
 
# resource "aws_s3_bucket_ownership_controls" "example" {
#   bucket = aws_s3_bucket.example.id
#   rule {
#     object_ownership = "BucketOwnerPreferred"
#   }
# }
 
# resource "aws_s3_bucket_public_access_block" "example" {
#   bucket = aws_s3_bucket.example.id
 
#   block_public_acls       = false
#   block_public_policy     = false
#   ignore_public_acls      = false
#   restrict_public_buckets = false
# }
 
# resource "aws_s3_bucket_acl" "example" {
#   depends_on = [
#     aws_s3_bucket_ownership_controls.example,
#     aws_s3_bucket_public_access_block.example,
#   ]
 
#   bucket = aws_s3_bucket.example.id
#   acl    = "public-read"
# }
 

resource "aws_s3_bucket_policy" "example_bucket_policy" {
  bucket = "demo-rosa-datayaan"

  policy = <<EOF
  {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::demo-rosa-datayaan",
        "arn:aws:s3:::demo-rosa-datayaan/*"
      ],
      "Principal": {
        "AWS": [
          "arn:aws:iam::729416225111:user/learning_admin"
        ]
      }
    }
  ]
}
  EOF
  }

resource "rhcs_rosa_oidc_config_input" "oidc_input" {
  count = var.managed ? 0 : 1

  region = var.cloud_region
}

# Create the OIDC config resources on AWS
module "oidc_config_input_resources" {
  count = var.managed ? 0 : 1

  source  = "terraform-redhat/rosa-sts/aws"
  version = "0.0.14"

  create_oidc_config_resources = true

  bucket_name             = one(rhcs_rosa_oidc_config_input.oidc_input[*].bucket_name)
  discovery_doc           = one(rhcs_rosa_oidc_config_input.oidc_input[*].discovery_doc)
  jwks                    = one(rhcs_rosa_oidc_config_input.oidc_input[*].jwks)
  private_key             = one(rhcs_rosa_oidc_config_input.oidc_input[*].private_key)
  private_key_file_name   = one(rhcs_rosa_oidc_config_input.oidc_input[*].private_key_file_name)
  private_key_secret_name = one(rhcs_rosa_oidc_config_input.oidc_input[*].private_key_secret_name)
}

resource "rhcs_rosa_oidc_config" "oidc_config" {
  managed            = var.managed
  secret_arn         = one(module.oidc_config_input_resources[*].secret_arn)
  issuer_url         = one(rhcs_rosa_oidc_config_input.oidc_input[*].issuer_url)
  installer_role_arn = var.installer_role_arn
} 



data "rhcs_rosa_operator_roles" "operator_roles" {
  operator_role_prefix = var.operator_role_prefix
  account_role_prefix  = var.account_role_prefix
}


module "operator_roles_and_oidc_provider" {
  source  = "terraform-redhat/rosa-sts/aws"
  version = "0.0.14"

  create_operator_roles = true
  create_oidc_provider  = true

  cluster_id             = ""
  rh_oidc_provider_thumbprint = rhcs_rosa_oidc_config.oidc_config.thumbprint
  rh_oidc_provider_url        = rhcs_rosa_oidc_config.oidc_config.oidc_endpoint_url
  operator_roles_properties   = data.rhcs_rosa_operator_roles.operator_roles.operator_iam_roles
  tags                        = var.tags
  path                        = var.path
}

