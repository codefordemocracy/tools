const intersection_settings = {
  template: `
    <div>
      <matches :mentity="mentity" :has="has" :numbranches="numbranches" :interactions="interactions" :api="matches[0]" :selected="selected" @onselect="onselect">
        <template v-slot:header>Matches</template>
        <template v-slot:intro>Review these potential matches for {{_.toUpper(settings.term2)}} and unselect the ones that should not be used to compute the intersection with {{_.toUpper(settings.term)}}.</template>
        <template v-slot:none>No matches found</template>
      </matches>
      <actions :mentity="mentity" :next="next" :selected="selected" @action="action">
        <template v-slot:header>Actions</template>
        <template v-slot:intro>Continue computing the intersection between {{_.toUpper(settings.term)}} and {{_.toUpper(settings.term2)}}.</template>
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
        associations: false,
        intersection: false,
        intersection2: true
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
          'term': this.settings.term2
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
      if (payload.type == 'intersection2') {
        this.$emit('add', {template: 'intersection-results', entity: this.mentity, term: term, ids: this.settings.ids, term2: this.settings.term2, ids2: this.selected, entity2: payload.setting})
      }
    }
  }
}
