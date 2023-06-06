// pages/editUserInfo/head/head.js

const app = getApp()
const db = wx.cloud.database()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userPhoto: '',
        imageflag: false,
        theme: wx.getSystemInfoSync().theme,
        avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    },

    // image 按钮
    handleText(evt) {
        // console.log(evt);
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            sourceType: ['album', 'camera'],
            camera: 'back',
            success: (res) => {
                // console.log(res.tempFiles[0].tempFilePath)
                // console.log(res.tempFiles.size)
                this.setData({
                    userPhoto: res.tempFiles[0].tempFilePath,
                    imageflag: true
                })
            },
            fail: (err) => {
                console.log('获取失败', err);
            }
        })
    },
    // button 按钮（修改头像）
    handleBtn() {
        if (this.data.imageflag) {
            wx.showLoading({
                title: '上传中',
            })
            let cloudPath = "userPhoto/" + app.userInfo._openid + Date.now() + ".jpg";
            wx.cloud.uploadFile({
                // 指定上传到的云路径
                cloudPath,
                // 指定要上传的文件的小程序临时文件路径
                filePath: this.data.userPhoto,
                // 成功回调
                success: res => {
                    // console.log(res.fileID);
                    let fileID = res.fileID;
                    if (fileID) {
                        db.collection('user').doc(app.userInfo._id).update({
                            data: {
                                userPhoto: fileID
                            }
                        }).then((res) => {
                            wx.hideLoading();
                            wx.showToast({
                                title: '更换成功'
                            });
                            app.userInfo.userPhoto = fileID;
                        });
                    }
                    // 同时更新数据库里面 content 的头像照片
                    for (let i = 0; i < app.userInfo.content.length; i++) {
                        const contentTime = app.userInfo.content[i].contentTime
                        const contentWord = app.userInfo.content[i].contentWord
                        const imageFileId = app.userInfo.content[i].imageFileId
                        const link = app.userInfo.content[i].link
                        const nickName = app.userInfo.content[i].nickName
                        db.collection('user').doc(app.userInfo._id).update({
                            data: {
                                ['content.' + [i]]: { contentTime, contentWord, imageFileId, link, nickName, userPhoto: fileID }
                            }
                        })
                        // 同时更改 app.useInfo.content 里面的头像照片
                        app.userInfo.content[i].userPhoto = fileID
                    }
                },
                fail: err => {
                    console.log('上传失败', err);
                }
            })
        }
        else {
            wx.showToast({
                title: '请点击头像选择照片',
            })
        }
    },

    // 授权使用微信头像
    onChooseAvatar(e) {
        const { avatarUrl } = e.detail
        this.setData({
            userPhoto: avatarUrl,
        })

        let cloudPath = "userPhoto/" + app.userInfo._openid + Date.now() + ".jpg";
        wx.cloud.uploadFile({
            // 指定上传到的云路径
            cloudPath,
            // 指定要上传的文件的小程序临时文件路径
            filePath: this.data.userPhoto,
            // 成功回调
            success: res => {
                // console.log(res.fileID);
                let fileID = res.fileID;
                if (fileID) {
                    db.collection('user').doc(app.userInfo._id).update({
                        data: {
                            userPhoto: fileID
                        }
                    }).then((res) => {
                        wx.showToast({
                            title: '更换成功'
                        });
                        app.userInfo.userPhoto = fileID;
                    });
                }
                // 同时更新数据库里面 content 的头像照片
                for (let i = 0; i < app.userInfo.content.length; i++) {
                    const contentTime = app.userInfo.content[i].contentTime
                    const contentWord = app.userInfo.content[i].contentWord
                    const imageFileId = app.userInfo.content[i].imageFileId
                    const link = app.userInfo.content[i].link
                    const nickName = app.userInfo.content[i].nickName
                    db.collection('user').doc(app.userInfo._id).update({
                        data: {
                            ['content.' + [i]]: { contentTime, contentWord, imageFileId, link, nickName, userPhoto: fileID }
                        }
                    })
                    // 同时更改 app.useInfo.content 里面的头像照片
                    app.userInfo.content[i].userPhoto = fileID
                }
            },
            fail: err => {
                console.log('上传失败', err);
            }
        })

        // this.upDateUserPhoto()
    },

    // getUserProfile(e) {
    //     wx.getUserProfile({
    //         desc: '只用于登录，不会保存个人信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
    //         success: (res) => {
    //             console.log(res.userInfo.avatarUrl);
    //             this.setData({
    //                 userPhoto: res.userInfo.avatarUrl
    //             })
    //             this.upDateUserPhoto()
    //         },
    //         fail: (err) => {
    //             console.log('授权失败', err);
    //         }
    //     })
    // },

    // 更新头像数据库
    // upDateUserPhoto() {
    //     db.collection('user').doc(app.userInfo._id).update({
    //         data: {
    //             userPhoto: this.data.userPhoto
    //         }
    //     }).then((res) => {
    //         wx.showToast({
    //             title: '更换成功',
    //         })
    //         app.userInfo.userPhoto = this.data.userPhoto
    //     })
    // },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 授权使用微信头像
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
            userPhoto: app.userInfo.userPhoto
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