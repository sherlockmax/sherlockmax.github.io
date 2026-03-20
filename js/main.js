new Vue({
  el: '#app',
  data: function () {
    return {
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
    }
  },
  methods: {
    goPath: function (path) {
      window.location.href = path
    }
  }
})
