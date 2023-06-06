// pages/user/user.js

// 获取数据库引用
const db = wx.cloud.database()
// 全局app
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userPhoto: "/images/user/user-unlogin.png",
        hasUserInfo: false,
        canIUseGetUserProfile: false,
        nickName: "小喵喵",
        logged: false,
        disabled: true,
        id: ""
    },

    // 获取位置信息，得到经纬度
    getLocation() {
        wx.getLocation({
            type: 'gcj02',
            success: (res) => {
                this.latitude = res.latitude
                this.longitude = res.longitude
            }
        })
    },

    getUserProfile(e) {
        // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
        // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        wx.getUserProfile({
            desc: '只用于登录，不会保存个人信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
            success: (res) => {
                let userInfo = res.userInfo
                if (!this.data.logged && userInfo) {
                    // 添加数据库
                    db.collection('user').add({
                        data: {
                            userPhoto: userInfo.avatarUrl,
                            nickName: userInfo.nickName,
                            signature: '',
                            phoneNumber: '',
                            weixinNumber: '',
                            links: 0,
                            time: new Date(),
                            isLocation: true,
                            friendList: [],
                            latitude: this.latitude,
                            longitude: this.longitude,
                            location: db.Geo.Point(this.longitude, this.latitude),
                            content: [],
                            isDraft:{}
                        }
                    }).then((ok) => {
                        // console.log(ok, '添加成功');
                        db.collection('user').doc(ok._id).get().then((res) => {
                            // 通过 Object.assign() 方法将res.data深复制给app.userInfo
                            app.userInfo = Object.assign(app.userInfo, res.data);
                            this.setData({
                                userPhoto: app.userInfo.userPhoto,
                                nickName: app.userInfo.nickName,
                                logged: true,
                                hasUserInfo: true,
                            });
                        })
                    }).catch((err) => {
                        console.log(err, '添加失败');
                    })
                }
                // console.log(res.userInfo);
            }
        })
    },
    getUserInfo(e) {
        // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
        let userInfo = e.detail.userInfo;
        if (!this.data.logged && userInfo) {
            db.collection('user').add({
                data: {
                    userPhoto: userInfo.avatarUrl,
                    nickName: userInfo.nickName,
                    signature: '',
                    phoneNumber: '',
                    weixinNumber: '',
                    links: 0,
                    time: new Date(),
                    isLocation: true,
                    friendList: [],
                    latitude: this.latitude,
                    longitude: this.longitude,
                    location: db.Geo.Point(this.longitude, this.latitude),
                    content: [],
                    isDraft:{}
                }
            }).then((res) => {
                db.collection('user').doc(res._id).get().then((res) => {
                    //console.log(res.data);
                    app.userInfo = Object.assign(app.userInfo, res.data);
                    this.setData({
                        userPhoto: app.userInfo.userPhoto,
                        nickName: app.userInfo.nickName,
                        logged: true,
                        hasUserInfo: true,
                    });
                });
            });
        }
    },

    // 实时监听获取消息
    getMessage() {
        db.collection('message').where({
            userId: app.userInfo._id
        }).watch({
            onChange: function (snapshot) {
                // console.log('成功', snapshot);
                // 确定监听消息成功
                if (snapshot.docChanges.length) {
                    let list = snapshot.docChanges[0].doc.list;
                    // console.log(list);
                    // 如果消息里面有数组，就显示红点
                    if (list.length) {
                        wx.showTabBarRedDot({
                            index: 2,
                        })
                        app.userMessage = list
                    } else {
                        wx.hideTabBarRedDot({
                            index: 2,
                        })
                        app.userMessage = []
                    }
                }
            },
            onError: function (error) {
                console.log('失败', error);
            }
        })
    },

    // 点击头像按钮，跳转到修改头像界面
    updateUserPhoto() {
        wx.navigateTo({
            url: '/pages/editUserInfo/head/head',
        })
    },
    // 点击昵称，跳转到修改昵称界面
    updateUserNickName() {
        wx.navigateTo({
            url: '/pages/editUserInfo/name/name',
        })
    },

    /**
        * 生命周期函数--监听页面加载
        */
    onLoad(options) {
        if (wx.getUserProfile) {
            this.setData({
                canIUseGetUserProfile: true
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

        // 获取位置信息
        this.getLocation()

        // 让用户再次进入页面避免重复登录，第一次登录相当于注册账号
        wx.cloud.callFunction({
            name: 'login',
            data: {}
        }).then((res) => {
            // console.log(res);
            db.collection('user').where({
                _openid: res.result.openid
            }).get().then((res) => {
                if (res.data.length) {
                    app.userInfo = Object.assign(app.userInfo, res.data[0]);
                    this.setData({
                        userPhoto: app.userInfo.userPhoto,
                        nickName: app.userInfo.nickName,
                        logged: true,
                        id: app.userInfo._id
                    });
                    // 登陆成功之后获取消息
                    this.getMessage()
                }
                else {
                    this.setData({
                        disabled: false
                    });
                }
            });
        });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        // console.log(app.userInfo);
        this.setData({
            nickName: app.userInfo.nickName,
            userPhoto: app.userInfo.userPhoto,
            id: app.userInfo._id
        })
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