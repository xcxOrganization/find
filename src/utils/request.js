import wepy from 'wepy'
import config from '../config'
import Log from './log.js'
import Login from './login.js'
import Observer from './observer.js'
import Util from './util.js'
let observer = Observer('fn');
let log = Log(),
	server = config.env,
	accessToken = '';

//图片地址：开发、生产
function getImgServerApi() {
	return `${config.imgApi}`;
}

//配置环境：本地、开发、生产 (区分活动、 common请求)
function getServerUrl(route) {
	return `${config.apiBase}${route}&thirdSessionKey=` + accessToken;
}

function request(route, method, data, success, fail, other) {
	accessToken = wx.getStorageSync(server + 'token');
	let args = arguments;
	if (accessToken == '') {
		new Login().init();//登录
		console.log('observer.list.push');
		observer.list.push(function () {
			request.apply(null, args);
		});
		return;
	}
	common_req.apply(null, args);//公共请求封装
}

function common_req() {
	console.log('common_req');
	let args = arguments;
	let noModal = false;
	if (!args[5] || !args[5].noToast) { //需要加载toast的情况
		wx.showToast({
			title: '加载中',
			icon: 'loading',
			duration: 10000,
			mask: true
		});
	}
	if (args[5] && args[5].noModal) { //不需要加载modal的情况
		noModal = true;
	}

	wepy.request({
		url: getServerUrl(args[0]),
		method: args[1],
		data: args[2],
		header: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		success: (res) => {
			console.log('请求data >>>> ',args[2],'请求链接 >>>> ' + getServerUrl(args[0]), '返回 >>>> ', res);
			wx.hideToast();
			if (args[5] && args[5].getCodeSts && res.data.ret != 200) {//需要拿到返回码数据的情况
				args[3].call(this, res.data);
				return;
			}
			if (res.data.ret == 200 && typeof args[3] == 'function') {
				args[3].call(this, res.data.data);
			} else if (res.data.ret == -10000) {
				wx.setStorageSync(server + 'token', '');
				//token已过期的约定，重新发起登录
				new Login().init();//登录
				observer.list.push(function () {
					request.apply(this, args);
				}); //保存请求队列
				return;
			} else {//返回错误的情况
				if (res.data.msg && !noModal) {
					args[4] && args[4].call(this, res);
					wx.showModal({
						showCancel: false,
						content: res.data.msg
					})
				} else if (res.statusCode && res.statusCode == 500) {
					args[4].call(this, res);
					wx.showModal({
						showCancel: false,
						content: '数据异常'
					})
				}
				if (res.statusCode != 200) {
					log.saveError('服务端接口异常：' + args[0], res, args[2]);
				}
			}

			if (observer.list.length > 0) {
				let accessToken = wx.getStorageSync(server + 'token');
				if (accessToken == '') {
					return;
				}
			}
			observer.Updata();
		},
		fail: (err) => {
			wx.hideToast();
			wx.showModal({
				showCancel: false,
				content: '网络异常，请稍后再试'
			})
		}
	});
}

function userInfo() {
	return wx.getStorageSync(server + '_nickname');
}

function refreshUserInfo(fn) {
	new Login().getUserInfo(fn);
}

function preLogin(fn) {
	wx.getUserInfo({
		success: () => {
			refreshUserInfo()
			if (fn) fn();
		},
		fail: () => {
			if (fn) fn();
		}
	})
}
//对外的接口
module.exports = {
	systemInfo: wepy.getSystemInfoSync(),
	server,
	userInfo,
	getServerUrl,
	request,
	getImgServerApi,
	refreshUserInfo,
	preLogin,
}