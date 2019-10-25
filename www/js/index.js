"use strict"

  const TICKINTERVAL = 86400000
  const XAXISRANGE = 777600000

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

  getDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 10, {
      min: 10,
      max: 90,
  })

  const getNewSeries = (baseval, yrange) => {
      const newDate = baseval + TICKINTERVAL
      lastDate = newDate

      for(let i = 0; i< data.length - 10; i++) {
          // IMPORTANT
          // we reset the x and y of the data which is out of drawing area
          // to prevent memory leaks
          data[i].x = newDate - XAXISRANGE - TICKINTERVAL
          data[i].y = 0
      }

      data.push({
          x: newDate,
          y: Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min,
      })

  }

  const resetData = _ => {
      // Alternatively, you can also reset the data at certain intervals to prevent creating a huge series
      const len = data.length
      data = data.slice( len-10, len )
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
    series: [{
      data: data,
    }],
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

  const chart = new ApexCharts(
      document.querySelector("#chart"),
      options
  )

  chart.render()

  const updateChart = () => {
    getNewSeries(lastDate, {
      min: 10,
      max: 90,
    })
    chart.updateSeries([{
      data: data,
    }])
  }

  window.setInterval(() => updateChart, 1000)



var app = {
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false)
    },

    onDeviceReady: function() {
        this.receivedEvent('deviceready')
    },

    receivedEvent: function(id) {
        var parentElement     = document.getElementById(id)
        var listeningElement  = parentElement.querySelector('.listening')
        var receivedElement   = parentElement.querySelector('.received')

        listeningElement.setAttribute('style', 'display:none')
        receivedElement.setAttribute('style', 'display:block')

        console.log(`Received Event: ${id}`)
    }
}

app.initialize()

//
// class App {
//   constructor() {
//     this.main = this
//
//   }
//
//   init() {
//     document.addEventListener('deviceready', this.onDeviceReady.bind(this.main), false)
//   }
//
//   onDeviceReady() {
//     this.receivedEvent('deviceready')
//   }
//
//   receivedEvent(id) {
//     const parentElement = document.querySelector(`#${elemId}`)
//     const listenElement = parentElement.querySelector('.listening')
//     const reicvdElement = parentElement.querySelector('.received')
//     listenElement.setAttribute('style', 'display:none' )
//     reicvdElement.setAttribute('style', 'display:block')
//
//     console.log(`Received Event: ${id}`)
//   }
// }
//
// const app = new App()
//
// app.init()
