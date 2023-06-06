// components/search/search.js

const app = getApp()
const db = wx.cloud.database()

Component({

    options: {
        styleIsolation: 'apply-shared'
    },

    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        isFocus: false,
        historyList: [],
        mytext: '',
        searchList: []
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 点击搜索框获得焦点
        handleFocus() {
            wx.getStorage({
                key: 'searchHistory',
                success: (res) => {
                    this.setData({
                        historyList: res.data
                    })
                }
            })
            this.setData({
                isFocus: true
            })
        },
        // 点击搜索框取消按钮，失去焦点
        handleCancel() {
            this.setData({
                isFocus: false,
                mytext: '',
                searchList: []
            })
        },
        // 点击搜索框回车按钮时触发
        handleConfirm(evt) {
            // console.log(evt.detail.value);
            let cloneHistoryList = [...this.data.historyList]
            cloneHistoryList.unshift(evt.detail.value)
            wx.setStorage({
                key: "searchHistory",
                //  Set：数组去重
                data: [...new Set(cloneHistoryList)]
            })
            this.changeSearchList(evt.detail.value);
        },
        // 点击删除按钮，删除历史记录
        handleHistoryDelete() {
            wx.removeStorage({
                key: 'searchHistory',
                success: (res) => {
                    // console.log(res)
                    this.setData({
                        historyList: []
                    })
                }
            })
        },
        // 点击历史记录也直接搜索
        handleHistoryItemDel(evt) {
            console.log(evt.target.dataset.text);
            this.setData({
                mytext: evt.target.dataset.text
            })
            this.changeSearchList(evt.target.dataset.text)
        },
        // 渲染搜索结果
        changeSearchList(value) {
            db.collection('user').where({
                // 数据库正则对象，模糊匹配 
                nickName: db.RegExp({
                    regexp: value,
                    options: 'i'
                })
            }).field({
                userPhoto: true,
                nickName: true
            }).get().then((res) => {
                this.setData({
                    searchList: res.data
                });
                // console.log(res.data);
            });
        }
    }
})
