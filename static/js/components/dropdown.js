const dropdown = {
  template: `
  <div class="dropdown-menu inline-block relative">
    <button type="button" class="btn" :class="button" @click="toggleOpen()" ref="button">{{text}}<i class="fas fa-caret-down ml-2"></i></button>
    <div class="absolute bg-white z-20" :class="[menu, {'block': open, 'hidden': !open}]" @click="toggleOpen()" ref="dropdown">
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
