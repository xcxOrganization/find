import wepy from 'wepy'
import config from '../config'
import request from '../utils/request.js'

let data = {
  img_prefixer: config.imgApi,
  canIShare: wx.canIUse ? wx.canIUse('button.open-type.share') : false
}
let click_timestamp = 0;
let formIdRecord = {
  timestamp: 0,//开始收集id时间
  num: 0,//存储formId个数
  saveSign: wx.getStorageSync(request.server + "_enableFormId") ? true : false,//是否存储formId标识
  formIdList: []//formId列表
}

export default class extends wepy.mixin {
  data = data
  methods = {
    toIndex() {
      wepy.switchTab({
        url: './index'
      })
    },
    openPdf(event) {
      wepy.showToast({
        title: '正在读取条款',
        icon: 'loading',
        mask: true
      })
      let url = event.currentTarget.dataset.url;
      console.log('条款pdf链接=====>'+url);
      wx.downloadFile({
        url: url,
        success(res) {
          console.log("成功下载后返回参数==", res);
          let filePath = res.tempFilePath
          wx.openDocument({
            filePath: filePath,
            success(res) {
              console.log('打开文档成功', res);
              wx.hideToast();
            },
            fail(res) {
              console.log('openDocument fail', res);
              wx.hideToast();
            }
          })
        },
        fail(res) {
          console.log(res.errMsg)
          wx.hideToast();
        },
        complete() {

        }
      })
    }
  }
  saveFormId() { // 收集formId
    let e = this;
    if (!e || !e.detail || !e.detail.formId) {
      return;
    }
    let formId = e.detail.formId;
    formIdRecord.saveSign = wx.getStorageSync(request.server + "_enableFormId") ? true : false;
    if (!formIdRecord.saveSign) {//不允许存储标识
      console.log('不允许存储标识');
      return;
    }
    if (formIdRecord.num == 0) {
      formIdRecord.timestamp = new Date().getTime();
    } else if (formIdRecord.num > 10) {//一天最多收集10个formId
      let timestamp = new Date().getTime(), during = timestamp - formIdRecord.timestamp;
      if (during > 24 * 60 * 60 * 1000) {//超过一天重新收集
        formIdRecord.num = 0;//更新收集数
        formIdRecord.timestamp = new Date().getTime();//更新时间
      } else {
        return;
      }
    }
    formIdRecord.num++;
    request.request('public/sendform', 'POST', {
      formId: formId
    }, function () {
      console.log('formId个数为：' + formIdRecord.num);
    }, function () {
    }, { 'noToast': true });
  }
}


