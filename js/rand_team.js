var app = new Vue({
  el: '#app',
  data: {
    loading: false,
    members: [],
    teams: [],
    teamHistory: [],
    tagType: ['', 'success', 'info', 'warning', 'danger'],
    times: ['18:00 ~ 18:30', '18:30 ~ 19:00', '19:00 ~ 19:30'],
    dialogFormVisible: false,
    form: {
      title: '羽球團',
      date: '2021.02.26',
      memberTxt: 'andy\njoey\nqueen\nking'
    },
    formLabelWidth: '120px'
  },
  mounted() {
    const now = new Date()
    const y = now.getFullYear()
    const m = (now.getMonth() + 1 + '').padStart(2, '0')
    const d = (now.getDate() + '').padStart(2, '0')
    this.form.date = y + '.' + m + '.' + d

    const originSetting = Cookies.get('MaxBGGroupSetting')

    if (originSetting) {
      this.form = JSON.parse(originSetting)
    }

    this.changeSettings()
  },
  methods: {
    goHome: function() {
      window.location.href = 'index.html'
    },
    makeTeams: function (fixedTeam) {
      let arr = this.shuffleArray(this.members)
      let team = []
      let teams = []

      if (fixedTeam.length > 0) {
        fixedTeam.forEach(p => {
          const index = arr.indexOf(p)
          if (index > -1) {
            arr.splice(index, 1)
          }

          arr.push(p)
        })
      }

      arr.forEach(p => {
        team.push(p)
        if (team.length >= 2) {
          team.sort()
          if (!this.isDuplicate(team)) {
            this.teamHistory.push(team)
            teams.push(team)
          }
          team = []
        }
      })

      teams = this.shuffleArray(teams)
      let teamLatestIndex = teams.length-1
      teams.forEach((t, i) => {
        if (i == teamLatestIndex) {
          return
        }
        if (t[0] == '<->' || t[1] == '<->') {
          teams[i] = teams[teamLatestIndex]
          teams[teamLatestIndex] = t
        }
      })

      return teams
    },
    isDuplicate: function (team) {
      let result = false
      this.teamHistory.forEach(oTeam => {
        if (JSON.stringify(oTeam) == JSON.stringify(team)) {
          result = true
          return
        }
      })

      return result
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
    },
    changeSettings: function () {
      this.loading = true
      this.members = this.form.memberTxt.split('\n')

      if (this.members.length % 2 == 1) {
        this.members.push('<->')
      }

      this.members.sort()
      this.teams = []
      this.teamHistory = []
      setTimeout(() => {
        let wholeTeams = []
        let maxCount = 50
        while (wholeTeams.length < 3) {
          maxCount--
          teams = this.makeTeams([])
          if (teams.length == this.members.length / 2) {
            wholeTeams.push(teams)
          } else {
            teams.forEach(team => {
              const index = this.teamHistory.indexOf(team)
              if (index > -1) {
                this.teamHistory.splice(index, 1)
              }
            })
          }

          if (maxCount <= 0) {
            break
          }
        }

        Cookies.set('MaxBGGroupSetting', JSON.stringify(this.form))

        setTimeout(() => {
          this.dialogFormVisible = false
          this.teams = wholeTeams
          this.loading = false
        }, 500)
      }, 500)
    }
  }
})
