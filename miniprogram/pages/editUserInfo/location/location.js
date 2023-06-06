// pages/editUserInfo/location/location.js

const app = getApp()
const db = wx.cloud.database()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLocation: true
    },

    switchChange(evt) {
        // console.log(evt.detail.value);
        db.collection('user').doc(app.userInfo._id).update({
            data: {
                isLocation: evt.detail.value
            }
        }).then((res) => {
            if (evt.detail.value) {
                wx.showToast({
                    title: '开启成功',
                })
                this.setData({
                    isLocation: evt.detail.value
                })
            } else {
                wx.showToast({
                    title: '关闭成功',
                })
                this.setData({
                    isLocation: evt.detail.value
                })
            }
            app.userInfo.isLocation = this.data.isLocation
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
        this.setData({
            isLocation: app.userInfo.isLocation
        })
        // console.log(app.userInfo.isLocation);
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