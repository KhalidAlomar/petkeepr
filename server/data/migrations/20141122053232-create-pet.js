"use strict"

module.exports = {
	up: function(migration, DataTypes, done) {
		migration.createTable(
			'Pets',
			{
				id: {
					type: DataTypes.INTEGER,
					primaryKey: true,
					autoIncrement: true
				},
				name: {
					type: DataTypes.STRING
				},
				startDate: {
					type: DataTypes.DATE
				},
				endDate: {
					type: DataTypes.DATE
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
		migration.dropTable('Pets');
		done();
	}
};