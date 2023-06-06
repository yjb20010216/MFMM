// pages/detail/detail.js

const app = getApp()
const db = wx.cloud.database()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        detail: {},
        isFriend: false,
        isHidden: false
    },

    handleAddFriend() {
        if (app.userInfo._id) {
            db.collection('message').where({ userId: this.data.detail._id }).get().then((res) => {
                // 被添加者 第二次被别人添加好友
                if (res.data.length) {
                    // 如果第二次 依旧是上次的那个人
                    if (res.data[0].list.includes(app.userInfo._id)) {
                        wx.showToast({
                            title: '已申请过!',
                            icon: 'error',
                        })
                    }
                    // 第二次是另外一个人
                    else {
                        wx.cloud.callFunction({
                            name: 'update',
                            data: {
                                collection: 'message',
                                where: {
                                    userId: this.data.detail._id
                                },
                                data: `{list : _.unshift('${app.userInfo._id}')}`
                            }
                        }).then((res) => {
                            // console.log(res);
                            wx.showToast({
                                title: '申请成功~'
                            })
                        });
                    }
                    // 被添加者 第一次被别人添加好友，申请
                } else {
                    db.collection('message').add({
                        data: {
                            // (被添加好友的) 账号 id
                            userId: this.data.detail._id,
                            // (要申请添加好友的) 账号 id 列表(可能不止一个)
                            list: [app.userInfo._id],
                            // (被添加好友的) 账号 nickName
                            nickName: this.data.detail.nickName
                        }
                    }).then((res) => {
                        wx.showToast({
                            title: '申请成功',
                        })
                    })
                }
            })
        } else {
            wx.showToast({
                title: '请先登录，正在跳转登录页面',
                icon: 'none',
                success() {
                    setTimeout(() => {
                        wx.switchTab({
                            url: '/pages/user/user',
                        })
                    }, 1000)
                }
            })
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // console.log(options);
        db.collection('user').doc(options.userId).get().then((res) => {
            this.setData({
                detail: res.data
            })
            // console.log(res.data.friendList);
            // 是否显示电话号码，添加好友，已是好友 等字段
            if (res.data.friendList.includes(app.userInfo._id)) {
                this.setData({
                    isFriend: true
                })
                // console.log('是好友');
            } else {
                // console.log('不是好友，也不是自己');
                this.setData({
                    isFriend: false
                }, () => {
                    if (res.data._id == app.userInfo._id) {
                        // console.log('不是好友，是自己');
                        this.setData({
                            isFriend: true,
                            isHidden: true
                        })
                    }
                })
            }
            // 所点击头像用户的id(res.data._id：是根据 options.userId 去向 user 数据库请求回来的数据)
            // console.log(res.data._id);
            // 当前账号用户的id
            // console.log(app.userInfo._id);
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})