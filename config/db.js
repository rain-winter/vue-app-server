/**
 * 数据库连接
 */
const mongoose = require('mongoose');
const config = require('./index')
const log4js = require('../utils/log4js')


async function main () {
  await mongoose.connect(config.URL);
}

main().then(res => {
  log4js.info('***数据库连接成功***')
}).catch(err => log4js.error('***数据库连接失败***'));
