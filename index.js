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

// 使用session
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

// 登陆页面
app.get('/login', function(req, res){
	res.render('login')
})

// 验证用户
app.post('/check', function(req, res){
	var data = [req.body.name, req.body.password]
	var sql = 'select * from user where name=? and password=?'
	db.base(sql, data, (results)=>{
		if(results.length){
			// 验证成功将用户信息存入session
			req.session.user = {
				name: data[0]
			}
			// 跳转到index
			res.redirect('index')
		}else{
			// 验证失败
			res.redirect('/login')
		}
	})
	// if(req.body){
	// 	res.render('index')
	// }else{
	// 	res.redirect('/login')
	// }
})

// 注册页面路由
app.get('/register', (req, res) => {
	res.render('register')
})

// 注册方法路由
app.post('/registerUser', (req, res) => {
	var sql = 'insert into user set ?'
	var data = {
		name: req.body.name,
		password: req.body.password
	}
	db.base(sql, data, (results)=>{
		console.log(results)
		if(results.affectedRows>0){
			// 成功跳转到index
			res.redirect('index')
		}else{
			// 注册失败
			res.redirect('/register')
		}
	})
})

// 修改页面路由
app.get('/edit', (req, res)=>{
	var sql = 'select * from user where id = ?'
	var data = [req.query.id]
	db.base(sql, data, (results)=>{
		res.render('edit', {user : results[0]})
	})
})

// 修改方法路由
app.post('/editUser', (req, res)=>{
	var sql = 'update user set name = ?, password = ? where id = ?'
	var data = [req.body.name, req.body.password, req.body.id]
	db.base(sql, data, (results)=>{
		res.redirect('index')
	})
})

// 删除路由
app.get('/delete', (req, res)=>{
	var sql = 'delete from user where id = ?'
	var data = [req.query.id]
	db.base(sql, data, (results)=>{
		res.redirect('index')
	})
})

// 退出登录
app.get('/logout', (req, res)=>{
	req.session.destroy(function(err){
		if(err) throw err;
		// 实现服务器端的跳转，这个对比于 客户端跳转
		res.redirect('login');
	});
})

// 成功后跳转页
app.get('/index', function(req, res){
	var sql = 'select * from user'
	var users = []
	db.base(sql, null, (results)=>{
		res.render('index', {
			name: req.session.user.name,
			users: results
		})
	})
})

app.listen(3000, function(){
	console.log('running...')
})