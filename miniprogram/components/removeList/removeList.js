// components/removeList/removeList.js

const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Component({

    lifetimes: {
        attached: function () {
            // 在组件实例进入页面节点树时执行
            db.collection('user').doc(this.data.messageId).field({
                userPhoto: true,
                nickName: true
            }).get().then((res) => {
                this.setData({
                    userMessage: res.data
                })
                // console.log(res.data);
            })
        },
        detached: function () {
            // 在组件实例被从页面节点树移除时执行
        },
    },

    /**
     * 组件的属性列表
     */
    properties: {
        // 从父组件传过来的 发送好友申请的 id
        messageId: String
    },

    /**
     * 组件的初始数据
     */
    data: {
        userMessage: {}
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 同意接受别人的好友申请
        handleAddFriend() {
            wx.showModal({
                title: '提示信息',
                content: '好友申请',
                confirmText: '同意',
                complete: (res) => {
                    if (res.cancel) {
                        // console.log('取消');
                    }
                    if (res.confirm) {
                        // console.log('确定');
                        db.collection('user').doc(app.userInfo._id).update({
                            data: {
                                friendList: _.unshift(this.data.messageId)
                            }
                        }).then((res) => {

                        })
                        // 调用云函数，更新数据库
                        // 往发送申请好友的账号 里添加 同意申请好友的id
                        wx.cloud.callFunction({
                            name: 'update',
                            data: {
                                collection: 'user',
                                doc: this.data.messageId,
                                data: `{friendList: _.unshift('${app.userInfo._id}')}`
                            }
                        }).then((res) => {
                            this.removeMessage()
                        })
                    }
                }
            })
        },
        // 删除别人的好友申请
        handleDelMessage() {
            wx.showModal({
                title: '提示信息',
                content: '删除消息',
                confirmText: '删除',
                complete: (res) => {
                    if (res.cancel) {
                        // console.log('取消');
                    }
                    if (res.confirm) {
                        this.removeMessage()
                    }
                }
            })
        },
        // 更新消息列表（更新数据和Dom结构）
        removeMessage() {
            // console.log('确定');
            // 根据此登录账号的 id 找到对应的消息列表
            db.collection('message').where({
                userId: app.userInfo._id
            }).get().then((res) => {
                let list = res.data[0].list
                // console.log(list);
                // 过滤出需要删除用户 id 的列表
                list = list.filter((item) => {
                    return item != this.data.messageId
                })
                // console.log(list);
                // 调用云函数 update 更新数据库
                wx.cloud.callFunction({
                    name: 'update',
                    data: {
                        collection: 'message',
                        where: {
                            userId: app.userInfo._id
                        },
                        data: {
                            list: list
                        }
                    }
                }).then((res) => {
                    // 向父组件传值
                    this.triggerEvent('myevent', list)
                })
            })
        },
    }
})
