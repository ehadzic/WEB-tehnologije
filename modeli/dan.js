const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const Dan = sequelize.define("Dan",{
        naziv:{
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        }
    }, {
        freezeTableName: true,
    })
    return Dan;
};