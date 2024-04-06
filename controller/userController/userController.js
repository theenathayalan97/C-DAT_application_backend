const userService = require('../../service/userService')
const awslogin = require("../../service/getService")
let message = require('../../response/message')


async function userSignUp(req, res ) {
    try {
      await userService.userSignUp(req, res)
    }
    catch (error) {
      return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
  }
  
  async function superAdminSignUp(req, res ) {
    try {
      await userService.superAdminSignUp(req, res)
    }
    catch (error) {
      return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
  }
  
  async function organizationSignUp(req, res ) {
    try {
      await userService.organizationSignUp(req, res)
    }
    catch (error) {
      return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
  }
  
  async function organizationLogin(req, res ) {
    try {
      let login_message = message.login
      await userService.organizationLogin(req, res, login_message)
    }
    catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
  }
  
  async function adminSignUp(req, res ) {
    try {
      await userService.adminSignUp(req, res)
    }
    catch (error) {
      return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
  }
  
  //AWS LOGIN
  async function login(req, res ) {
    try {
      let login_message = message.login
      await userService.userLogin(req, res, login_message)
    }
    
    catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
  }

  async function awsLogin(req, res ) {
    try {
      let login_message = message.login
      await awslogin.awsLogin(req, res, login_message)
    }
    
    catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
  }

  async function forgetPassword(req, res ) {
    try {
      let login_message = message.login
      await userService.forgetPassword(req, res, login_message)
    }
    catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
  }

  async function passwordOtpVerify(req, res ) {
    try {
      let login_message = message.login
      await userService.passwordOtpVerify(req, res, login_message)
    }
    catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
  }
  
  async function changePassword(req, res ) {
    try {
      let login_message = message.login
      await userService.changePassword(req, res, login_message)
    }
    catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
  }
  
  //get 
  async function userGet(req, res){
    let userData = await userService.getUser(req, res)
  }
  
  async function organizationGet(req, res){
    let organizationData = await userService.getOrganization(req, res)
  }

  async function serviceGet(req, res){
    let organizationData = await userService.getService(req, res)
  }

    module.exports = { adminSignUp, superAdminSignUp, organizationSignUp, organizationLogin, 
    userSignUp, login   , userGet, organizationGet, serviceGet, forgetPassword, changePassword,
    passwordOtpVerify, awsLogin }
  