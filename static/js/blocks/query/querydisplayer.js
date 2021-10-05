const querydisplayer = {
  components: {
    'configuration': configuration
  },
  template: `
    <ul class="list-none text-xs leading-normal" v-if="!_.isEmpty(query)">
      <li v-if="!_.includes(hide, 'visibility')"><strong>Visibility:</strong> {{query.visibility}}</li>
      <li v-if="!_.includes(hide, 'id')"><strong>ID:</strong> <a class="text-primary" :href="'/view/query/?id=' + query.id + '&mode=popup'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-view-query-' + _.uniqueId(), ratio, window)">{{query.id}}</a></li>
      <li v-if="!_.includes(hide, 'name')"><strong>Name:</strong> {{query.name}}</li>
      <li v-if="!_.includes(hide, 'description') && !_.isNil(query.description)"><strong>Description:</strong> {{query.description}}</li>
      <li v-if="!_.includes(hide, 'template')"><strong>Template:</strong> <configuration :recipe="_.filter(RECIPES, {template: query.template})[0]" version="settings" :unformatted="true"></configuration> [{{query.template}}]</li>
      <li v-if="!_.includes(hide, 'lists')"><strong>Lists:</strong><span v-for="(id, i) in query.lists"><span v-if="i != 'a'">,</span> <a class="text-primary" :href="'/view/list/?id=' + id + '&mode=popup'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-view-list-' + _.uniqueId(), ratio, window)">{{id}}</a></span></li>
      <li v-if="!_.includes(hide, 'last_updated')"><strong>Last Updated:</strong> {{moment(query.last_updated).local()}}</li>
      <li v-if="!_.includes(hide, 'created_at')"><strong>Created at:</strong> {{moment(query.created_at).local()}}</li>
      <li v-if="!_.includes(hide, 'created_by')"><strong>Created by:</strong> <a class="text-primary" :href="'/user/' + query.created_by + '/?mode=popup'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-user-' + _.uniqueId(), ratio, window)">{{query.created_by}}</a></li>
      <li v-if="!_.includes(hide, 'cloned_from') && !_.isNil(query.cloned_from)"><strong>Cloned from:</strong> <a class="text-primary" :href="'/view/query/?id=' + query.cloned_from + '&mode=popup'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-view-query-' + _.uniqueId(), ratio, window)">{{query.cloned_from}}</a></li>
      <li v-if="!_.includes(hide, 'dates')"><strong>Dates:</strong> {{query.dates.min.split('T')[0]}} to {{query.dates.max.split('T')[0]}}</li>
      <template v-if="!_.includes(hide, 'filters') && !_.isNil(query.filters)">
        <template v-if="!_.includes(hide, 'filters.amount') && !_.isNil(query.filters.amount)">
          <li v-if="!_.isNil(query.filters.amount.min)"><strong>Min Transaction Amount:</strong> {{'$' + query.filters.amount.min | currency}}</li>
          <li v-if="!_.isNil(query.filters.amount.max)"><strong>Max Transaction Amount:</strong> {{'$' + query.filters.amount.max | currency}}</li>
        </template>
      </template>
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
