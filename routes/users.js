/**
 * 用户管理模块
 */
const router = require('koa-router')()
const jwt = require('jsonwebtoken') // 引入jsonwebtoken
router.prefix('/users') // 一级路由

const User = require('../model/userSchema')
const utils = require('../utils/utils')
const util = require('../utils/utils')

/* /login 是二级路由 */
router.post('/login', async (ctx) => {
	// const {
	// 	userName,
	// 	userPwd
	// } = ctx.request.body

	try {
		const {
			userName,
			userPwd
		} = ctx.request.body
		console.log(userName)
		/**
		 * 返回数据库指定字段，有三种方式
		 * 1、 'userId userName '
		 * 2、{userId:1} 为1返回 0不反回
		 * 3、.select('userId')
		 */
		const res = await User.findOne({
			userName,
			userPwd,
		}, 'userId userName userEmail state role deptId roleList')

		const data = res._doc

		const token = jwt.sign({
			data,
		}, 'imooc', {
			expiresIn: '4d'
		})

		if (res) {
			data.token = token
			// ...之后，res变了，res里的_doc才是原来的res
			console.log(data.token)
			ctx.body = util.success(data)
		} else {
			ctx.body = util.fail('账号密码不正确')
		}
	} catch (error) {
		ctx.body = util.fail(error.msg)
	}
})

// TODO 获取用户列表
router.get('list', async (ctx) => {
	const { userId, userName, state } = ctx.request.body
	const { page, skipIndex } = utils.pager(ctx.request.query)
	let params = {}
	if (userId) params.userId = userId
	if (userName) params.userName = userName
	if (state && state != '0') params.state = state
	try {
		const query = User.find(params, { _id: 0, userPwd: 0 })
		const list = await query.skip(skipIndex).limit(page.pageSize)
		ctx.body = utils.success({
			page: {
				...page,
				total
			},
			list
		})
	} catch (e) {
		ctx.body = utils.fail(`查询异常：${e.stack}`)
	}
})

module.exports = router
