const typeahead = {
  template: `
  <div class="typeahead">
    <input ref="typeahead" :placeholder="placeholder" :class="input" :value="value" :disabled="disabled" @focus="onFocus()" @input="onChange()" @keyup.down="onArrowDown" @keyup.up="onArrowUp" @keydown.enter="onEnter" />
    <ul class="typeahead-results" :class="ul" v-show="isOpen && results.length > 0">
      <li class="typeahead-noclick text-muted" v-if="isLoading">
        Loading...
      </li>
      <li v-else v-for="(result, i) in results" :key="i" @click="setResult(result)" class="typeahead-result" :class="{ 'is-active': i === arrowCounter }">
        {{ result }}
      </li>
    </ul>
  </div>
  `,
  props: {
    value: String,
    placeholder: String,
    items: {
      type: Array,
      default: () => [],
    },
    input: String,
    ul: String,
    disabled: Boolean
  },
  data() {
    return {
      isOpen: false,
      results: [],
      isLoading: false,
      arrowCounter: -1
    };
  },
  methods: {
    onFocus() {
      self = this
      // suggest options for search after a delay
      if (this.value == '') {
        _.delay(function() {
          self.results = self.items;
          self.isOpen = true;
        }, 750)
      }
    },
    onChange() {
      this.$emit('input', this.$refs.typeahead.value)
      if (this.isAsync) {
        this.isLoading = true;
      } else {
        this.filterResults();
        this.isOpen = true;
      }
    },
    filterResults() {
      this.results = this.items.filter(item => {
        return item.toLowerCase().indexOf(this.$refs.typeahead.value.toLowerCase()) > -1;
      });
    },
    setResult(result) {
      this.$refs.typeahead.value = result;
      this.$emit('input', this.$refs.typeahead.value)
      this.isOpen = false;
    },
    onArrowDown(evt) {
      if (this.arrowCounter < this.results.length) {
        this.arrowCounter = this.arrowCounter + 1;
      }
    },
    onArrowUp() {
      if (this.arrowCounter > 0) {
        this.arrowCounter = this.arrowCounter - 1;
      }
    },
    onEnter() {
      if (this.arrowCounter != -1) {
        this.$refs.typeahead.value = this.results[this.arrowCounter];
        this.$emit('input', this.$refs.typeahead.value)
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    }
  },
  watch: {
    items(val, oldValue) {
      if (val.length !== oldValue.length) {
        this.results = val;
        this.isLoading = false;
      }
    }
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
  }
}
