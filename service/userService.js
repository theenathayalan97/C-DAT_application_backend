const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../response/response')
require('dotenv').config()

const jwt = require('jsonwebtoken');

const mailMessage = require('../subService/function')

const access_key = process.env.access_key
const secret_key = process.env.secret_key

//database
let database = require('../Connections/postgres')
let user = database.users
let organization = database.organizations
let service = database.Services

let otp;

async function userSignUp(req, res) {
  try {
    // console.log(1);
    let register = {}
    let name = req.body.user_name
    let password = req.body.password
    let email = req.body.email
    let phonenumber = req.body.phonenumber
    let organization_name = req.body.organization_name
 
    register.name = name
    register.password = password
    register.email = email
    register.phonenumber = phonenumber
    if (organization_name) {
      let organization_data = await organization.findOne({
        where: { organization_name: organization_name }
      })
      if (!organization_data ){
        return res.status(400).json({ message: "organization not found" })
      }else{
      register.organization_id = organization_data.uuid
      register.status = "pending"
      let data = await user.findOne({
        where: { email: email, organization_id: register.organization_id }
      })
      if (data) {
        return res.status(400).json({ message: "already email id registered" })
      } else {
        let sendMail = await mailMessage.mailSend(organization_data.email, `Please approve your organization by ${name}`, organization_data.organization_name)
        let userRegister = await user.create(register)
        return res.status(201).json({ message: "Request message send for admin" })
      }
      }
    } else {
      
      let data = await user.findOne({
        where: { email: email }
      })
      if (data) {
        return res.status(400).json({ message: "already email id registered" })
      } else {
        let userRegister = await user.create(register)
        return res.status(201).json({ message: "user register successfully" })
      }
    }


  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function superAdminSignUp(req, res, message) {
  try {
    // console.log(1);
    let register = {}
    let name = req.body.name
    let password = req.body.password
    let email = req.body.email
    let phonenumber = req.body.phonenumber
    let role = req.body.role
    register.name = name
    register.password = password
    register.email = email
    register.phonenumber = phonenumber
    register.role = role

    let data = await user.findOne({
      where: { email: email }
    })
    if (data) {
      return res.status(400).json({ message: "already email id registered" })
    } else {
      let organizationRegister = await user.create(register)
      return res.status(201).json({ message: "super admin register successfully" })
    }

  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function organizationSignUp(req, res, message) {
  try {
    // console.log(1);
    let register = {}
    let organization_name = req.body.organization_name
    let password = req.body.password
    let email = req.body.email
    let phonenumber = req.body.phonenumber

    register.organization_name = organization_name
    register.password = password
    register.email = email
    register.phonenumber = phonenumber
    register.createdby = req.id

    let data = await organization.findOne({
      where: { email: email }
    })
    if (data) {
      if (data.organization_name == register.organization_name) {
        return res.status(400).json({ message: "already name registered" })
      } else if (data.phonenumber == register.phonenumber) {
        return res.status(400).json({ message: "already phonenumber registered" })
      } else {
        return res.status(400).json({ message: "already email_id registered" })
      }
    } else {
      let organizationRegister = await organization.create(register)
      return res.status(201).json({ message: "organization register successfully" })
    }

  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function organizationLogin(req, res, message) {
  try {
    let email = req.body.email
    if (!email) {
      return res.status(400).json({ message: "email required" })
    }
    let password = req.body.password
    if (!password) {
      return res.status(400).json({ message: "password required" })
    }
    // console.log(1);
    let organizationData = await organization.findOne({
      where: { email: email }
    })
    if (!organizationData) {
      return res.status(404).json({ message: "organization not found" })
    } else if (organizationData.password == password) {
      return res.status(201).json({ message: "log in successfully" })
    } else {
      return res.status(400).json({ message: "user email id and password incorrect" })
    }


  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function adminSignUp(req, res, message) {
  try {
    // console.log(1);
    let register = {}
    let name = req.body.user_name
    let password = req.body.password
    let email = req.body.email
    let phonenumber = req.body.phonenumber
    let role = req.body.role
    let organization_name = req.body.organization_name
    if(!organization_name){
      return res.status(400).json({ message: "organisation name required" })
    }

    register.name = name
    register.password = password
    register.email = email
    register.phonenumber = phonenumber
    if ((req.role == 'admin') && (role == 'superAdmin')) {
      return res.status(400).json({ message: "access denied" })
    }
    register.role = role



    if (req.organization_id) {
      register.organization_name = req.organization_id
    } else {
      let organizationData = await organization.findOne({
        where: { organization_name: organization_name }
      })

      if(organizationData){
        register.organization_id = organizationData.uuid
      }else{
        return res.status(400).json({ message: "organisation not found" })
      }     
    }

    let data = await user.findOne({
      where: { phonenumber: phonenumber, organization_id : register.organization_id }
    })
    if (data) {
      if (data.email == register.email) {
        return res.status(400).json({ message: "already email registered" })
      }else {
        return res.status(400).json({ message: "already phonenumber registered" })
      }
    } else {
      let userRegister = await user.create(register)
      return res.status(200).json({ message: "user register successfully" })
    }

  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function userLogin(req, res, message) {
  try {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let email = req.body.email
    if (!email) {
      return res.status(400).json({ message: "email required" })
    }
    let password = req.body.password
    if (!password) {
      return res.status(400).json({ message: "password required" })
    }
    // console.log(1);
    let data = await user.findOne({
      where: { email: email, status: 'active', is_active: true }
    })
    if (!data) {
      return res.status(404).json({ message: "user not found" })
    } else if ((data.password == password)) {
      let user = {
        uuid: data.uuid,
        role: data.role,
        organization_id: data.organization_id
      }
      const token = jwt.sign(user, jwtSecretKey, {
        expiresIn: '365d' // expires in 365 days
      });
      return res.status(201).json({ message: "log in successfully", result: token })
    } else {
      return res.status(400).json({ message: "user phone number and password incorrect" })
    }


  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function getService(req, res) {
  try {
    let userId = req.id

    let serviceDetails = await service.findAll({
      where: { user_id: userId }
    })
    if (serviceDetails) {
      return res.status(200).json({ message: "get service detail successfully" })
    } else {
      return res.status(404).json({ message: "service not found" })
    }
  } catch (error) {
    return res.status(400).json({ message: "something went wrong", result: error.message })
  }
}

async function s3_bucket_creation(req, res, message) {
  try {
    const bucketname = req.body.bucket_name;
    if (!bucketname) {
      return res.status(400).json({ message: "Bucket name is required" });
    }
    const tfConfigPath = `${path.directory}/s3_bucket.tf`;

    const tfConfig = `
      resource "aws_s3_bucket" "${req.body.bucket_name}" {
          bucket =  "${req.body.bucket_name}"
          lifecycle {
                  prevent_destroy = true
                } 
        }`;
    // Write the Terraform configuration to a file
    fs.writeFileSync(`${path.directory}/s3_bucket.tf`, tfConfig);
    const configPath = `${path.directory}`;
    process.chdir(configPath);

    exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        if(applyStderr.includes('start with a letter or underscore')){
          return res.status(400).json({ message : "the letter not start with a number or underscore"})
        }
        console.error('Terraform S3 Bucket creation failed:', applyStderr);
        return res.status(400).json({ message: "Terraform S3 Bucket creation failed" });
      } else {
        console.log('Terraform apply succeeded.');
        respounce.createMessage(req, res, message)
      }
    });
  }
  catch (error) {
    return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

async function forgetPassword(req, res) {
  try {
    let forgetPassword = {
      email: req.params.email,
      uuid: req.id
    }

    let data = await user.findOne({
      where: forgetPassword
    })
    if (!data) {
      return res.status(404).json({ message: "email not found" })
    }

    otp = otpGenerator.generate(4, {
      lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
    });

    setTimeout(() => {
      otp = undefined

    }, 30000)
    console.log(" generate : ", otp);
    const transporter = nodemailer.createTransport({
      port: 465,               // true for 465, false for other ports
      host: "smtp.gmail.com",
      auth: {
        user: process.env.step - email,
        pass: process.env.step - pass,
      },
      secure: true,
    });

    const mailData = {
      from: process.env.step - email,  // sender address
      to: data.email,   // list of receivers
      subject: 'change the password',
      text: 'That was easy!',
      html: `<b>forget password </b><br> OTP - ${otp}<br/>`,
    };

    transporter.sendMail(mailData, function (err, info) {
      if (err)
        console.log(err)
      else
        return res.status(200).json({ message: "OTP mail send successfully", message_id: info })
    });
  } catch (error) {
    return res.status(400).json({ message: "something went wrong", result: error.message })
  }
}

async function passwordOtpVerify(req, res) {
  try {
    let userOtp = req.body.otp
    if (userOtp == otp) {
      return res.status(200).json({ message: 'OTP verifyed successfully' })
    } else {
      return res.status(400).json({ message: 'Please check the OTP' })
    }
  } catch (error) {
    return res.status(400).json({ message: 'something went wrong', result: error.message })
  }
}

async function changePassword(req, res) {
  try {
    let newPassword = req.body.newPassword
    let changePassword = req.body.changePassword
    if (newPassword == changePassword) {
      let data = await user.findOne({
        where: { uuid: req.id }
      })
      data.password = changePassword
      let passwordUpdate = await user.update(data, {
        where: { uuid: req.id }
      })
      return res.status(200).json({ message: 'Password change successfully' })
    } else {
      return res.status(400).json({ message: 'Please check the new password and change password' })
    }

  } catch (error) {
    return res.status(400).json({ message: 'something went wrong', result: error.message })
  }
}

//get 
async function getUser(req, res) {
  try {
    let user_id = req.id
    let userData = await user.findOne({
      where: { uuid: user_id }
    })

    return res.status(200).json({ message: "user data get successfully ", result: userData })
  } catch (error) {
    return res.status(400).json({ message: 'something went wrong', result: error.message })
  }
}

async function getOrganization(req, res) {
  try {
    let name = req.body.name
    let organizationData = await organization.findOne({
      where: { name: name }
    })

    return res.status(200).json({ message: "user data get successfully ", result: organizationData })
  } catch (error) {
    return res.status(400).json({ message: 'something went wrong', result: error.message })
  }
}

module.exports = {
  adminSignUp, superAdminSignUp, organizationSignUp, userSignUp, organizationLogin,
  userLogin, s3_bucket_creation, getService, forgetPassword, changePassword,
  passwordOtpVerify, getOrganization, getUser
};









