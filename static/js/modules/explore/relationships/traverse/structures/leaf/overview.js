const overview = {
  template: `
    <div>
      <matches :mentity="mentity" :has="has" :numbranches="numbranches" :interactions="interactions" :api="matches[0]" :selected="selected" @onselect="onselect">
        <template v-slot:header>Matches</template>
        <template v-slot:intro>Review these potential matches for {{_.toUpper(settings.term)}} and select the ones that are relevant.</template>
        <template v-slot:none>No matches found</template>
      </matches>
      <actions :mentity="mentity" :next="next" :selected="selected" @action="action">
        <template v-slot:header>Actions</template>
        <template v-slot:intro>Choose an analytical action to perform on the selected matches.</template>
      </actions>
    </div>
  `,
  props: {
    settings: Object,
    numbranches: Number
  },
  computed: {
    mentity() {
      return this.settings.entity
    },
    has() {
      return {
        intermediaries: false,
        expansions: false,
        search: false
      }
    },
    next() {
      return {
        associations: !_.isNil(this.$store.state.explore.associations[this.mentity]),
        intersection: _.includes(this.$store.state.explore.intersections, this.mentity),
        intersection2: false
      }
    }
  },
  data() {
    return {
      interactions: {
        selectable: true
      },
      matches: [{
        endpoint: '/api/traverse/find/',
        payload: {
          'entity': this.settings.entity,
          'term': this.settings.term
        }
      }],
      selected: []
    }
  },
  methods: {
    onselect(payload) {
      this.selected = payload
    },
    action(payload) {
      let term = this.settings.term
      if (payload.type == 'associations') {
        this.$emit('add', {template: 'associations-results', entity: this.mentity, term: term, ids: this.selected, entity2: payload.setting})
      } else if (payload.type == 'intersection') {
        this.$emit('add', {template: 'intersection-settings', entity: this.mentity, term: term, ids: this.selected, term2: payload.setting})
      }
    }
  }
}
