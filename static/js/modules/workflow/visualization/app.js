/* Initialize Elements */

new Vue({
  el: '#app',
  components: {
    'tabs': tabbed.tabs,
    'tab': tabbed.tab
  },
  data: {
    visualization: {
      type: null
    }
  },
  watch: {
    visualization: {
      deep: true,
      handler() {
        store.commit('workflow/reset')
        store.commit('workflow/clear')
        // validate and preview
        if (!_.isNull(this.visualization.type)) {
          store.commit('workflow/valid', 1)
        }
      }
    }
  },
})
