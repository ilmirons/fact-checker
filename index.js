#!/usr/bin/env node

const _        = require('lodash')
const ejs      = require('ejs')
const fs       = require('fs')
const JSON5    = require('json5')
const mkdirp   = require('mkdirp')
const path     = require('path')
const pify     = require('pify')
const rReadDir = require('recursive-readdir')
const program  = require('commander')

program
  .version(require(path.join(__dirname, 'package.json')).version)
  .option('-v, --verbose', 'Print more output')
  .option('-r, --root <path>', 'Test root folder')
  .option('-d, --defaults', 'Template with default values for messages to be sent')
  .option('-s, --save', 'Save responses from the server')
  .option('-t, --tests', 'Input file for test definition')
  .parse(process.argv)

const isJson = true // program.format && program.format.toLowerCase() === 'json' || true

const fileExt     = isJson ? 'json' : 'xml'
const testRoot    = program.root || './tests'
const defaultFile = program.defaults || path.join(testRoot, `default.${fileExt}`)
const defaults    = JSON5.parse(fs.readFileSync(defaultFile))
const testFile    = program.tests || path.join(testRoot, 'tests.json')
const tests       = JSON5.parse(fs.readFileSync(testFile))

const mkInputPath = (name) => path.join(testRoot, '/testInputs/', `${name}.gen.${fileExt}`).replace(/\\/g, '\\\\')
const mkOutputPath = (name) => path.join(testRoot, '/testOutputs/', `${name}.${fileExt}`).replace(/\\/g, '\\\\')

mkdirp(path.join(testRoot, '/testInputs/'))
mkdirp(path.join(testRoot, '/testOutputs/'))

const unlinkPromise = pify(fs.unlink)
const clean = () => rReadDir(testRoot)
  .then((files) => Promise.all(files
      .filter((f) => /.*\.gen\.\w+/.test(f))
      .map((f) => unlinkPromise(f))
    )
  )

const generateTestInput = (t) => {
  const req = defaults.body
  const inputFile = mkInputPath(t.title)
    // TODO find a safer alternative to this eval call
  t.inputs.forEach((i) => eval(i))
  fs.writeFile(inputFile, JSON.stringify(req), (err) => {
    if (err) throw err
    else if (program.verbose) { console.info(inputFile, 'has been generated!') }
  })
}

var generateSuite = (tests) => {
  const testGroups = _.groupBy(tests, (t) => t.title.split('_')[0])
  const eTests = {
    testGroups: _.mapValues(testGroups, (tests) =>
      tests.map((t) => {
        if (_.isEmpty(t.title)) throw new Error('Titles for tests can not be empty');
        if ([t.requestOptions, defaults.requestOptions].every(_.isEmpty)) {
          throw new Error('At least one among test or default requestOptions must be defined')
        }
        const splitTitle = t.title.split('_');
        t.testTitle = splitTitle.slice(splitTitle.length > 1 ? 1 : 0).join('_')
        t.requestOptions = _.merge(defaults.requestOptions, t.requestOptions)
        t.filePath = mkInputPath(t.title)
        t.outPath = mkOutputPath(t.title)
        t.saveRes = program.save
        return t;
      })
    )
  };
  ejs.renderFile(path.join(__dirname, '/testTemplate.ejs'), eTests, {}, (err, str) => {
    if (err) throw err;
    fs.writeFile(path.join(testRoot, '/testSuite.gen.js'), str, (err) => {
      if (err) throw err;
      else if (program.verbose) { console.info('testSuite has been generated!') }
    })
  });
}

clean()
  .then(() => {
    tests.forEach(generateTestInput)
    generateSuite(tests)
    return true;
  })
  .catch((err) => console.error(err.message));
