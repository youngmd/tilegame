var myapp = angular.module('myapp', []);


function mainController($scope, $http) {
    $scope.title = "A list of people";
    $scope.formData = {};

    $scope.searchText = "";

    $scope.people = [
        {name:'John', age:25, gender:'boy'},
        {name:'Jessie', age:30, gender:'girl'},
        {name:'Johanna', age:28, gender:'girl'},
        {name:'Joy', age:15, gender:'girl'},
        {name:'Mary', age:28, gender:'girl'},
        {name:'Peter', age:95, gender:'boy'},
        {name:'Sebastian', age:50, gender:'boy'},
        {name:'Erika', age:27, gender:'girl'},
        {name:'Patrick', age:40, gender:'boy'},
        {name:'Samantha', age:60, gender:'girl'}
    ];

    $scope.addperson = function() {
        var person  = {name: $scope.formData.name, age: $scope.formData.age, gender: $scope.formData.gender};
        console.log(person);
        $scope.people.push(person);
    }
};