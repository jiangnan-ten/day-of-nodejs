##抓取17173游戏排名

var app = require('express')(),
    superagent = require('superagent'),
    cheerio = require('cheerio'),
    async = require('async');

    app.get('/', function(req, res, next) {
    var url = [];
    var list = [];

    for(var i = 0; i < 68; i++) {
        url.push('http://top.17173.com/index.html?t=0.43218794581480324&page='+ i);
    }

    var fetchUrl = function(item, callback) {
        superagent.get(item).end(function(s_err, s_data) {
            console.log('now fetching ' + item);
            var $ = cheerio.load(s_data.text);
            $('.ph-bd-list li').each(function(index, element) {
                var son = $(element);
                list.push({
                    idx: son.find('.ttime').text(),
                    game: son.find('.game-name a').text(),
                    hot: son.find('.type').text()
                });
            });

            callback(null);
        });

    };

    async.mapLimit(url, 20, function(per_url, callback) {
        fetchUrl(per_url, callback);
    }, function(a_err, a_res) {
        res.send(list);
    });

});

app.listen(3000);