const configurable = {
  template: `
  <div class="inline">
    <span v-if="settings.version == 'list'" @click="$emit('click')"><span v-if="!settings.prefill">a </span><span :class="{'font-bold': !settings.unformatted}">{{settings.prefill ? options[0].name : _.startCase(settings.subtype) + ' List'}}</span><span v-if="settings.prefill"> ({{_.startCase(settings.subtype) + ' List'}})</span></span>
    <span v-if="settings.version == 'settings'"><span :class="{'font-bold': !settings.unformatted}">List {{_.toUpper(settings.sequence)}}</span> ({{_.startCase(settings.subtype) + ' List'}})</span>
    <span v-if="settings.version == 'results'">the {{settings.subtype}} list with ID <a :href="'/view/list/?id=' + listid" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-view-list-detail-' + _.uniqueId(), 0.7, window)" :class="{'underline': !settings.unformatted}">{{listid}}</a></span>
  </div>
  `,
  props: {
    settings: {
      type: Object,
      default: function () {
        return {
          version: 'list',
          lists: {},
          prefill: false,
          subtype: null,
          sequence: 'a',
          unformatted: false
        }
      }
    }
  },
  computed: {
    options() {
      return this.settings.lists[this.settings.subtype]
    },
    listid() {
      return this.settings.lists[this.settings.sequence]
    }
  }
}
