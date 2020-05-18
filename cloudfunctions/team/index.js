// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database();
const teamCollection = db.collection('team');
const _ = db.command;

/**
 * 修改昵称
 * @param {*} param0 
 */
function rename({ team_id, openid, nickname }) {
  return teamCollection.where({
    _id: team_id,
    'members.openid': openid
  }).update({
    data: {
      'members.$.nickname': nickname
    }
  });
}

/**
 * 重置小红花额度
 * @param {} param0 
 */
function reset_quota({ team_id, quota }) {
  return teamCollection
    .doc(team_id)
    .update({
      data: {
        'members.$[].quota': quota
      }
    });
}

/**
 * 增加/扣除红花
 * @param {*} param0 
 */
function update_flowers({ team_id, openid, inc}) {
  return teamCollection.where({
    _id: team_id,
    'members.openid': openid
  }).update({
    data: {
      'members.$.flowers': _.inc(inc)
    }
  });
}

/**
 * 更新额度
 * @param {*} param0 
 */
function update_quota({ team_id, openid, inc}) {
  return teamCollection.where({
    _id: team_id,
    'members.openid': openid
  }).update({
    data: {
      'members.$.quota': _.inc(inc)
    }
  });
}

/**
 * 移除团队成员
 * @param {*} param0 
 */
function remove_member({team_id, openid}) {
  const doc =  teamCollection.doc(team_id);
  
  return doc.get().then(res => {
    const { members } = res.data;
    const index = members.findIndex(mb => mb.openid === openid);
    if(index > -1) {
      members.splice(index, 1);
    }
    return doc.update({
      data: {
        members
      }
    });
  });
}

/**
 * 添加团队成员
 * @param {*} param0 
 */
function add_member({team_id, member}) {
  const { openid } = member;
  const search = teamCollection.where({
    _id: team_id,
    'members.openid': openid
  });

  return search.get().then(res => {
    if(!res.data.length) {
      return search.update({
        data: {
          'members': _.push(member)
        }
      })
    }
    return true;
  });
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { type, params } = event;
  let res = Promise.resolve();

  if(type === 'rename') {
    res = await rename(params);
  } else if(type === 'reset_quota') {
    res = await reset_quota(params);
  } else if(type === 'update_flowers') {
    res = await update_flowers(params);
  } else if(type === 'update_quota') {
    res = await update_quota(params);
  } else if(type === 'remove_member') {
    res = await remove_member(params);
  } else if(type === 'add_member') {
    res = await add_member(params);
  }

  return res;
}