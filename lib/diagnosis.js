var os = require('os')
	, async = require('async')
	, S = require('string');

function Diagnosis(service, timeout) {
	var self = this;
	this.service_ = service;
	this.timeout_ = timeout || 15*60*1000;

	this.send_avg = new CalcAvg(function(){
		return self.service_.getSendCount();
	});

	this.recv_avg_ = new CalcAvg(function(){
		return self.service_.getRecvCount();
	});

	// init functions
	this.init_message();
	this.init();

};
module.exports = Diagnosis;

Diagnosis.prototype.close = function() {
	this.interval_ && clearInterval(this.interval_);
	this.send_avg.close();
	this.recv_avg_.close();
};

Diagnosis.prototype.init_message = function() {
	this.diag_msg_ = ["Diagnosis:"];
};

Diagnosis.prototype.run = function() {
	var self = this;
	this.interval_ = setInterval(function(){
		async.waterfall(self.diag_funcs_,
			function(){
				logger.info(self.diag_msg_.join('; '));
				self.init_message();
			}
		);
	}, this.timeout_);
};

Diagnosis.prototype.init = function(){
	var self = this;
	this.diag_funcs_ = [
		// cpu 
		function(callback){
			self.diag_msg_.push("cpu loadavg(1min, 5min, 15min):" + os.loadavg());
			callback();
		},

		// mem
		function(callback){
			var tmpl_str = "mem total:{{total}}MB, mem free:{{free}}MB";
			self.diag_msg_.push(S(tmpl_str).template({
				"total":(os.totalmem()/(1024*1024)).toFixed(2),
				"free":(os.freemem()/(1024*1024)).toFixed(2)
			}).s);
			callback();
		},

		// recv events count
		function(callback){
			var tmpl_str = "recv events total:{{total}}, avg(1min, 5min, 15min):{{1min}},{{5min}},{{15min}}";
			self.diag_msg_.push(S(tmpl_str).template(
				self.recv_avg_.print()
			).s);
			callback();
		},

		// send events count
		function(callback){
			var tmpl_str = "send events total:{{total}}, avg(1min, 5min, 15min):{{1min}},{{5min}},{{15min}}";
			self.diag_msg_.push(S(tmpl_str).template(
				self.send_avg.print()
			).s);
			callback();
		}		
	];
};

function CalcAvg(count_func) {
	this.count_func_ = count_func;
 	this.count_ = [0];
	this.init();
};

CalcAvg.prototype.init = function() {
	var self = this;
	this.interval_ = setInterval(function(){
		self.count_.push(self.count_func_());
		if (self.count_.length > 16) { // NOT 15
			self.count_.splice(0, 1);
		}
	}, 60*1000); // per minute
};


CalcAvg.prototype.close = function() {
	this.interval_ && clearInterval(this.interval_);
};

CalcAvg.prototype.print = function() {
	var ret = {
		"1min" : 0,
		"5min" : 0,
		"15min" : 0,
		"total" : 0,
 	};

 	var len = this.count_.length - 1;
 	if (len > 0){ // 1.2.3...
 		ret["total"] = this.count_[len];
 		ret["1min"] = this.count_[len] - this.count_[len-1];

 		if (len <= 5){ // 1.2.3.4.5
 			ret["5min"] = this.count_[len] - this.count_[0];
 		}
 		else{
 			ret["5min"] = this.count_[len] - this.count_[len-5];
 			ret["15min"] = this.count_[len] - this.count_[0];
 		}
 	}

 	return ret;
};