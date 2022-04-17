var express = require("express");
var app = express();
var port = 8083;
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://127.0.0.1:27017/test");
const cors = require('cors');

var nameSchema = new mongoose.Schema({
    firstName:String
   });

var User = mongoose.model("User", nameSchema);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.get("/", (req, res) => {
//  res.send("Hello World");
// });

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
   });
 
// app.post("/addname", (req, res) => {
//     console.log('enter post function');
//     console.log('req.body:' + req.body);
//     var myData = new User(req.body);
//     console.log(myData);
//     myData.save()
//     .then(item => {
//     res.send("item saved to database");
//     })
//     .catch(err => {
//     res.status(400).send("unable to save to database");
//     });
// });
app.use(cors({
    origin: '*'
}));

app.post("/mongodb", (req, res) => {
    console.log(req.body);
    console.log('req.body:' + req.body);
    var myData = new User({firstName : JSON.stringify(req.body)});
    console.log(myData);
    myData.save()
    .then(item => {
    res.send("item saved to database");
    })
    .catch(err => {
    res.status(400).send("unable to save to database");
    });
 });

app.listen(port, () => {
    console.log("Server listening on port " + port);
   });

// app.get("http://localhost:3000/abc", (req, res) => {
//     console.log('abc');
// });
