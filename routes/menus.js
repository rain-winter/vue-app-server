const router = require('koa-router')()

const util = require('../utils/utils')
const Menu = require('../model/menuSchema') // 引入模型

router.prefix('/menu') // 设置路由前缀

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