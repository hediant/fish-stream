var StreamAPI = require('./../client/stream-api.js');

var tt = 0;

function testWrite(){
	var lgAPI = new StreamAPI('http://localhost:10016');
	var tt1 = tt++;
	var tt2 = 0;
	console.log('['+tt1+'] '+'..............................');
	lgAPI.on('connect', function(){
		console.log('['+tt1+'] '+'connect');
	});

	lgAPI.on('reconnect', function(){
		console.log('['+tt1+'] '+'reconnect');
	});

	lgAPI.on('disconnect', function(){
		console.log('['+tt1+'] '+'disconnect');
		//lgAPI.close();
		//tmWrite();
	});

	lgAPI.on('data', function(evtList){
		for (var i = 0; i < evtList.length; i++){
			if (tt2++ > 8) {
				console.log('['+tt1+'] '+'close------------------');
				lgAPI.close();
				tmWrite();
				return ;
			};
			console.log('['+tt1+'] '+JSON.stringify(evtList[i]));
		}
	});

	var tNow = Date.now();
	var fields = {
		data:{
			tag1:12.3,
			tag2:12.4
		},
		source:Date.now(),
		quality:{
			tag2:'BAD'
		},
		sender:'stream-api-test'
	};
	lgAPI.write('abc.real', 'real', fields);
	lgAPI.write('12345BBF.real', 'real', fields);
}

function testRange(){
	var lgAPI = new StreamAPI('http://localhost:10016');
	var tNow = Date.now();
	lgAPI.range('12345BBF.real', tNow-3600000, tNow+600000, function(err, evtList) {
		if (err){
			console.log('==='+err.error);
		}else{
			console.log('readRange 12345BBF');
			for(var i = 0; i < evtList.length; i++){
				console.log('\t'+JSON.stringify(evtList[i]));
			}
		}
		lgAPI.close();
	});
}

//
//testRange();
function tmWrite(){
	setTimeout(testWrite,5000);
}
testWrite();
