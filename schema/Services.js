module.exports = (database, Sequelize) => {
    const services = database.define('services', {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        service_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        tag_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        organization_id:{
            type:Sequelize.STRING,
            allowNull:true
        },
        user_id:{
            type:Sequelize.STRING,
            allowNull:true
        },
        is_deleted:{
            type:Sequelize.BOOLEAN,
            allowNull:true,
            defaultValue:false
        },
        is_active:{
            type:Sequelize.BOOLEAN,
            allowNull:true,
            defaultValue:true
        }
    },
        {
            timeStamps: true
        })
    return services

}