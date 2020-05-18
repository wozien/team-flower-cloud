// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database();
const history = db.collection('history');
const _ = db.command;

/**
 * 分页获取赠送记录
 * @param {*} param0 
 */
function get_list({team_id, to, skip}) {
  return history.where({
    team_id,
    to
  }).orderBy('date', 'desc')
    .skip(skip)
    .limit(10)
    .get()
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { type, params } = event;

  let res;
  if(type === 'get_list') {
    res = await get_list(params);
  }
  return res;
}