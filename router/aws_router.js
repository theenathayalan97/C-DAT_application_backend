const userController = require("../controller/userController/userController")
const serviceController = require("../controller/serviceController/serviceController")
const architectureController = require('../controller/archetecController/archetectureController')
const getServiceController = require("../controller/serviceController/getServiceController")
const deploymentController = require("../controller/deployment/deploymentController")
const middleware= require('../middleware/auth')
const router=require("express").Router();




/**
 * @openapi
 * /superAdmin_signup:
 *   post:
 *     summary: Register a new super admin
 *     description: Creates a new super admin account.
 *     requestBody:
 *       description: Super admin information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: A successful response
 *       '400':
 *         description: Bad request. Invalid input data.
 * /user_list:
 *   get:
 *     summary: Retrieve a list of users
 *     description: Retrieve a list of users from the database.
 *     responses:
 *       '200':
 *         description: A successful response with a list of users.
 *       '401':
 *         description: Unauthorized. User does not have permission.

 */




// finish router
//super admin
router.post("/superAdmin_signup", userController.superAdminSignUp);

// organization
router.post("/organization_signup", middleware.authorization, middleware.authentication(['superAdmin'],true), userController.organizationSignUp);
router.post("/organization_login", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), userController.organizationLogin);

//user
router.post("/signup", userController.userSignUp);
router.post("/login",  userController.login);
router.post("/aws_login",  userController.awsLogin);
router.post("/forget_password",  userController.forgetPassword);
router.post("/otp_verifycation",  userController.passwordOtpVerify);
router.post("/change_password",  userController.changePassword);
router.post("/user_signup", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), userController.adminSignUp);

// get
router.get("/user_list",middleware.authorization, middleware.authentication(['superAdmin','admin'],true), userController.userGet);
router.get("/organization_list",middleware.authorization, middleware.authentication(['superAdmin','admin','user'],true), userController.organizationGet);
router.get("service_list",middleware.authorization, middleware.authentication(['superAdmin','admin'],true), userController.serviceGet)

//service
router.post("/s3_bucket", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),serviceController.s3_bucket)
router.get("/vpclist",getServiceController.vpc_list);
router.get("/SG_list",getServiceController.security_group_list)
router.get("/subnet_list",getServiceController.subnet_list)
router.get("/interGateWay_list",getServiceController.internet_gate_way_list)
router.get("/natGateWay_list",getServiceController.nat_gate_way_list)
router.get("/os_list",getServiceController.os_list)
router.post("/queue_creation", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), serviceController.create_queue)
router.post("/sns_topic", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), serviceController.create_sns_topic)
router.post("/load_balancer", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), serviceController.load_balancer)
router.post("/key_pair", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), serviceController.key_pair)
router.delete("/account_delete", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),serviceController.accountDestroy)
router.delete("/file_delete", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),serviceController.serviceDestroy)

//deploy process
router.post("/docker_instance", middleware.authorization, middleware.authentication(['superAdmin','admin','user'],true),deploymentController.createDockerInstance) //ECR
router.post("/cloud_app_runner", middleware.authorization, middleware.authentication(['superAdmin','admin','user'],true),deploymentController.appRunner) //App runner
router.post("/jenkins_pipeline", middleware.authorization, middleware.authentication(['superAdmin','admin','user'],true),deploymentController.jenkinsPipeline) //Jenkins
router.post("/ebs", middleware.authorization, middleware.authentication(['superAdmin','admin','user'],true),deploymentController.ebs) //EBS
router.post("/jenkins_instance", middleware.authorization, middleware.authentication(['superAdmin','admin','user'],true),deploymentController.jenkinsInstance)
router.post("/jenkins_pipeline", middleware.authorization, middleware.authentication(['superAdmin','admin','user'],true),deploymentController.jenkinsPipeline)

//process
router.post("/architecture",architectureController.architecture)
router.post("/container_deploy", middleware.authorization, middleware.authentication(['superAdmin','admin','user'],true),deploymentController.createContainerDeploy) //ECS

//Not using below router
router.post("/rosa", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),deploymentController.rosa)
router.get("/code_pull", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), serviceController.code_pull)
router.post("/code_push", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), serviceController.push_code)


module.exports=router