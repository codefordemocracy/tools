/* Define Modules */

const authStore = {
  namespaced: true,
  state: () => ({
    login: false,
    logout: false,
    verify: false,
    limit: false,
    profile: false
  }),
  getters: {
    isLoaded: state => {
      return state.profile != false
    },
    isLoggedIn: state => {
      return !_.isEmpty(state.profile)
    },
    isVerified: state => {
      if (_.isEmpty(state.profile)) {
        return false
      }
      return state.profile.verified
    }
  },
  mutations: {
    login (state, payload) {
      state.login = payload
    },
    logout (state, payload) {
      state.logout = payload
    },
    verify (state, payload) {
      if (payload) {
        if (_.isEmpty(state.profile)) {
          state.login = true
        } else {
          state.verify = true
        }
      } else {
        state.verify =false
      }
    },
    limit (state, payload) {
      state.limit = payload
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
