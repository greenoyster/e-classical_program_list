const request = require('request-promise')
const parser = require('node-html-parser');
const decode = require('unescape');
const format = require('string-format')
const date = require('date-and-time');

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

function makeUrl(time) {
  const baseURL = 'https://www.e-classical.com.tw/schedule_detail.html';
  var args =  {
      radio_type: 1,
      show_day: date.format(time, 'YYYY-MM-DD'),
      current_time: date.format(time, 'HH:mm'),
  };
  var uriComponents = [];
  for (key in args) {
    uriComponents.push(key+'='+args[key])
  }
  return format('{0}?{1}', baseURL, encodeURI(uriComponents.join('&')));
}

function parseDateTime() {
  time = new Date();
  for (var i = 2; i < process.argv.length; ++i) {
    var arg = process.argv[i];
    var input = date.parse(arg, 'YYYYMMDD');
    if (!isNaN(input)) {
      time.setFullYear(input.getFullYear());
      time.setMonth(input.getMonth());
      time.setDate(input.getDate());
      continue;
    }

    input = date.parse(arg, 'MMDD');
    if (!isNaN(input)) {
      time.setMonth(input.getMonth());
      time.setDate(input.getDate());
      continue;
    }

    input = date.parse(arg, 'H:m');
    if (!isNaN(input)) {
      time.setHours(input.getHours());
      time.setMinutes(input.getMinutes());
      continue;
    }

    input = date.parse(arg, 'H');
    if (!isNaN(input)) {
      time.setHours(input.getHours());
      time.setMinutes(0);
      continue;
    }
    console.error('Bad argument:', arg);
    return null
  }
  return time;
}

function main() {
  var time = parseDateTime();
  if (!time) {
    console.error('Bad input, YYYYMMDD HH:mm or MMDD HH:mm');
    return;
  }
  console.log(format('Querying schedule on {0}\n', date.format(time, 'YYYY-MM-DD HH:mm A')));
  var options = {
        method: 'GET',
        uri: makeUrl(time),
        headers: {
          referer: 'https://www.e-classical.com.tw/schedule_detail.html'
        },
  };
  request(options)
    .then(function (response) {
        const root = parser.parse(response);

        const header = root.querySelector('.schedule_container');
        if (!header) {
          throw 'no header found';
        }
        var introElement = header.childNodes[1].childNodes[1].childNodes[3];
        printNodes(introElement);
        console.log();

        const list = root.querySelector(".schedule_list");
        if (!list) {
          throw 'no list found';
        }
        const times = list.querySelectorAll(".schedule_list-time");
        const details = list.querySelectorAll(".schedule_list-detail");
        for (var i=0; i < times.length; ++i) {
          printNodes(times[i], details[i]);
          console.log();
        }
    })
    .catch(function (err) {
        console.log('Failed to make request to e-classical:', err);
    })
}

main();

