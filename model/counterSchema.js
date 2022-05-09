const mongoose = require('mongoose')

/**
 * 维护用户id自增长表
 */
const counterSchema = mongoose.Schema({
  _id: String, // ID
  sequence_value: Number // 可以递增的id
})

// 导出users ，模型，数据库集合的名字
module.exports = mongoose.model('counter', counterSchema, 'counters')