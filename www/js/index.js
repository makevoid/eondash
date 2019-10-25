// require other file

const renderChart = () => {
  const lastDate = 0
  const data = []
  const TICKINTERVAL = 86400000
  let XAXISRANGE = 777600000
  const getDayWiseTimeSeries = (baseval, count, yrange) => {
      const i = 0
      while (i < count) {
          const x = baseval
          const y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min

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

  const animOptions = {
    enabled: true,
    easing: 'linear',
    dynamicAnimation: {
      speed: 1000
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
}

class App {
  constructor() {

  }

  init() {
    document.addEventListener('deviceready', this.deviceReady.bind(this), false)

  }

  deviceReady(evt) {
    const parentElement = document.querySelector(`#${elemId}`)
    const listenElement = parentElement.querySelector('.listening')
    const reicvdElement = parentElement.querySelector('.received')
    listenElement.setAttribute('style', 'display:none' )
    reicvdElement.setAttribute('style', 'display:block')

    console.log(`Received Event: ${id}`)
  }
}

const app = new App()

app.init()
