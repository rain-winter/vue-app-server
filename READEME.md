# 目录

- config
  - db 数据库连接
  - index 存放数据库配置（url）

# JWT
jsonwebtoken

Header.Payload.Signature
调用方式

* /api?token=xxx
* cookie写入token
* storage写入token，请求头添加： Authorization: Bearer\<token>