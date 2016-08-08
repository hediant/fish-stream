var io = require('socket.io')();

var IoSvr = function(config){
	var writeFun = null;
	var rangeFun = null;
	var readvFun = null;

	this.setWriteFun = function(fn){
		writeFun = fn;
	};

	this.setRangeFun = function(fn){
		rangeFun = fn;
	};

	this.setReadvFun = function(fn){
		readvFun = fn;
	};

	this.start = function(){
		io.on('connection', function(socket) {
			logger.debug('socket.io connection id:'+socket.id);
			socket.on('write', function(topic, evtClass, fields){
				writeFun(topic, evtClass, fields);
			});
			socket.on('range', function(topic, begin, end, fn){
				rangeFun(topic, begin, end, function(err, evtList){
					fn(err, evtList);
				});
			});
			socket.on('readv', function(ver, fn){
				readvFun(ver, function(err, newVer, evtList){
					fn(err, newVer, evtList);
				});
			});		
			socket.on('disconnect', function () {
				logger.debug('socket.io disconnect id:'+socket.id);
			});
		});

		io.listen(config.ioPort);
		logger.info('start socket.io listen:'+config.ioPort);
	};

};

module.exports = IoSvr;