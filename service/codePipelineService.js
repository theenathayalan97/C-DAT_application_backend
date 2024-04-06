

const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../response/response')

async function codePipeline(req, res, message){
    try {
        let tfConfig = `
        resource "aws_codepipeline" "codepipeline" {
            name     = "tf-test-pipeline"
            pipeline_type = "V2"
            role_arn = aws_iam_role.codepipeline_role.arn
          
            artifact_store {
              location = aws_s3_bucket.codepipeline_bucket.bucket
              type     = "S3"
            }
          
            stage {
              name = "Source"
          
              action {
                name             = "Source"
                category         = "Source"
                owner            = "AWS"
                provider         = "CodeStarSourceConnection"
                version          = "1"
                output_artifacts = ["source_output"]
          
                configuration = {
                  ConnectionArn    = aws_codestarconnections_connection.example.arn
                  FullRepositoryId = "c-dat-backend"
                  BranchName       = "master"
                }
              }
            }
          
            stage {
              name = "Build"
          
              action {
                name             = "Build"
                category         = "Build"
                owner            = "AWS"
                provider         = "CodeBuild"
                input_artifacts  = ["source_output"]
                output_artifacts = ["build_output"]
                version          = "1"
          
                configuration = {
                  ProjectName = "test"
                }
              }
            }
          
            stage {
              name = "Deploy"
          
              action {
                name            = "Deploy"
                category        = "Deploy"
                owner           = "AWS"
                provider        = "ELASTICBEANSTALK"
                input_artifacts = ["build_output"]
                version         = "1"
          
               configuration = {
                  ApplicationName    = "new-cdat-terraform"
                  EnvironmentName    = "cdat-terraform-env-1"
                  WaitForDeployment  = "true"
                  ActionMode         = "REPLACE_ON_FAILURE"
                }
              }
            }
          }
          
          resource "aws_codestarconnections_connection" "example" {
            name          = "example-connection"
            provider_type = "GitHub"
          }
          
          resource "aws_s3_bucket" "codepipeline_bucket" {
            bucket = "test-bucket-123-cdat-ebs"
          }
          
          resource "aws_s3_bucket_public_access_block" "codepipeline_bucket_pab" {
            bucket = aws_s3_bucket.codepipeline_bucket.id
          
            block_public_acls       = true
            block_public_policy     = true
            ignore_public_acls      = true
            restrict_public_buckets = true
          }
          
          data "aws_iam_policy_document" "assume_role" {
            statement {
              effect = "Allow"
          
              principals {
                type        = "Service"
                identifiers = ["codepipeline.amazonaws.com"]
              }
          
              actions = ["sts:AssumeRole"]
            }
          }
          
          resource "aws_iam_role" "codepipeline_role" {
            name               = "test-role"
            assume_role_policy = data.aws_iam_policy_document.assume_role.json
          }
          
          
          
          data "aws_iam_policy_document" "codepipeline_policy" {
            statement {
              effect = "Allow"
          
              actions = [
                "s3:GetObject",
                "s3:GetObjectVersion",
                "s3:GetBucketVersioning",
                "s3:PutObjectAcl",
                "s3:PutObject",
              ]
          
              resources =  [
                  "arn:aws:s3:::test-bucket-123-cdat-ebs",
                  "arn:aws:s3:::test-bucket-123-cdat-ebs/*"
                ]
            }
              statement {
                effect = "Allow"
                actions = ["elasticbeanstalk:*"]
                resources = ["*"]
              }
          
            statement {
              effect    = "Allow"
              actions   = ["codestar-connections:UseConnection"]
              resources = [aws_codestarconnections_connection.example.arn]
            }
          
            statement {
              effect = "Allow"
          
              actions = [
                "codebuild:BatchGetBuilds",
                "codebuild:StartBuild",
              ]
          
              resources = ["*"]
            }
          }
          
          resource "aws_iam_role_policy" "codepipeline_policy" {
            name   = "codepipeline_policy"
            role   = aws_iam_role.codepipeline_role.id
            policy = data.aws_iam_policy_document.codepipeline_policy.json
          }          
        `

        fs.writeFileSync(`${path.directory}/codePipeline.tf`, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);

         // Run Terraform commands
         exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
              if(applyStderr.includes('terraform init -update')){
                exec('terraform init -update',()=>{
                  codePipeline(req, res, message)
                })
              }else if(applyStderr.includes('terraform init ')){
                exec('terraform init ',()=>{
                  codePipeline(req, res, message)
                })
              }else if(applyStderr.includes("already exists")){
                return res.status(400).json({ message: "name is already exit" });
              }
                console.log('code pipeline  creation failed:', applyStderr);
                return res.status(400).json({ message: "code pipeline creation failed" });
            } else {
                console.log('Terraform apply succeeded.');
                respounce.createMessage(req, res, message);
            }
        });
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

module.exports = { codePipeline }