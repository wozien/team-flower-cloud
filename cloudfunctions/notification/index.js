// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

function getTemplateId(type) {
  let res;
  if(type === 'give') 
    res = 'VuohxXh57VvHSkihzpk94WtkpuLiRL3XJFXXhttd6Sw'
  else if(type === 'deduct')
    res = 'ct4NV_LQ7AhLpkulV-feI7AOFHnxgZJuI-X8a2aVlF8'
  return res
}

function getTemplateData(type, params) {
  if(type === 'give') {
    return {
      thing1: { value: params.team_name },
      thing2: { value: params.sender },
      number3: { value: params.number }
    }
  }else {
    return {
      thing1: { value: params.team_name },
      number2: { value: params.number },
      thing3: { value: params.reason } 
    }
  }
}

/**
 * 订阅消息推送的入口
 * event.type  give | deduct
 * event.params   // 参数
 * {
 *    team_id: '',
 *    team_name: '',
 *    touser: '',
 *    sender: '',
 *    number: '',
 *    reason: ''
 * }
 */
exports.main = async (event, context) => {
  const { type, params } = event
  const templateId = getTemplateId(type)
  const templateData = getTemplateData(type, params)

  try {
    const result = await cloud.openapi.subscribeMessage.send({
      touser: params.touser,
      page: 'pages/rank/rank?team_id=' + params.team_id,
      lang: 'zh_CN',
      templateId: templateId,
      data: templateData
    })
    return result
  }catch(err) {
    return err
  }

}