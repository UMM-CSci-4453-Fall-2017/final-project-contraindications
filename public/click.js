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
        refreshContras(addedSynonym);
     }
     refreshDropdowns();  //make sure the buttons are loaded


   function initializeEmptyContras(data,allContraIDs)
   {
     $scope.contraindications = [];
     var uniqueContraIDs = [];
     for(var i = 0; i < allContraIDs.length; i++)
     {
       if(!uniqueContraIDs.includes(allContraIDs[i]))
       {
         uniqueContraIDs.push(allContraIDs[i]);
         $scope.contraindications.push({ContraindicationID: uniqueContraIDs[i], Factors: ""});
       }
     }

     return uniqueContraIDs;
   }

   function aggregateContras(data,uniqueContraIDs)
   {
     for(var i = 0; i < data.length; i++)
     {
       var indexOfData = uniqueContraIDs.indexOf(data[i].ContraindicationID);
       if($scope.contraindications[indexOfData].Factors.length > 1) {
         $scope.contraindications[indexOfData].Factors += " and " + data[i].Name;
       } else {
         $scope.contraindications[indexOfData].Factors += data[i].Name;
       }
       $scope.contraindications[indexOfData].Description = data[i].Description;
     }
   }

  function getSynonymList(addedSynonym)
  {
    var yourMedSynIDs = $scope.yourMedications.map(m => m.SynonymID);
    var yourConSynIDs = $scope.yourConditions.map(c => c.SynonymID);
    if(addedSynonym.TypeID == 1 && !yourMedSynIDs.includes(addedSynonym.SynonymID))
    {
      $scope.yourMedications.push(addedSynonym);
      yourMedSynIDs.push(addedSynonym.SynonymID);
    }
    else if (addedSynonym.TypeID == 2 && !yourConSynIDs.includes(addedSynonym.SynonymID)) {
      $scope.yourConditions.push(addedSynonym);
      yourConSynIDs.push(addedSynonym.SynonymID);
    }
    return yourMedSynIDs.concat(yourConSynIDs);
  }

   // when called, gets contraindications from api and updates $scope.contraindications
  function refreshContras(addedSynonym){
    loading=true;
    $scope.errorMessage='';

    registerApi.getContraindications(getSynonymList(addedSynonym))
      .success(function(data){
         aggregateContras(data,initializeEmptyContras(data,data.map(m => m.ContraindicationID)));
         if($scope.contraindications.length > 0)
         {
           $scope.noContraindications = false;
         } else {
           $scope.noContraindications = true;
         }
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
    getContraindications: function(synonymIDs) {
      var url = apiUrl + '/contraindications?synonymIDs=' + synonymIDs;
      return $http.get(url);
    }
 };
}
