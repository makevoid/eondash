"use strict"

const JWT_TOKEN = window.JWT_TOKEN


const TICKINTERVAL = 86400000
const XAXISRANGE   = 777600000

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

  for(let i = 0; i< data.length - 10; i++) {
    // we reset the x and y of the data which is out of drawing area to prevent memory leaks
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
    show: false
  },
  zoom: {
    enabled: false
  }
}

const options = {
  chart: chartOptions,
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
  },
  title: {
    text: 'Dynamic Updating Chart',
    align: 'left',
  },
  markers: {
    size: 0,
  },
  xaxis: {
    type: 'datetime',
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

const testRequest = async () => {
  cordova.plugin.http.setHeader('Authorization', `JWT ${JWT_TOKEN}`)

  const log = document.querySelector(".debug")
  log.innerHTML = "init"

  const options = {
    method: 'get',
    // data: { id: 12, message: 'test' },
    // headers: { Authorization: `JWT ${JWT_TOKEN}` }
  };

  const url = "https://api.commadotai.com/v1/me/devices"

  const data = await request(url, options)
  console.log("data", data)
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

    getDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 10, {
      min: 10,
      max: 90,
    })

    const clone = (obj) => Object.assign({}, obj)
    const cloneArr = (arr) => new Array(...arr)

    const options1  = clone(options)
    const options2  = clone(options)
    const options3  = clone(options)
    const data1     = cloneArr(data)
    const data2     = cloneArr(data)
    const data3     = cloneArr(data)

    options1.series = [{
      data: data,
    }]
    options2.series = [{
      data: data,
    }]
    options3.series = [{
      data: data,
    }]

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
