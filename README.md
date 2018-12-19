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
$ node ./fact-checker-wrapper/index.js %
$ npm test
```

### How does it works

A template is defined in `test/default.json`. It includes a `requestOption` field which contains options to be passed to [request](https://github.com/request/request) when sending data to server and a `body` field which contains a shallow payload with defaults. From these defaults and a conf file located in `test/tests.json`  the testSuite is generated. `test/tests.json` is an array of test definitions; each test definition includes a title (string containing at least one '_': the preceeding part is used to populate describe), a requestOptions object to be merged with defaults, an `inputs` array setting variables in the default tree and a `checks` array of pairs jsonpath expression/expected result (note: just the first result wil be used for a deep equality comparison with expected result). Both `test/default.json` and `test/tests.json` can use [json5](https://json5.org/) extensions (such as comments). As a clean is performed before generation of new files commenting test definition works as a way to avoid test/output files generation.

### TODO

* post-install-script to reduce commands needed for setup
* support commandLine options
* add XML/SOAP support too

