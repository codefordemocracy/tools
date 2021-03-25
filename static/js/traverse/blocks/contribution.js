const contribution = {
  template: `
    <div>
      <matches :has="has" :interactions="interactions" :api="matches[0]" @investigate="investigate" class="mb-3">
        <template v-slot:header>Contributor</template>
        <template v-slot:intro>These are the details for the CONTRIBUTOR.</template>
        <template v-slot:none>No contributors found</template>
      </matches>
      <matches :has="has" :interactions="interactions" :api="matches[1]" @investigate="investigate">
        <template v-slot:header>Recipient</template>
        <template v-slot:intro>These are the details for the RECIPIENT.</template>
        <template v-slot:none>No recipients found</template>
      </matches>
    </div>
  `,
  props: {
    settings: Object
  },
  computed: {
    has() {
      return {
        intermediaries: false,
        expansions: false,
        search: true
      }
    }
  },
  data() {
    return {
      interactions: {
        selectable: false
      },
      matches: [{
        endpoint: '/api/traverse/contribution/contributor/',
        payload: {
          'ids': this.settings.ids
        }
      }, {
        endpoint: '/api/traverse/contribution/recipient/',
        payload: {
          'ids': this.settings.ids
        }
      }]
    }
  },
  methods: {
    investigate(payload) {
      if (payload.type == 'search') {
        this.$emit('add', {template: 'overview', entity: payload.entity, term: payload.term})
      }
    }
  }
}
