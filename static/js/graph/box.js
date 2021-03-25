const box = {
  tabs: {
    template: `
      <div ref="tabs">
        <div class="d-flex border-right">
          <div v-for="tab in tabs" @click="selectTab(tab)" class="tab p-1 flex-fill border border-right-0 bg-light text-center" :class="{ 'tab-active': tab.isActive }">
            {{ tab.name }}
          </div>
        </div>
        <div class="tab-content p-1 border-left border-right">
          <slot></slot>
        </div>
      </div>
    `,
    data() {
      return { tabs: [] };
    },
    created() {
      this.tabs = this.$children;
    },
    methods: {
      selectTab(selectedTab) {
        this.tabs.forEach(tab => {
          tab.isActive = (tab.name == selectedTab.name);
        });
        this.$store.commit('tab', selectedTab.name.toLowerCase())
      }
    }
  },
  tab: {
    template: `
      <div v-show="isActive"><slot></slot></div>
    `,
    props: {
      name: {
        type: String,
        required: true
      },
      selected: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        isActive: false
      };
    },
    mounted() {
      this.isActive = this.selected;
    }
  }
}
