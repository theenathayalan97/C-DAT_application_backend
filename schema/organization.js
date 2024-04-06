
module.exports = (database, Sequelize) => {
    const Organization = database.define('Organization', {
        uuid: {
            type: Sequelize.UUID,
            primarykey: true,
            defaultValue: Sequelize.UUIDV4()
        },
        organization_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        phonenumber :{
            type: Sequelize.STRING,
            allowNull: false
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
        },
        createdby: {
            type: Sequelize.STRING,
            allowNull: true
        },
    }, {
        timeStamps: true
    })
    return Organization
}