var request = require('request');
var cheerio = require('cheerio');
var app = require('express')();
var async = require('async');

var baseurl = 'http://www.lagou.com/jobs/positionAjax.json';
var urlBox = [];
var gj = ['', '应届毕业生', '1年以下', '1-3年', '3-5年', '5-10年', '10年以上'];
var xl = ['', '大专', '本科', '硕士', '博士'];
var jd = ['', '初创型', '成长性', '成熟型', '已上市'];
var hy = ['', '移动互联网', '电子商务', '金融', '企业服务', '教育', '文化游戏', '游戏', 'O2O', '硬件'];

/*获取所有url地址 待抓取*/
function getAllUrl()
{
	var count = 1;
	for (var i in gj) {
		for (var j in xl) {
			for (var m in jd) {
				for (var n in hy) {
					urlBox.push({
						index: count,
						url: baseurl + '?gj=' + gj[i] + '&xl=' + xl[j] + '&jd=' + jd[m] + '&hy=' + hy[n] + '&city=' + '上海'
					});
					count += 1;
				}
			}
		}
	}
}

/*获取组合后的url*/
getAllUrl();

/*每一种组合的有多个分页 获取所页数后去 抓取具体的第几页数据*/
var typeUrl = function (eachurl, callbackori) {
	request.post({
		url: encodeURI(eachurl.url),
		form: {
			first: true,
			pn: 1,
			kd: 'php'
		}
	}, function(err, response, body) {
		var jsonBody = JSON.parse(body);
		var totalPageCount = jsonBody.content.totalPageCount; //总页数

		if( totalPageCount >= 1 ) {
			var urlPerPageContainer = fetchPerPage(eachurl, totalPageCount);
			async.mapLimit(urlPerPageContainer, 10, function(url, callback) {//最大并发数10个
					fetchUrl(url, callback);
				}, function(err, result) {//所有任务完成后的回调

				}
			);
		}
	});

	callbackori(null);
};

/*构造每一页的url*/
var fetchPerPage = function (eachUrl, totalPageCount) {
	var urlPerPageContainer = [];//该种组合的所有url
	for(var i = 1; i <= totalPageCount; i++) {
		urlPerPageContainer.push({
			url: encodeURI(eachUrl.url),
			index: eachUrl.index,
			form: {
				first: i == 1 ? true : false,
				pn: i,
				kd: 'php'
			}
		});
	}

	return urlPerPageContainer;
};

/*获取第几页的数据*/
var fetchUrl = function (url, callback) {
	request.post(url, function(error, response, body) {
		if( !error ) {
			var jsonBody = JSON.parse(body);
			var jsonRes = jsonBody.content.result;
			var jsonContainer = [];

			for (var i in jsonRes) {
				jsonContainer.push({
					'职位名称' : jsonRes[i].positionName,
					'公司名称' : jsonRes[i].companyName,
					'薪水'	   : jsonRes[i].salary,
				});
			}
			console.log('当前抓取第' + url.index + '组, 第' + url.form.pn + '页');
			console.log(jsonContainer);
			console.log('本页共' + jsonContainer.length + '条数据\n' + '***************************************************');

			callback(null, jsonContainer);
		}
	});
}

async.eachLimit(urlBox, 5, function(url, callback) {
		typeUrl(url, callback);
	}, function(err) {
		//console.log(err);
	}
);