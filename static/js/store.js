/* Define Modules */

const authStore = {
  namespaced: true,
  state: () => ({
    login: false,
    logout: false,
    profile: false
  }),
  mutations: {
    login (state, payload) {
      state.login = payload
    },
    logout (state, payload) {
      state.logout = payload
    },
    profile (state, payload) {
      state.profile = payload
    }
  }
}

const waitlistStore = {
  namespaced: true,
  state: () => ({
    modal: false
  }),
  mutations: {
    modal (state, payload) {
      state.modal = payload
    }
  }
}
