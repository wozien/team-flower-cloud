# team-flower 小程序云开发代码

[小程序前端项目](https://github.com/wozien/team-flower)

## 云函数目录 `/cloudfunctions`

- `login`: 登陆获取openid
- `team`: 团队数据操作相关， 包括添加/移除成员， 赠送/扣除小红花
- `history`: 赠送记录相关操作
- `notification`: 推送相关逻辑

## 运行安装

- `git clone` 到本地
- 用微信开发工具打开
- 修改 `app.js` 为自己的云开发服务器：
  ```js
  App({
  onLaunch() {
    if(!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
        // 连接云服务器
        wx.cloud.init({
          env: 'mpyun-0ll9s',  // 修改自己的申请的云服务器名
          traceUser: true,
        })
      }
    }
  })
  ```
- 对应函数名右键部署

