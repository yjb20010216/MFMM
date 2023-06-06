// pages/chatMessage/chatMessage.js

const app = getApp()
const db = wx.cloud.database()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        friendList: {},
        userList:{}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 获得好友数据
        // console.log(options.userId);
        db.collection('user').doc(options.userId).get().then((res) => {
            console.log(res.data);
            this.setData({
                friendList: res.data
            })
        })
          // 获得自己数据
        db.collection('user').doc(app.userInfo._id).get().then((res) => {
            console.log(res.data);
            this.setData({
                userList: res.data
            })
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