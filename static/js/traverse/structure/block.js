const block = {
  template: `
    <div>
      <div class="cap d-flex justify-content-between align-items-center">
        <div>
          <strong>{{settings.entity}}:</strong> {{settings.term}}
          <span class="text-muted" v-if="settings.template != 'contribution'"> &ndash; </span>
          <span v-if="settings.template == 'overview'">overview</span>
          <span v-if="settings.template == 'associations-results'">associations ({{settings.entity2}}s)</span>
          <span v-if="settings.template == 'associations-details'">associations ({{settings.entity2}}s) <span class="text-muted">&ndash;</span> details ({{settings.term2}})</span>
          <span v-if="settings.template == 'intersection-settings'">intersection ({{settings.term2}}) <span class="text-muted">&ndash;</span> settings</span>
          <span v-if="settings.template == 'intersection-results'">intersection ({{settings.term2}}) <span class="text-muted">&ndash;</span> {{settings.entity2}}s</span>
          <span v-if="settings.template == 'intersection-details'">intersection ({{settings.term2}}) <span class="text-muted">&ndash;</span> details ({{settings.term3}})</span>
        </div>
        <div class="text-right">
          <button class="btn text-muted" @click="destroy()">x</button>
        </div>
      </div>
      <div class="block p-2">
        <overview :settings="settings" :numbranches="numbranches" @add="add" v-if="settings.template == 'overview'"></overview>
        <associations-results-candidate-committee :settings="settings" :numbranches="numbranches" @add="add" v-if="settings.template == 'associations-results' && ((settings.entity == 'candidate' && settings.entity2 == 'committee') || (settings.entity == 'committee' && settings.entity2 == 'candidate'))"></associations-results-candidate-committee>
        <associations-results-committee-committee :settings="settings" :numbranches="numbranches" @add="add" v-else-if="settings.template == 'associations-results' && settings.entity == 'committee' && settings.entity2 == 'committee'"></associations-results-committee-committee>
        <associations-results :settings="settings" :numbranches="numbranches" @add="add" v-else-if="settings.template == 'associations-results'"></associations-results>
        <associations-details :settings="settings" @add="add" v-if="settings.template == 'associations-details'"></associations-details>
        <intersection-settings :settings="settings" :numbranches="numbranches" @add="add" v-if="settings.template == 'intersection-settings'"></intersection-settings>
        <intersection-results-candidate-committee :settings="settings" :numbranches="numbranches" @add="add" v-if="settings.template == 'intersection-results' && ((settings.entity == 'candidate' && settings.entity2 == 'committee') || (settings.entity == 'committee' && settings.entity2 == 'candidate'))"></intersection-results-candidate-committee>
        <intersection-results-committee-committee :settings="settings" :numbranches="numbranches" @add="add" v-else-if="settings.template == 'intersection-results' && settings.entity == 'committee' && settings.entity2 == 'committee'"></intersection-results-committee-committee>
        <intersection-results :settings="settings" :numbranches="numbranches" @add="add" v-else-if="settings.template == 'intersection-results'"></intersection-results>
        <intersection-details :settings="settings" @add="add" v-if="settings.template == 'intersection-details'"></intersection-details>
        <contribution :settings="settings" @add="add" v-if="settings.template == 'contribution'"></contribution>
      </div>
    </div>
  `,
  props: {
    settings: Object,
    numbranches: Number
  },
  methods: {
    add(payload) {
      this.$emit('add', payload)
    },
    destroy() {
      this.$emit('destroy')
    }
  }
}
