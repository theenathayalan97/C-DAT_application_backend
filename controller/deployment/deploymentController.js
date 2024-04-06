const rosaService = require('../../service/rosaService')
const dockerService = require("../../service/dockerService")
const jenkinsService = require("../../service/jenkinsService")
const appRunnerService = require('../../service/appRunner')
const ebsService = require('../../service/ebsService')
const codePipelineService = require('../../service/codePipelineService')

let message = require('../../response/message')

async function createDockerInstance(req, res) {
    try {
      let docker_instance = message.dockerInstance
      let instance = await dockerService.createDockerInstance(req, res, docker_instance)
    } catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
  }
  
  async function createContainerDeploy(req, res) {
    try {
      let container_deploy = message.containerDeploy
      let instance = await dockerService.containerDeploy(req, res, container_deploy)
    } catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
  }
  
  async function rosa(req, res) {
    try {
      let rosa_create = message.rosaCreate
      let rosa = await rosaService.rosa(req, res, rosa_create)
    } catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
  }
  
  async function jenkinsInstance(req, res){
    try {
      let Jenkins = message.Jenkins
      let jenkins = await jenkinsService.jenkinsInstance(req, res, Jenkins)
    } catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
  }

  async function jenkinsPipeline(req, res){
    try {
      let jenkins_pipeline = message.jenkinsPipeline
      let jenkins = await jenkinsService.jenkinsData(req, res, jenkins_pipeline)
    } catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
  }
  
  async function appRunner(req, res){
      let cloud_appRunner = message.appRunner
      let runner = await appRunnerService.appRunner(req, res, cloud_appRunner)
  }
  
  async function ebs(req, res){
    let cloud_ebs= message.ebs
    let beanstrackService = await ebsService.ebs(req, res, cloud_ebs)
  }
  
  async function code_pipeline(req, res){
    let cloud_pipeline= message.code_pipeline
    let codePipeLineService = await codePipelineService.codePipeline(req, res, cloud_pipeline)
  }

  module.exports = { createDockerInstance, createContainerDeploy, rosa, jenkinsPipeline, 
    appRunner, ebs, code_pipeline, jenkinsInstance, jenkinsPipeline }