const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const router = require('koa-router')() // 获取的是一级路由


const log = require('./utils/log4js') // log
const users = require('./routes/users') // 用户模块路由

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

	await next()
})

// routes
router.prefix('/api') // 设置全局路由前缀
// 一级路由加载二级路由
router.use(users.routes(), users.allowedMethods())
app.use(router.routes(), router.allowedMethods()) // 全局加载下一级路由

// error-handling
app.on('error', (err, ctx) => {
	log.error(err)
});

module.exports = app
