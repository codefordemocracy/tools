const listpaginator = {
  components: {
    'listdisplayer': listdisplayer
  },
  template: `
    <div>
      <div class="bg-xlight p-5 mb-4" v-for="list in chunks[page-1]">
        <listdisplayer :list="list" :hide="hide" :ratio="ratio"></listdisplayer>
        <div class="text-xs mt-3">
          <a href="javascript:void(0)" @click="toggle(list)" class="text-purple mr-3" v-if="_.includes(actions, 'toggle')">Make <span v-if="list.visibility == 'public'">Hidden</span><span v-else>Public</span></a>
          <a :href="'/create/list/?action=clone&id=' + list.id" class="text-primary mr-3" v-if="_.includes(actions, 'clone')">Clone</a>
          <a :href="'/create/list/?action=edit&id=' + list.id" class="text-orange mr-3" v-if="_.includes(actions, 'edit')">Edit</a>
          <a href="javascript:void(0)" @click="confirm(list)" class="text-red" v-if="_.includes(actions, 'delete')">Delete</a>
        </div>
      </div>
      <div class="flex justify-between items-center" v-if="chunks.length > 1">
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
