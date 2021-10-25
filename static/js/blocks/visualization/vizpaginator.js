const vizpaginator = {
  components: {
    'vizdisplayer': vizdisplayer
  },
  template: `
    <div :class="{'-mb-4': chunks.length == 1}">
      <div class="bg-xlight p-5 mb-4" v-for="viz in chunks[page-1]">
        <vizdisplayer :viz="viz" :hide="hide" :ratio="ratio"></vizdisplayer>
        <div class="text-xs mt-3">
          <a :href="'/view/visualization/?id=' + viz.id" class="text-blue mr-3" v-if="_.includes(actions, 'view')" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-viz-' + _.uniqueId(), ratio, window)">View Details</a>
          <a :href="'/create/visualization/?action=clone&id=' + viz.id" class="text-primary mr-3" v-if="_.includes(actions, 'clone')">Clone</a>
          <a :href="'/create/visualization/?action=edit&id=' + viz.id" class="text-orange mr-3" v-if="_.includes(actions, 'edit')">Edit</a>
          <a href="javascript:void(0)" @click="confirm(viz)" class="text-red" v-if="_.includes(actions, 'delete')">Delete</a>
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
      default: ['view', 'clone', 'edit', 'delete']
    },
    visualizations: {
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
      return _.chunk(this.visualizations, this.pagelength)
    }
  },
  methods: {
    confirm(viz) {
      this.$emit('confirm', viz)
    }
  }
}
