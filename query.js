const request = require('request-promise')
const parser = require('node-html-parser');
const decode = require('unescape');
const datetime = require('node-datetime');
const format = require('string-format')

function main() {
  var options = {
        method: 'GET',
        uri: makeUrl(),
        headers: {referer: 'https://www.e-classical.com.tw/schedule_detail.html'},
  };
  request(options)
    .then(function (response) {
        const root = parser.parse(response);
        const list = root.querySelector(".schedule_list");
        const times = list.querySelectorAll(".schedule_list-time");
        const details = list.querySelectorAll(".schedule_list-detail");
        for (var i=0; i < times.length; ++i) {
          printNodes(times[i], details[i]);
          console.log();
        }
    })
    .catch(function (err) {
      // Something bad happened, handle the error
    })
}

function unescapeHTML(text) {
  return decode(text).replace(/&nbsp;/g, "");
}

function printNodes() {
  var e = Array.from(arguments);

  var out = []
  for (var i = 0; i < e.length; ++i) {
    for (var j = 0; j < e[i].childNodes.length; j++) {
      if (e[i].childNodes[j].nodeType == 1) {
        out.push(e[i].childNodes[j].rawText);
      }
    }
  }
  console.log(unescapeHTML(out.join('\n')));
}

function makeArgs() {
  var now = datetime.create();
  var date = now.format('Y-m-d');
  var time = now.format('H:M');
  return args = {
      radio_type: 1,
      show_day: date,
      current_time: time
  };
}

function makeUrl() {
  const baseURL = 'https://www.e-classical.com.tw/schedule_detail.html';
  var components = [];
  var args = makeArgs();
  for (key in args) {
    components.push(key+'='+args[key])
  }
  return format('{0}?{1}', baseURL, components.join('&'));
}

main();
