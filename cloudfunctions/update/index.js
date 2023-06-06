// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env: "cloud1-9g2ij0bz8597f074"
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = (event, context) => {

    if (typeof event.data == 'string') {
        event.data = eval('(' + event.data + ')');
    }

    if (event.doc) {
        return db.collection(event.collection).doc(event.doc).update({
            data: {
                ...event.data
            }
        })
    } else {
        return db.collection(event.collection).where({ ...event.where }).update({
            data: {
                ...event.data
            }
        })
    }
}