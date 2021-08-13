const branch = {
  template: `
    <div :id="id" class="branch">
      <leaf :settings="settings" :numbranches="numbranches" @add="add" @destroy="destroy"></leaf>
      <div v-if="branches.length > 0">
        <div class="bar flex flex-col">
          <div class="self-center line bg-secondary"></div>
          <div class="mx-auto bg-white border border-secondary rounded-full p-1 flex justify-center items-center">
            <button v-for="path in paths" @click="set(path.id)" class="inline-block bubble rounded-full m-1" :class="{'bg-secondary': !path.active, 'bg-gray': path.active}"></button>
          </div>
          <div class="self-center line bg-secondary" v-if="branch"></div>
        </div>
        <branch :id="branch.id" :settings="branch.settings" :branches="branch.branches" @destroy="remove" v-for="branch in branches" v-show="active == branch.id"></branch>
      </div>
    </div>
  `,
  props: {
    id: Number,
    settings: Object,
    branches: Array
  },
  data() {
    return {
      active: null
    }
  },
  computed: {
    paths() {
      var self = this
      return _.map(this.branches, function(branch) {
        return {
          id: branch.id,
          label: branch.label,
          active: _.isEqual(self.active, branch.id) ? true : false
        }
      })
    },
    numbranches() {
      return this.branches.length
    }
  },
  methods: {
    add(payload) {
      let branch = {
        id: _.uniqueId(),
        settings: payload,
        branches: []
      }
      this.active = branch.id
      this.branches.push(branch)
    },
    set(id) {
      this.active = id
    },
    remove(id) {
      // remove emitted branch
      this.branches = _.filter(this.branches, function(branch) {
        return !_.isEqual(branch.id, id)
      })
      // set new active branch
      if (!_.isEmpty(this.branches)) {
        this.active = this.branches[0].id
      }
    },
    destroy() {
      this.$emit('destroy', this.id)
    }
  },
  mounted() {
    document.getElementById(this.id).scrollIntoView();
  }
}
