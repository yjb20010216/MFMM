// pages/editUserInfo/signature/signature.js

const app = getApp()
const db = wx.cloud.database()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        signature: ''
    },

    handleText(evt) {
        // console.log(evt);
        let value = evt.detail.value.trim()
        this.setData({
            signature: value
        })
    },
    handleBtn() {
        if (this.data.signature.trim().length == 0) {
            wx.showToast({
                title: '个性签名不能为空！',
                icon: 'error',
                duration: 1000
            })
        } else if (this.data.signature.trim().length > 0 && this.data.signature.trim().length < 30) {
            this.upDateSignature()
        } else {
            wx.showToast({
                title: '长度为 1-30 位！',
                icon: 'error',
                duration: 1000
            })
        }
    },
    upDateSignature() {
        wx.showLoading({
            title: '修改中',
        })
        db.collection('user').doc(app.userInfo._id).update({
            data: {
                signature: this.data.signature
            }
        }).then((res) => {
            wx.hideLoading()
            wx.showToast({
                title: '修改成功',
            })
            app.userInfo.signature = this.data.signature
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
            signature: app.userInfo.signature
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