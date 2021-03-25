const modal = {
  template: `
  <transition name="modal" v-if="show">
    <div class="modal-mask">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header p-2">
            <slot name="header"></slot>
            <div class="modal-close">
              <button class="btn btn-sm" @click="cancel()">&times;</button>
            </div>
          </div>
          <div class="modal-body px-2 py-1">
            <slot name="body"></slot>
          </div>
          <div class="modal-footer p-2">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  `,
  props: {
    show: Boolean
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
