const azureController = require("../controller/azureController")
const router=require("express").Router();

router.post("/azure_login",azureController.azure_login);
router.post("/virtual_network",azureController.virtual_network);
router.post("/resource_group",azureController.resource_group);

module.exports=router