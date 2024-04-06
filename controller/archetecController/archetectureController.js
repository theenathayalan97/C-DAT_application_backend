const architectureService = require('../../service/architectureService')

let message = require('../../response/message')


async function architecture(req, res) {
    try {
      let architecture_message = message.architecture
      let codeArchitecture = await architectureService.architecture(req, res, architecture_message)
    }
    catch (error) {
      console.log("error is: ", error);
      return res.status(400).json({ message: "something went wrong", result: error.message })
    }
  }

  module.exports = { architecture }