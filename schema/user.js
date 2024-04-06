
module.exports = (database, Sequelize) => {
    const User = database.define('User', {
        uuid: {
            type: Sequelize.UUID,
            primarykey: true,
            defaultValue: Sequelize.UUIDV4()
        },
        name: {
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
        phonenumber: {
            type: Sequelize.STRING,
            allowNull: false
        },
        role: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue:'user'
        },
        status: {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue:'active'
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
        organization_id: {
            type: Sequelize.STRING,
            allowNull: true
        },
    }, {
        timeStamps: true
    })
    return User
}