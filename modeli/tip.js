const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const Tip = sequelize.define("Tip",{
        naziv:{
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        freezeTableName: true,
    })
    return Tip;
};