// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

/**
 *  文本安全检测
 * @param {*} param0 
 */
async function check_msg({ content }) {
  try {
    const res = await cloud.openapi.security.msgSecCheck({
      content
    })

    if(res && res.errCode.toString() === '87014') {
      return { code: 500, msg: '违规内容', data: res }
    } else {
      return { code: 0, msg: '合法内容', data: res }
    }
  } catch(err) {
    if(err.errCode.toString() === '87014') {
      return { code: 500, msg: '违规内容', data: err }
    }
    return { code: 502, msg: '接口调用异常', data: err }
  }
}

/**
 * 图片安全检测
 * @param {string} img 图片的CDN地址
 * @param {string} mimeType MIMETYPE
 */
async function check_img({ img, mimeType }) {
  try {
    // 先从cdn下载图片地址
    let buffer = await axios.get(img, {
      responseType: 'arraybuffer'
    })
    if(!buffer || !buffer.data) throw new Error('cdn download error')

    let res = await cloud.openapi.security.imgSecCheck({
      media: {
        contentType: mimeType,
        value: buffer.data
      }
    })

    if(res && res.errCode.toString() === '87014') {
      return { code: 500, msg: '违规图片', data: res }
    } else {
      return { code: 0, msg: '合法图片', data: res }
    }
  } catch(err) {
    if(err.errCode.toString() === '87014') {
      return { code: 500, msg: '违规图片', data: err }
    }
    return { code: 502, msg: '接口调用异常', data: err }
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { type, params } = event;
  let res = Promise.resolve();

  if(type === 'check_msg') {
    res = await check_msg(params)
  } else if(type === 'check_img') {
    res = await check_img(params)
  }

  return res;
}