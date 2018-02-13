var app = angular.module("app", ["dndLists"]);

app.controller("mainCtrl", function ($scope, $http){

    //present view
    $scope.currentView = "table";
    
    
                        //FOR LOGIN AND REGISTRATION
    $scope.bg = false;//fixed background 
    $scope.log = false;//form for login
    $scope.reg = false;//form for registration
    
    $scope.existingLogin = false;
    $scope.wrongLogin = false;
    $scope.wrongPass = false;
    
    $scope.showForms = function(x,y,z,h){  //fuction for bg, log and reg
        $scope.bg = x;
        $scope.log = y;
        $scope.reg = z;
        
        //cleans form messages
        $scope.existingLogin = h;
        $scope.wrongLogin = h;
        $scope.wrongPass = h;
        
        //cleans forms
        $scope.user={};
        $scope.newUser={}; 
        $scope.newUser.email = "";
        $scope.newUser2={};
    }
    
    
    //add new users
    $scope.addNewUser = function (newUser) {        
        $http.post('api/users', newUser).then(function (response) {
            console.log('success', response.data);// success
            
            if(response.data == "Error"){
                $scope.existingLogin = true;//error - this login exists
            }else{
                $scope.showForms(false,false,false,false);
            }
            
        }, function (data, status, headers, config) {
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
        });       
    }
    
    $scope.online = {"logged":true};//info about logged user
    
    $scope.logIn = function(){//for login into the site

        $http.post("api/auth", {login: $scope.user.login, password: $scope.user.pass}).then(function (response) {
            console.log('success', response.data);// success
            if (response.data.login) {
                $scope.online.logged = false;//check logged in or not
                $scope.online.login = response.data.login;//add user name
                
                $scope.showForms(false,false,false,false);
                
            } if (response.data.status == 1) {
                $scope.wrongLogin = false;
                $scope.wrongPass = true;
                
            } if (response.data.status == 2) {   
                $scope.wrongLogin = true;
                $scope.wrongPass = false;
            }
            
        }, function (data, status, headers, config) {
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
        });
    }
    
    $scope.logOut = function(x){//for log out from the site
        $scope.online.logged = true;
        
        $scope.$broadcast('currentView', {
            message: "table"
        });
    }
    
    
                        //FOR ERRORS WHEN FILLING THE FORMS
    $scope.getError = function (error, type) {
        if (angular.isDefined(error)) {
            if (error.email) {
                return "Wrong email";
            } else if (error.pattern && type){
                return "Wrong password";
            }
        }
    }
});









app.controller("viewCtrl", function ($scope, $http){
    
    //GET ALL TASKS
    $http.get('api/tasks').then(function (response) {
        console.log('success', response.data);// success
        $scope.json = response.data;
        
    }, function (data, status, headers, config) {
        console.log(data);
        console.log(status);
        console.log(headers);
        console.log(config);
    });
    
                    //OPTION FOR REGISTERED USERS
    //blocks the ability to move topics for unregistered users
    $scope.dragover = function (index, external, type, callback) {  
        return !$scope.online.logged;
    }
    
    $scope.saveMoving = function() {
        $http.post("api/saveMoving", $scope.json).then(function(response) {
            console.log('success', response.data);// success
            $scope.json = response.data;
            
        }, function (data, status, headers, config) {
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
        });
    }
        
    //select pressed task 
    $scope.show = function(item){
        if(!$scope.online.logged){
            $scope.info = item;
            $scope.currentView = "info";
        }else{
            $scope.$parent.bg = true; 
            $scope.$parent.log = true;
        }
    }
    
    $scope.$on('currentView', function (event, data) {//if logout, currentView - table
        $scope.currentView = data.message; 
    });
    
    //return to present view
    $scope.back = function(){
        $scope.currentView = "table";
    }

    //RESET TO DEFAULT
    $scope.reset = function () {            
        $http.get('api/reset').then(function (response) {
            console.log('success', response.data);// success
            $scope.json = response.data;
            
        }, function (data, status, headers, config) {
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
        });       
    };
    
    //edit or create new task
    $scope.showGroup = true;//show or hide select with groups
    $scope.editOrCreate = function (item, view, currentView, showGroup) {
        $scope.showGroup = showGroup;
        $scope.currentItem = item ? angular.copy(item) : {};
        $scope.currentView = currentView;
        $scope.view = view;
    }

    //save changes
    $scope.saveEdit = function (item) {
        try{//check the valid date
            if(new Date(item.due_date).toISOString().substr(0, 10)==item.due_date.substr(0, 10)){
                if (angular.isDefined(item._id)) {
                    console.log("=========== update");
                    $scope.updateTask(item);
                } else {
                    console.log("=========== create");
                    $scope.createTask(item);
                }
            } else {
                $scope.wrongDate = true;
            }       
        } catch (e){
            $scope.wrongDate = true;
        }
    }    
    
    //CREATE NEW GROUP
    $scope.createGroup = function (item) {
        $http.post('api/group', item).then(function (response) {
            console.log('success', response.data);// success
            $scope.json = response.data;
            $scope.currentView = "table";
            
        }, function (data, status, headers, config) {
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
        });
    }
    
    //ADD NEW TASK
    $scope.createTask = function (item) {
        $http.post('api/task', item).then(function (response) {
            console.log('success', response.data);// success
            $scope.json = response.data;
            $scope.currentView = "table";
            
        }, function (data, status, headers, config) {
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
        });
    }
    

    //DELETE THE GROUP
    $scope.deleteGroup = function (index) {
        $http.delete('api/deleteGroup?id='+$scope.json[index]._id).then(function (response) {
            console.log('success', response.data);// success
            $scope.json = response.data;
              
        }, function (data, status, headers, config) {
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
        });

        $scope.currentView = "table"; 
    }

    //DELETE THE TASK FROM THE GROUP
    $scope.deleteTask = function (item) {
        $scope.json.forEach(function (e, i) {
            if (e.tasks.indexOf(item) >= 0)
                e.tasks.splice(e.tasks.indexOf(item), 1);
        });
        
        $http.delete('api/deleteTask?id='+item._id).then(function (response) {
            console.log('success', response.data);// success
            $scope.json = response.data;
            
        }, function (data, status, headers, config) {
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
        });
        
        $scope.currentView = "table";
    }
    
    
    //UPDATE TASK
    $scope.updateTask = function (item) {
        $http.put('api/update', item).then(function (response) {
            console.log('success', response.data);// success
            $scope.json = response.data;
            
        }, function (data, status, headers, config) {
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
        });
        
        $scope.info = item;
        $scope.currentView = "info"
    }

    //cancel changes and return to present table
    $scope.cancelEdit = function (item) {
        $scope.currentItem = {};
        $scope.currentView = $scope.view;
    }
});




