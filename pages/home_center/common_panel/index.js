// miniprogram/pages/home_center/common_panel/index.js.js
import { getDevFunctions, getDeviceDetails, deviceControl } from '../../../utils/api/device-api'
import wxMqtt from '../../../utils/mqtt/wxMqtt'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    device_name: '',
    titleItem: {
      name: '',
      value: '',
    },
    roDpList: {}, //只上报功能点
    rwDpList: {}, //可上报可下发功能点
    isRoDpListShow: false,
    isRwDpListShow: false,
    forest: '../../../image/b.jpg',
  },

  //下发功能点命令
  controldeviceDP:function(e){
  const id = e.currentTarget.id


      const value = ! this.data.rwDpList.switch.value
      const params = {
        // name 云函数的名称，必须使用 ty-service
        name: "ty-service",
        data: {
            action: "device.control",
      // params 接口参数
            params: {
        "device_id": this.data.device_id , // 填写自己的设备 id
        "commands": [{ "code": id, "value": value }] // 下面的命令，
            }
        }
      }
    
    console.log('下发命令value=',value)

    wx.cloud.callFunction(params).then(res =>{
      console.log('开关按钮', res); // 结果里如果返回 true 则说明下发设备成功

    }).catch(err => console.log('err', err))

  },

  /**
   * 跳转到电量统计页面
   */
  goto_electricity_count:function(){
    const {device_id,device_name} = this.data
    console.log('传到统计页面的id,name',device_id,device_name)
    wx.navigateTo({url: `/pages/home_center/count/index?device_id=${device_id}&device_name=${device_name}`,
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
    onLoad: function (options) {
    const { device_id } = options
    this.setData({ device_id })

    // mqtt消息监听
    wxMqtt.on('message', (topic, newVal) => {
      const { status } = newVal
      console.log("mqtt消息监听newVal",newVal)
      this.updateStatus(status)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: async function () {
    const { device_id } = this.data
    const [{ name, status, icon }, { functions = [] }] = await Promise.all([
      getDeviceDetails(device_id),
      getDevFunctions(device_id),
    ]);

    const { roDpList, rwDpList } = this.reducerDpList(status, functions)

    // 获取头部展示功能点信息
    let titleItem = {
      name: '',
      value: '',
    };
    if (Object.keys(roDpList).length > 0) {
      let keys = Object.keys(roDpList)[0];
      titleItem = roDpList[keys];
    } else {
      let keys = Object.keys(rwDpList)[0];
      titleItem = rwDpList[keys];
    }

    const roDpListLength = Object.keys(roDpList).length
    const isRoDpListShow = Object.keys(roDpList).length > 0
    const isRwDpListShow = Object.keys(rwDpList).length > 0

    this.setData({ titleItem, roDpList, rwDpList, device_name: name, isRoDpListShow, isRwDpListShow, roDpListLength, icon})
    console.log('onReady rwDpList=',rwDpList)

    //status方法获取设备状态
    const params = {
      name: "ty-service",
      data: {
          action: "device.status",  //获取DP状态
          params: {
            "device_id": device_id, 
          }
      }
    };
    wx.cloud.callFunction(params).then(res =>{
      const stu= res.result.data
      this.updateStatus(stu)
      console.log('获取DP状态', res) // 结果里如果返回 true 则说明成功
    }).catch(err => console.log('err', err))
  },

  // 分离只上报功能点，可上报可下发功能点
  reducerDpList: function (status, functions) {
    // 处理功能点和状态的数据
    let roDpList = {};
    let rwDpList = {};
    if (status && status.length) {
      status.map((item) => {
        const { code, value } = item;
        let isExit = functions.find(element => element.code == code);
        if (isExit) {
          let rightvalue = value
          // 兼容初始拿到的布尔类型的值为字符串类型
          if (isExit.type === 'Boolean') {
            rightvalue = value == 'true'
          }

          rwDpList[code] = {
            code,
            value: rightvalue,
            type: isExit.type,
            values: isExit.values,
            name: isExit.name,
          };
        } else {
          roDpList[code] = {
            code,
            value,
            name: code,
          };
        }
      });
    }
    return { roDpList, rwDpList }
  },

  sendDp: async function (e) {
    const { dpCode, value } = e.detail
    const { device_id } = this.data
    const { success } = await deviceControl(device_id, dpCode, value)
  },

  updateStatus: function (newStatus) {
    let { roDpList, rwDpList, titleItem } = this.data
    newStatus.forEach(item => {
      const { code, value } = item
      if (typeof roDpList[code] !== 'undefined') {
        roDpList[code]['value'] = value;
      } else if (rwDpList[code]) {
        rwDpList[code]['value'] = value;
      }
    })

    // 更新titleItem
    if (Object.keys(roDpList).length > 0) {
      let keys = Object.keys(roDpList)[1];
      titleItem = roDpList[keys];
    } else {
      let keys = Object.keys(rwDpList)[0];
      titleItem = rwDpList[keys];
    }

    this.setData({ titleItem, roDpList: { ...roDpList }, rwDpList: { ...rwDpList } })



  },




  jumpTodeviceEditPage: function(){
    console.log('jumpTodeviceEditPage')
    const { icon, device_id, device_name } = this.data
    wx.navigateTo({
      url: `/pages/home_center/device_manage/index?device_id=${device_id}&device_name=${device_name}&device_icon=${icon}`,
    })
  },

})