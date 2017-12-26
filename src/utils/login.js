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
	console.log('wechatapplogin');
	let that = this;
	wx.request({
		url: `${config.apiBase}` + '?service=App.Find_User.AddUser&openid=11',
		data: parm,
		method: 'POST',
		header: {
			'content-type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json'
		},
		success: function (resRes) {
			console.log('登陆成功', resRes);
			if (fn) {
				fn(parm, resRes)
			}
			loginSts = !1;//取消登录状态
			if (!resRes || !resRes.data || !resRes.data.data) {//屏蔽错误报警
				log.saveInfo('登录失败', resRes, parm);
				return;
			}
			if (resRes.data.data.nickname) {
				wx.setStorageSync(server + '_nickname', resRes.data.data.nickname);
			}
			if (resRes.data.data.headimgurl) {
				wx.setStorageSync(server + '_headimgurl', resRes.data.data.headimgurl);
			}
			resRes.data = parseData(resRes.data);
			if (resRes.data.data.token) {
				if (resRes.data.data.openid) {//这里拿到全局openid
					let app = getApp();
					wx.setStorageSync(server + 'zast_openid', app.zast_openid = resRes.data.data.openid);

				}
				wx.setStorageSync(server + 'user_id', resRes.data.data.user_id);
				wx.setStorageSync(server + 'token', resRes.data.data.token);
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

pt.toLogin = function (fn, type) {
	console.log('toLogin');
	let that = this, fromUserId = wx.getStorageSync(config.env + 'fromUserId');
	wx.login({
		success: (res) => {
			if (!res || !res.code) {
				return;
			}
			let code = res.code,
				parm = {
					gzh: "weSceneMiniapp",
					code: code
				}
			if (fromUserId) {
				parm.fromUserId = fromUserId;//提交邀请人id
			}

			if (fn && type == 'getUserInfo') {
				fn.call(that, code);
				return;
			}
			let accessToken = wx.getStorageSync(config.env + 'token'),
				zast_openid = wx.getStorageSync(config.env + 'zast_openid');
			if (!accessToken || !zast_openid) {//过期的情况会去去除token缓存，没有token或者过期才去调数据
				that.wechatapplogin(parm, fn);//获取数据权限
			} else {
				let app = getApp();
				if (!app.zast_openid) {
					app.zast_openid = zast_openid;
				}
				loginSts = !1;//取消登录状态
				if (fn) {
					fn();
				}
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
					gzh: "weSceneMiniapp",
					code: code,
					encryptedData: resInfo.encryptedData,
					iv: resInfo.iv
				}

				that.wechatapplogin(parm, fn);//获取数据权限
			}
		})
	}, 'getUserInfo');
}


pt.init = function (fn) {//wechatapplogin 登录后回调函数
	let that = this;
	if (loginSts == !0) {
		return; //请求队列还有多个请求或者正在登录时则等待请求返回。
	}
	loginSts = !0;
	that.toLogin(fn);
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