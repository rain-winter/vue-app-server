const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  "userId": Number,
  "userName": String,
  "userPwd": String,
  "userEmail": String,
  "mobile": String,
  "sex": Number, // 性别 0：男 1：女
  "deptId": [], // 部门
  "job": String, // 岗位
  "state": {
    type: Number,
    default: 1
  }, // 1：在职 2：离职 3：试用期
  "role": {
    type: Number,
    default: 1
  },// 用户角色 0：系统管理员 1：普通用户
  "roleList": [], // 系统角色
  "createTime": {
    type: Date,
    default: Date.now()
  },
  "updateTime": {
    type: Date,
    default: Date.now()
  },
  remark: String
})

// 导出users ，模型，数据库集合的名字
module.exports = mongoose.model('users', userSchema, 'users')