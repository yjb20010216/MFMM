// pages/near/near.js

// 获取数据库引用
const db = wx.cloud.database()
// 全局app
const app = getApp()
const _ = db.command

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 维度
        latitude: '',
        // 经度
        longitude: '',
        markers: [],
        markUsreId: [],
        isShowLocation: false
    },

    // 获取位置信息，得到经纬度
    getLocation() {
        wx.getLocation({
            type: 'gcj02',
            success: (res) => {
                const latitude = res.latitude
                const longitude = res.longitude
                this.setData({
                    latitude: latitude,
                    longitude: longitude
                })
                this.getNearUser()
            }
        })
    },

    // 获取附近其他用户位置
    getNearUser() {
        db.collection('user').where({
            location: _.geoNear({
                geometry: db.Geo.Point(this.data.longitude, this.data.latitude),
                minDistance: 0,
                maxDistance: 50000,
            }),
            isLocation: true
        }).field({
            longitude: true,
            latitude: true,
            userPhoto: true,
            nickName: true
        }).get().then((res) => {
            // console.log(res.data);
            let data = res.data
            let result = []
            if (data.length) {
                for (let i = 0; i < data.length; i++) {

                    this.setData({
                        markerUsreId: this.data.markUsreId.push(data[i]._id)
                    })

                    if (data[i].userPhoto.includes('cloud://')) {
                        wx.cloud.getTempFileURL({
                            fileList: [data[i].userPhoto],
                            success: res => {
                                result.push({
                                    iconPath: res.fileList[0].tempFileURL,
                                    id: i,
                                    latitude: data[i].latitude,
                                    longitude: data[i].longitude,
                                    width: 30,
                                    height: 30,
                                });
                                this.setData({
                                    markers: result
                                });
                            }
                        })
                    }
                    else {
                        result.push({
                            iconPath: data[i].userPhoto,
                            id: i,
                            latitude: data[i].latitude,
                            longitude: data[i].longitude,
                            width: 30,
                            height: 30,
                        });
                    }
                }
                this.setData({
                    markers: result
                });
                // console.log(res.data);
                // console.log(this.data.markUsreId);
            }
        })
    },
    // 点击头像跳转到详情页
    markertap(ev) {
        wx.navigateTo({
            url: '/pages/detail/detail?userId=' + this.data.markUsreId[ev.detail.markerId]
        })
        // console.log(this.data.markUsreId[ev.detail.markerId]);
    },

    // 根据 isLocation 决定是否展现 show-location 标记点
    getIsShowLocation() {
        if (app.userInfo.isLocation) {
            this.setData({
                isShowLocation: true
            })
            // console.log('登录状态，显示定点');
        } else {
            this.setData({
                isShowLocation: false
            })
            // console.log('未登录状态，不显示定点');
        }
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
        this.getLocation()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.getLocation()
        this.getIsShowLocation()
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