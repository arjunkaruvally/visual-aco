'use strict';

/* Controllers */
var visualAcoControllers = angular.module('visualAcoControllers', []);

visualAcoControllers.controller('VisualisationCtrl', ['$scope', 'City', 'AntColony', 'AntSystemAlgorithm', 'Two',
  function ($scope, City, AntColony, AntSystemAlgorithm, Two) {
    $scope.nrOfCities = 50;
    $scope.animationSpeed = 2;
    $scope.evaporation = 0.1;
    $scope.Q = 80;
    $scope.alpha = 5;
    $scope.beta = 10;
    $scope.iterationCount = 0;
    $scope.antPercentage = 80;
    $scope.nrOfIterations = 100;
    $scope.bestTourLength = "NaN";
    $scope.runOrStopLabel = "Run";
    $scope.isRunning = false;
    $scope.skipDrawingAnts = false;
    $scope.skipDrawingTrails = false;

    var saved_x = [ 774, 470, 195, 690, 209, 198, 601, 675, 82, 335, 399, 196, 579, 457, 340, 616, 713, 657, 284, 597, 477, 291, 480, 657, 634, 409, 51, 502, 231, 748, 48, 399, 336, 764, 588, 491, 810, 249, 299, 756, 514, 257, 552, 633, 705, 680, 210, 769, 407, 432]
    var saved_y = [ 307 ,435 ,185 ,555 ,30 ,101 ,44 ,338 ,44 ,67 ,123 ,564 ,171 ,506 ,442 ,89 ,147 ,151 ,561 ,32 ,172 ,161 ,559 ,226 ,196 ,281 ,334 ,83 ,518 ,474 ,564 ,260 ,593 ,154 ,453 ,291 ,319 ,443 ,302 ,41 ,205 ,89 ,312 ,96 ,307 ,585 ,44 ,8 ,195 ,493 ]

    var cities = [];
    var bestTour = undefined;
    var lines = [];
    var colony = undefined;

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
        // var x = _.random(radius, Two.width - radius);
        // var y = _.random(radius, Two.height - radius);
        var x = saved_x[n]
        var y = saved_y[n]

        var circle = Two.makeCircle(x, y, radius);
        circle.noStroke().fill = '#000000';
        cities[n] = City(n, x, y, circle);
      });
      // x_cities = 
      console.log(cities.length);
      // for(let i=0; cities.length; i++){
      //   console.log(cities[i]);
      // }
    };
    $scope.noCities = function () {
      return cities.length === 0;
    };

    $scope.runOrStop = function () {
      if ($scope.isRunning) stop();
      else run();
    };

    $scope.getCitiesArray = function () {
      return _.map(cities, function(city) {
        return {x:city.x, y:city.y}
      })
    };

    var intervalId;
    function stop() {
      clearInterval(intervalId);
      $scope.isRunning = false;
      $scope.runOrStopLabel = "Run";
      colony.stopAnts();
    }

    function run() {
      Two.remove(lines);
      $scope.bestTourLength = "NaN";
      var algorithm = AntSystemAlgorithm($scope.alpha, $scope.beta);
      colony = AntColony($scope, cities, Math.round($scope.nrOfCities * ($scope.antPercentage / 100)), algorithm, getScaleAdjustedSettings().scale);
      $scope.runOrStopLabel = "Stop";
      $scope.isRunning = true;
      $scope.iterationCount = 0;
      var running = false;
      intervalId = setInterval(runIter, 30);
      function runIter() {
        if (running) return;
        if ($scope.iterationCount >= $scope.nrOfIterations) {
          stop();
          $scope.$digest();
          return;
        }
        running = true;
        colony.setupAnts($scope.skipDrawingAnts);
        colony.moveAnts($scope.skipDrawingAnts).then(function() {
          colony.updateTrails($scope.skipDrawingTrails);
          updateBest(colony.getBestTour());
          $scope.iterationCount++;
          running = false;
        });
      }
    }

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
    }

    function drawBest() {
      Two.remove(lines);
      var start = cities[bestTour.tour[$scope.nrOfCities - 1]];
      var end = cities[bestTour.tour[0]];
      lines[0] = Two.makeLine(start.x, start.y, end.x, end.y);
      lines[0].linewidth = 4;
      for (var i = 1; i < bestTour.tour.length; i++) {
        start = cities[bestTour.tour[i - 1]];
        end = cities[bestTour.tour[i]];
        lines[i] = Two.makeLine(start.x, start.y, end.x, end.y);
        lines[i].linewidth = 4;
      }
    }
  }]);

visualAcoControllers.controller('AlgorithmCtrl', ['$scope',
  function ($scope) {
  }]);

visualAcoControllers.controller('AboutCtrl', ['$scope',
  function ($scope) {
  }]);