Fact-checker
===============
A down to earth tool for API test

### The approach used

Fact-checker is a test generator; it generates JSON input files to be sent to server and a testSuite file which can be run by [mocha](https://github.com/mochajs/mocha). This testSuite iteratively send JSON inputs from files to server and checks chunk of output retrieved by mean of deep equality using [jsonpath](https://github.com/dchester/jsonpath) expressions.

### Installation and usage

The easiest way to use fact-checker is to download [its wrapper](https://github.com/ilmirons/fact-checker-wrapper), which include peer dependecies and run the executable node script from there. To do so type:

```bash
$ npm install fact-checker-wrapper
$ cd node_modules/fact-checker-wrapper
$ npm install
$ npm test # after configuring test for your server or starting included echo-server (see below)
```
the wrapper includes an echo server (re-send everything sent to it) that can be used for experimenting. After installing try (on bash shell):
```bash
$ mini-echo &
$ npm test
```

`npm test` execute `fact-checker` and `mocha` on generated tests. You can execute manually both commands, fact-checker supports the following options:

```bash
  -V, --version      output the version number
  -v, --verbose      Print more output
  -r, --root <path>  Test root folder
  -d, --defaults     Template with default values for messages to be sent
  -s, --save         Save responses from the server
  -t, --tests        Glob file pattern for test definition. Matches inside test root folder
  -h, --help         output usage information
```

### How does it works

A template is defined in `test/default.json`. It includes a `requestOption` field which contains options to be passed to [request](https://github.com/request/request) when sending data to server and a `body` field which contains a shallow payload with defaults. From these defaults and a series of conf files located in  test root folder (default `test`) the testSuites are generated. Test definition files match the pattern `/.*tests.json/i`. For each of these a corresponding `.*testsSuite.js` file is generated. Test definition files are array of test definitions; each test definition includes a title (string containing at least one `_`: the preceeding part is used to group tests), a requestOptions object to be merged with defaults, an `inputs` array setting variables in the default tree and a `checks` array of pairs jsonpath expression/expected result (note: just the first result wil be used for a deep equality comparison with expected result). Both `test/default.json` and test definition files can use [json5](https://json5.org/) extensions (such as comments). As a clean is performed before generation of new files commenting test definitions works as a way to avoid test/output files generation.

### Known issues

mocha is not visible in executable path in windows, unless you install it globally. To run it from from the wrapper you may use the full path (`node_modules\.bin\mocha.cmd`)

### TODO

* add XML/SOAP support too

