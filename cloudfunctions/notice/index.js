// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const noticeCollection = db.collection('notice')

async function get_list({ team_id, skip }) {
  const res = await noticeCollection.where({
    team_id
  }).orderBy('date', 'desc')
    .skip(skip)
    .limit(6)
    .get()
        
  return res
}

/**
 * 更新公告赞的数据
 * @param {*} param0 
 */
async function update_likes({ notice_id, openid, like }) {
  let res = await noticeCollection.doc(notice_id).get()

  if(res.errMsg === 'document.get:ok') {
    const notice = res.data
    if(notice && notice.likes) {
      const index = notice.likes.findIndex(id => openid === id)
      if(index > -1 && !like) {
        notice.likes.splice(index, 1)
      } else if(index < 0 && like) {
        notice.likes.push(openid)
      }
      res = await noticeCollection.doc(notice_id).update({
        data: {
          likes: notice.likes
        }
      })
    }
  }

  return res
}

/**
 * 更新公告
 * @param {*} param0 
 */
function update_notice({ notice_id, notice }) {
  return noticeCollection.doc(notice_id).update({
    data: {
      ...notice
    }
  })
}

/**
 * 删除公告
 * @param {*} param0 
 */
async function delete_notice({ notice_id }) {
  let res = await noticeCollection.doc(notice_id).get()
  const notice = res && res.data

  if(notice && notice.images && notice.images.length) {
    // 删除图片
    await cloud.deleteFile({
      fileList: notice.images
    })
  }

  return noticeCollection.doc(notice_id).remove()
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { type, params } = event;
  let res = Promise.resolve();

  if(type === 'get_list') {
    res = await get_list(params)
  } else if(type === 'update_likes') {
    res = await update_likes(params)
  } else if(type === 'update_notice') {
    res = await update_notice(params)
  } else if(type === 'delete_notice') {
    res = await delete_notice(params)
  }

  return res
}