/**
 * Created by Shaun Erikson on 18/10/2014.
 */
(function() {
    var myData;
    var app = angular.module('store', [ ]);

    myData = {
        name: 'Bill',
        age: 25
    };
    app.controller('StoreController', function() {
       this.boop = {
           name: 'Bill',
           age: 25
       };
    });


})();
