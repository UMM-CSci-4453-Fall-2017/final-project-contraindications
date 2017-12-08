// setup
var express=require('express'),
mysql=require('mysql'),
credentials=require('./credentials.json'),
app = express(),
port = process.env.PORT || 1337;

credentials.host='ids.morris.umn.edu'; //setup database credentials

var connection = mysql.createConnection(credentials); // setup the connection

connection.connect(function(err){if(err){console.log(error)}});

// gets buttons from database
// sends button info to client
app.use(express.static(__dirname + '/public'));
app.get("/buttons",function(req,res){
  var sql = 'SELECT * FROM mitc0417.till_buttons'; // sql query to get information from till_buttons
  connection.query(sql,(function(res){return function(err,rows,fields){
     if(err){console.log("We have an error:");
             console.log(err);}
     res.send(rows);
  }})(res));
});


// gets medications from database
// sends medication info to client
app.get("/medications",function(req,res){
  //gets list of synonyms of type 1 (medications)
  var sql = 'SELECT SynonymID, Name as HoverName, IF(CHAR_LENGTH(Name) > 40, CONCAT(SUBSTRING(Name,1,40),"..."),SUBSTRING(Name,1,40))  as Name, LinkID, TypeID FROM rich1143.Synonyms WHERE TypeID = 1 ORDER BY Name;';
  connection.query(sql,(function(res){return function(err,rows,fields){
     if(err){console.log("We have an error:");
             console.log(err);}
     res.send(rows);
  }})(res));
});

// gets conditions from database
// sends condition info to client
app.get("/conditions",function(req,res){
  //gets list of synonyms of type 2 (conditions)
  var sql = 'SELECT SynonymID, Name as HoverName, IF(CHAR_LENGTH(Name) > 40, CONCAT(SUBSTRING(Name,1,40),"..."),SUBSTRING(Name,1,40))  as Name, LinkID, TypeID FROM rich1143.Synonyms WHERE TypeID = 2 ORDER BY Name;';
  connection.query(sql,(function(res){return function(err,rows,fields){
     if(err){console.log("We have an error:");
             console.log(err);}
     res.send(rows);
  }})(res));
});


// takes in SynonymIDs of selected medications and conditions
// queries the database to find all contraindications
app.get("/contraindications",function(req,res){
  var synonymIDs = req.param('synonymIDs');

sql = 'SELECT temp2.ContraindicationID, Description, Name, FactorID FROM rich1143.Contraindications '
+ 'RIGHT JOIN (SELECT * FROM (SELECT Name, ContraFactorID, ContraindicationID, ContraFactors.FactorID FROM rich1143.SynFactor '
+ 'LEFT JOIN rich1143.ContraFactors ON ContraFactors.FactorID = SynFactor.FactorID WHERE SynonymID IN (' + synonymIDs + ')) as temp '
+ 'WHERE FactorID IS NOT NULL AND ContraindicationID IN '
+ '(SELECT ContraindicationID FROM (SELECT ContraindicationID, COUNT(ContraindicationID) as count '
+ 'FROM (SELECT SynonymID, Name, LinkID, ContraFactorID, ContraindicationID, ContraFactors.FactorID FROM rich1143.SynFactor '
+ 'LEFT JOIN rich1143.ContraFactors ON ContraFactors.FactorID = SynFactor.FactorID WHERE SynonymID IN (' + synonymIDs + ')) as temp '
+ 'WHERE FactorID IS NOT NULL GROUP BY ContraindicationID HAVING count > 1) as temp1)) as temp2 ON temp2.ContraindicationID = Contraindications.ContraindicationID;'

  connection.query(sql,(function(res){return function(err,rows,fields){
     if(err){console.log("We have an insertion error:");
             console.log(err);}
     res.send(rows); // Let the upstream guy know how it went
  }})(res));
});

app.listen(port);
