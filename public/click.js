angular.module('register',[])
  .controller('registerCtrl',RegisterCtrl)
  .factory('registerApi',registerApi)
  .constant('apiUrl','http://localhost:1337'); // CHANGED for the lab 2017!

function RegisterCtrl($scope,registerApi){
  $scope.noContraindications = true;
  $scope.possibleMedications = [{SynonymID: 1, Name: "Xenol", FactorID: 3},
                                {SynonymID: 2, Name: "Sudefrinalin", FactorID: 3},
                                {SynonymID: 3, Name: "Pizzafrin", FactorID: 1},
                                {SynonymID: 4, Name: "Epilopal", FactorID: 2}];
  $scope.yourMedications = {};
  $scope.possibleConditions = [{SynonymID: 5, Name: "Smoking", FactorID: 4},
                                {SynonymID: 6, Name: "Pregnant", FactorID: 5},
                                {SynonymID: 7, Name: "Low blood pressure", FactorID: 6},
                                {SynonymID: 8, Name: "Kidney Disease", FactorID: 7}];
  $scope.yourConditions = {};

// Universal
  $scope.errorMessage='';
   $scope.isLoading=isLoading;
   var loading = false;
   $scope.setPanelHeights=setPanelHeights;




   function setPanelHeights() {

     var medicationPanel = document.getElementById('medicationPanel').offsetHeight;
     var conditionPanel = document.getElementById('conditionPanel').offsetHeight;
     console.log("med " + medicationPanel + " cond " + conditionPanel);
     if(conditionPanel>medicationPanel)
     {
       console.log("here");
         document.getElementById('medicationPanel').style.height=1000;
     }
     else
     {
       console.log("no here");
         document.getElementById('conditionPanel').style.height=medicationPanel;
     }
   };


   function isLoading(){
    return loading;
   }

   // Authentication functions
   function loginClick(){
    console.log("clicked it");
    setPanelHeights();
     $scope.errorMessage='';
     registerApi.clickLogin(username.value, pwd.value)
        .success(function(){
          $scope.authenticated = true;
        })
        .error(function(){$scope.errorMessage="Unable to click";});
   };


   // Button functions

   // when called, gets buttons from api and updates $scope.buttons
  function refreshButtons(){
    loading=true;
    $scope.errorMessage='';
    registerApi.getButtons()
      .success(function(data){
         $scope.buttons=data;
         loading=false;
      })
      .error(function () {
          $scope.errorMessage="Unable to load Buttons:  Database request failed";
          loading=false;
      });
 }

// when called, gets lines from api and updates $scope.lines
 function refreshLines(){
   loading=true;
   $scope.errorMessage='';
   setPanelHeights();
   registerApi.getLines()
     .success(function(data){
        $scope.lines=data;
        decimalinator(); // formats price for UI
         // calculates and formats price for UI
        loading=false;
     })
     .error(function () {
         $scope.errorMessage="Unable to load Lines:  Database request failed";
         loading=false;
     });
}

// calls the database when buttons are clicked
  function buttonClick($event){
     $scope.errorMessage='';
     registerApi.clickButton($event.target.id)
        .success(function(){
          totalPrice(); // calculates and formats price for UI
          refreshLines(); // gets lines from api and updates $scope.lines
        })
        .error(function(){$scope.errorMessage="Unable to click";});
  }
  refreshButtons();  //make sure the buttons are loaded

// calculates and formats price for UI
  function totalPrice(){
    $scope.totalPrice = 0;
    for(var i = 0; i < $scope.lines.length; i++) {
      $scope.totalPrice += $scope.lines[i].price * $scope.lines[i].quantity;
    }

    $scope.totalPrice =  $scope.totalPrice + "";
    console.log("clicked it");
    if($scope.totalPrice.substring($scope.totalPrice.length - 3, $scope.totalPrice.length - 2) != ".") {

      if($scope.totalPrice.substring($scope.totalPrice.length - 2, $scope.totalPrice.length - 1) == ".") { // if there is one decimal place (ex: 1.5)
        $scope.totalPrice += "0";
      } else { // if it is a round number (ex: 36)
        $scope.totalPrice += ".00";
      }
    }
  }

// formats price for UI
  function decimalinator() {
    for(var i = 0; i < $scope.lines.length; i++) {
      price = ($scope.lines[i].price * $scope.lines[i].quantity) + "";
      if(price.substring(price.length - 3, price.length - 2) != ".") {

        if(price.substring(price.length - 2, price.length - 1) == ".") { // if there is one decimal place (ex: 1.5)
          price += "0";
        } else { // if it is a round number (ex: 36)
          price += ".00";
        }
      }
      $scope.lines[i].displayPrice = price;
    }
  }

// calls the database when lines are clicked
  function lineClick($event){
     $scope.errorMessage='';
     registerApi.clickLine($event.target.parentElement.id)
        .success(function(){
          //totalPrice(); // calculates and formats price for UI
          refreshLines(); // gets lines from api and updates $scope.lines
        })
        .error(function(){$scope.errorMessage="Unable to click";});
  }
  refreshLines();  //make sure the lines are loaded

}

// api that holds functions for retrieving button and list information
function registerApi($http,apiUrl){
  return{
    getButtons: function(){ // retreives button information from database
      var url = apiUrl + '/buttons';
      return $http.get(url);
    },
    clickButton: function(id){ // sends button click information to database
      var url = apiUrl+'/click?id='+id;
      return $http.get(url);
    },
    getLines: function(){ // retreives list information from database
      var url = apiUrl + '/list';
      return $http.get(url);
    },
    clickLine: function(id){ // sends line click information to databse
      var url = apiUrl+'/click?id='+id;
      return $http.get(url);
    },
    clickLogin: function(username,password) {
      console.log("in here");
      var url = apiUrl + '/login';
      return $http.get(url);
    }
 };
}
