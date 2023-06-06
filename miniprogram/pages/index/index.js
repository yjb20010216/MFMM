// pages/index/index.js

const app = getApp()
const db = wx.cloud.database()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        swiperImage: [],
        dataList: [],
        isLove: true,
        current: 'time',
        isPagesScroll: true,
        usePageScroll: true,
        isScrollView: false,
        // 切换好友动态时是否显示 未登录
        isFriendListCurrent: false,
        // 好友id列表
        currentFriendIDList: [],
        currentFriendIDListTwo: [],
        // 是否有好友列表id
        isHaveFriendListId: true,
        // 全部好友的内容
        friendContent: [],
        // contentAll: []
        // 下拉刷新是否结束
        isRefresh: false
    },

    // 点赞事件
    // handleLinks(evt) {
    //     if (app.userInfo._id) {
    //         // console.log('被点赞者', evt.target.dataset.id);
    //         // console.log('点赞者', app.userInfo._id);
    //         wx.cloud.callFunction({
    //             name: 'update',
    //             data: {
    //                 collection: 'user',
    //                 doc: evt.target.dataset.id,
    //                 data: "{links : _.inc(1)}"
    //             }
    //         }).then((res) => {
    //             // console.log('点赞成功', res.result);
    //             if (res.result.stats.updated) {
    //                 let cloneListData = [...this.data.dataList];
    //                 for (let i = 0; i < cloneListData.length; i++) {
    //                     if (cloneListData[i]._id == evt.target.dataset.id) {
    //                         cloneListData[i].links++
    //                     }
    //                 }
    //                 this.setData({
    //                     dataList: cloneListData,
    //                     isLove: false
    //                 })
    //             }
    //         })
    //     } else {
    //         wx.showToast({
    //             title: '请先登录',
    //         })
    //     }
    // },


    // 点赞事件
    handleLinks(evt) {
        // 被点赞者
        const userId = evt.target.dataset.id
        // 被点赞者发布内容的索引号
        const contentIndex = evt.target.dataset.contentindex
        if (app.userInfo._id) {
            // console.log('被点赞者', userId);
            // console.log('被点赞者content索引', contentIndex);
            // console.log('点赞者',app.userInfo._id);
            // 存储 点赞者点击content内容索引对应的值
            let contentIndexObj = {}
            db.collection('user').doc(userId).field({
                content: true
            }).get().then((res) => {
                // console.log(res.data.content);
                contentIndexObj = { ...res.data.content[contentIndex] }
                // content 里面的点赞数量 + 1
                contentIndexObj.link += 1
                // 更新数据库content 里面的 link 数量
                // 因为 userId 不是数据库创建者，所以要更改数据库权限，或者携带上opeId，才具备写数据库的权限
                db.collection('user').doc(userId).update({
                    data: {
                        ['content.' + [contentIndex]]: contentIndexObj
                    },
                    // 点赞成功更新完数据库后执行的回调函数
                    success: function (res) {
                        // console.log('点赞成功',res.stats);
                    }
                })
                // console.log(contentIndexObj);
            })
            // console.log(this.data.dataList);
            // 同时更新页面的 dataList 数据
            let cloneListData = [...this.data.dataList];
            for (let i = 0; i < cloneListData.length; i++) {
                if (cloneListData[i]._id == userId) {
                    cloneListData[i].content[contentIndex].link++
                }
            }
            this.setData({
                dataList: cloneListData,
            })
            // 同时更新 app.userInfo.content 里面的link点赞数量
            app.userInfo.content[contentIndex].link++
            // console.log(app.userInfo.content[contentIndex]);

        } else {
            wx.showToast({
                title: '请先登录',
                icon: 'error'
            })
        }
    },


    // 切换推荐和好友列表事件
    handlecurrent(evt) {
        let current = evt.target.dataset.current
        // 推荐列表
        if (current == 'time') {
            this.setData({
                current: 'time',
                isFriendListCurrent: false
            })
            this.getListData()
        } else {
            // 好友列表
            this.setData({
                current: 'friend'
            })
            // 如果用户已登录
            if (app.userInfo._id) {
                this.getFriendListContnet()
            } else {
                // 如果用户未登录
                this.setData({
                    isFriendListCurrent: true
                })
                wx.showToast({
                    title: '请先登录',
                    icon: 'error'
                })
            }
        }
    },

    // 从数据库获取全部用户数据，推荐列表
    getListData() {
        db.collection('user').field({
            userPhoto: true,
            nickName: true,
            links: true,
            content: true
        }).orderBy('time', 'desc').get().then((res) => {
            // console.log(res.data);
            this.setData({
                dataList: res.data,
                isHaveFriendListId: true
            })
        })
    },

    // 从数据库请求好友列表的数据
    getFriendListContnet() {
        // 向数据库请求好友的 id
        db.collection('user').doc(app.userInfo._id).field({
            friendList: true
        }).get().then((res) => {
            // console.log(res.data.friendList);
            this.setData({
                currentFriendIDList: res.data.friendList,
                currentFriendIDListTwo: res.data.friendList
            })

            // 判断列表有没有好友
            if (this.data.currentFriendIDListTwo.length) {
                // console.log('有好友');
                this.setData({
                    isHaveFriendListId: true
                })
            } else {
                // console.log('没有好友');
                this.setData({
                    isFriendListCurrent: true,
                    isHaveFriendListId: false
                })
            }

            // 遍历好友列表，请求好友数据
            // console.log(this.data.currentFriendIDList);
            this.data.currentFriendIDList.forEach((item, index) => {
                db.collection('user').doc(item).get().then((res) => {
                    // console.log(res.data);
                    this.setData({
                        friendContent: [...this.data.friendContent, res.data]
                    })
                    // console.log('foreach循环');
                    // 等到循环到最后一步 才进行下面的操作
                    if (index == this.data.currentFriendIDList.length - 1) {
                        // console.log('异步成功');
                        // 数组去重
                        let friendContentArray = []
                        friendContentArray = this.getArraySet(this.data.friendContent)
                        this.setData({
                            dataList: friendContentArray,
                            isFriendListCurrent: false,
                            friendContent: []
                        })
                        // console.log(this.data.dataList);
                    }
                })
            })
        })

    },
    // 页面滚动事件
    onPageScroll(e) {
        if (this.data.isPagesScroll) {
            if (e.scrollTop == 0) {
                this.setData({
                    usePageScroll: true
                })
            } else {
                this.setData({
                    usePageScroll: false
                })
            }
            // console.log(e.scrollTop);
        }
    },


    // 点击按钮跳转至详情页
    handleDetail(evt) {
        let id = evt.target.dataset.id
        wx.navigateTo({
            url: '/pages/detail/detail?userId=' + id,
        })
    },

    // 获取banner数据库，更新swiper轮播图
    getBannerList() {
        db.collection('banner').get().then((res) => {
            // console.log(res.data);
            this.setData({
                swiperImage: res.data
            })
        })
    },
    // 点击图片放大
    handleBigImage(evt) {
        // console.log(evt.currentTarget.dataset);
        db.collection('user').doc(evt.currentTarget.dataset.usreid).field({
            content: true
        }).get().then((res) => {
            // console.log(res.data)
            // console.log(evt.currentTarget.dataset.index);
            // console.log(res.data.content.imageFileId);
            wx.previewImage({
                current: res.data.content[evt.currentTarget.dataset.contentindex].imageFileId[evt.currentTarget.dataset.imageindex], // 当前显示图片的http链接
                urls: res.data.content[evt.currentTarget.dataset.contentindex].imageFileId // 需要预览的图片http链接列表
            })
        })
    },
    // 定义数组去重的函数
    getArraySet(arr) {
        let obj = {};
        arr = arr.reduce((newArr, next) => {
            obj[next._id] ? "" : (obj[next._id] = true && newArr.push(next));
            return newArr;
        }, []);
        return arr;
    },
    // srcoll内下拉刷新触发事件
    handleRefresh() {
        // console.log('下拉刷新触发了事件');
        setTimeout(() => {
            this.setData({
                isRefresh: false
            })
            wx.showToast({
                title: '刷新成功',
                icon: 'none'
            })
        }, 1500)
    },
    // srcoll滚动到底部触发事件
    handleScrollToLower() {
        // console.log('滚动到底部触发了事件');
        wx.showToast({
            title: '没有更多内容了',
            icon: 'none'
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // this.getListData()
        // 测试微信授权登录
        // wx.onThemeChange((result) => {
        //     this.setData({
        //         theme: result.theme
        //     })
        // })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        this.getBannerList()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        if (this.data.current == 'time') {
            // console.log('推荐');
            this.getListData()
        } else {
            // console.log('好友列表');
            this.getFriendListContnet()
        }
        this.setData({
            isPagesScroll: true
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        this.setData({
            isPagesScroll: false
        })
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