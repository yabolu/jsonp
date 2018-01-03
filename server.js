var http = require('http');
var path = require('path');
var fs = require('fs');
var url = require('url');

var routes = {
	'/a': function(req, res){
		res.end(JSON.stringify(req.query));
	},
	'/b': function(req, res){
		res.end('match /b');
	},
	'/a/c': function(req, res){
		res.end('match /a/c');
	},
	'/search': function(req, res){
		res.end('username='+req.body.username + ', password='+req.body.password);
	},
	'/getNews': function(req, res){

		var news = [
			"第11日前瞻：中国冲击4金 博尔特再战200米羽球",
			"正直播柴飚/洪炜出战 男双力争会师决赛",
			"女排将死磕巴西！郎平安排男陪练模仿对方核心",
			"没有中国选手和巨星的110米栏 我们还看吗？",
			"中英上演奥运金牌大战",
			"博彩赔率挺中国夺回第二纽约时报：中国因对手服禁药而丢失的奖牌最多",
			"最“出柜”奥运？同性之爱闪耀里约",
			"下跪拜谢与洪荒之力一样 都是真情流露"
		]
		var data = [];
		for(var i=0; i<3; i++){
			var index = parseInt(Math.random()*news.length);
			data.push(news[index]);
			news.splice(index, 1);
		}


		var cb = req.query.callback;
		if(cb){
			res.end(cb + '('+ JSON.stringify(data) + ')');
		}else{
			res.end(data);
		}


	}
};

var server = http.createServer(function(req, res){
	routePath(req, res);
});

server.listen(9000);



function routePath(req, res){
	var pathObj = url.parse(req.url);
	var handleFn = routes[pathObj.pathname];

	if(handleFn){
		req.query = parseBody(pathObj.query);
		console.log(req.query);
		/*
		data事件会在数据接收过程中，每收到一段数据就触发一次，
		接收到的数据被传入回调函数。
		end事件则是在所有数据接收完成后触发
		 */
		var body = '';
		req.on('data', function(chunk){
			body += chunk;
		}).on('end', function(){
			req.body = parseBody(body);
			
		});

		handleFn(req, res);
	}else {

		staticRoot(path.resolve(__dirname, 'static'), req, res);
	}
}


function staticRoot(staticPath, req, res){
        var pathObj = url.parse(req.url, true);

        if(pathObj.pathname === '/'){
                pathObj.pathname += 'index.html';
        }

        var filePath = path.join(staticPath, pathObj.pathname);

        fs.readFile(filePath, 'binary', function(err, fileContent){
                if(err){
                        console.log('404');
                        res.writeHead(404, 'not found');
                        res.write('<h1>404 not found</h1>');
                        res.end();
                }else{
                        console.log('ok');
                        res.writeHead(200, 'OK');
                        res.write(fileContent, 'binary');
                        res.end();
                }
        });
}


function parseBody(body){
	var obj = {};
	body.split('&').forEach(function(str){
		obj[str.split('=')[0]] = str.split('=')[1];
	});

	return obj;
}

