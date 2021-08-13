const leaf = {
  template: `
    <div>
      <div class="py-2 px-3 flex justify-between items-center bg-secondary">
        <div class="uppercase">
          <strong class="text-dark">{{settings.entity}}:</strong> {{settings.term}}
          <span class="text-muted" v-if="settings.template != 'contribution'"> &ndash; </span>
          <span v-if="settings.template == 'overview'">overview</span>
          <span v-if="settings.template == 'associations-results'">associations ({{settings.entity2}}s)</span>
          <span v-if="settings.template == 'associations-details'">associations ({{settings.entity2}}s) <span class="text-muted">&ndash;</span> details ({{settings.term2}})</span>
          <span v-if="settings.template == 'intersection-settings'">intersection ({{settings.term2}}) <span class="text-muted">&ndash;</span> settings</span>
          <span v-if="settings.template == 'intersection-results'">intersection ({{settings.term2}}) <span class="text-muted">&ndash;</span> {{settings.entity2}}s</span>
          <span v-if="settings.template == 'intersection-details'">intersection ({{settings.term2}}) <span class="text-muted">&ndash;</span> details ({{settings.term3}})</span>
        </div>
        <a href="javascript:void(0);" class="text-muted hover:text-dark" @click="destroy()"><i class="fas fa-times"></i></a>
      </div>
      <div class="border-l border-r border-b border-secondary bg-white p-5">
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
