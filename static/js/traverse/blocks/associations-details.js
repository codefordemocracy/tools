const associations_details = {
  template: `
    <div>
      <matches :mentity="mentity" :has="has" :interactions="interactions" :api="matches[0]" :qs="settings.qs" @investigate="investigate">
        <template v-slot:header>Intermediaries</template>
        <template v-slot:intro>These are the details on the intermediaries that connect {{_.toUpper(settings.term)}} and {{_.toUpper(settings.term2)}}.</template>
        <template v-slot:none>No intermediaries found</template>
      </matches>
    </div>
  `,
  props: {
    settings: Object
  },
  computed: {
    mentity() {
      if (_.isArray(this.$store.state.intermediaries[this.settings.entity][this.settings.entity2])) {
        return this.$store.state.intermediaries[this.settings.entity][this.settings.entity2][this.settings.index]
      } else {
        return this.$store.state.intermediaries[this.settings.entity][this.settings.entity2]
      }
    },
    has() {
      return {
        intermediaries: !_.isNil(this.$store.state.intermediaries[this.settings.entity][this.mentity]) || !_.isNil(this.$store.state.intermediaries[this.settings.entity2][this.mentity]),
        expansions: _.includes(this.$store.state.expansions, this.mentity),
        search: _.includes(this.$store.state.search, this.mentity)
      }
    }
  },
  data() {
    return {
      interactions: {
        selectable: false
      },
      matches: [{
        endpoint: '/api/traverse/intermediaries/',
        payload: {
          'ids': this.settings.ids,
          'ids2': this.settings.ids2,
          'entity': this.settings.entity,
          'entity2': this.settings.entity2
        }
      }]
    }
  },
  methods: {
    investigate(payload) {
      if (payload.type == 'intermediate') {
        if (!_.isNil(this.$store.state.intermediaries[this.settings.entity][this.mentity])) {
          this.$emit('add', {template: 'associations-details', entity: this.settings.entity, entity2: this.mentity, term: this.settings.term, term2: payload.term, ids: this.settings.ids, ids2: payload.ids, qs: payload.qs, index: payload.index})
        } else if (!_.isNil(this.$store.state.intermediaries[this.settings.entity2][this.mentity])) {
          this.$emit('add', {template: 'associations-details', entity: this.settings.entity2, entity2: this.mentity, term: this.settings.term2, term2: payload.term, ids: this.settings.ids2, ids2: payload.ids, qs: payload.qs, index: payload.index})
        }
      } else if (payload.type == 'expand') {
        this.$emit('add', {template: this.mentity, entity: this.mentity, term: payload.term, ids: payload.ids})
      } else if (payload.type == 'search') {
        this.$emit('add', {template: 'overview', entity: payload.entity, term: payload.term})
      }
    }
  }
}
