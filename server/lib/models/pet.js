"use strict";

module.exports = function(sequelize, DataTypes) {
  	var Pet = sequelize.define(
		'Pet', 
		{
			name: DataTypes.STRING,
			startDate: {
				type: DataTypes.DATE
			},
			endDate: {
				type: DataTypes.DATE
			}
		}, 
		{
			classMethods: {
			 	associate: function(models) {
					// associations can be defined here
				}
			}
		}
	);
	return Pet;
};