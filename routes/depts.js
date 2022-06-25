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
  if (deptName) {
    ctx.body = util.success(rootList)
  } else {
    // 做递归
    // d第二个null是为了查出来橘子皮
    let treesList = getTreeDept(rootList, null, [])
    ctx.body = util.success(treesList)
  }
})
const getTreeDept = (rootList, id, list) => {
  for (let i = 0; i < rootList.length; i++) {
    let item = rootList[i]
    console.log(item.parentId.slice())
    if (String(item.parentId.slice().pop()) == String(id)) {
      list.push(item._doc)
    }
  }
  list.map(item => {
    item.children = []
    getTreeDept(rootList, item._id, item.children)
    if (item.children.length == 0) {
      delete item.children
    }
  })
  return list
}

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
