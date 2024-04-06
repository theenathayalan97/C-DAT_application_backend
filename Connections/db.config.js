const env= process.env
module.exports={
    HOST:env.HOST,
    USER:env.NAME,
    PASSWORD:env.PASSWORD,
    DB:env.DB,
    dialect:'postgres',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }

}