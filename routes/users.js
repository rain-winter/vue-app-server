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

    const data = res._doc

    const token = jwt.sign({
      data: data,
    }, 'imooc', { expiresIn: '24h' })

    if (res) {
      data.token = token
      // ...之后，res变了，res里的_doc才是原来的res
      ctx.body = util.success(data)
    } else {
      ctx.body = util.fail('账号密码不正确')
    }
  } catch (error) {
    ctx.body = util.fail(error.msg)
  }
})

module.exports = router
