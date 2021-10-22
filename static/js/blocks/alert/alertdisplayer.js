const alertdisplayer = {
  template: `
    <ul class="list-none text-xs leading-normal" v-if="!_.isEmpty(alert)">
      <li v-if="!_.includes(hide, 'id')"><strong>ID:</strong> <a class="text-primary" :href="'/view/alert/?id=' + alert.id + '&mode=popup'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-view-alert-' + _.uniqueId(), ratio, window)">{{alert.id}}</a></li>
      <li v-if="!_.includes(hide, 'active')"><strong>Active:</strong> {{alert.active}}</li>
      <li v-if="!_.includes(hide, 'name')"><strong>Name:</strong> {{alert.name}}</li>
      <li v-if="!_.includes(hide, 'description')"><strong>Description:</strong> {{alert.description}}</li>
      <li v-if="!_.includes(hide, 'query')"><strong>Query:</strong> <a class="text-primary" :href="'/view/query/?id=' + alert.query + '&mode=popup'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-view-query-' + _.uniqueId(), ratio, window)">{{alert.query}}</a></li>
      <li v-if="!_.includes(hide, 'last_updated')"><strong>Last Updated:</strong> {{moment(alert.last_updated).local()}}</li>
      <li v-if="!_.includes(hide, 'created_at')"><strong>Created at:</strong> {{moment(alert.created_at).local()}}</li>
      <template v-if="!_.includes(hide, 'trigger')">
        <li><strong>Trigger Event:</strong> {{alert.trigger.event.replace('_', ' ')}}</li>
        <li><strong>Trigger Frequency:</strong> {{alert.trigger.frequency}}</li>
      </template>
      <li v-if="!_.includes(hide, 'last_checked') && !_.isNil(alert.last_checked)"><strong>Last Checked:</strong> {{moment(alert.last_checked).local()}}</li>
      <li v-if="!_.includes(hide, 'last_alerted') && !_.isNil(alert.last_alerted)"><strong>Last Alerted:</strong> {{moment(alert.last_alerted).local()}}</li>
    </ul>
  `,
  props: {
    alert: null,
    hide: {
      type: Array,
      default: []
    },
    ratio: {
      type: Number,
      default: 0.7
    }
  }
}
