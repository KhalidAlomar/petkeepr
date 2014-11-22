"use strict";

var fs        = require("fs");
var path      = require("path");

module.exports = createModels;

function createModels(sequelize, Sequelize) {

  var models = {};
  models.sequelize = sequelize;
  models.Sequelize = Sequelize;

  fs
    .readdirSync(__dirname)
    .filter(function(file) {
      return (file.indexOf(".") !== 0) && (file !== "index.js") && (file !== "createModels.js");
    })
    .forEach(function(file) {
      var model = sequelize["import"](path.join(__dirname, file));
      models[model.name] = model;
    });

  Object.keys(models).forEach(function(modelName) {
    if ("associate" in models[modelName]) {
      models[modelName].associate(models);
    }
  });

  return models;
}
