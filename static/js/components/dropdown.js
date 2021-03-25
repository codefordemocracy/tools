const dropdown = {
  template: `
  <div class="btn-group">
    <button type="button" class="btn dropdown-toggle" :class="button" @click="toggleOpen()" ref="button">{{text}} </button>
    <div class="dropdown-menu" :class="[menu, {'d-block': open}]" @click="toggleOpen()" ref="dropdown">
      <slot></slot>
    </div>
  </div>
  `,
  props: {
    button: String,
    menu: String,
    text: String
  },
  data() {
    return {
      id: _.uniqueId(),
      open: false
    };
  },
  methods: {
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.open = false;
        this.$emit('dropdown', {id: this.id, open: this.open})
      }
    },
    toggleOpen() {
      this.open = !this.open
      this.$emit('dropdown', {id: this.id, open: this.open})
    }
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
  }
}
