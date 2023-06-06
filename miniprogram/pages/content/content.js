// pages/content/content.js

// 获取数据库引用
const db = wx.cloud.database()
// 全局app
const app = getApp()

Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 用户选择的照片
        contentPhoto: [],
        // 用户发布的呢容
        contentWord: '',
        // imageFileId: [],
        // 删除照片
        isDeleteImage: false,
        // 存储从 app.userInfo 获取的数据
        // contentAll: [],
        // 存储从数据库获取的数据
        // nickName: '',
        // userPhoto: ''
    },

    // textarea 输入事件
    eventhandle(evt) {
        // console.log(evt.detail.value);
        this.setData({
            contentWord: evt.detail.value
        })
    },

    // 发布内容
    handlePublish() {
        if (this.data.contentWord.trim().length == 0) {
            wx.showToast({
                title: '内容不能为空！',
                icon: 'error',
                duration: 1000
            })
        } else {
            // 将用户发布的内容和选择的照片同步到数据库的云存储
            // 更新数据库
            this.saveuserinfo()
        }
    },

    // 点击选择图片
    handlePhoto() {
        this.setData({
            isDeleteImage: false
        })
        if (this.data.contentPhoto.length > 8) {
            wx.showToast({
                title: '最多选择 9 张图片',
                icon: 'error',
                duration: 1000
            })
        } else {
            wx.chooseMedia({
                count: 9,
                mediaType: ['image', 'video'],
                sourceType: ['album', 'camera'],
                camera: 'back',
                success: (res) => {
                    if (this.data.contentPhoto.length > 8) {
                        wx.showToast({
                            title: '最多选择 9 张图片',
                            icon: 'error',
                            duration: 1000
                        })
                    } else {
                        this.setData({
                            contentPhoto: [...this.data.contentPhoto, ...res.tempFiles]
                        })
                        // console.log(res.tempFiles)
                        // console.log(this.data.contentPhoto);
                    }
                },
                fail: (err) => {
                    console.log('未知错误', err);
                }
            })
        }
    },

    // 点击图片实现预览
    PreviewImage(evt) {
        if (this.data.isDeleteImage) {
            this.setData({
                isDeleteImage: false
            })
        } else {
            // console.log(evt.currentTarget.dataset.index);
            const previewImage = this.data.contentPhoto.map(item => item.tempFilePath)
            // console.log(previewImage);
            wx.previewImage({
                current: previewImage[evt.currentTarget.dataset.index], // 当前显示图片的http链接
                urls: previewImage // 需要预览的图片http链接列表
            })
        }
    },
    // 长按图片显示删除
    DeleteImage(evt) {
        this.setData({
            isDeleteImage: true
        })
    },
    // 点击字体图标删除图片
    handleIconDel(evt) {
        // console.log('删除', evt.currentTarget.dataset.index);
        this.data.contentPhoto.splice(evt.currentTarget.dataset.index, 1)
        this.setData({
            contentPhoto: this.data.contentPhoto
        });
    },

    //上传云存储异步操作，拿到fileId后同步放入数据库
    //最重要的是将wx.cloud.uploadFile异步变同步，等返回fileId后才能上传数据库
    saveuserinfo() {
        wx.showLoading({
            title: '发布中',
        })
        // 用户没有选择照片
        if (!this.data.contentPhoto.length) {
            // 从app.userInfo 获取用户昵称，头像
            // 把用户发布的内容更新到数据库
            db.collection('user').doc(app.userInfo._id).update({
                data: {
                    content: [...app.userInfo.content, {
                        contentWord: this.data.contentWord,
                        contentTime: new Date().getTime(),
                        imageFileId: [],
                        nickName: app.userInfo.nickName,
                        userPhoto: app.userInfo.userPhoto,
                        link: 0
                    }]
                }
            }).then((res) => {
                wx.hideLoading()
                wx.showToast({
                    title: '发布成功',
                })
                // 把用户发布的所有内容同步到 app.userInfo 里面
                app.userInfo.content = [...app.userInfo.content, {
                    contentWord: this.data.contentWord,
                    contentTime: new Date().getTime(),
                    imageFileId: [],
                    nickName: app.userInfo.nickName,
                    userPhoto: app.userInfo.userPhoto,
                    link: 0
                }]
                this.setData({
                    contentWord: '',
                    contentPhoto: []
                })
            });
        } else {
            // 用户选择了照片

            // 图片临时路径
            var contentPhoto = this.data.contentPhoto
            // 图片云存储的fileId
            // const imageFileId = this.data.imageFileId;
            // 把 uploadFile 异步变为同步
            const uploadTasks = contentPhoto.map((item, index) =>
                this.uploadFilePromise("contentPhoto/" + app.userInfo._openid + index + Date.now() + ".jpg", item.tempFilePath));
            Promise.all(uploadTasks)
                .then(data => {
                    // console.log('云存储返回的数据', data)
                    const newFileList = data.map(item => (item.fileID));
                    // console.log('处理云存储返回后的数据', newFileList)
                    // 把用户发布的内容同步到数据库
                    db.collection('user').doc(app.userInfo._id).update({
                        data: {
                            content: [...app.userInfo.content, {
                                contentWord: this.data.contentWord,
                                contentTime: new Date().getTime(),
                                imageFileId: newFileList,
                                nickName: app.userInfo.nickName,
                                userPhoto: app.userInfo.userPhoto,
                                link: 0
                            }]
                        }
                    }).then((res) => {
                        wx.hideLoading()
                        wx.showToast({
                            title: '发布成功',
                        })
                        // 把用户发布的所有内容同步到 app.userInfo 里面
                        app.userInfo.content = [...app.userInfo.content, {
                            contentWord: this.data.contentWord,
                            contentTime: new Date().getTime(),
                            imageFileId: newFileList,
                            nickName: app.userInfo.nickName,
                            userPhoto: app.userInfo.userPhoto,
                            link: 0
                        }]
                        this.setData({
                            contentWord: '',
                            contentPhoto: []
                        })
                        // console.log(res);
                    });
                })
                .catch(e => {
                    wx.showToast({ title: '上传失败', icon: 'none' });
                    console.log(e);
                });
        }
    },

    //上传云存储
    uploadFilePromise(fileName, chooseResult) {
        return wx.cloud.uploadFile({
            cloudPath: fileName,
            filePath: chooseResult
        });
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
        // console.log(app.userInfo.content);
        // if (app.userInfo.content) {
        //     this.setData({
        //         contentAll: [...app.userInfo.content]
        //     })
        // }
        // 如果草稿里面有内容，从 app.userInfo.isDraft 里面取出草稿箱的内容，存到data里面去
        if (app.userInfo.isDraft.imageFileId) {
            // console.log(app.userInfo.isDraft);
            this.setData({
                contentWord: app.userInfo.isDraft.contentWord,
                contentPhoto: app.userInfo.isDraft.imageFileId
            })
            // 存到data里面之后清空数据库里面的草稿箱
            db.collection('user').doc(app.userInfo._id).update({
                data: {
                    isDraft: {
                        contentWord: '',
                        imageFileId: []
                    }
                }
            }).then((res) => {
                app.userInfo.isDraft.contentWord = ''
                app.userInfo.isDraft.imageFileId = []
            });
        }
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
        // 询问用户未发布的内容是否要存为草稿
        if (this.data.contentWord.trim().length != 0) {
            wx.showModal({
                title: '提示信息',
                content: '要存为草稿吗',
                complete: (res) => {
                    // 不存为草稿
                    if (res.cancel) {
                        db.collection('user').doc(app.userInfo._id).update({
                            data: {
                                isDraft: {
                                    contentWord: '',
                                    imageFileId: []
                                }
                            }
                        }).then((res) => {
                            app.userInfo.isDraft.contentWord = ''
                            app.userInfo.isDraft.imageFileId = []
                        });
                    }
                    // 存为草稿
                    if (res.confirm) {
                        db.collection('user').doc(app.userInfo._id).update({
                            data: {
                                isDraft: {
                                    // 把照片的云存储id传到数据库，
                                    imageFileId: this.data.contentPhoto,
                                    contentWord: this.data.contentWord,
                                }
                            }
                        }).then((res) => {
                            wx.showToast({
                                title: '保存成功',
                            })
                            app.userInfo.isDraft.contentWord = this.data.contentWord
                            app.userInfo.isDraft.imageFileId = this.data.contentPhoto
                        });
                    }
                },
            })
        }
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