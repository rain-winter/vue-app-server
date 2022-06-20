const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const router = require('koa-router')() // 获取的是一级路由
const jwt = require('jsonwebtoken') // jsonwebtoken
const koajwt = require('koa-jwt') // 中间件，在路由启动前加载

const util = require('./utils/utils.js')
const log = require('./utils/log4js') // log
const users = require('./routes/users') // 用户模块路由
const menus = require('./routes/menus') // 1-菜单模块路由
const roles = require('./routes/roles') // 角色路由

onerror(app) // error handler

require('./config/db') // 连接数据库


// middlewares
app.use(bodyparser({
	enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())


// logger
app.use(async (ctx, next) => {
	log.info(`get params:${JSON.stringify(ctx.request.query)}`)
	log.info(`post params:${JSON.stringify(ctx.request.body)}`)
	// next() 进行接口了
	await next().catch(err => {
		// 默认抛出 401状态码
		if (err.status == '401') {
			ctx.status = 200
			ctx.body = util.fail('Token认证失败', util.CODE.AUTH_ERROR)
		} else {
			throw err;
		}
	})
})

// 任何请求都会经过它，校验token是否失效（拦截器）
app.use(koajwt({
	secret: 'imooc'
}).unless({
	// 不校验以api开头的login接口
	path: [/^\/api\/users\/login/]
}))
// routes
router.prefix('/api') // 设置全局路由前缀

// router.get('/leave/count', (ctx) => {
// 	 从ctx.request获取token
// 	const token = ctx.request.headers.authorization.split(' ')[1]
// 	  解密出数据
// 	const payload = jwt.verify(token, 'imooc')
// 	ctx.body = '123'
// })

// 一级路由加载二级路由
router.use(users.routes(), users.allowedMethods())
router.use(menus.routes(), menus.allowedMethods())
router.use(roles.routes(), roles.allowedMethods())

app.use(router.routes(), router.allowedMethods()) // 全局加载下一级路由

// error-handling
app.on('error', (err, ctx) => {
	log.error(err)
});

console.log('http://localhost:3003/')

module.exports = app