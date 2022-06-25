/**
 * 用户管理模块
 */
const router = require('koa-router')()
const jwt = require('jsonwebtoken') // 引入jsonwebtoken
router.prefix('/users') // 一级路由

const User = require('../model/userSchema')
const Counter = require('../model/counterSchema')
const utils = require('../utils/utils')
const util = require('../utils/utils')
const md5 = require('md5')

/* /login 是二级路由 */
router.post('/login', async ctx => {
  try {
    const { userName, userPwd } = ctx.request.body
    /**
     * 返回数据库指定字段，有三种方式
     * 1、 'userId userName '
     * 2、{userId:1} 为1返回 0不反回
     * 3、.select('userId')
     */
    const res = await User.findOne(
      {
        userName,
        userPwd,
      },
      'userId userName userEmail state role deptId roleList'
    )

    const data = res._doc

    const token = jwt.sign(
      {
        data,
      },
      'imooc',
      {
        expiresIn: '4d',
      }
    )

    if (res) {
      data.token = token
      // ...之后，res变了，res里的_doc才是原来的res
      ctx.body = util.success(data)
    } else {
      ctx.body = util.fail('账号密码不正确')
    }
  } catch (error) {
    ctx.body = util.fail(error.msg)
  }
})

// 获取用户列表
router.get('/list', async ctx => {
  const { userId, userName, state } = ctx.request.query
  const { page, skipIndex } = utils.pager(ctx.request.query)
  console.log(page)
  console.log(skipIndex)
  let params = {}
  if (userId) params.userId = userId // 根据id查询
  if (userName) params.userName = userName // 根据userName查询
  if (state && state != '0') params.state = state // 根据state查询
  console.log(params) // { state: '1' }
  try {
    const query = User.find(params, {
      _id: 0,
      userPwd: 0,
    })
    if (query == []) {
      return utils.success(null, '暂无数据')
    }
    // 分页
    const list = await query.skip(skipIndex).limit(page.pageSize)
    // console.log(list)
    const total = await User.countDocuments(params) // 获取d总记录数
    ctx.body = utils.success({
      page: {
        ...page,
        total,
      },
      list,
    })
  } catch (e) {
    ctx.body = utils.fail(`查询异常：${e.stack}`)
  }
})

/**
 * TODO 用户删除/批量删除
 */
router.post('/delete', async ctx => {
  // 待删除的用户id数组
  // 软删除  state改为离职
  const { userIds } = ctx.request.body
  // User.updateMany({
  // 	$or: [
  // 		{ userId: 10001 },
  // 		{ userId: 1002 }
  // 	]
  // })
  // 将 多条数据的state改为2
  const res = await User.updateMany(
    {
      userId: {
        $in: userIds,
      },
    },
    {
      state: 2,
    }
  )
  console.log('res', res)
  if (res.modifiedCount == 0) {
    ctx.body = util.fail('删除失败')
    return
  }
  ctx.body = util.success(res, '删除成功')
})

/**
 * TODO 用户新增/编辑
 */
router.post('/operate', async ctx => {
  const { userId, userName, userEmail, mobile, job, state, roleList, deptId, action } =
    ctx.request.body
  if (action == 'add') {
    if (!userName || !userEmail || !deptId) {
      ctx.body = util.fail('参数错误', util.CODE.PARAM_ERROR)
      return
    }

    // 首先使数据库Counter表的sequence_value＋1 作为用户的主键
    // 通过doc.sequence_value取到id
    const doc = await Counter.findOneAndUpdate(
      {
        _id: 'userId',
      },
      {
        $inc: {
          sequence_value: 1,
        },
      },
      {
        new: true,
      }
    )

    // 判断重复，使用 $or 或者查询
    const res = await User.findOne(
      {
        $or: [
          {
            userName,
          },
          {
            userEmail,
          },
        ],
      },
      '_id userName userEmail'
    )
    console.log(res)
    if (res) {
      ctx.body = util.fail(`系统监测到重复用户，信息如下：${res.userName}`)
    } else {
      const user = new User({
        userId: doc.sequence_value,
        userName,
        userPwd: md5(123456),
        userEmail,
        role: 1,
        roleList,
        job,
        state,
        deptId,
        mobile,
      })
      user.save()
      ctx.body = util.success({}, '用户创建成功')
    }
  } else {
    if (!deptId) {
      ctx.body = util.fail('部门不能为空', util.CODE.PARAM_ERROR)
      return
    }
    try {
      const res = await User.findOneAndUpdate(
        {
          userId,
        },
        {
          mobile,
          job,
          state,
          roleList,
          deptId,
        }
      )
      ctx.body = util.success(res, '更新成功')
    } catch (error) {
      ctx.body = util.fail('更新失败')
    }
  }
})

// 获取全部用户
router.get('/all/list', async ctx => {
  try {
    const list = await User.find({}, 'userId userName userEmail')
    ctx.body = util.success(list)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})

module.exports = router
