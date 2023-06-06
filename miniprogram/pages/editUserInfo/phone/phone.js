// pages/editUserInfo/phone/phone.js

const app = getApp()
const db = wx.cloud.database()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        phoneNumber: '',
    },

    handleText(evt) {
        let value = evt.detail.value.replace(/\D/g, '')
        this.setData({
            phoneNumber: value
        })
    },
    handleBtn() {
        var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
        if (this.data.phoneNumber.trim().length == 0) {
            wx.showToast({
                title: '手机号不能为空！',
                icon: 'error',
                duration: 1000
            })
        } else if (this.data.phoneNumber.length < 11) {
            wx.showToast({
                title: '手机号长度不对！',
                icon: 'error',
                duration: 1000
            })
        } else if (!myreg.test(this.data.phoneNumber)) {
            wx.showToast({
                title: '手机号格式不对！',
                icon: 'error',
                duration: 1000
            })
        } else {
            this.upDatePhone()
        }
    },
    upDatePhone() {
        wx.showLoading({
            title: '修改中',
        })
        db.collection('user').doc(app.userInfo._id).update({
            data: {
                phoneNumber: this.data.phoneNumber
            }
        }).then((res) => {
            wx.hideLoading()
            wx.showToast({
                title: '修改成功',
            })
            app.userInfo.phoneNumber = this.data.phoneNumber
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
            phoneNumber: app.userInfo.phoneNumber
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