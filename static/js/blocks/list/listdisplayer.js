const listdisplayer = {
  template: `
    <ul class="list-none text-xs leading-normal" v-if="!_.isEmpty(list)">
      <li v-if="!_.includes(hide, 'visibility')"><strong>Visibility:</strong> {{list.visibility}}</li>
      <li v-if="!_.includes(hide, 'type')"><strong>Type:</strong> {{list.type}}</li>
      <li v-if="!_.includes(hide, 'id')"><strong>ID:</strong>{{list.id}}</li>
      <li v-if="!_.includes(hide, 'name')"><strong>Name:</strong> {{list.name}}</li>
      <li v-if="!_.includes(hide, 'description')"><strong>Description:</strong> {{list.description}}</li>
      <li v-if="!_.includes(hide, 'last_updated')"><strong>Last Updated:</strong> {{moment(list.last_updated).local()}}</li>
      <li v-if="!_.includes(hide, 'created_at')"><strong>Created at:</strong> {{moment(list.created_at).local()}}</li>
      <li v-if="!_.includes(hide, 'created_by') && !_.isNil(list.created_by)"><strong>Created by:</strong> <a :href="'/user/' + list.created_by + '/?mode=popup'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-user-' + _.uniqueId(), ratio, window)">{{list.created_by}}</a></li>
      <li v-if="!_.includes(hide, 'cloned_from') && !_.isNil(list.cloned_from)"><strong>Cloned from:</strong> <a :href="'/view/list/?id=' + list.cloned_from + '&mode=popup'" v-on:click.prevent="POPUP(event.currentTarget.href, 'popup-view-list-' + _.uniqueId(), ratio, window)">{{list.cloned_from}}</a></li>
      <li v-if="!_.includes(hide, 'include.terms') && !_.isEmpty(list.include.terms)"><strong>Included Terms:</strong> {{list.include.terms.join(', ')}}</li>
      <li v-if="!_.includes(hide, 'include.ids') && !_.isEmpty(list.include.ids)"><strong>Included IDs:</strong> {{list.include.ids.join(', ')}}</li>
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
  }
}
