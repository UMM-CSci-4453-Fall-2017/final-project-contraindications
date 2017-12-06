angular.module('register',[])
  .controller('registerCtrl',RegisterCtrl)
  .factory('registerApi',registerApi)
  .constant('apiUrl','http://localhost:1337'); // CHANGED for the lab 2017!

function RegisterCtrl($scope,registerApi){
  $scope.noContraindications = true;
  $scope.possibleMedications = [];
  $scope.yourMedications = [];
  $scope.possibleConditions = [];
  $scope.yourConditions = [];
  $scope.contraindications = [];
  $scope.addClick=addClick;

// Universal
  $scope.errorMessage='';
  $scope.isLoading=isLoading;
  var loading = false;

  function isLoading(){
    return loading;
   }

   // calls the database when medications or conditions
     function addClick(addedSynonym){
        $scope.errorMessage='';
        registerApi.getContraindications(getSynonymList(addedSynonym))
           .success(function(){
             setPanelHeights();
             refreshContras();
           })
           .error(function(){$scope.errorMessage="Unable to click";});
     }
     refreshDropdowns();  //make sure the buttons are loaded


   // Other functions
  function getSynonymList(addedSynonym)
  {
    if(addedSynonym.TypeID == 1)
    {
      $scope.yourMedications.push(addedSynonym);
      var synonymIDs = [];
      for(var i = 0; i < $scope.yourMedications.length; i++)
      {
        synonymIDs.push($scope.yourMedications[i].SynonymID);
      }
    } else {
      $scope.yourConditions.push(addedSynonym);
      var synonymIDs = [];
      for(var i = 0; i < $scope.yourConditions.length; i++)
      {
        synonymIDs.push($scope.yourConditions[i].SynonymID);
      }
    }

  }

   // when called, gets contraindications from api and updates $scope.contraindications
  function refreshContras(){
    loading=true;
    $scope.errorMessage='';
    registerApi.getContraindications()
      .success(function(data){
         $scope.contraindications=data;
         loading=false;
      })
      .error(function () {
          $scope.errorMessage="Unable to load contraindications:  Database request failed";
          loading=false;
      });
 }

 // when called, gets medications and conditions from api and updates $scope.possibleMedications and $scope.possibleConditions
function refreshDropdowns(){
  loading=true;
  $scope.errorMessage='';
  registerApi.getMedications()
    .success(function(data){
       $scope.possibleMedications=data;
       loading=false;
    })
    .error(function () {
        $scope.errorMessage="Unable to load medications:  Database request failed";
        loading=false;
    });
    registerApi.getConditions()
      .success(function(data){
         $scope.possibleConditions=data;
         loading=false;
      })
      .error(function () {
          $scope.errorMessage="Unable to load medications:  Database request failed";
          loading=false;
      });
}

}

// api that holds functions for retrieving button and list information
function registerApi($http,apiUrl){
  return{
    getMedications: function() {
      var url = apiUrl + '/medications';
      return $http.get(url);
    },
    getConditions: function() {
      var url = apiUrl + '/conditions';
      return $http.get(url);
    },
    getContraindications: function() {
      var url = apiUrl + '/contraindications';
      return $http.get(url);
    }
 };
}
