new Vue({
  el: '#app',
  data: function () {
    return {
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
    }
  },
  mounted: function () {
    this.changeSettings()
  },
  methods: {
    goHome: function () {
      window.location.href = 'index.html'
    },
    changeSettings: function () {
      this.members = this.form.memberTxt.split('\n').filter(function (member) {
        return member.trim() !== ''
      })

      if (this.members.length % 2 === 1) {
        this.members.push('-')
      }

      if (this.form.isRandTeam) {
        this.members = this.shuffleArray(this.members)
      }

      this.teams = []

      for (var i = 0; i < this.members.length; i += 2) {
        this.teams.push([this.members[i], this.members[i + 1]])
      }

      this.parentMap = {}
      this.dataRows = this.initTree(this.teams)
      this.dataRows = this.fillTree(this.dataRows)
      this.refreshChart(this.dataRows)
      this.dialogFormVisible = false
    },
    refreshChart: function (dataRows) {
      var _this = this

      google.charts.load('current', { packages: ['orgchart'] })
      google.charts.setOnLoadCallback(function () {
        var data = new google.visualization.DataTable()

        data.addColumn('string', 'Name')
        data.addColumn('string', 'Manager')

        data.addRows(dataRows)

        _this.chart = new google.visualization.OrgChart(
          document.getElementById('chart_div')
        )

        google.visualization.events.addListener(_this.chart, 'select', function () {
          _this.setWinner()
        })

        _this.chart.draw(data, { allowHtml: true })
      })
    },
    getDeepLevel: function (teamAmount, totalLevel) {
      var nextLevel = totalLevel + 1
      var checkAmount = teamAmount / 2

      if (checkAmount < 1) {
        return nextLevel
      }

      return this.getDeepLevel(checkAmount, nextLevel)
    },
    initTree: function (teams) {
      var dataRows = []
      var totalAmount = this.getDeepLevel(teams.length, 0)

      for (var i = 0; i < teams.length; i++) {
        var childId = totalAmount + '-' + (i + 1)

        dataRows.push([
          {
            v: childId,
            f: teams[i].join('<br>')
          },
          ''
        ])
      }

      return dataRows
    },
    fillTree: function (dataRows) {
      if (dataRows.length % 2 === 0 && dataRows.length >= 2) {
        var tmp = dataRows[dataRows.length - 1]
        dataRows[dataRows.length - 1] = dataRows[dataRows.length - 2]
        dataRows[dataRows.length - 2] = tmp
      }

      var groupKey = 1
      var groupMap = {}
      var hasNoParentAmount = 0

      dataRows.forEach(
        function (element, index) {
          if (element[1].length > 0) {
            return
          }

          var key = element[0].v
          var level = parseInt(key.split('-')[0], 10) - 1
          var parentId = level + '-' + groupKey

          element[1] = parentId
          dataRows[index] = element
          this.parentMap[key] = parentId

          if (!groupMap[parentId]) {
            dataRows.push([
              {
                v: parentId,
                f: ' '
              },
              ''
            ])
            groupMap[parentId] = 1
            hasNoParentAmount++
          } else {
            groupMap[parentId]++
            groupKey++
          }
        }.bind(this)
      )

      if (hasNoParentAmount <= 1) {
        return dataRows
      }

      return this.fillTree(dataRows)
    },
    setWinner: function () {
      if (!this.chart) {
        return
      }

      var selection = this.chart.getSelection()

      if (!selection || selection.length === 0 || selection[0].row == null) {
        return
      }

      var element = this.dataRows[selection[0].row]
      var key = element[0].v
      var parentId = this.parentMap[key]

      if (!parentId) {
        return
      }

      this.dataRows.forEach(function (e, index) {
        if (e[0].v === parentId) {
          if (this.dataRows[index][0].f === element[0].f) {
            this.dataRows[index][0].f = ' '
          } else {
            this.dataRows[index][0].f = element[0].f
          }
        }
      }, this)

      this.refreshChart(this.dataRows)
    },
    shuffleArray: function (originArr) {
      var arr = this.deepClone(originArr)

      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp
      }

      return arr
    },
    deepClone: function (arr) {
      return JSON.parse(JSON.stringify(arr))
    }
  }
})
