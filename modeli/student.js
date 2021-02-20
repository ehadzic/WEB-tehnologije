const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const Student = sequelize.define("Student",{
        ime:{
            type: Sequelize.STRING,
            allowNull: false,
        },
        index: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        }
    }, {
        freezeTableName: true,
    })
    return Student;
};