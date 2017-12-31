function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatTimestamp(totalTime) {//时间戳间隔
  var days = parseInt(totalTime / parseInt(1000 * 60 * 60 * 24));
  totalTime = totalTime % parseInt(1000 * 60 * 60 * 24);
  var hours = parseInt(totalTime / parseInt(1000 * 60 * 60));
  totalTime = totalTime % parseInt(1000 * 60 * 60);
  var minutes = parseInt(totalTime / parseInt(1000 * 60));
  totalTime = totalTime % parseInt(1000 * 60);
  var seconds = parseInt(totalTime / parseInt(1000));

  var str = days > 0 ? (days + '天') : '';
  return str + [hours, minutes, seconds].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function mixin(target, source) {//数据对象拓展
  var args = Array.prototype.slice.call(arguments), i = 1, key, index, newArr = {},
    ride = typeof args[args.length - 1] == 'boolean' ? args.pop() : true;//ride 默认true，覆盖原值

  if (args.length === 1) {
    target = this;
    i = 0;
  }
  while ((source = args[i++])) {
    for (key in source) {
      if (key in target) {
        if (typeof source[key] == 'object' && typeof target[key] == 'object') {
          for (index in source[key]) {
            target[key][index] = source[key][index];
          }
        } else {
          target[key] = source[key];
        }
      } else if (ride || !(key in target)) {
        target[key] = source[key];
      }
    }
  }
  return target;
}

// 匹配表单输入信息

function testRedPacket(redPacket) {//匹配大于0的整数
  var reg = /^[1-9]+[0-9]*$/; //匹配大于0的整数
  return reg.test(redPacket);
}

function testPhone(phone) {//匹配手机号码
  var reg = /^((1[0-9]{2})+\d{8})$/;
  return reg.test(phone);
}

function testName(name) {//匹配姓名
  var reg = /^[\u4e00-\u9fa5]+(.[\u4e00-\u9fa5]+)*$/; //匹配姓名
  return reg.test(name);
}

function identityCodeValid(code) {//身份证匹配
  var city = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江 ", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北 ", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏 ", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外 " };
  var tip = "";
  var pass = true;

  if (!code || !/^[1-9][0-9]{5}(19[0-9]{2}|200[0-9]|201[0-9])(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[0-9]{3}[0-9xX]$/i.test(code)) {
    tip = "身份证号格式错误";
    pass = false;
  }

  else if (!city[code.substr(0, 2)]) {
    tip = "地址编码错误";
    pass = false;
  }
  else {
    //18位身份证需要验证最后一位校验位
    if (code.length == 18) {
      code = code.split('');
      //∑(ai×Wi)(mod 11)
      //加权因子
      var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      //校验位
      var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
      var sum = 0;
      var ai = 0;
      var wi = 0;
      for (var i = 0; i < 17; i++) {
        ai = code[i];
        wi = factor[i];
        sum += ai * wi;
      }
      var last = parity[sum % 11];
      if (parity[sum % 11] != code[17]) {
        tip = "校验位错误";
        pass = false;
      }
      if (code[17] == 'x' && parity[sum % 11] == 'X') {
        pass = true;
      }
    }
  }
  return pass;
}

function trim(str) { //删除左右两端的空格 
  return str.replace(/(^\s*)|(\s*$)/g, "");
}

function getQueryStr(str, name) {//str生成二维码传入分析的scene字符串 name参数名
  if (!str) return null;
  var reg = new RegExp("(^|,)" + name + "=([^,]*)(,|$)");
  var r = str.match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

function getUrlVars(str,dot) {
  let newDot = dot?dot:'&';
  let vars = [];
  let hashes = str.slice(str.indexOf('?') + 1).split(newDot);
  for (var i = 0; i < hashes.length; i++) {
    let hash = hashes[i].split('=');
    //vars.push(hash[0]);
    if (hash[0]) {
      vars[hash[0]] = hash[1];
    }
  }
  return vars;
}

function objSort(obj) {
  let str = "";
  for (let key in obj) {
    str += key + '=' +obj[key] + '&'
  }
  return str.substring(0, str.lastIndexOf('&'));
}

module.exports = {
  formatTime,
  getQueryStr,
  objSort,
  getUrlVars,
  formatTimestamp,
  testRedPacket,
  testPhone,
  testName,
  identityCodeValid,
  trim,
  mixin
}
