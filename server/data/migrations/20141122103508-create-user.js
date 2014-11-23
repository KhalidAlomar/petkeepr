"use strict"

module.exports = {
	up: function(migration, DataTypes, done) {
		migration.createTable(
			'Users',
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true
				},
				userName: {
					type: DataTypes.STRING
				},
				password: {
					type: DataTypes.STRING
				},
				createdAt: {
					type: DataTypes.DATE
				},
				updatedAt: {
					type: DataTypes.DATE
				}
			}
		);
		done();
	},
 
	down: function(migration, DataTypes, done) {
		migration.dropTable('Users');
		done();
	}
};