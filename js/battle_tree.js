var app = new Vue({
  el: '#app',
  data: {
    chart: null,
    dataRows: [],
    parentMap: {},
    members: [],
    teams: [],
    dialogFormVisible: false,
    form: {
      memberTxt: 'andy\njoey\nqueen\nking',
      isRandTeam: false
    },
    formLabelWidth: '120px'
  },
  mounted() {
    this.changeSettings()
    this.dataRows = this.initTree(this.teams)
    this.dataRows = this.fillTree(this.dataRows)

    this.refreshChart(this.dataRows)
  },
  methods: {
    goHome: function () {
      window.location.href = 'index.html'
    },
    changeSettings() {
      this.members = this.form.memberTxt.split('\n')

      if (this.members.length % 2 == 1) {
        this.members.push('-')
      }

      if (this.form.isRandTeam) {
        this.members = this.shuffleArray(this.members)
      }

      this.teams = []
      this.members.forEach((v, i) => {
        if (i % 2 == 0) {
          this.teams.push([this.members[i], this.members[i + 1]])
        }
      })

      this.dataRows = this.initTree(this.teams)
      this.dataRows = this.fillTree(this.dataRows)

      this.refreshChart(this.dataRows)
      this.dialogFormVisible = false
    },
    refreshChart(dataRows) {
      google.charts.load('current', { packages: ['orgchart'] })
      google.charts.setOnLoadCallback(drawChart)

      _this = this
      function drawChart() {
        var data = new google.visualization.DataTable()
        data.addColumn('string', 'Name')
        data.addColumn('string', 'Manager')
        // data.addColumn('string', 'ToolTip')

        // For each orgchart box, provide the name, manager, and tooltip to show.
        data.addRows(dataRows)

        // Create the chart.
        _this.chart = new google.visualization.OrgChart(document.getElementById('chart_div'))
        google.visualization.events.addListener(_this.chart, 'select', _this.setWinner)
        // Draw the chart, setting the allowHtml option to true for the tooltips.
        _this.chart.draw(data, { allowHtml: true })
      }
    },
    getDeepLevel(teamAmount, totalLevel) {
      totalLevel++
      checkAmount = teamAmount / 2

      if (checkAmount < 1) {
        return totalLevel
      }

      return this.getDeepLevel(checkAmount, totalLevel)
    },
    initTree(teams) {
      dataRows = []
      totalAmount = this.getDeepLevel(teams.length, 0)
      // create base
      for (let i = 0; i <= teams.length; i += 2) {
        if (teams[i]) {
          childId = totalAmount + '-' + (i + 1)
          dataRows.push([{ v: childId, f: teams[i].join('</br>') }, ''])
        }

        if (teams[i + 1]) {
          childId = totalAmount + '-' + (i + 2)
          dataRows.push([{ v: childId, f: teams[i + 1].join('</br>') }, ''])
        }
      }

      return dataRows
    },
    fillTree(dataRows) {
      if (dataRows.length % 2 == 0) {
        tmp = dataRows[dataRows.length - 1]
        dataRows[dataRows.length - 1] = dataRows[dataRows.length - 2]
        dataRows[dataRows.length - 2] = tmp
      }

      groupKey = 1
      groupMap = {}
      hasNoParentAmount = 0
      dataRows.forEach((element, index) => {
        if (element[1].length <= 0) {
          key = element[0].v
          level = parseInt(key.split('-')[0]) - 1
          parentId = level + '-' + groupKey
          element[1] = parentId
          dataRows[index] = element

          if (!groupMap[parentId]) {
            this.parentMap[key] = parentId
            dataRows.push([{ v: parentId, f: ' ' }, ''])
            hasNoParentAmount++
            groupMap[parentId] = 1
          } else {
            this.parentMap[key] = parentId
            groupMap[parentId]++
            groupKey++
          }
        }
      })

      if (hasNoParentAmount <= 1) {
        return dataRows
      }

      return this.fillTree(dataRows)
    },
    setWinner() {
      var selection = this.chart.getSelection()
      element = this.dataRows[selection[0].row]
      key = element[0].v
      v = element[1]
      parentId = this.parentMap[key]

      this.dataRows.forEach((e, index) => {
        if (e[0].v == parentId) {
          if (this.dataRows[index][0].f == element[0].f) {
            this.dataRows[index][0].f = ' '
          } else {
            this.dataRows[index][0].f = element[0].f
          }
          return
        }
      })

      this.refreshChart(this.dataRows)
    },
    shuffleArray: function (originArr) {
      let arr = this.deepClone(originArr)
      for (let i = originArr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }

      return arr
    },
    deepClone: function (arr) {
      return JSON.parse(JSON.stringify(arr))
    }
  }
})
