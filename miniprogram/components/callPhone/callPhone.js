// components/callPhone/callPhone.js
Component({
    // apply-shared： 表示页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面
    options: {
        styleIsolation: 'apply-shared'
    },
    /**
     * 组件的属性列表
     */
    properties: {
        phoneNumber: String
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        handlePhone() {
            wx.makePhoneCall({
                phoneNumber: this.data.phoneNumber
            })
        }
    }
})
