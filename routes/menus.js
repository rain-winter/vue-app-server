const router = require('koa-router')()

const util = require('../utils/utils')
const Menu = require('../model/menuSchema') // 引入模型

router.prefix('/menu') // 设置路由前缀

router.get('/list', async (ctx) => {
  const {
    menuName,
    menuState,
  } = ctx.request.body

  const params = {}

  if (menuName) params.menuName = menuName
  if (menuState) params.menuState = menuState

  let rootList = await Menu.find(params) || []

  const permissionList = getTreeMenu(rootList, null, [])
  ctx.body = util.success(permissionList)
})

// 递归拼接属性列表
function getTreeMenu(rootList, id, list) {
  for (let i = 0; i < rootList.length; i++) {
    let item = rootList[i]
    if (String(item.parentId.slice().pop()) == String(id)) {
      console.log(item.parentId.slice().pop())
      list.push(item._doc)
    }
  }
  list.map(item => {
    item.children = []
    getTreeMenu(rootList, item._id, item.children)
    if (item.children.length == 0) {
      delete item.children
    } else if (item.children.length > 0 && item.children[0].menuType == 2) { // 2 是按钮
      // 快速区分按钮和菜单，用于后期做菜单按钮权限控制
      item.action = item.children
    }
  })
  return list
}

/**
 * 按钮的添加、删除、编辑
 */
router.post('/operate', async (ctx) => {
  // 解析出_id和action，剩下的一起解析
  const {
    _id,
    action,
    ...params
  } = ctx.request.body
  let res, info;

  try {
    if (action == 'add') {
      res = await Menu.create(params)
      info = '创建成功'
    } else if (action == 'edit') {
      info = '编辑成功'
      params.updateTime = new Date()
      await Menu.findByIdAndUpdate(_id, params)
    } else {
      await Menu.findByIdAndRemove(_id)
      await Menu.deleteMany({
        parentId: {
          $all: [_id]
        }
      })
      info = '删除成功'
    }
    ctx.body = util.success('', info)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})

// * 需要导出
module.exports = router