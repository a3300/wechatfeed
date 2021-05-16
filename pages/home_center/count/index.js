import wxCharts from '../../../utils/wxcharts.js';
var app = getApp();
var daylineChart = null;
var yuelineChart = null;

var start_time_flag = 0;
var end_time_flag = 0;
var start_time = "";      //开始时间
var end_time = '';      //结束时间

var result_value =[0,0,0,0,0];    //查询结果
var result_name = [1,2,3,4,5];    //结果对应的日期
var statistical_type_name='统计'; //统计类型显示名字

Page({
  /**
   * 页面的初始数据
   */
  data: {
    device_id:'',
    device_name:'',

    startTime:'', //开始时间文字显示
    endTime:'',   //结束时间文字显示

    statisticalUnit:'m' ,//统计方式 ：m-月，d-日，h-小时
    selectTime: 0 ,       //选择统计方式 0    1     2
    selectTimeAry:['月统计','日统计','小时统计']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { device_id,device_name} = options
    console.log('加载统计页面，', options )
    this.setData({ device_id,device_name })
    console.log('onLoad')

    this.getMulitLine()
   
  },


drawline: function(){
  this.updateData();
},
//查询选定的日期统计数据
updateDataDay: function(){
  result_value = [];
  result_name = [];
  console.log('updateDataDay');
  const id = this.data.device_id;
  const params = {
    "name": "ty-service",
    "data": {
      "action": "statistics.days",
      "params": {
        "device_id": id, // 填写自己的设备 id
        "code": "add_ele", // 命令，
        "start_day":start_time,
        "end_day":end_time
      }
    }
  };
  //console.log('params = ',params);
  wx.cloud.callFunction(params).then(res =>{
    console.log('updateDataDay', res); // 结果里如果返回 true 则说明下发设备成功
    let value =  res.result.data.days;
    for(let k in value){  //遍历value
      result_value.push( value[k]);
      result_name.push(k.slice(6));//名称去掉年月份 
    }
    console.log("result_name_value=",result_value,result_name);
  }).catch(err => console.log('err', err))  ;

},
//查询选定的日期小时统计数据
updateDataHour: function(){
  result_value = [];
  result_name = [];
  const id = this.data.device_id;
  const params = {
    name: "ty-service",
    data: {
      action: 'statistics.hours',
      params: {
        "device_id": id, // 填写自己的设备 id
        "code": 'add_ele', // 命令，
        "start_hour": start_time,
        "end_hour": end_time,
      }
    }
  };
  console.log('params = ',params);
  wx.cloud.callFunction(params).then(res =>{
    console.log('统计查询小时', res); // 结果里如果返回 true 则说明下发设备成功
    let value =  res.result.data.hours;
    for(let k in value){  //遍历value
      result_value.push(value[k]);
      result_name.push(k.slice(8));//名称去掉年月日
    }
    console.log("result_name_value=",result_value,result_name);
  }).catch(err => console.log('err', err))  ;
},
//查询选定的月份统计数据
updateDataMonth:  function(){
  result_value = [];
  result_name = [];
  const id = this.data.device_id;
  const params = {
    name: "ty-service",
    data: {
      action: 'statistics.months',
      params: {
        "device_id": id, // 填写自己的设备 id
        "code": 'add_ele', // 命令，
        "start_month":start_time,
        "end_month": end_time,
      }
    }
  };
  console.log('params = ',params)
  wx.cloud.callFunction(params).then(res =>{
    console.log('统计查询月', res); // 结果里如果返回 true 则说明下发设备成功
    let value =  res.result.data.months;
    for(let k in value){  //遍历value
      result_value.push(value[k]);
      result_name.push(k.slice(4));  //去掉前4个数的年份
    }
    console.log("result_name_value=",result_value,result_name);
  }).catch(err => console.log('err', err));
},

//更新图表数据
updateData:  function () {
  console.log('updateData');
  var series = [{
      name: statistical_type_name,
      data: result_value,
      format: function (val, name) {
          return val + 'KWh';//.toFixed(2)
      }
  }];
  yuelineChart.updateData({
      categories: result_name,
      series: series
  });
},
//创建图表数据
getMulitLine: function(){
  var windowWidth = 320;
  var simulationData =  { categories: result_name, data: result_value};
  //尝试获取系统宽度
  try {
    var res = wx.getSystemInfoSync();
    windowWidth = res.windowWidth;
  } catch (e) {
    console.error('getSystemInfoSync failed!');
  }
  
  console.log("话折线前result_name：",result_name)
  yuelineChart = new wxCharts({ //当月用电折线图配置
    canvasId: 'yueEle',
    type: 'line',   //图表类型
    categories: simulationData.categories, //categories X轴
    animation: true,    //是否动画展示
    // background: '#f5f5f5',
    series: [{
      name: statistical_type_name,
      data: simulationData.data,
      format: function (val, name) {
        return val + 'kWh';//.toFixed(2)
      }
    }],
    xAxis: {
      disableGrid: true   //不绘制X轴网格
    },
    yAxis: {
      title: '用电量(kWh)',
      format: function (val) {
        return val.toFixed(2);
      },
      min: 0
    },
    width: windowWidth,
    height: 200,
    dataLabel: false, //是否在图表中显示数据内容值
    dataPointShape: true, //是否在图表中显示数据点图形标识
  });
},

  /**
   * 触摸显示
   * @param {*} e 
   */
  yueTouchHandler: function (e) { //当月用电触摸显示
    var sta =  this.data.statisticalUnit
    var i=''
    console.log(yuelineChart.getCurrentDataIndex(e));
    yuelineChart.showToolTip(e, { //showToolTip图表中展示数据详细内容
      background: '#7cb5ec',
      format: function (item, category) {
        
        if(sta == 'm')
          i='月'
        else if(sta == 'd')
          i='日'
        else if(sta == 'h')
          i='时'
        return category + i + '用电量' + ':' + item.data
      }
    });
  },

  /**
   * 选择开始的日期/时间
   */
  bindStartDateChange:function(e){
    start_time_flag = 1
    this.setData({startTime:e.detail.value})
    let value =  e.detail.value.replace(/-/g,'')
    value = value.replace(/:/g,'')
    // 小时统计模式把选择的日期附加上时间范围
    if(this.data.statisticalUnit == 'h'){   
      start_time=value+'00'
      end_time=value+'23'
    }else{  //月/日统计模式
    console.log('picker选择开始范围：',value )
    start_time=value
    }
    
    //直接选择日期后向服务器查询统计数据
    if(this.data.statisticalUnit == 'h')
      this.updateDataHour()
    if(start_time_flag == 1 && end_time_flag == 1){
      //直接选择日期后向服务器查询统计数据
        if(this.data.statisticalUnit == 'm')
          this.updateDataMonth()
        else if(this.data.statisticalUnit == 'd')
          this.updateDataDay()
      }
  },
  /**
   * 选择结束的日期/时间
   */
  bindEndDateChange:function(e){
    end_time_flag = 1
    this.setData({endTime:e.detail.value})
    let value =  e.detail.value.replace(/-/g,'')
    value = value.replace(/:/g,'')
    if(this.data.statisticalUnit == 'h'){
      value = value.slice(0,2)
    }
    console.log('picker选择结束范围：',value )
    end_time=value
    if(start_time_flag == 1 && end_time_flag == 1){
    //直接选择日期后向服务器查询统计数据
      if(this.data.statisticalUnit == 'm')
        this.updateDataMonth()
      else if(this.data.statisticalUnit == 'd')
        this.updateDataDay()
    }

  },

  //设置按月/日/时统计方式
  bindPickerChange:function(e){
    var selectTime = e.detail.value
    if(selectTime == 0){
      this.setData({statisticalUnit:'m'})
      statistical_type_name='月统计电量'
    }else if(selectTime == 1){
      this.setData({statisticalUnit:'d'})
      statistical_type_name='日统计电量'
    }else if(selectTime == 2){
      this.setData({statisticalUnit:'h'})
      statistical_type_name='小时统计电量'
    }
    this.setData({selectTime,startTime:'',endTime:''})
  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: async function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})