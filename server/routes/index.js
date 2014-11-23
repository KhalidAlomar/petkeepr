"use strict";

var di = require('ng-di');
require('../lib/db');
require('../lib/models');

var angularModule = di.module('modRouters', ['modDb', 'modModels']);
module.exports = angularModule;

var createUserRouter = require('./userrouter');
createUserRouter.$inject = ['models'];
angularModule.factory('userRouter', createUserRouter);

var createPetRouter = require('./petrouter');
createPetRouter.$inject = ['models'];
angularModule.factory('petRouter', createPetRouter);
