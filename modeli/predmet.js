const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const Predmet = sequelize.define("Predmet",{
        naziv:{
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        freezeTableName: true,
    })
    return Predmet;
};