/**
 * 用户管理模块
 */
const router = require('koa-router')()
router.prefix('/users') // 一级路由

const User = require('../model/userSchema')
const util = require('../utils/utils')

/* /login 是二级路由 */
router.post('/login', async (ctx) => {
  const { userName, userPwd } = ctx.request.body
  console.log('userName', userName)
  console.log(userPwd)
  try {
    const { userName, userPwd } = ctx.request.body
    const res = await User.findOne({
      userName,
      userPwd,
    })

    if (res) {
      ctx.body = util.success(res)
    } else {
      ctx.body = util.fail('账号密码不正确')
    }
  } catch (error) {
    ctx.body = util.fail(error.msg)
  }
})

module.exports = router
