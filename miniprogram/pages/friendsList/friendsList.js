// pages/friendsList/friendsList.js

// 获取数据库引用
const db = wx.cloud.database()
// 全局app
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 好友列表信息
        friendList: [],
        // 好友列表id
        friendListID: [],
        isfrinendList: true
    },
    // 点击头像进入跳转至该用户主页
    handleDetail(evt) {
        // console.log(evt.target.dataset.id);
        wx.navigateTo({
            url: '/pages/detail/detail?userId=' + evt.target.dataset.id,
        })
    },
    // 判断好友列表是否为空数组
    isfriend() {
        if (!this.data.friendList.length) {
            this.setData({
                isfrinendList: false
            })
        } else {
            this.setData({
                isfrinendList: true
            })
        }
    },
    // 点击是否删除好友
    handleChatMessage(evt) {
        // 好友id
        // console.log(evt.target.dataset.id);
        // 自己id
        // console.log(app.userInfo._id)
        wx.showModal({
            title: '提示信息',
            content: '删除好友',
            confirmText: '删除',
            complete: (res) => {
                if (res.cancel) {
                    // console.log('取消');
                    this.isfriend()
                }
                if (res.confirm) {
                    // console.log('确定');
                    // 删除this.data.friendList里面的好友数据
                    this.setData({
                        friendList: this.data.friendList.filter((item) => item._id != evt.target.dataset.id),
                        friendListID: this.data.friendListID.filter((item) => item != evt.target.dataset.id),
                    })
                    // 同时更新数据库里面的好友数据
                    db.collection('user').doc(app.userInfo._id).update({
                        data: {
                            friendList: this.data.friendListID
                        }
                    })
                    // 根据好友id请求数据库，找到好友里面的friendlList
                    let friendUserListId = []
                    db.collection('user').doc(evt.target.dataset.id).field({
                        friendList: true
                    }).get().then((res) => {
                        // console.log(res.data);
                        friendUserListId = res.data.friendList.filter((item) => item != app.userInfo._id)
                        // console.log(friendUserListId);
                        // 同时清除好友数据库里面friendList自己的id
                        db.collection('user').doc(evt.target.dataset.id).update({
                            data: {
                                friendList: friendUserListId
                            }
                        }).then((res) => {
                            this.isfriend()
                        })
                    })
                }
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        db.collection('user').where({
            friendList: app.userInfo._id
        }).field({
            userPhoto: true,
            nickName: true
        }).get().then((res) => {
            // console.log(res.data);
            res.data.forEach((item => {
                this.data.friendListID.push(item._id)
            }))
            this.setData({
                friendList: res.data,
                friendListID: this.data.friendListID
            })
            this.isfriend()
            // console.log(this.data.friendListID);
        })
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