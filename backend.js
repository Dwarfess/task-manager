
const express = require('express');
const app = express();
const url = require('url');
const qs = require("querystring");
const fs = require("fs");

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')))

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const options = {
    useMongoClient: true,
    autoIndex: false, // Don't build indexes
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
};

const db_path = "mongodb://localhost:27017/dnd";
const STATUS_WRONG_PASSWORD = 1;
const STATUS_USER_DONT_EXIST = 2;

// for work with promise
mongoose.Promise = global.Promise;

//setting the schema
var userScheme = new Schema({
    login: String,
    email: String,
    password: String
});
    
var userModel = mongoose.model("users", userScheme);//create module with schema


//load page 
app.get('/', function(req, res){
	res.sendFile('public/index.html', { root: __dirname });
});

                    //ADD AND CREATE USERS
    //ADD NEW USER
app.post('/api/users', function(req, res){
	console.log(req.body);    
    
    // connection to the mongodb (for server - mongod --config mongodb.config)
    mongoose.connect(db_path, options);   

    //regular for checking login
    var regex = new RegExp(["^", req.body.login, "$"].join(""), "i");
    
    userModel.findOne({"login":regex}, function(err, doc){
        if(doc){
            console.log("Go error");
            res.send("Error");
        } else{
            var newUser = new userModel({
                login: req.body.login,
                email: req.body.email,
                password: req.body.pass
            });
            
            newUser.save(function(err){                
                if(err) return console.log(err);
                res.send("Object is saved");
                console.log("Object is saved", newUser.login);
            });    
        }
    });	
});

    // LOGIN
app.post('/api/auth', function(req, res){
    mongoose.connect(db_path, options);   

    //regular for checking login
    var regex = new RegExp(["^", req.body.login, "$"].join(""), "i");
    
    userModel.findOne({"login":regex}, function(err, doc){
        if(doc){
            if(doc.password == req.body.password){
                res.type('application/json');
                res.jsonp(doc);
            } else  {
                var resp = {status: STATUS_WRONG_PASSWORD};
                res.jsonp(resp);
                console.log("Wrong password");
            }
        } else{
            console.log("Go error")
            var resp = {status: STATUS_USER_DONT_EXIST};
            res.jsonp(resp);
            console.log("This user doesn't exist");
        }
    });
});





                    //OPTION FOR REGISTERED USERS
//setting the schema
var tasksScheme = new Schema({
    title: String,
    tasks: [{
        name: String,
        due_date: { type: Date, default: Date.now },
        description: String
    }]
});
 
var tasksModel = mongoose.model("tasks", tasksScheme);//create module with schema

//function receives and adds the array with tasks to mongo
async function list(file){
    var obj = file; 
    console.log("Start list");
    for(var i=0;i<obj.length;i++){
        let newTask = new tasksModel(obj[i]);

        await newTask.save(function(err){
            if(err) return console.log(err);
        });
    }
}

    //GET ALL TASKS
app.get('/api/tasks', function(req, res){ 
    // connection to the mongodb (for server - mongod --config mongodb.config)
    mongoose.connect(db_path, options);       
    tasksModel.find({}, function(err, doc){
        res.type('application/json');
        res.jsonp(doc);
    });      
});

    //SAVE MOVING TASKS
app.post('/api/saveMoving', async function(req, res){ 
    // connection to the mongodb (for server - mongod --config mongodb.config)
    mongoose.connect(db_path, options);

    await tasksModel.remove({}, function (err) {
        if (err) return handleError(err);
    });
        
    await list(req.body);//function receives and adds the array with tasks to mongo
            
    tasksModel.find({}, function(err, doc){
        res.type('application/json');
        res.jsonp(doc);
    });     
});

    //RESET TO DEFAULT
app.get('/api/reset', async function(req, res){ 
    // connection to the mongodb (for server - mongod --config mongodb.config)
    mongoose.connect(db_path, options);

    await tasksModel.remove({}, function (err) {
        if (err) return handleError(err);
    });
    
    let file = JSON.parse(fs.readFileSync('public/tasks.json', 'utf8'));
    await list(file);//function receives and adds the array with tasks to mongo
    
    tasksModel.find({}, function(err, doc){
        res.type('application/json');
        res.jsonp(doc); 
    });      
});


    //CREATE NEW GROUP
app.post('/api/group', async function(req, res){
    mongoose.connect(db_path, options);   

    var newGroup = new tasksModel({title:req.body.title});       
    await newGroup.save(function(err){                
        if(err) return console.log(err);
        console.log("New group was saved", req.body.title);
    });
    
    tasksModel.find({}, function(err, doc){
        res.type('application/json');
        res.jsonp(doc); 
    });
});	


    //ADD NEW TASK
app.post('/api/task', async function(req, res){
    mongoose.connect(db_path, options);    
    await tasksModel.findOneAndUpdate({"_id": req.body.group._id},
        {$push: {"tasks": {
            name: req.body.name,
            due_date: req.body.due_date,
            description: req.body.description
        }}},{upsert: true},function(err, doc) {
            if(err) return console.log(err);
            console.log("New task was saved", req.body.name);
        });
    
    tasksModel.find({}, function(err, doc){
        res.type('application/json');
        res.jsonp(doc); 
    });
});	



    //DELETE THE GROUP
app.delete('/api/deleteGroup', function(req, res){
    let parse_url = url.parse(req.url).query;
    let id = qs.parse(parse_url).id;
    
    mongoose.connect(db_path, options);
    //find the task by id and delete
    tasksModel.remove({"_id":id}, function(err, doc){
        console.log("The group was deleted");
    });
    
    tasksModel.find({}, function(err, doc){
        res.type('application/json');
        res.jsonp(doc); 
    });
  
});

    //DELETE THE TASK FROM THE GROUP
app.delete('/api/deleteTask', function(req, res){
    let parse_url = url.parse(req.url).query;
    let id = qs.parse(parse_url).id;
    
    mongoose.connect(db_path, options);
    tasksModel.update({},{$pull:{"tasks":{"_id":id}}},{multi:true}, function(err, doc){
        console.log("The task was deleted"); 
    });
    
    tasksModel.find({}, function(err, doc){
        res.type('application/json');
        res.jsonp(doc); 
    });
});

    //UPDATE TASK
app.put('/api/update', function(req, res){
    mongoose.connect(db_path, options);

    tasksModel.updateOne({"tasks._id": req.body._id},
                         { $set: { "tasks.$.name":req.body.name,
                                   "tasks.$.due_date":req.body.due_date,
                                   "tasks.$.description":req.body.description
                                 }}, function(err,doc){
        console.log("That task was update");
    });
    
    tasksModel.find({}, function(err, doc){
        res.type('application/json');
        res.jsonp(doc); 
    });
});


            //FOR ERROR
app.use(function(req, res, next){
	res.status(404);
	res.send('404 page not found');
});

app.use(function(err, req, res, next){
	res.status(500);
	res.send('Server error');
});

app.listen(3000, function(){
    console.log('Example app listening on port 3000!');
});
