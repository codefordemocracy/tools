const listpaginator = {
  components: {
    'listdisplayer': listdisplayer
  },
  template: `
    <div>
      <div class="bg-xlight p-2 mb-2" v-for="list in chunks[page-1]">
        <listdisplayer :list="list" :hide="hide" :ratio="ratio"></listdisplayer>
        <a href="javascript:void(0)" @click="toggle(list)" class="text-purple mr-2" v-if="_.includes(actions, 'toggle')">Make <span v-if="list.visibility == 'public'">Hidden</span><span v-else>Public</span></a>
        <a :href="'/create/list/?action=clone&id=' + list.id" class="text-primary mr-2" v-if="_.includes(actions, 'clone')">Clone</a>
        <a :href="'/create/list/?action=edit&id=' + list.id" class="text-orange mr-2" v-if="_.includes(actions, 'edit')">Edit</a>
        <a href="javascript:void(0)" @click="confirm(list)" class="text-danger" v-if="_.includes(actions, 'delete')">Delete</a>
      </div>
      <div class="row d-flex align-items-center mb-1" v-if="chunks.length > 1">
        <div class="col-6 col-sm-3 order-sm-1">
          <button class="btn btn-link text-gray btn-xs" @click="page--" :disabled="page == 1">&larr; Previous<span class="d-none d-md-inline"> Page</span></button>
        </div>
        <div class="col-6 col-sm-3 order-sm-3 text-right">
          <button class="btn btn-link text-gray btn-xs pl-3" @click="page++" :disabled="page == chunks.length">Next<span class="d-none d-md-inline"> Page</span> &rarr;</button>
        </div>
        <div class="col-12 col-sm-6 order-sm-2 text-center">
          Page {{page}} of {{chunks.length}}</span>
        </div>
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
      default: ['toggle', 'clone', 'edit', 'delete']
    },
    lists: {
      type: Array,
      default: []
    },
    ratio: {
      type: Number,
      default: 0.7
    }
  },
  data() {
    return {
      page: 1
    }
  },
  computed: {
    chunks() {
      return _.chunk(this.lists, 5)
    }
  },
  methods: {
    toggle(list) {
      this.$emit('toggle', list)
    },
    confirm(list) {
      this.$emit('confirm', list)
    }
  }
}
