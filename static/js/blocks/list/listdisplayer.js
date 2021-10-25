const listdisplayer = {
  template: `
    <ul class="list-none text-xs leading-normal" v-if="!_.isEmpty(list)">
      <li v-if="!_.includes(hide, 'visibility')"><strong>Visibility:</strong> {{list.visibility}}</li>
      <li v-if="!_.includes(hide, 'type')"><strong>Type:</strong> {{list.type}}</li>
      <li v-if="!_.includes(hide, 'subtype')"><strong>Subtype:</strong> {{list.subtype}}</li>
      <li v-if="!_.includes(hide, 'id')"><strong>ID:</strong> <a class="text-primary" :href="'/view/list/?id=' + list.id" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-view-list-' + _.uniqueId(), ratio, window)">{{list.id}}</a></li>
      <li v-if="!_.includes(hide, 'name')"><strong>Name:</strong> {{list.name}}</li>
      <li v-if="!_.includes(hide, 'description')"><strong>Description:</strong> {{list.description}}</li>
      <li v-if="!_.includes(hide, 'last_updated')"><strong>Last Updated:</strong> {{moment(list.last_updated).local()}}</li>
      <li v-if="!_.includes(hide, 'created_at')"><strong>Created at:</strong> {{moment(list.created_at).local()}}</li>
      <li v-if="!_.includes(hide, 'created_by')"><strong>Created by:</strong> <a class="text-primary" :href="'/user/' + list.created_by + '/'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-user-' + _.uniqueId(), ratio, window)">{{list.created_by}}</a></li>
      <li v-if="!_.includes(hide, 'cloned_from') && !_.isNil(list.cloned_from)"><strong>Cloned from:</strong> <a class="text-primary" :href="'/view/list/?id=' + list.cloned_from" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-view-list-' + _.uniqueId(), ratio, window)">{{list.cloned_from}}</a></li>
      <template v-if="!_.includes(hide, 'include')">
        <li v-if="!_.includes(hide, 'include.terms') && !_.isEmpty(list.include.terms)"><strong>Included Terms:</strong> {{list.include.terms.join(', ')}}</li>
        <li v-if="!_.includes(hide, 'include.ids') && !_.isEmpty(list.include.ids)"><strong>Included IDs:</strong> {{list.include.ids.join(', ')}}</li>
        <li v-if="!_.includes(hide, 'include.filters') && !_.isEmpty(list.include.filters)"><strong>Filters:</strong> {{mapFilter(list.include.filters).join(', ')}}</li>
      </template>
      <template v-if="!_.includes(hide, 'exclude') && !_.isNil(list.exclude)">
        <li v-if="!_.includes(hide, 'exclude.terms') && !_.isEmpty(list.exclude.terms)"><strong>Excluded Terms:</strong> {{list.exclude.terms.join(', ')}}</li>
        <li v-if="!_.includes(hide, 'exclude.ids') && !_.isEmpty(list.exclude.ids)"><strong>Excluded IDs:</strong> {{list.exclude.ids.join(', ')}}</li>
        <li v-if="!_.includes(hide, 'exclude.filters') && !_.isEmpty(list.exclude.filters)"><strong>Filters:</strong> {{mapFilter(list.exclude.filters).join(', ')}}</li>
      </template>
    </ul>
  `,
  props: {
    list: null,
    hide: {
      type: Array,
      default: []
    },
    ratio: {
      type: Number,
      default: 0.7
    }
  },
  methods: {
    mapFilter(filters) {
      return _.map(_.keys(filters), function(k) {
        return k + '=' + filters[k]
      })
    }
  }
}
