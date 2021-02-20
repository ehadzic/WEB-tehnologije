const Sequelize = require("sequelize");

module.exports = function (sequelize, DataTypes) {
	const Aktivnost = sequelize.define(
		"Aktivnost",
		{
			naziv: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			pocetak: { type: Sequelize.FLOAT, allowNull: false },
			kraj: { type: Sequelize.FLOAT, allowNull: false },
		},
		{
			freezeTableName: true,
		}
	);
	return Aktivnost;
};
