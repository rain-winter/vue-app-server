const mongoose = require('mongoose')

const menuSchema = mongoose.Schema({
  menuType: Number, // 菜单类型
  menuName: String, // 菜单名称
  menuCode: String, // 菜单名字
  path: String, // 路由地址
  icon: String, // 图标
  component: String, // 组件地址
  menuState: Number, //菜单状态
  parentId: [mongoose.Types.ObjectId], // 父级菜单的id
  "createTime": {
    type: Date,
    default: Date.now()
  },
  "updateTime": {
    type: Date,
    default: Date.now()
  },
})

/**
 * (1) 导出模型 ， 叫做menus
 * (2) menuSchema
 * (3) menus 创建数据库集合menus 可省略
 */
module.exports = mongoose.model('menu', menuSchema)