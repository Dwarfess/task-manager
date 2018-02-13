# Web application
Simple task manager, implemented on AngularJS.<br>

## Download & Get started
1. Open `Git Bash`.
2. Change the current working directory to the location where you want the cloned directory to be made.
3. Type git clone, and then paste the URL:
```
 git clone https://github.com/Dwarfess/task-manager.git
```
4. Move to the application folder
```
 cd task-manager
```
5. Сommand to install dependencies from `package.json` (up to 10 minutes)
```
 npm install --save-dev
```
6. Сommand to run the application
```
 node backend.js
```
7. Open in your browser address [localhost:3000](http://localhost:3000)

8. To stop the application, press `CTRL+C`


**ATTENTION: In order to launch the application on your computer, you must first be running `MongoDB` on port 27017 and an updated version `NodeJS`. Detailed description of the installation of the `MongoDB` you can find [here](https://metanit.com/nosql/mongodb/1.2.php)**

## Brief description of application operation

### Unauthorized users can
   * View task list
   * Login/register to app to do more

### Authorized users can
   * View task list
   * Move the tasks from one group to another
   * View task information by clicking on the item
   * Correct task information ("Edit" button)
   * Delete the tasks from the list ("cross" icon near the item or the "Delete" button at the info window)
   * Delete the groups from the list ("cross" icon near the name of the group)
   * Add a new task (the "Add task" button at the main page)
   * Create a new group (the "Create group" button at the main page)
   * Restoring default values as an example (the "Reset to default" button at the main page)



**(in case somebody trying to open task information, the authorization window appears)**
