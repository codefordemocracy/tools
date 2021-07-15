/* Configure Store */

const workflowStore = {
  namespaced: true,
  state: () => ({
    tab: 1,
    valid: [0],
    complete: false,
    processing: false,
    success: false,
    error: false
  }),
  mutations: {
    tab(state, payload) {
      state.tab = payload
    },
    valid(state, payload) {
      state.valid = _.union(state.valid, [payload])
    },
    reset(state) {
      state.valid = [0]
      state.complete = false
    },
    clear(state) {
      state.processing = false
      state.success = false
      state.error = false
    },
    complete(state) {
      state.complete = true
    },
    processing(state) {
      state.processing = true
    },
    success(state) {
      state.processing = false
      state.success = true
    },
    error(state) {
      state.processing = false
      state.error = true
    }
  },
  actions: {
    submit({commit}, obj) {
      commit('clear')
      commit('processing')
      axios.post(obj.endpoint, obj.payload)
      .then(function(response) {
        if (_.get(response.data, 'id')) {
          commit('success')
        } else {
          commit('error')
        }
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  }
}

const store = new Vuex.Store({
  modules: {
    auth: authStore,
    waitlist: waitlistStore,
    workflow: workflowStore
  }
})
