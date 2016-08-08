var https = require('https');

function authenticateUserTest(){
	var opt = {  
        method: 'post',  
        host: 'localhost',  
        port: 443,  
        path: '/v1/json/authenticate/user',  
        rejectUnauthorized: false, 
        headers: {  
            "Content-Type": 'application/json',  
        }  
	};
	var req = https.request(opt, function(res) {
		res.setEncoding('utf8');
		var ret = "";
	    res.on('data', function(chunk) {
	    	ret += chunk;
	    });
	    res.on('end', function() {
	    	ret = JSON.parse(ret);
	    	if (ret.ret && ret.ret.accessKey) {
	    		appendTest(ret.ret.accessKey);
	    		//console.log(ret.ret.accessKey);
	    		//setTimeout(logoutTest,2000,ret.ret.accessKey);
	    	};
         });
	});
	req.on('error', function(e) {
		console.log(e.message);
  	});
  	req.write('{"account":"123123","username":"123123","password":"123123"}');
  	req.end();
}

function appendTest(accessKey){
	var urlPath = '/v1/json/123456/append?accessKey='+accessKey;
	var opt = {  
        method: 'post',  
        host: 'localhost',  
        port: 443,  
        path: urlPath,  
        rejectUnauthorized: false, 
        headers: {  
            "Content-Type": 'application/json',  
        }  
	};
	var realData = {
		"data":{
  			"1.1":66.99,
  			"1.2":66.88,
  			"2.1":66.21,
  		},
  		"source":1414999240297,
  		"quality":{
  			"2.1":"bad"
  		}
	};
	var req = https.request(opt, function(res) {
		res.setEncoding('utf8');
		var ret = "";
	    res.on('data', function(chunk) {
	    	ret += chunk;
	    });
	    res.on('end', function() {
	    	console.log(ret);
	    	//ret = JSON.parse(ret);
	    	//if (ret.ret && ret.ret.accessKey) {
	    	//	logoutTest(ret.ret.accessKey);
	    	//};
         });
	});
	req.on('error', function(e) {
		console.log(e.message);
  	});
  	req.write(JSON.stringify(realData));
  	req.end();
}

authenticateUserTest();