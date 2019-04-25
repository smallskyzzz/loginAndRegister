// 封装操作数据库的通用api
const mysql = require('mysql')

exports.base = (sql, data, callback) => {
	const connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456',
		database: 'node'
	})
	// 连接操作
	connection.connect()

	// 操作数据库(异步操作)
	connection.query(sql, data, function(error, results, fields){
		if(error) throw error
		callback(results)
	})

	// 关闭数据库
	connection.end()
}