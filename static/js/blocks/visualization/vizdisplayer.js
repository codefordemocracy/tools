const vizdisplayer = {
  template: `
    <ul class="list-none text-xs leading-normal" v-if="!_.isEmpty(viz)">
      <li v-if="!_.includes(hide, 'category')"><strong>Category:</strong> {{viz.category}}</li>
      <li v-if="!_.includes(hide, 'id')"><strong>ID:</strong> <a class="text-primary" :href="'/view/visualization/?id=' + viz.id + '&mode=popup'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-view-viz-' + _.uniqueId(), ratio, window)">{{viz.id}}</a></li>
      <li v-if="!_.includes(hide, 'name')"><strong>Name:</strong> {{viz.name}}</li>
      <li v-if="!_.includes(hide, 'description')"><strong>Description:</strong> {{viz.description}}</li>
      <li v-if="!_.includes(hide, 'query')"><strong>Query:</strong> <a class="text-primary" :href="'/view/query/?id=' + viz.query + '&mode=popup'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-view-query-' + _.uniqueId(), ratio, window)">{{viz.query}}</a></li>
      <li v-if="!_.includes(hide, 'last_updated')"><strong>Last Updated:</strong> {{moment(viz.last_updated).local()}}</li>
      <li v-if="!_.includes(hide, 'created_at')"><strong>Created at:</strong> {{moment(viz.created_at).local()}}</li>
      <li v-if="!_.includes(hide, 'cloned_from') && !_.isNil(viz.cloned_from)"><strong>Cloned from:</strong> <a class="text-primary" :href="'/view/visualization/?id=' + viz.cloned_from + '&mode=popup'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-view-viz-' + _.uniqueId(), ratio, window)">{{viz.cloned_from}}</a></li>
      <li v-if="!_.includes(hide, 'aggregations') && !_.isEmpty(viz.aggregations.columns)"><strong>Aggregations:</strong><span v-for="(agg, col) in viz.aggregations.apply"><span v-if="col != viz.aggregations.columns[0]">,</span> {{agg}}({{col}})</span></li>
      <li v-if="!_.includes(hide, 'aggregations') && !_.isEmpty(viz.aggregations.groupby)"><strong>Group By:</strong> {{viz.aggregations.groupby.join(', ')}}</li>
    </ul>
  `,
  props: {
    viz: null,
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
