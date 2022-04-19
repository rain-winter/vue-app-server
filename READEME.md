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
~~~bash
yarn add koa-jwt -S
~~~

~~~js
// TODO 任何请求都会经过它，校验token是否失效
// koa2中中间件使用，默认都会注入 ctx对象
app.use(koa - jwt({
	secret: 'imooc'
}))
~~~

~~~js
const res = await User.findOne({
			userName,
			userPwd,
		}, 'userId userName') // 只返回这儿两个字段
~~~

