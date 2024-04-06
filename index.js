const express = require("express")
let bodyParser = require('body-parser')
const { exec } = require('child_process');
const dotenv = require('dotenv').config()
require('./Connections/Database')
const cors = require('cors')
var app=express();
const port = 8000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

// parse application/json
app.use(bodyParser.json())


const aws_router = require("./router/aws_router")
app.use("/api/v1",aws_router)

const azure_router = require("./router/azureRouter")
app.use("/api/v1",azure_router)




//server port 
app.listen(port,(err)=>{
  if(err){
    console.log("the port is not connect ",err)
  }
    console.log("Server has started successfully")
})




