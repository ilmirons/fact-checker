#!/usr/bin/env node

const fs       = require('fs')
const rReadDir = require('recursive-readdir')
const ejs      = require('ejs')
const _        = require('lodash')
const path     = require('path')
const mkdirp   = require('mkdirp')
const JSON5    = require('json5')

// TODO add cmdLine support for path

const testRoot = path.join(process.cwd(), '/tests')
const defaults = JSON5.parse(fs.readFileSync(path.join(testRoot, '/default.json')))
const tests    = JSON5.parse(fs.readFileSync(path.join(testRoot, '/tests.json')))

const mkInputPath = (name) => path.join(testRoot, '/testInputs/', name + '.gen.json').replace(/\\/g, '\\\\')

mkdirp(path.join(testRoot, '/testInputs/'))

const clean = () => rReadDir(testRoot)
  .then((files) => 
    Promise.all(files
      .filter((f) => /.*\.gen\.\w+/.test(f))
      .map((f) => new Promise((resolve, reject) => fs.unlink(f,
        (err) => {
          if (err) reject(err)
          else resolve();
        }))))
  )


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

var generateSuite = (tests) => {
  const testGroups = _.groupBy(tests, (t) => t.title.split('_')[0])
  const eTests = {
    testGroups: _.mapValues(testGroups, (tests) =>
      tests.map((t) => {
        if (_.isEmpty(t.title)) throw new Error('Titles for tests can not be empty');
        const splitTitle = t.title.split('_');
        t.testTitle = splitTitle.slice(splitTitle.length > 1 ? 1 :
          0).join('_')
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

clean()
  .then(() => {
    tests.forEach(generateTestInput)
    generateSuite(tests)
    return true;
  })
  .catch((err) => console.err(err));
