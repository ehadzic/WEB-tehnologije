const Sequelize = require("sequelize");
const sequelize = new Sequelize("wt2017909","root","root",{host:"127.0.0.1",dialect:"mysql",logging:false});
const db={};

db.Sequelize = Sequelize;  
db.sequelize = sequelize;

//import modela

const fs = require('fs');
const path = require('path');
fs
    .readdirSync('./modeli')
    .forEach((file) => {
        //const model = sequelize.import(path.join('./models', file));
        const model = require(path.join(__dirname,'modeli', file))(sequelize, Sequelize)
        db[model.name] = model;
    });


//relacije
// Veza 1-n Predmet-Grupa
db.Predmet.hasMany(db.Grupa, {foreignKey: {name: 'predmet', allowNull: false}});
db.Grupa.belongsTo(db.Predmet, {foreignKey: {name: 'predmet', allowNull: false}});



// Veza n-1 Aktivnost-Predmet
db.Predmet.hasMany(db.Aktivnost, {foreignKey: {name: 'predmet', allowNull: false}});
db.Aktivnost.belongsTo(db.Predmet, {foreignKey: {name: 'predmet', allowNull: false}});

//Veza n-0 Aktivnost-Grupa
db.Grupa.hasMany(db.Aktivnost, {foreignKey: {name: 'grupa', allowNull: true}});
db.Aktivnost.belongsTo(db.Grupa, {foreignKey: {name: 'grupa', allowNull: true}});

//Aktivnost N-1 Dan
db.Dan.hasMany(db.Aktivnost, {foreignKey: {name: 'dan', allowNull: false}});
db.Aktivnost.belongsTo(db.Dan, {foreignKey: {name: 'dan', allowNull: false}});

//Aktivnost N-1 Tip
db.Tip.hasMany(db.Aktivnost, {foreignKey: {name: 'tip', allowNull: false}});
db.Aktivnost.belongsTo(db.Tip, {foreignKey: {name: 'tip', allowNull: false}});

//Student N-M Grupa
db.Student.belongsToMany(db.Grupa, {through: 'StudentiGrupe', foreignKey: 'student'});
db.Grupa.belongsToMany(db.Student, {through: 'StudentiGrupe', foreignKey: 'grupa'});


module.exports=db;