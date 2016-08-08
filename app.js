var Diagnosis = require('./lib/diagnosis')
	, StreamServ = require('./lib/service')
	, config = require('./config/config.js');

// 初始化日志记录
require('./lib/logger')
    .use(require('./config/log4js-default'), 'stream');

// run io-srv
var service = new StreamServ(config);
service.run();

// run diagnosis if need
if (config.diagnosis){
	var diagnosis = new Diagnosis(service, config["diagnosis-interval"]);
	diagnosis.run();
}

logger.info('Stream service is running. pid:%s', process.pid);