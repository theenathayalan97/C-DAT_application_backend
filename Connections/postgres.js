const dbConfig= require('./db.config')

const Sequelize = require('sequelize')
const database = new Sequelize(dbConfig.DB,dbConfig.USER,dbConfig.PASSWORD,{
    host:dbConfig.HOST,
    dialect:dbConfig.dialect})

const db={}
db.Sequelize= Sequelize
db.database= database

db.users= require('../schema/user')(database,Sequelize)
db.organizations= require('../schema/organization')(database,Sequelize)
db.Services= require('../schema/Services')(database,Sequelize)


module.exports=db
