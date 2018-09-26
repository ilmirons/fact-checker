var _ = require('lodash')
var readJSON = require('read-json-sync')
var jp = require('jsonpath')
var expect = require('chai').expect
var request = require('request')

<% 
	Object.keys(testGroups).forEach((k) => {
    var testGroup = testGroups[k]; %>
describe('<%- k %>', () => {
  <% for(var j = 0; j < testGroup.length; j++) { 
	var t = testGroup[j]; %>
  it('<%- t.testTitle %>', (done) => {
    request(_.merge({
      body: readJSON(`<%- t.filePath %>`),
      json: true
    }, <%- JSON.stringify(t.requestOptions) %>), (err, res, data) => {
      if (err) throw err;
      <% for(var i = 0; i < t.checks.length; i++) { 
				var check = t.checks[i] %>
      expect(jp.query(data, '<%- check[0] %>')[0]).to.deep.equal(<%- JSON.stringify(check[1]) %>)
      <% } %>
      done();
    })
  });
  <% } /* End tests cycle*/ %>
}) /* End describe */
<% }) /* End describes cycle */ %>