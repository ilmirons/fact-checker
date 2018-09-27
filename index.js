#!/usr/bin/env node

var fs = require('fs')
var ejs = require('ejs')
var _ = require('lodash')
var path = require('path')
var mkdirp = require('mkdirp')
  // TODO add cmdLine support for path
var testRoot = path.join(process.cwd(), '/tests')
  // TODO adapt to support json5
var defaults = require(path.join(testRoot, '/default.json'))
var tests = require(path.join(testRoot, '/tests.json'))

const mkInputPath = (name) => path.join(testRoot, '/testInputs/', name + '.gen.json').replace(/\\/g, '\\\\')

mkdirp(path.join(testRoot, '/testInputs/'))

const generateTestInput = (t) => {
  const req = defaults.body
  const inputFile = mkInputPath(t.title)
  // TODO find a safer alternative to this eval call
  t.inputs.forEach((i) => eval(i))
  fs.writeFile(inputFile, JSON.stringify(req), (err) => {
    if (err) throw err
      // TODO add cmdLine support for verbose
    else console.info(inputFile, 'has been generated!')
  })
}

var generateTest = (tests) => {
  const testGroups = _.groupBy(tests, (t) => t.title.split('_')[0])
  const eTests = {
    testGroups: _.mapValues(testGroups, (tests) =>
      tests.map((t) => {
        if (_.isEmpty(t.title)) throw new Error('Titles for tests can not be empty');
        t.testTitle = t.title.split('_').slice(t.title.split('_').length > 1 ? 1
          : 0).join('_')
        if ([t.requestOptions, defaults.requestOptions].every(_.isEmpty)) {
          throw new Error('At least one among test or default requestOptions must be defined')
        }
        t.requestOptions = _.isObject(t.requestOptions) ?
          _.merge(defaults.requestOptions, t.requestOptions) : defaults.requestOptions
        t.filePath = mkInputPath(t.title)
        return t;
      })
    )
  };
  ejs.renderFile(path.join(__dirname, '/testTemplate.ejs'), eTests, {}, (err, str) => {
    if (err) throw err;
    fs.writeFile(path.join(testRoot, '/testSuite.gen.js'), str, (err) => {
      if (err) throw err;
      else console.info('testSuite has been generateded!');
    })
  });
}

tests.forEach(generateTestInput);
generateTest(tests)
