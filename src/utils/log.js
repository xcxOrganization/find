import config from '../config'
import wepy from 'wepy'
let log = new Log();
//  服务端错误日志
function Log() {
	if(this instanceof Log){
		this.config = config;
		this.systemInfo = wepy.systemInfo;
		return this;
	}else{
		log.config = config;
		log.systemInfo = wepy.systemInfo;
		return log;
	}
}

let pt = Log.prototype;

pt._log = function(level, message) {
	if(this.config.env == 'dev'){
	    return;
	}
	if(typeof message != 'string') {
		message = JSON.stringify(message)
	}
	wx.request({
		url: `https://leancloud.cn/1.1/classes/${level}`, //仅为示例，并非真实的接口地址
		method: 'POST',
		data: message,
		header: {
			'X-Avoscloud-Application-Id': this.config.logger['X-Avoscloud-Application-Id'],
			'X-Avoscloud-Application-Key': this.config.logger['X-Avoscloud-Application-Key'],
			'content-type': 'application/json'
		},
		success: function(res) {}
	})
}

pt.saveError = function(msg, detail, data) {
	var logData = {
		environment: this.config.env,
		systemInfo: this.systemInfo,
		msg,
		detail,
		params: data || {}
	};
    this._log('ERROR', logData)
}

pt.saveInfo = function(msg, detail, data){
	var logData = {
		environment: this.config.env,
		systemInfo: this.systemInfo,
		msg,
		detail,
		params: data || {}
	};
    this._log('INFO', logData)
}

pt.upCatch = function(error, data){
	var logData = {
		environment: this.config.env,
		systemInfo: this.systemInfo,
		error,
		params: data || {}
	};
    this._log('WARNING', logData)
}
module.exports = Log;