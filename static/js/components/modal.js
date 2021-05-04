const modal = {
  template: `
  <transition name="modal" v-if="show">
    <div class="modal-mask">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-close">
            <button class="btn btn-sm" @click="cancel()">&times;</button>
          </div>
          <div class="modal-header p-2" v-if="!iframe">
            <slot name="header"></slot>
          </div>
          <div class="modal-body" :class="iframe ? 'p-0' : 'px-2 py-1'">
            <slot name="body"></slot>
          </div>
          <div class="modal-footer p-2" v-if="!iframe">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
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
