const modal = {
  template: `
  <div class="modal fade-in fixed top-0 left-0 w-full h-full flex items-center justify-center z-40" v-if="show">
    <div class="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
    <div class="bg-white w-11/12 max-w-lg rounded relative">
      <div class="modal-close cursor-pointer absolute top-0 right-0 rounded-tr" @click="cancel()">
        <span class="text-sm font-medium">&times;</span>
      </div>
      <div class="modal-content overflow-scroll">
        <div class="p-5" v-if="!iframe">
          <slot name="header"></slot>
        </div>
        <div class="z-50" :class="iframe ? 'p-0' : 'px-5 py-2'">
          <slot name="body"></slot>
        </div>
        <div class="p-5" v-if="!iframe">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </div>
  `,
  props: {
    show: Boolean,
    iframe: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    cancel() {
      this.$emit('cancel')
    }
  },
  watch: {
    show(newval, oldval) {
      if (newval == true) {
        document.body.classList.add('overflow-hidden');
      } else {
        document.body.classList.remove('overflow-hidden');
      }
    }
  }
}
