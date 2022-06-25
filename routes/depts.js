const router = require('koa-router')()

const util = require('../utils/utils')
const Dept = require('../model/deptSchama') // 引入模型
router.prefix('/dept')

// 部门树形列表
router.get('/list', async ctx => {
  let { deptName } = ctx.request.query
  let params = {}
  if (deptName) params.deptName = deptName
  let rootList = await Dept.find(params)
  ctx.body = util.success(rootList)
})

// 部门操作：创建、编辑、删除
router.post('/operate', async ctx => {
  let res, info // 返回值 返回信息
  const { _id, action, ...params } = ctx.request.body
  try {
    if (action == 'create') {
      // 创建
      res = await Dept.create(params)
      info = '创建成功'
    } else if (action == 'edit') {
      params.updateTime = new Date()
      res = await Dept.findOneAndUpdate(_id, params)
      info = '编辑成功'
    } else if (action == 'delete') {
      res = await Dept.findByIdAndRemove(_id)
      //   删除包含_id的部门
      Dept.deleteMany({ parentId: { $all: [_id] } })
      info = '删除成功'
    }
    ctx.body = util.success('', info)
  } catch (error) {
    console.log(`${error.stack}`)
  }
})

module.exports = router
