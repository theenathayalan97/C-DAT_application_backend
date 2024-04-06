const gitService = require('../../service/gitService')
const destroyService = require('../../service/destroyService')
const architectureService = require('../../service/architectureService')
const messsageService = require('../../service/messageService')
const userService = require('../../service/userService')

let message = require('../../response/message') 

async function accountDestroy(req, res) {
    try {
      let destroy_message = message.accountDestroy
      const destroy = await destroyService.accountDestroy(req, res, destroy_message)
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ message: "Something went wrong", result: error.message });
    }
  }
  
  async function serviceDestroy(req, res) {
    try {
      let destroy_message = message.serviceDestroy
      const destroy = await destroyService.serviceDestroy(req, res, destroy_message)
    } catch (error) {
      console.error("Error:", error);
      return res.status(400).json({ message: "Something went wrong", result: error.message });
    }
  }
  

  async function create_queue(req, res) {
    try {
      let queue_message = message.create_queue
      const queueMessage = await messsageService.queueCreate(req, res, queue_message)
    }
    catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: "Something went wrong", result: error.message });
    }
  }
  
  
  async function create_sns_topic(req, res) {
    try {
      let sns_create = message.snsCreate
      const snsMessage = await messsageService.createSnsTopic(req, res, sns_create)
    }
    catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
  }
  

  async function push_code(req, res) {
    try {
      let push_msg = message.codePush
      let codePush = await gitService.codePush(req, res, push_msg)
    } catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
  }
  

  async function code_pull(req, res) {
    try {
      let pull_msg = message.codePull
      let codePull = await gitService.codePull(req, res, pull_msg)
    } catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
  }
  
  async function load_balancer(req, res){
    try {
      let load_massage = message.createLoadBalancer
      let load_balancer = await architectureService.loadbancer(req, res, message)
  
    } catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: "something went wrong", result: error.message})
    }
  }


  async function key_pair(req, res){
    let key_pair_message= message.keyPair
    let keyPairService = await architectureService.keyPair(req, res, key_pair_message)
  }

  async function send_email(req,res){
    try {
      let mail_send=message.mailSend
      const mailsend = await messsageService.mailSend(req,res,mail_send)
    } catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
  }

  async function s3_bucket(req, res) {
    try {
      let s3_bucket_message = message.s3Bucket
      const bucket_creation = await userService.s3_bucket_creation(req, res, s3_bucket_message)
    } catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
  }

  module.exports = { accountDestroy, serviceDestroy, create_queue, create_sns_topic, push_code,
    code_pull, load_balancer, key_pair, send_email, s3_bucket}