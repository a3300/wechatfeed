// pages/home_center/common_panel/components/Integer/index.js
Component({
  options: {
    styleIsolation: 'shared'
  },
  /**
   * 组件的属性列表
   */
  properties: {
    values: String,
    value: Number,
    dpName: String,
    dpCode: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    min: 1,
    step: 1,
    max: 1,
    unit: '%',
    multiArray:[['00','01','02','03','04','05','06','07','08','09',10,11,12,13,14,15,16,17,18,19,20,21,22,23],
    ['00','01','02','03','04','05','06','07','08','09',10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59],
    ['00','01','02','03','04','05','06','07','08','09',10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59]  ],
    multiIndex:[0,0,0],
    settime:[0,0,0]
  },

  lifetimes: {
    attached: function() {
      const { values } = this.properties
      const { step, min, max, unit } = values
      ? JSON.parse(values)
      : { step: 1, min: 1, max: 1, unit: '%' };

      this.setData({ step, min, max, unit })
      console.log('values',values)
    }
  },

//监听组件倒计时’秒‘字段值传递给界面 转换为 时：分：秒
  observers: {
    'value': function(value) {
      // 在 value 被设置时，执行这个函数
      const hour = parseInt(value/3600)
      const minute = parseInt(value%3600/60)
      const second = value % 60
      const multiIndex = [hour,minute,second]
      this.setData({ multiIndex })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

/**
 * 设置倒计时时间
 */
bindMultiPickerChange: function (e) {
  const value = e.detail.value //获取设定的值 **：**：**
  const { dpCode } = this.properties
  var myEventOption = {} // 触发事件的选项
  const time = value[0]*3600 + value[1]*60 + value[2] //  把设置界面的值转换成秒
  console.log('触发Integer组件bindMultiPickerChange函数',dpCode,time)
  this.setData({value:time})
  this.triggerEvent('sendDp', this.properties )//{ dpCode, time }
},



  }
})
