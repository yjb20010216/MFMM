// pages/editUserInfo/name/name.js

const app = getApp()
const db = wx.cloud.database()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        nickName: '',
        theme: wx.getSystemInfoSync().theme,
    },

    handleText(evt) {
        // console.log(evt);
        let value = evt.detail.value.trim()
        this.setData({
            nickName: value
        })
    },
    handleBtn() {
        if (this.data.nickName.trim().length == 0) {
            wx.showToast({
                title: '昵称不能为空！',
                icon: 'error',
                duration: 1000
            })
        } else if (this.data.nickName.trim().length > 0 && this.data.nickName.trim().length < 10) {
            this.upDateNickName()
        } else {
            wx.showToast({
                title: '长度为 1-10 位！',
                icon: 'error',
                duration: 1000
            })
        }
    },
    upDateNickName() {
        wx.showLoading({
            title: '修改中',
        })
        db.collection('user').doc(app.userInfo._id).update({
            data: {
                nickName: this.data.nickName
            }
        }).then((res) => {
            wx.hideLoading()
            wx.showToast({
                title: '修改成功',
            })
            app.userInfo.nickName = this.data.nickName
        })
        // console.log(app.userInfo.content);
        // 同时更新数据库里面 content 的昵称
        for (let i = 0; i < app.userInfo.content.length; i++) {
            const contentTime = app.userInfo.content[i].contentTime
            const contentWord = app.userInfo.content[i].contentWord
            const imageFileId = app.userInfo.content[i].imageFileId
            const link = app.userInfo.content[i].link
            const userPhoto = app.userInfo.content[i].userPhoto
            db.collection('user').doc(app.userInfo._id).update({
                data: {
                    ['content.' + [i]]: { contentTime, contentWord, imageFileId, link, userPhoto, nickName: this.data.nickName }
                }
            })
            // 同时更改 app.useInfo.content 里面的昵称
            app.userInfo.content[i].nickName = this.data.nickName
        }
    },

    // 表单提交事件
    formSubmit(e) {
        console.log('昵称：', e.detail.value.nickname)
        this.setData({
            nickName: e.detail.value.nickname
        })
        this.upDateNickName()
    },

    // getUserProfile(e) {
    //     wx.getUserProfile({
    //         desc: '只用于登录，不会保存个人信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    //         success: (res) => {
    //             // console.log(res);
    //             this.setData({
    //                 nickName: res.userInfo.nickName
    //             })
    //             this.upDateNickName()
    //         },
    //         fail: (err) => {
    //             console.log('授权失败', err);
    //         }
    //     })
    // },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        wx.onThemeChange((result) => {
            this.setData({
                theme: result.theme
            })
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        this.setData({
            nickName: app.userInfo.nickName
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