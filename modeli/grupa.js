const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const Grupa = sequelize.define("Grupa",{
        naziv:{
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
        }
    }, {
        freezeTableName: true,
    })
    return Grupa;
};