#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var Mustache = require('mustache');
var files = require('./lib/files');

function getBasePath(componentPath) {
  if (path.isAbsolute(componentPath)) {
    return componentPath;
  } else {
    return path.join(files.getCurrentDirectory(), componentPath)
  }
}

function promptUser(callback) {
  var questions = [
    {
      name: 'componentPath',
      type: 'input',
      message: 'Enter the name/path of your component:',
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
    {
      name: 'container',
      type: 'confirm',
      message: 'Do you need a container?:',
    },
    {
      name: 'cssExtension',
      type: 'list',
      message: 'What css file extension do you use?',
      choices: ['Styles.js', '.css', '.scss'],
    },
  ];

  inquirer.prompt(questions).then(callback);
}

function templateMaps(componentName, cssExtension, container) {
  return [
    { render: container, templatePath: 'Container.js.mst', outputFile: `${componentName}Container.js` },
    { render: true, templatePath: 'index.js.mst', outputFile: `index.js` },
    { render: true, templatePath: 'Component.js.mst', outputFile: `${componentName}.js` },
    { render: true, templatePath: 'Styles.css.mst', outputFile: `${componentName}${cssExtension}` },
  ];
}

function writeFiles({ componentPath, container, cssExtension }) {
  var basePath = getBasePath(componentPath);
  var componentName = componentPath.split('/').slice(-1)[0];
  fs.mkdir(basePath);

  const isStyledComponent = cssExtension === 'Styles.js';
  templateMaps(componentName, cssExtension, container).forEach(c => {
    fs.readFile(path.join(__dirname, 'templates', c.templatePath), function (err, data) {
      var renderedFile = Mustache.render(data.toString(), { componentName, cssExtension, isStyledComponent });
      fs.writeFile(path.join(basePath, c.outputFile), renderedFile);
    });
  });
}

function run() {
  promptUser(function() {
    var options = arguments['0'];
    writeFiles(options, function(err) {
      if(err) return console.log(err);
    });
  });
}

run();
