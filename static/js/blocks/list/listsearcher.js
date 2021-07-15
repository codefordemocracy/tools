const listsearcher = {
  components: {
    'listdisplayer': listdisplayer,
    'multiselect': window.VueMultiselect.default
  },
  template: `
  <div class="row">
    <div class="col-12 col-md-6 pb-2 pb-md-0">
      <multiselect v-model="list" track-by="id" label="name" :options="options"></multiselect>
      <listdisplayer :list="list" :hide="['visibility', 'type', 'name', 'id']" class="mt-2"></listdisplayer>
    </div>
    <div class="col-12 col-md-6">
      <div class="bg-light p-2 preview">
        <small class="badge badge-xs badge-gray-dark">PREVIEW</small>
        <pre class="mb-0">{{preview | prettify}}</pre>
      </div>
    </div>
  </div>
  `,
  props: {
    type: null,
    prepopulate: null,
    options: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      list: {
        id: null,
        type: null,
        subtype: null,
        include: {
          terms: null,
          ids: null
        },
        name: null,
        description: null,
        last_updated: null,
      },
      preview: []
    }
  },
  computed: {
    build() {
      return this.list
    }
  },
  methods: {
    peek() {
      var self = this
      // get preview
      axios.post('/api/list/preview/', this.build)
      .then(function(response) {
        self.preview = response.data
      })
      .catch(function(error) {
        console.error(error)
      })
    }
  },
  watch: {
    list: {
      deep: true,
      handler() {
        this.peek()
        // validate and emit change
        if (!_.isEmpty(this.list.id)) {
          this.$emit('change', {build: this.build, valid: true})
        } else {
          this.$emit('change', {build: this.build, valid: false})
        }
      }
    }
  },
  created() {
    this.list = _.filter(this.options, {id: this.prepopulate})[0]
  }
}
