// 各环境接口地址
let ENV_API = {
    dev: "",
    uat: "",
    prod: "",
};

//图片地址
let img_API = {
    dev: "",
    uat: "",
    prod: ""
};

// 这里添加的属性，可以通过app.config 来访问
let config = {
    env: 'dev', // 在这里切换当前环境
    logger: {//配置上传log相关参数
        'X-Avoscloud-Application-Id': 'eDhlsYU0IWkyIFM8kMGDfw8s-gzGzoHsz',
        'X-Avoscloud-Application-Key': 'FCtKbKv13fbK8fDWdkIA6xEQ'
    },
    AppID: 'wxa0331ef4db311fdb',//AppID
    title: '找人',
    version: 'v1.0.0'
};
config.apiBase = ENV_API[config.env];
config.imgApi = img_API[config.env];
config.toMPversion = (config.env === 'prod' ? 'release' : 'trial')//trial,develop,release

module.exports = config;
