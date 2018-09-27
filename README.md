Fact-checker
===============
A down to earth tool for API test

### A bit of history

This tool was born using dead time at office, trying to ease colleagues from manual testing REST APIs.
There were special needs for this tool:
1. Write as less as possible to configure tests
2. Have a solid copy of input sent to server
3. It had to be ready and usable ASAP

### The approach used

Fact-checker is a test generator; it generates JSON input files to be sent to server and a testSuite file which can be run by [mocha](https://github.com/mochajs/mocha). This testSuite iteratively send JSON inputs from files to server and checks chunk of output retrieved by mean of deep equality using [jsonpath](https://github.com/dchester/jsonpath) expressions.

### How does it works
TL;DR; see working example [here](https://github.com/ilmirons/echoServer) (download dependencies and run `npm test`)

A template is defined in `test/default.json`. It includes a `requestOption` field which contains options to be passed to [request]() when sending data to server and a `body` field which contains a shallow payload with defaults. From these defaults and a conf file located in `test/tests.json`  the testSuite is generated. `test/tests.json` is an array of test definitions; each test definition includes a title (string containing at least one '_': the preceeding part is used to populate describe), a requestOptions object to be merged with defaults, an `inputs` array setting variables in the default tree and a `checks` array of pairs jsonpath expression/expected result (note: just the first result wil be used for a deep equality comparison with expected result)

### Usage

Just run `$ fact-checker` with files in place.

### TODO
* better error handling
* support json5 for json inputs
* support commandLine options
