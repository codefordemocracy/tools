const DEFAULT_COLOR_CHECKED = '#555'
const DEFAULT_COLOR_UNCHECKED = '#bbb'
const DEFAULT_LABEL_CHECKED = 'include'
const DEFAULT_LABEL_UNCHECKED = 'exclude'
const DEFAULT_SWITCH_COLOR = '#fff'
const contains = (object, title) =>
  typeof object === 'object' && object.hasOwnProperty(title)
const px = v => v + 'px'
const translate3d = (x, y, z = '0px') => {
  return `translate3d(${x}, ${y}, ${z})`
}

const toggle = {
  template: `
  <div class="flex justify-between items-start text-xs">
    <span class="leading-none py-1.5"><slot name="text"></slot></span>
    <label :class="className">
      <input type="checkbox" class="hidden opacity-0 absolute w-px h-px" :name="name" :checked="value" :disabled="disabled" @change.stop="toggle" />
      <div class="relative box-border outline-none m-0 select-none transition-all duration-300" :style="coreStyle">
        <div class="absolute overflow-hidden top-0 left-0 rounded-full bg-white z-10" :style="buttonStyle"></div>
      </div>
      <div v-if="labels" class="uppercase">
        <span class="absolute top-0 text-white left-2" :style="labelStyle" v-if="toggled">
          <slot name="checked">
            <div>{{labelChecked}}</div>
          </slot>
        </span>
        <span class="absolute top-0 text-white right-2" :style="labelStyle" v-else>
          <slot name="unchecked">
            <div>{{labelUnchecked}}</div>
          </slot>
        </span>
      </div>
    </label>
  </div>
  `,
  props: {
    value: {
      type: Boolean,
      default: false
    },
    name: {
      type: String
    },
    disabled: {
      type: Boolean,
      default: false
    },
    sync: {
      type: Boolean,
      default: false
    },
    speed: {
      type: Number,
      default: 300
    },
    color: {
      type: [String, Object],
      validator (value) {
        return typeof value === 'object'
          ? (value.checked || value.unchecked || value.disabled)
          : typeof value === 'string'
      }
    },
    switchColor: {
      type: [String, Object],
      validator (value) {
        return typeof value === 'object'
          ? (value.checked || value.unchecked)
          : typeof value === 'string'
      }
    },
    cssColors: {
      type: Boolean,
      default: false
    },
    labels: {
      type: [Boolean, Object],
      default: true,
      validator (value) {
        return typeof value === 'object'
          ? (value.checked || value.unchecked)
          : typeof value === 'boolean'
      }
    },
    height: {
      type: Number,
      default: 22
    },
    width: {
      type: Number,
      default: 80
    },
    margin: {
      type: Number,
      default: 3
    },
    fontSize: {
      type: Number
    }
  },
  computed: {
    className () {
      let { toggled, disabled } = this
      return ['switch inline-block relative align-middle select-none cursor-pointer', { toggled, disabled }]
    },
    coreStyle () {
      return {
        width: px(this.width),
        height: px(this.height),
        backgroundColor: this.cssColors
          ? null
          : (this.disabled ? this.colorDisabled : this.colorCurrent),
        borderRadius: px(Math.round(this.height / 2))
      }
    },
    buttonRadius () {
      return this.height - this.margin * 2;
    },
    distance () {
      return px(this.width - this.height + this.margin)
    },
    buttonStyle () {
      const transition = `transform ${this.speed}ms`
      const margin = px(this.margin)
      const transform = this.toggled
        ? translate3d(this.distance, margin)
        : translate3d(margin, margin)
      const background = this.switchColor
        ? this.switchColorCurrent
        : null
      return {
        width: px(this.buttonRadius),
        height: px(this.buttonRadius),
        transition,
        transform,
        background
      }
    },
    labelStyle () {
      return {
        lineHeight: px(this.height),
        fontSize: this.fontSize ? px(this.fontSize) : null
      }
    },
    colorChecked () {
      let { color } = this
      if (typeof color !== 'object') {
        return color || DEFAULT_COLOR_CHECKED
      }
      return contains(color, 'checked')
        ? color.checked
        : DEFAULT_COLOR_CHECKED
    },
    colorUnchecked () {
      let { color } = this
      return contains(color, 'unchecked')
        ? color.unchecked
        : DEFAULT_COLOR_UNCHECKED
    },
    colorDisabled () {
      let { color } = this
      return contains(color, 'disabled')
        ? color.disabled
        : this.colorCurrent
    },
    colorCurrent () {
      return this.toggled
        ? this.colorChecked
        : this.colorUnchecked
    },
    labelChecked () {
      const { labels } = this
      return contains(labels, 'checked')
        ? labels.checked
        : DEFAULT_LABEL_CHECKED
    },
    labelUnchecked () {
      const { labels } = this
      return contains(labels, 'unchecked')
        ? labels.unchecked
        : DEFAULT_LABEL_UNCHECKED
    },
    switchColorChecked () {
      const { switchColor } = this
      return contains(switchColor, 'checked')
        ? switchColor.checked
        : DEFAULT_SWITCH_COLOR
    },
    switchColorUnchecked () {
      const { switchColor } = this
      return contains(switchColor, 'unchecked')
        ? switchColor.unchecked
        : DEFAULT_SWITCH_COLOR
    },
    switchColorCurrent () {
      let { switchColor } = this
      if (typeof switchColor !== 'object') {
        return switchColor || DEFAULT_SWITCH_COLOR
      }
      return this.toggled
        ? this.switchColorChecked
        : this.switchColorUnchecked
    }
  },
  watch: {
    value (value) {
      if (this.sync) {
        this.toggled = !!value
      }
    }
  },
  data () {
    return {
      toggled: !!this.value
    }
  },
  methods: {
    toggle (event) {
      this.toggled = !this.toggled
      this.$emit('input', this.toggled)
      this.$emit('change', {
        value: this.toggled,
        srcEvent: event
      })
    }
  }
}
