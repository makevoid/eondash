"use strict"
const JWT_TOKEN = window.JWT_TOKEN

  const TICKINTERVAL = 1
  const XAXISRANGE = 30

  let lastDate = 0
  let data = []

  const getDayWiseTimeSeries = (baseval, count, yrange) => {
    let i = 0
    while (i < count) {
      let x = baseval
      let y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min
      data.push({
        x, y
      })
      lastDate = baseval
      baseval += TICKINTERVAL
      i++
    }
  }

  const getNewSeries = (baseval, yrange) => {
    const newDate = baseval + TICKINTERVAL
    lastDate = newDate

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
      max: 100,
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
        console.log("ERROR:", resp.status)
        console.log(resp.error)
        reject(resp.error)
      });
    })
  )

  const getDongles = async () => {
    const options = { method: 'get' }
    const url = "https://api.commadotai.com/v1/me/devices"
    const data = await request(url, options)
    console.log("getDongles", data)
    return data
  }

  // get carState etc. from Athena
  const getData = async (dongleId) => {
    const service = "carState"
    const params = {
      method: "getMessage",
      params: {"service": service, "timeout": 3000},
      jsonrpc: "2.0",
      id: 0
    }
    const options = { method: 'post', data: params }
    const url = `https://athena.comma.ai/${dongleId}`
    const data = await request(url, options)
    console.log("getData", data)
    return data
  }


const testRequest = async () => {
  cordova.plugin.http.setHeader('Authorization', `JWT ${JWT_TOKEN}`)

  const log = document.querySelector(".debug")
  log.innerHTML = "init"

  const dongles  = await getDongles()
  const dongleId = dongles[0].dongle_id

  const data = await getData(dongleId)

  log.innerHTML = data
}

// default cordova setup
const app = {
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false)
  },

  onDeviceReady: function() {
    this.receivedEvent('deviceready')
  },

  receivedEvent: async function(id) {
    const parentElement     = document.getElementById(id)
    const listeningElement  = parentElement.querySelector('.listening')
    const receivedElement   = parentElement.querySelector('.received')

    listeningElement.setAttribute('style', 'display:none')
    receivedElement.setAttribute('style', 'display:block')

    console.log(`Received Event: ${id}`)

    // -------

    getDayWiseTimeSeries(1, 30, {
      min: 10,
      max: 90,
    })

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

    const updateCharts = () => {
      const newSeries1 = getNewSeries(lastDate, {
        min: 10,
        max: 90,
      })
      const newSeries2 = getNewSeries(lastDate, {
        min: 10,
        max: 90,
      })
      const newSeries3 = getNewSeries(lastDate, {
        min: 10,
        max: 90,
      })

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

    setInterval(updateCharts, 1000)

    await testRequest()
  }
}

app.initialize()
