var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var Mustache = require('mustache');
var files = require('./lib/files');

function getBasePath(componentName) {
  if (path.isAbsolute(componentName)) {
    return componentName;
  } else {
    return path.join(files.getCurrentDirectoryBase(), componentName)
  }
}

function promptUser(callback) {
  var questions = [
    {
      name: 'componentName',
      type: 'input',
      message: 'Enter the name of your component:',
      validate: function( value ) {
        if (!value.length) {
          return 'Please enter a name for your component';
        }
        else if (files.directoryExists(getBasePath(value))) {
          return 'This directory already exists';
        } else {
          return true;
        }
      }
    },
  ];

  inquirer.prompt(questions).then(callback);
}

function writeFiles(componentName) {
  var basePath = getBasePath(componentName);

  fs.readFile('./templates/Component.js.mst', function (err, data) {
    if (err) throw err;
    var output = Mustache.render(data.toString(), { componentName });
    fs.writeFile(path.join(basePath, `${componentName}.js`), output);
  });
}

function run() {
  promptUser(function() {
    var componentName = arguments['0']['componentName'];
    writeFiles(componentName, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
  });
}

run();
