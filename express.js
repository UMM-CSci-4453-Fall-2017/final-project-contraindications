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

// handles click information taken in from client
app.get("/click",function(req,res){
  var htmlID = req.param('id');
  console.log("htmlID " + htmlID.substring(0,1))
  var id;
  var sql;
  if(htmlID.substring(0,1) == ("l")) // this is if it's a line being clicked
  {
    id = htmlID.substring(5,htmlID.length);

    // sql query to delete rows from transaction table when corresponding row is clicked
    sql = 'DELETE FROM mitc0417.transaction_table WHERE lineID = ' + id + ';';
  }
  else { // this is if it's a button being clicked
    id = htmlID.substring(7,htmlID.length);

    // upsert to transaction table when button is clicked
    // if item is in the table, it increments quantity
    // if item is not in table, it adds it with quanitity = 1
    sql = 'INSERT INTO mitc0417.transaction_table (buttonID, quantity) VALUES (' + id + ', 1) ON DUPLICATE KEY UPDATE quantity = quantity + 1';
  }

  connection.query(sql,(function(res){return function(err,rows,fields){
     if(err){console.log("We have an insertion error:");
             console.log(err);}
     res.send(err); // Let the upstream guy know how it went
  }})(res));
});

// gets list from database
// sends lsit info to client
app.get("/list",function(req,res){

  // pulls information about transaction lines from till_buttons and transaction_table
  var sql = 'SELECT * FROM mitc0417.transaction_table LEFT JOIN mitc0417.till_buttons ON mitc0417.transaction_table.buttonID = mitc0417.till_buttons.buttonID;';
  connection.query(sql,(function(res){return function(err,rows,fields){
     if(err){console.log("We have an error:");
             console.log(err);}

     res.send(rows);
  }})(res));
});


// verifies login with information from client
app.get("/login",function(req,res){
  var htmlID = req.param('id');
  var sql = "SHOW TABLES";
  console.log("You made it!");

  connection.query(sql,(function(res){return function(err,rows,fields){
     if(err){console.log("We have an insertion error:");
             console.log(err);}
     res.send(err); // Let the upstream guy know how it went
  }})(res));
});

app.listen(port);
