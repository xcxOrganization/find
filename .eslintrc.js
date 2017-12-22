module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.wpy files
  plugins: [
    'html'
  ],
  settings: {
    'html/html-extensions': ['.html', '.wpy']
  },
  // add your custom rules here
  'rules': {
	'no-func-assign': 2,//禁止重复的函数声明
	"no-irregular-whitespace": 0,//允许有不规则的空格
	"quotes": [0, "single"],//引号类型 `` "" ''
	"semi": [0, "never"],//分号
	"space-before-function-paren": [0, "always"],
	"semi-spacing": [0, { "before": false, "after": true }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
