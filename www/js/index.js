"use strict"

// note: consider if it's worth adding a loading screen as the chart are not renedered after the second tick (1-6 seconds, depending on your connection and the connection to the comma api servers)

const JWT_TOKEN = window.JWT_TOKEN
const setIntervalAsync = SetIntervalAsync.dynamic.setIntervalAsync

class NullDongleId { }

const TICKINTERVAL = 1
const XAXISRANGE = 30

let timer = new Date()
let data = []

const getNewSeries = (baseval, yrange) => {
  const newDate = baseval + TICKINTERVAL
  lastDateSeconds = newDate

  for(let i = 0; i< data.length - 30; i++) {
    data[i].x = newDate - XAXISRANGE - TICKINTERVAL
    data[i].y = 0
  }

  return {
    x: newDate,
    y: Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min,
  }
}

const resetData = _ => {
  const len = data.length
  data = data.slice( len-30, len )
}

const animOptions = {
  enabled: true,
  easing: 'linear',
  dynamicAnimation: {
    speed: 1000
  }
}

const chartOptions = {
  height: 350,
  type: 'line',
  animations: animOptions,
  toolbar: {
    show: false,
  },
  zoom: {
    enabled: false,
  },
}

const options = {
  chart: chartOptions,
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
  },
  markers: {
    size: 0,
  },
  xaxis: {
    type: 'number',
    range: XAXISRANGE,
  },
  yaxis: {
    // TODO: consider if it's needed to limit to a max Y value as in the default example
    // max: 100,
  },
  legend: {
    show: false,
  },
}

const request = (url, options) => (
  new Promise((resolve, reject) => {
    cordova.plugin.http.sendRequest(url, options, (resp) => {
      // console.log(resp.data)
      resolve(resp.data)
    }, (resp) => {
      console.log("ERROR fetching URL: ", url, " -> ", resp.status)
      console.log(resp.error)
      reject(resp.error)
    });
  })
)

const getDongles = async () => {
  const options = { method: 'get' }
  const url = "https://api.commadotai.com/v1/me/devices"
  let data = await request(url, options)
  data = JSON.parse(data)
  console.log("getDongles", data)
  return data
}

// get carState etc. from Athena
const getData = async (dongleId) => {
  // TODO: in the next commit i'll switch thermal to carState output
  // const service = "carState"
  const service = "thermal"
  const params = {
    method: "getMessage",
    params: { service: service, timeout: 3000 },
    jsonrpc: "2.0",
    id: 0,
  }
  const options = { method: 'post', data: params }
  const url = `https://athena.comma.ai/${dongleId}`
  let data = await request(url, options)
  data = JSON.parse(data)
  data = data.result
  return data
}

let dongleId = new NullDongleId()

// default cordova setup
const app = {
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false)
  },

  onDeviceReady: function() {
    this.receivedEvent('deviceready')
  },

  initHttp: () => {
    cordova.plugin.http.setHeader('Authorization', `JWT ${JWT_TOKEN}`)
    cordova.plugin.http.setDataSerializer('json')
  },

  receivedEvent: async function(id) {
    this.initHttp()

    const parentElement     = document.getElementById(id)
    const listeningElement  = parentElement.querySelector('.listening')
    const receivedElement   = parentElement.querySelector('.received')

    listeningElement.setAttribute('style', 'display:none')
    receivedElement.setAttribute('style', 'display:block')
    console.log(`Received Event: ${id}`)


    const clone = (obj) => ( { ...obj }) // Object.assign({}, obj)
    const cloneArr = (arr) => new Array(...arr)

    const options1  = clone(options)
    const options2  = clone(options)
    const options3  = clone(options)
    // options3.title.text = "speed"
    const data1     = cloneArr(data)
    const data2     = cloneArr(data)
    const data3     = cloneArr(data)

    options1.series = [{
      data: data1,
    }]
    options1.title = {
      text: "steering angle",
      align: "left",
    }
    options2.series = [{
      data: data2,
    }]
    options2.title = {
      text: "steering torque",
      align: "left",
    }
    options3.series = [{
      data: data3,
    }]
    options3.title = {
      text: "speed",
      align: "left",
    }

    const chart1 = new ApexCharts(
      document.querySelector(".chart1"),
      options1
    )
    chart1.render()

    const chart2 = new ApexCharts(
      document.querySelector(".chart2"),
      options2
    )
    chart2.render()

    const chart3 = new ApexCharts(
      document.querySelector(".chart3"),
      options3
    )
    chart3.render()

    const updateCharts = async () => {
      let data = await getData(dongleId)

      // use thermal instead of carstate as example
      data = data.thermal
      data.batteryVoltage = Math.round( data.batteryVoltage / 1000 / 10 ) / 100
      // console.log("data:", data)
      console.log("cpu0:", data.cpu0)
      console.log("batteryCurrent:", data.batteryCurrent)
      console.log("batteryVoltage:", data.batteryVoltage)

      const now = new Date()
      const seconds = Math.round((now - timer) / 100) / 10
      // console.log("S", seconds)

      const newSeries1 = { y: data.cpu0,           x: seconds }
      const newSeries2 = { y: data.batteryCurrent, x: seconds }
      const newSeries3 = { y: data.batteryVoltage, x: seconds }

      if (data1.length > 30) {
        data1.unshift()
        data2.unshift()
        data3.unshift()
      }
      data1.push(newSeries1)
      data2.push(newSeries2)
      data3.push(newSeries3)
      chart1.updateSeries([{
        data: data1,
      }])
      chart2.updateSeries([{
        data: data2,
      }])
      chart3.updateSeries([{
        data: data3,
      }])
    }

    const dongles  = await getDongles()
    dongleId = dongles[0].dongle_id

    await updateCharts()
    setIntervalAsync(updateCharts, 3000)
  }
}

app.initialize()
