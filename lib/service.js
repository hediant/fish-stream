var IoSvr = require('./io-svr.js');

function StreamServ(config) {

	var evtList1 = [];
	var evtList2 = [];
	var curList1 = true;
	var version = 1;

	// for diagnosis reason
	var recv_count = 0;
	var send_count = 0;

	this.getRecvCount = function(){
		return recv_count;
	};

	this.getSendCount = function(){
		return send_count;
	};

	this.onWrite = function(topic, evtClass, fields){
		//logger.trace(JSON.stringify(fields));
		fields = JSON.parse(fields);
		version++;
		recv_count++;
		
		var tNow = Date.now();

		if (!fields['source']) {
			fields['source'] = tNow;
		};
		fields['recv'] = tNow;
		fields['server'] = config.appName;
		fields['ver'] = version;
		var evt = {
			'topic':topic,
			'class':evtClass,
			'fields':fields
		};
		
		if (curList1){
			if (evtList1.length < config.bufferLen) {
				evtList1.push(evt);
				return ;
			}
			curList1 = false;
			evtList2.length = 0;
			evtList2.push(evt);
			return ;
		}
		if (evtList2.length < config.bufferLen) {
			evtList2.push(evt);
			return ;
		};
		curList1 = true;
		evtList1.length = 0;
		evtList1.push(evt);
	}

	this.onRange = function(topic, begin, end, fn){
		var lst = [];
		if (curList1) {
			for (var i = 0; i < evtList2.length; i++){
				if (evtList2[i].topic == topic && evtList2[i].fields['recv'] >= begin && evtList2[i].fields['recv'] <= end) {
					lst.push(evtList2[i]);
				};
			}
			for (var i = 0; i < evtList1.length; i++){
				if (evtList1[i].topic == topic && evtList1[i].fields['recv'] >= begin && evtList1[i].fields['recv'] <= end) {
					lst.push(evtList1[i]);
				};
			}

		}else{
			for (var i = 0; i < evtList1.length; i++){
				if (evtList1[i].topic == topic && evtList1[i].fields['recv'] >= begin && evtList1[i].fields['recv'] <= end) {
					lst.push(evtList1[i]);
				};
			}
			for (var i = 0; i < evtList2.length; i++){
				if (evtList2[i].topic == topic && evtList2[i].fields['recv'] >= begin && evtList2[i].fields['recv'] <= end) {
					lst.push(evtList2[i]);
				};
			}
		}

		fn(null,JSON.stringify(lst));
		send_count += lst.length;
	}

	this.onReadValues = function(ver, fn){
		if (ver==0) {
			fn(null, version, '[]');
			return ;
		};
		if (ver > version) {
			ver = 1;
		};
		var lastv = version;
		var lst = [];
		if (curList1) {
			for (var i = 0; i < evtList2.length; i++){
				if (lst.length>=config.readMax) {
					break;
				};
				if (evtList2[i].fields['ver'] > ver) {
					lst.push(evtList2[i]);
				};
			}
			for (var i = 0; i < evtList1.length; i++){
				if (lst.length>=config.readMax) {
					break;
				};
				if (evtList1[i].fields['ver'] > ver) {
					lst.push(evtList1[i]);
				};
			}

		}else{
			for (var i = 0; i < evtList1.length; i++){
				if (lst.length>=config.readMax) {
					break;
				};
				if (evtList1[i].fields['ver'] > ver) {
					lst.push(evtList1[i]);
				};
			}
			for (var i = 0; i < evtList2.length; i++){
				if (lst.length>=config.readMax) {
					break;
				};
				if (evtList2[i].fields['ver'] > ver) {
					lst.push(evtList2[i]);
				};
			}
		}
		if (lst.length>0) {
			lastv = lst[lst.length-1].fields['ver'];
		};

		fn(null,lastv,JSON.stringify(lst));
		send_count += lst.length;
	}

	this.run = function() {
		var ioSvr = new IoSvr(config);
		ioSvr.setWriteFun(this.onWrite);
		ioSvr.setRangeFun(this.onRange);
		ioSvr.setReadvFun(this.onReadValues);

		ioSvr.start();	
	}	
}

module.exports = StreamServ;