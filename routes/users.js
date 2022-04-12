/**
 * 用户管理模块
 */
const router = require('koa-router')()
const jwt = require('jsonwebtoken') // 引入jsonwebtoken
router.prefix('/users') // 一级路由

const User = require('../model/userSchema')
const util = require('../utils/utils')

/* /login 是二级路由 */
router.post('/login', async (ctx) => {
  const { userName, userPwd } = ctx.request.body

  try {
    const { userName, userPwd } = ctx.request.body
    const res = await User.findOne({
      userName,
      userPwd,
    })
    const token = jwt.sign({
      data: res,
    }, 'imooc', { expiresIn: 30 })
    console.log(res)

    if (res) {
      res.token = token
      ctx.body = util.success(res)
    } else {
      ctx.body = util.fail('账号密码不正确')
    }
  } catch (error) {
    ctx.body = util.fail(error.msg)
  }
})

module.exports = router
