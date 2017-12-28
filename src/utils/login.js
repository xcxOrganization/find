import config from '../config'
import Log from './log.js'
import Observer from './observer.js'
import wepy from 'wepy'
let observer = new Observer('fn');
let log = Log();
let server = config.env;
let loginSts = !1;//是否在登录状态
//登录模块
function Login() {
	this.server = config.env;
	this.userInfo = {};//用户信息
}

var pt = Login.prototype;

pt.wechatapplogin = function (parm, fn) {
	let that = this;
	console.log(parm);
	if(parm.iv && parm.encryptedData){
		parm.thirdSessionKey = wx.getStorageSync(server + 'token');
		that.addUser(parm);
		return;
	}
	wx.request({
		url: `${config.apiBase}` + 'App.Find_User.UserLogin',
		data: parm,
		method: 'POST',
		header: {
			'content-type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json'
		},
		success: function (resRes) {
			console.log('登陆成功', resRes);
			loginSts = !1;//取消登录状态
			if (!resRes || !resRes.data || !resRes.data.data) {//屏蔽错误报警
				log.saveInfo('登录失败', resRes, parm);
				return;
			}
			resRes.data = parseData(resRes.data);
			if (resRes.data.data.thirdSessionKey) {
				if (fn) {
					fn.call(that, resRes.data.data.thirdSessionKey);
				}
				wx.setStorageSync(server + 'token', resRes.data.data.thirdSessionKey);
			} else {
				wx.showToast({
					title: '获取Token异常'
				})
				return;//拿不到token就没必要做请求接口处理
			}
			observer.Updata();
		},
		fail: (err) => {
			loginSts = !1;//取消登录状态
			log.saveInfo('获取Token失败', err, parm);
			wx.showToast({
				title: '获取Token失败'
			})
		}
	})
}

pt.toLogin = function (fn) {
	console.log('toLogin');
	let that = this;
	wx.login({
		success: (res) => {
			if (!res || !res.code) {
				return;
			}
			let code = res.code,
				parm = {
					code: code
				}

			let accessToken = wx.getStorageSync(config.env + 'token');
			if (!accessToken) {//过期的情况会去去除token缓存，没有token或者过期才去调数据
				that.wechatapplogin(parm, fn);//获取数据权限
			} else {
				loginSts = !1;//取消登录状态
				fn.call(that,code);
			}
		},
		error: () => {
			wx.showToast({
				title: '调用登录失败'
			})
		}
	});
}

pt.getUserInfo = function (fn) {
	let that = this;
	that.toLogin((code) => {
		wx.getUserInfo({
			success: (resInfo) => {
				let parm = {
					code: code,
					encryptedData: resInfo.encryptedData,
					iv: resInfo.iv
				}
				that.wechatapplogin(parm, fn);//获取数据权限
			}
		})
	});
}


pt.init = function (fn) {//wechatapplogin 登录后回调函数
	let that = this;
	if (loginSts == !0) {
		return; //请求队列还有多个请求或者正在登录时则等待请求返回。
	}
	loginSts = !0;
	that.toLogin(fn);
}

pt.addUser = function (parm) {
	let newParm = {
		iv:parm.iv,
		thirdSessionKey:parm.thirdSessionKey,
		encryptedData:parm.encryptedData
	}
	wx.request({
		url: `${config.apiBase}` + 'App.Find_User.InsertUserInfo',
		data: newParm,
		method: 'POST',
		header: {
			'content-type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json'
		},
		success: function (resRes) {
			console.log('addUser成功', resRes);
			wx.setStorageSync('addUser');
		},
		fail: (err) => {
			log.saveInfo('addUser失败', err, parm);
			wx.showToast({
				title: 'addUser'
			})
		}
	})
}

function parseData(data) {
	//针对移动端数据返回非JSON数据，作临时处理
	if (typeof data == "object") {
		return data;
	}
	var str = data.slice(1).replace('\\', '');
	return JSON.parse(str);
}

module.exports = Login;