const tabbed = {
  tabs: {
    template: `
      <div ref="tabs" class="border-b border-secondary tabs">
        <div class="flex" :class="{'border-r border-secondary': fill}">
          <div v-for="tab in tabs" @click="select(tab)" class="py-2 px-5 cursor-pointer text-xs border border-r-0 border-secondary bg-light text-center" :class="{'tab-active border-b-0 bg-white': tab.active, 'flex-1': fill}">
            {{tab.name}}
          </div>
          <div class="bg-light border-l border-b border-secondary flex-grow" v-if="!fill"></div>
        </div>
        <div class="tab-content overflow-auto break-words bg-white border-l border-r border-secondary">
          <slot></slot>
        </div>
      </div>
    `,
    props: {
      fill: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        tabs: []
      }
    },
    created() {
      this.tabs = this.$children
    },
    methods: {
      select(selected) {
        if (selected.placeholder) {
          store.commit('waitlist/modal', true)
        } else {
          this.tabs.forEach(tab => {
            tab.active = (tab.name == selected.name);
          })
        }
        this.$emit('change', selected.name)
      }
    }
  },
  tab: {
    template: `
      <div v-show="active"><slot></slot></div>
    `,
    props: {
      name: {
        type: String,
        required: true
      },
      selected: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        active: false
      }
    },
    mounted() {
      this.active = this.selected;
    }
  }
}
