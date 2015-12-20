'use strict';

/* Controllers */
var visualAcoControllers = angular.module('visualAcoControllers', []);

visualAcoControllers.controller('VisualisationCtrl', ['$scope', 'City', 'AntColony', 'AntSystemAlgorithm', 'Two',
  function ($scope, City, AntColony, AntSystemAlgorithm, Two) {
    $scope.nrOfCities = 10;
    $scope.animationSpeed = 2;
    $scope.evaporation = 0.5;
    $scope.Q = 500;
    $scope.iterationCount = 0;
    $scope.antPercentage = 80;
    $scope.bestTourLength = "NaN";
    $scope.isRunning = false;
    $scope.runOrStopLabel = "Run";

    $scope.changedSpeed = function () {
      $scope.$emit('speedChange', $scope.animationSpeed);
    };

    $scope.generate = function () {
      bestTour = undefined;
      $scope.bestTourLength = "NaN";
      Two.remove(_.pluck(cities, 'point'));
      Two.remove(lines);
      _($scope.nrOfCities).times(function (n) {
        var radius = getScaleAdjustedSettings().radius;
        var x = _.random(radius, Two.width - radius);
        var y = _.random(radius, Two.height - radius);
        var circle = Two.makeCircle(x, y, radius);
        circle.noStroke().fill = '#000000';
        cities[n] = City(n, x, y, circle);
      });
      colony = AntColony($scope, cities, Math.round($scope.nrOfCities * ($scope.antPercentage / 100)), algorithm);
    };

    function drawBest() {
      Two.remove(lines);
      var start = cities[bestTour.tour[$scope.nrOfCities - 1]];
      var end = cities[bestTour.tour[0]];
      lines[0] = Two.makeLine(start.x, start.y, end.x, end.y);
      for (var i = 1; i < bestTour.tour.length; i++) {
        start = cities[bestTour.tour[i - 1]];
        end = cities[bestTour.tour[i]];
        lines[i] = Two.makeLine(start.x, start.y, end.x, end.y);
      }
    }

    $scope.noCities = function () {
      return cities.length === 0;
    };

    $scope.runOrStop = function () {
      if ($scope.isRunning) stop();
      else run();
    };

    var intervalId;
    function stop() {
      clearInterval(intervalId);
      $scope.isRunning = false;
      $scope.runOrStopLabel = "Run";
      colony.stopAnts();
    }

    function run() {
      $scope.runOrStopLabel = "Stop";
      $scope.isRunning = true;
      $scope.iterationCount = 0;
      var running = false;
      intervalId = setInterval(runIter, 30);
      function runIter() {
        if (running) return;
        if ($scope.iterationCount >= 100) {
          clearInterval(intervalId);
          return;
        }
        running = true;
        colony.setupAnts();
        colony.moveAnts().then(function() {
          colony.updateTrails();
          updateBest(colony.getBestTour());
          $scope.iterationCount++;
          running = false;
        });
      }
    }

    var cities = [];
    var bestTour = undefined;
    var lines = [];
    var algorithm = AntSystemAlgorithm();
    var colony = AntColony($scope, cities, Math.round($scope.nrOfCities * ($scope.antPercentage / 100)), algorithm);

    function getScaleAdjustedSettings() {
      if ($scope.nrOfCities < 50) return {radius: 10, scale: 0.5};
      if ($scope.nrOfCities < 250) return {radius: 5, scale: 0.3};
      return {radius: 3, scale: 0.15};
    }

    function updateBest(currentBest) {
      if (isNaN($scope.bestTourLength) || currentBest.length < bestTour.length) {
        bestTour = currentBest;
        $scope.bestTourLength = bestTour.length;
      }
      drawBest();
      console.log("Best tour so far: ", bestTour.length);
      console.log(bestTour.tour.toString());
    }
  }]);

visualAcoControllers.controller('AlgorithmCtrl', ['$scope',
  function ($scope) {
  }]);

visualAcoControllers.controller('AboutCtrl', ['$scope',
  function ($scope) {
  }]);