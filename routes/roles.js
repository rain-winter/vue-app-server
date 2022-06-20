const router = require('koa-router')()
const { url } = require('koa-router')
const Role = require('../model/rolesSchema')
const utils = require('../utils/utils')
// const { success, fail, pager, CODE } = require('../utils/utils')
router.prefix('/roles')

// 查询所有角色列表
router.get('/allList', async ctx => {
  try {
    const list = await Role.find({}, '_id roleName')
    ctx.body = utils.success(list)
  } catch (error) {
    ctx.body = utils.fail(`查询失败：${error.stack}`)
  }
})

// 按列获取角色列表
router.get('/list', async ctx => {
  const { roleName } = ctx.request.query
  const { page, skipIndex } = utils.pager(ctx.request.query)
  try {
    let params = {}
    if (roleName) params.roleName = roleName
    const query = Role.find(params) // promise类型的对象
    const list = await query.skip(skipIndex).limit(page.pageSize)
    const total = await Role.countDocuments(params)
    ctx.body = utils.success({
      list,
      page: {
        ...page,
        total,
      },
    })
  } catch (error) {
    ctx.body = utils.fail(`查询失败：${error.stack}`)
  }
})

// 角色的操作：创建、编辑、删除
router.post('/operate', async ctx => {
  const { _id, roleName, remark, action } = ctx.request.body

  let res, info // 返回值 返回消息

  try {
    if (action == 'create') {
      // 创建
      res = await Role.create({ roleName, remark })
      info = '创建成功'
    } else if (action == 'edit') {
      // 编辑
      if (!_id) {
        ctx.body = utils.fail('缺少id')
        return
      }
      let params = { roleName, remark } // 条件
      params.updateTime = new Date()

      res = await Role.findByIdAndUpdate(_id, params)
      info = '编辑成功'
    } else {
      // 删除
      if (!_id) {
        ctx.body = utils.fail('缺少id')
        return
      }
      res = await Role.findByIdAndRemove(_id)
      info = '删除成功'
    }
    ctx.body = utils.success(res, info)
  } catch (error) {
    // 查询失败，打印堆栈信息
    ctx.body = utils.fail(`查询失败：${error.stack}`)
  }
})

module.exports = router
