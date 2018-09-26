#!/usr/bin/env node

'use strict'

var fs = require('fs')
var ejs = require('ejs')
var _ = require('lodash')
var path = require('path')
var mkdirp = require('mkdirp')
  // TODO add cmdLine support for path
var testRoot = path.normalize(process.cwd() + '/tests')
  // TODO adapt to support json5
var defaults = require(testRoot + '/default.json');
var tests = require(testRoot + '/tests.json');

var mkInputPath = (name) => path.normalize(testRoot + '/testInputs/' + name + '.gen.json').replace(/\\/g, '\\\\')
mkdirp(testRoot + '/testInputs/')

// Endpoint: http://salcls0293.sede.corp.sanpaoloimi.com:9080/DecisionService/rest/JUIB0_MDI/1.0/JUIB0_MDIRule/1.0
// Request Method: POST

var generateTestInput = (t) => {
  let req = defaults.body;
  let inputFile = mkInputPath(t.title)
  t.inputs.forEach((i) => eval(i));
  fs.writeFile(inputFile, JSON.stringify(req), (err) => {
    if (err) throw err;
    // TODO add cmdLine support for verbose
    else console.info(inputFile, 'has been generated!');
  })
}

var generateTest = (tests) => {
  let testGroups = _.groupBy(tests, (t) => t.title.split('_')[0]);
  let eTests = {
    testGroups: _.mapValues(testGroups, (tests) => {
      return tests.map((t) => {
        t.testTitle = t.title.split('_').slice(1).join('_')
        t.requestOptions = t.requestOptions !== undefined ? _.merge(defaults.requestOptions, t.requestOptions) :
          defaults.requestOptions;
        t.filePath = mkInputPath(t.title);
        return t;
      });
    })
  };
  ejs.renderFile(__dirname + '/testTemplate.tpl.js', eTests, {}, (err, str) => {
    if (err) throw err;
    fs.writeFile(testRoot + '/testSuite.gen.js', str, (err) => {
      if (err) throw err;
      else console.info('testSuite has been generateded!');
    })
  });
}

tests.forEach(generateTestInput);
generateTest(tests)
