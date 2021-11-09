const alertpaginator = {
  components: {
    'alertdisplayer': alertdisplayer
  },
  template: `
    <div>
      <div class="bg-xlight p-5 mb-4" v-for="alert in chunks[page-1]">
        <alertdisplayer :alert="alert" :hide="hide" :ratio="ratio"></alertdisplayer>
        <div class="text-xs mt-3">
          <a href="javascript:void(0)" @click="store.getters['auth/isVerified'] ? toggle(alert) : store.commit('auth/verify', true)" class="text-purple mr-3" v-if="_.includes(actions, 'toggle')"><span v-if="alert.active == true">Deactivate</span><span v-else>Activate</span></a>
          <a href="javascript:void(0)" @click="confirm(alert)" class="text-red" v-if="_.includes(actions, 'delete')">Delete</a>
        </div>
      </div>
      <div class="flex justify-between items-center">
        <button class="btn text-gray btn-sm" @click="page--" :disabled="page == 1">&larr; Previous<span class="hidden md:inline"> Page</span></button>
        <span class="text-xs">Page {{page}} of {{chunks.length}}</span>
        <button class="btn text-gray btn-sm pl-3" @click="page++" :disabled="page == chunks.length">Next<span class="hidden md:inline"> Page</span> &rarr;</button>
      </div>
    </div>
  `,
  props: {
    hide: {
      type: Array,
      default: []
    },
    actions: {
      type: Array,
      default: ['toggle', 'delete']
    },
    alerts: {
      type: Array,
      default: []
    },
    ratio: {
      type: Number,
      default: 0.7
    },
    pagelength: {
      type: Number,
      default: 3
    }
  },
  data() {
    return {
      page: 1
    }
  },
  computed: {
    chunks() {
      return _.chunk(this.alerts, this.pagelength)
    }
  },
  methods: {
    toggle(alert) {
      this.$emit('toggle', alert)
    },
    confirm(alert) {
      this.$emit('confirm', alert)
    }
  }
}
