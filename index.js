var express = require('express')
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const db = require('./db.js')
var session = require('express-session')

var app = express()
// 设置模板引擎
// 设置模板的路径
app.set('views',path.join(__dirname,'view'));
// 设置默认引擎
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// 处理请求参数
// 挂载参数处理中间件（post）
app.use(bodyParser.urlencoded({ extended: false }));
// 处理json格式的参数
app.use(bodyParser.json());

app.use(session({
	secret: 'keyboard cat', // 相当于是一个加密密钥，值可以是任意字符串
	resave: false, // 强制session保存到session store中
	saveUninitialized: false // 强制没有“初始化”的session保存到storage中
}))

// 登陆拦截器
app.use(function (req, res, next) {
    var url = req.originalUrl;
    if (url != "/login" && url != "/check" && !req.session.user) {
        return res.redirect("/login");
    }
    next();
});

app.get('/login', function(req, res){
	res.render('login')
})
app.get('/check', function(req, res){
	res.redirect('/login')
})
// post方法登陆成功后刷新页面默认的方式仍然是post，所以不会跳转到上面的路由
// 但如果手动输入路由就会变为get，跳转到login
app.post('/check', function(req, res){
	var data = [req.body.name, req.body.password]
	var sql = 'select * from user where name=? and password=?'
	db.base(sql, data, (results)=>{
		if(results.length){
			console.log(req.session.user)
			req.session.user = {
				name: data[0]
			}
			res.redirect('index')
		}else{
			res.redirect('/login')
		}
	})
	// if(req.body){
	// 	res.render('index')
	// }else{
	// 	res.redirect('/login')
	// }
})
app.get('/index', function(req, res){
	res.render('index')
})

app.listen(3000, function(){
	console.log('running...')
})