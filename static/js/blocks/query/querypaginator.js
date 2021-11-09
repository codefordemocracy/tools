const querypaginator = {
  components: {
    'querydisplayer': querydisplayer
  },
  template: `
    <div>
      <div class="bg-xlight p-5 mb-4" v-for="query in chunks[page-1]">
        <querydisplayer :query="query" :hide="hide" :ratio="ratio"></querydisplayer>
        <div class="text-xs mt-3">
          <a :href="'/view/query/?id=' + query.id" class="text-blue mr-3" v-if="_.includes(actions, 'view')" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-query-' + _.uniqueId(), ratio, window)">View Results</a>
          <a href="javascript:void(0)" @click="store.getters['auth/isVerified'] ? toggle(query) = true : store.commit('auth/verify', true)" class="text-purple mr-3" v-if="_.includes(actions, 'toggle')">Make <span v-if="query.visibility == 'public'">Hidden</span><span v-else>Public</span></a>
          <a :href="'/create/query/?action=clone&id=' + query.id" class="text-primary mr-3" v-if="_.includes(actions, 'clone')">Clone</a>
          <a :href="'/create/query/?action=edit&id=' + query.id" class="text-orange mr-3" v-if="_.includes(actions, 'edit')">Edit</a>
          <a href="javascript:void(0)" @click="confirm(query)" class="text-red" v-if="_.includes(actions, 'delete')">Delete</a>
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
      default: ['view', 'toggle', 'clone', 'edit', 'delete']
    },
    queries: {
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
      return _.chunk(this.queries, this.pagelength)
    }
  },
  methods: {
    toggle(query) {
      this.$emit('toggle', query)
    },
    confirm(query) {
      this.$emit('confirm', query)
    }
  }
}
