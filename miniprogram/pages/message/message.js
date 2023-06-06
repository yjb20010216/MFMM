// pages/message/message.js

const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userMessage: [],
        logined: false
    },

    onMyEvent(evt) {
        // 先让 userMessage 赋值为空，再接受子组件传过来的值
        this.setData({
            userMessage: []
        }, () => {
            this.setData({
                userMessage: evt.detail
            })
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

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        if (app.userInfo._id) {
            this.setData({
                logined: true,
                userMessage: app.userMessage
            })
            // console.log(this.data.userMessage);
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