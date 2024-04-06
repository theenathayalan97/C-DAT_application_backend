const getService = require('../../service/getService')

let message = require('../../response/message')

async function vpc_list(req, res) {
    try {
        let vpc_list_message = message.getVpc
        const vpcList = await getService.vpcListGet(req, res, vpc_list_message)
    } catch (error) {
        console.log("get vpc_list is error :", error);
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
};

async function subnet_list(req, res) {
    try {
        let subnet_list_message = message.getSubnet
        const subnetList = await getService.subnetGetList(req, res, subnet_list_message)
    } catch (error) {
        console.log("error is: ", error);
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
};

async function security_group_list(req, res) {
    try {
        let securityGroup_list_message = message.getSecurityGroup
        const subnetList = await getService.securityGroupListGet(req, res, securityGroup_list_message)
    } catch (error) {
        console.log("error is: ", error);
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
};

async function architectureSecurity_group_list(req, res) {
    try {
        let subnet_list_message = message.getSecurityGroup
        const subnetList = await getService.architectureSecurityGroup(req, res, subnet_list_message)
    } catch (error) {
        console.log("error is: ", error);
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
};

async function internet_gate_way_list(req, res) {
    try {
        let internetGateWay_list_message = message.getInternetGateWay
        const subnetList = await getService.internetGateWayList(req, res, internetGateWay_list_message)
    } catch (error) {
        console.log("error is: ", error);
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
};

async function nat_gate_way_list(req, res) {
    try {
        let natGateWay_list_message = message.getNatGateWay
        const subnetList = await getService.natGateWayList(req, res, natGateWay_list_message)
    } catch (error) {
        console.log("error is: ", error);
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
};

async function os_list(req, res) {
    try {
        let os_list_message = message.getOs
        const osList = await getService.osListGet(req, res, os_list_message)
    } catch (error) {
        console.log("error is: ", error);
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
}

module.exports = {
    vpc_list, subnet_list, security_group_list, architectureSecurity_group_list,
    internet_gate_way_list, os_list, nat_gate_way_list
}
