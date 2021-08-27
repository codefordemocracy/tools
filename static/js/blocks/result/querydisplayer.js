const querydisplayer = {
  template: `
    <ul class="list-none text-xs leading-normal" v-if="!_.isEmpty(query)">
      <li v-if="!_.includes(hide, 'visibility')"><strong>Visibility:</strong> {{query.visibility}}</li>
      <li v-if="!_.includes(hide, 'output')"><strong>Output:</strong> {{query.output}}</li>
      <li v-if="!_.includes(hide, 'template')"><strong>Template:</strong> {{query.template}}</li>
      <li v-if="!_.includes(hide, 'id')"><strong>ID:</strong> {{query.id}}</li>
      <li v-if="!_.includes(hide, 'name')"><strong>Name:</strong> {{query.name}}</li>
      <li v-if="!_.includes(hide, 'description')"><strong>Description:</strong> {{query.description}}</li>
      <li v-if="!_.includes(hide, 'last_updated')"><strong>Last Updated:</strong> {{moment(query.last_updated).local()}}</li>
      <li v-if="!_.includes(hide, 'created_at')"><strong>Created at:</strong> {{moment(query.created_at).local()}}</li>
      <li v-if="!_.includes(hide, 'created_by') && !_.isNil(query.created_by)"><strong>Created by:</strong> <a class="text-primary" :href="'/user/' + query.created_by + '/?mode=popup'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-user-' + _.uniqueId(), ratio, window)">{{query.created_by}}</a></li>
      <li v-if="!_.includes(hide, 'cloned_from') && !_.isNil(query.cloned_from)"><strong>Cloned from:</strong> <a class="text-primary" :href="'/view/query/?id=' + query.cloned_from + '&mode=popup'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-view-list-' + _.uniqueId(), ratio, window)">{{query.cloned_from}}</a></li>
      <li v-if="!_.includes(hide, 'subtypes')"><strong>Subtypes:</strong> {{query.subtypes.join(', ')}}</li>
      <li v-if="!_.includes(hide, 'lists')"><strong>Lists:</strong> {{_.values(query.lists).join(', ')}}</li>
      <li v-if="!_.includes(hide, 'dates')"><strong>Dates:</strong> {{query.dates.min.split('T')[0]}} to {{query.dates.max.split('T')[0]}}</li>
    </ul>
  `,
  props: {
    query: null,
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
