"use strict";

module.exports = function(sequelize, DataTypes) {
  	var Pet = sequelize.define(
		'Pet', 
		{
			name: DataTypes.STRING
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