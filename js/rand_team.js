new Vue({
  el: '#app',
  data: function () {
    return {
      loading: false,
      members: [],
      teams: [],
      teamHistory: [],
      tagType: ['', 'success', 'info', 'warning', 'danger'],
      times: ['18:00 ~ 18:30', '18:30 ~ 19:00', '19:00 ~ 19:30'],
      dialogFormVisible: false,
      form: {
        title: '羽球團',
        date: '',
        memberTxt: 'andy\njoey\nqueen\nking'
      },
      formLabelWidth: '120px'
    }
  },
  mounted: function () {
    var now = new Date()
    var y = now.getFullYear()
    var m = String(now.getMonth() + 1).padStart(2, '0')
    var d = String(now.getDate()).padStart(2, '0')

    this.form.date = y + '.' + m + '.' + d

    var originSetting = Cookies.get('MaxBGGroupSetting')

    if (originSetting) {
      try {
        this.form = JSON.parse(originSetting)
      } catch (error) {}
    }

    this.changeSettings()
  },
  methods: {
    goHome: function () {
      window.location.href = 'index.html'
    },
    makeTeams: function (fixedTeam) {
      var arr = this.shuffleArray(this.members)
      var team = []
      var teams = []

      if (fixedTeam.length > 0) {
        fixedTeam.forEach(function (p) {
          var index = arr.indexOf(p)
          if (index > -1) {
            arr.splice(index, 1)
          }
          arr.push(p)
        })
      }

      arr.forEach(
        function (p) {
          team.push(p)

          if (team.length >= 2) {
            team.sort()

            if (!this.isDuplicate(team)) {
              this.teamHistory.push(team.slice())
              teams.push(team.slice())
            }

            team = []
          }
        }.bind(this)
      )

      teams = this.shuffleArray(teams)

      var teamLatestIndex = teams.length - 1

      teams.forEach(function (t, i) {
        if (i === teamLatestIndex) {
          return
        }

        if (t[0] === '<->' || t[1] === '<->') {
          var tmp = teams[i]
          teams[i] = teams[teamLatestIndex]
          teams[teamLatestIndex] = tmp
        }
      })

      return teams
    },
    isDuplicate: function (team) {
      var teamKey = JSON.stringify(team)

      return this.teamHistory.some(function (oTeam) {
        return JSON.stringify(oTeam) === teamKey
      })
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
    },
    changeSettings: function () {
      var _this = this

      this.loading = true
      this.members = this.form.memberTxt.split('\n').filter(function (member) {
        return member.trim() !== ''
      })

      if (this.members.length % 2 === 1) {
        this.members.push('<->')
      }

      this.members.sort()
      this.teams = []
      this.teamHistory = []

      setTimeout(function () {
        var wholeTeams = []
        var maxCount = 50

        while (wholeTeams.length < 3 && maxCount > 0) {
          maxCount--

          var teams = _this.makeTeams([])

          if (teams.length === _this.members.length / 2) {
            wholeTeams.push(teams)
          }
        }

        Cookies.set('MaxBGGroupSetting', JSON.stringify(_this.form))

        _this.dialogFormVisible = false
        _this.teams = wholeTeams
        _this.loading = false
      }, 200)
    }
  }
})
