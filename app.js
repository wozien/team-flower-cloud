
App({
  onLaunch() {
    if(!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      // 连接云服务器
      wx.cloud.init({
        env: 'mpyun-0ll9s',
        traceUser: true,
      })
    }
  }
})