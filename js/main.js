var app = new Vue({
  el: '#app',
  data: {
    tools: [
      {
        name: '隨機分組工具',
        path: 'rand_team.html'
      },
      {
        name: '賽程組織樹',
        path: 'battle_tree.html'
      }
    ]
  },
  mounted() {},
  methods: {
    goPath: function (path) {
      console.log(path)
      window.location.href = path
    }
  }
})
