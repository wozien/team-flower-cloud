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
 * 更新头像
 * @param {*} param0 
 */
function update_avatar({ team_id, openid, avatar }) {
  return teamCollection.where({
    _id: team_id,
    'members.openid': openid
  }).update({
    data: {
      'members.$.avatar': avatar
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
        'quota': quota,
        'members.$[].quota': quota
      }
    });
}

/**
 * 重置小红花
 * @param {*} param0 
 */
function reset_flowers({ team_id }) {
  return teamCollection
    .doc(team_id)
    .update({
      data: {
        'members.$[].flowers': 0
      }
    })
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
  return teamCollection.where({
    _id: team_id,
    'members.openid': openid
  }).update({
    data: {
      'members.$.is_delete': 1
    }
  });
}

/**
 * 添加团队成员
 * @param {*} param0 
 */
function add_member({team_id, member}) {
  return teamCollection.doc(team_id).get().then(res => {
    const { members } = res.data;
    const index = members.findIndex(mb => mb.openid === member.openid);
    if(index > -1) {
      const oldMember = members[index];
      if(oldMember.is_delete == 1) {
        // 已删除的成员再次加入
        members.splice(index, 1, member);
        return update_members({team_id, members});
      } else {
        // 已在团队中
        return true;
      }
    } else {
      members.push(member);
      return update_members({team_id, members});
    }
  })
}

/**
 * 更新成员数据
 * @param {*} param0 
 */
function update_members({team_id, members}) {
  return teamCollection.doc(team_id).update({
    data: {
      members
    }
  });
}

/**
 * 更新团队的管理模式
 * @param {*} param0 
 */
function update_mode({ team_id, mode }) {
  return teamCollection.doc(team_id).update({
    data: {
      mode
    }
  })
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
  } else if(type === 'reset_flowers') {
    res = await reset_flowers(params);
  } else if(type === 'update_mode') {
    res = await update_mode(params);
  } else if(type === 'update_avatar') {
    res = await update_avatar(params);
  }

  return res;
}