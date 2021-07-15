const tabbed = {
  tabs: {
    template: `
      <div ref="tabs">
        <div class="d-flex" :class="{'border-right': fill}">
          <div v-for="tab in tabs" @click="select(tab)" class="tab border border-right-0 bg-light text-center" :class="{'tab-active': tab.active, 'flex-fill': fill}">
            {{tab.name}}
          </div>
          <div class="bg-light border-left border-bottom flex-grow-1" v-if="!fill"></div>
        </div>
        <div class="tab-content border-left border-right">
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
