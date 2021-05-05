/* Data Store */

const store = new Vuex.Store({
    state: {
        step: 'intro',
        flow: null,
        advanced: false,
        loading: false,
        loaded: false,
        waiting: false,
        error: false,
        tab: 'details',
        elements: [],
        selected: [],
        lastaction: null,
        diff: {
            oldElementIds: [],
            newElementIds: [],
            idsToAdd: [],
            idsToRemove: [],
            elementsToAdd: [],
            elementsToRemove: []
        },
        filter: {},
        layout: 'cose',
        relayout: false,
        fit: false,
        png: false,
        json: false,
        viewkey: false,
        runphysics: false,
        expandnode: false,
        smartselect: false,
        uncoverdonors: false,
        showlink: false
    },
    getters: {
        type: (state) => {
            if (state.selected.length > 0) {
                groups = _.uniq(_.map(state.selected, 'group'))
                if (groups.length == 1) {
                    let type = groups[0].slice(0, -1)
                    type = type.charAt(0).toUpperCase() + type.substring(1);
                    if (state.selected.length > 1) {
                        type = type + 's'
                    }
                    return type;
                }
            }
            return 'Elements'
        },
        label: (state) => {
            return _.uniq(_.map(state.selected, 'data.label'))
        },
        dataelements: (state) => {
            let eles = _.cloneDeep(state.elements)
            return _.map(eles, function(ele) {
                return ele.data
            })
        },
        flatelements: (state) => {
            let eles = _.cloneDeep(state.elements)
            return _.map(eles, function(ele) {
                return _.omit(_.merge(ele.data.properties, ele.data), 'properties')
            })
        },
        flatselected: (state) => {
            let eles = _.cloneDeep(state.selected)
            return _.map(eles, function(ele) {
                return _.omit(_.merge(ele.data.properties, ele.data), 'properties')
            })
        },
        graphstring: (state, getters) => {
            let nodes = _.compact(_.map(_.filter(getters.flatelements, { element: 'node' }), 'uuid'))
            let edges = _.compact(_.map(_.filter(getters.flatelements, { element: 'edge' }), 'uuid'))
            let graphstring = ""
            if (nodes.length > 0) {
                graphstring += "&nodes="
                graphstring += _.join(nodes, ',')
            }
            if (edges.length > 0) {
                graphstring += "&edges="
                graphstring += _.join(edges, ',')
            }
            return graphstring
        },
        hasedge: (state, getters) => {
            // checks if 2 nodes are connected by an edge
            if (state.selected.length == 2 && getters.type == 'Nodes') {
                let ids = _.map(state.selected, 'data.id')
                let connections = _.uniq(_.map(state.elements, function(ele) {
                    if (ele.data.source == ids[0]) { return ele.data.target } else if (ele.data.target == ids[0]) { return ele.data.source }
                    return false
                }))
                return _.includes(connections, ids[1])
            }
            return false
        },
        stats: (state, getters) => {
            // helper functions to create each stat
            let makehistogram = function(elements, key) {
                let c = {
                    label: key,
                    type: 'histogram',
                    statdata: {
                        labels: [],
                        values: []
                    }
                }
                _.forEach(elements, function(i) {
                    c.statdata.labels.push(i.value)
                    c.statdata.values.push(i.count)
                })
                return c
            }
            let makestackbar = function(elements, key) {
                    let total = _.sum(_.map(elements, 'count'))
                    let c = {
                        label: key,
                        type: 'stackbar',
                        statdata: {
                            pairs: []
                        }
                    }
                    _.forEach(elements, function(i) {
                        c.statdata.pairs.push({
                            label: i.value,
                            value: Math.round(i.count / total * 100)
                        })
                    })
                    return c
                }
                // helper function to transform keys and values
            let makevalues = function(elements) {
                    let keys = _.without(_.uniq(_.flatMap(elements, function(ele) { return _.keys(ele) })), 'element', 'id', 'source', 'target')
                    let values = _.map(keys, function(k) {
                        return {
                            key: k,
                            values: _.map(_.countBy(elements, k), function(count, value) {
                                return { value: value, count: count }
                            })
                        }
                    })
                    return values
                }
                // helper function to create the stats
            let makestats = function(elements) {
                let stats = []
                _.forEach(makevalues(elements), function(obj) {
                    let v = _.sortBy(_.filter(obj.values, function(o) { return (o.value != 'undefined' && !_.isEmpty(o.value)) }), 'value')
                    if ((v.length > 0 && v.length <= 8 && obj.key != 'datetime') || (obj.key == 'type' || obj.key == 'labels')) {
                        stats.push(makestackbar(v, obj.key))
                    } else if (obj.key == 'datetime' || (_.sum(_.map(v, 'value')) > 0 && _.max(_.map(v, 'count')) > 1)) {
                        stats.push(makehistogram(v, obj.key))
                    }
                })
                return stats
            }
            let nodes = _.filter(getters.flatelements, { element: 'node' })
            let edges = _.filter(getters.flatelements, { element: 'edge' })
            return [{
                label: 'nodes',
                count: _.size(nodes),
                stats: makestats(nodes)
            }, {
                label: 'edges',
                count: _.size(edges),
                stats: makestats(edges)
            }]
        }
    },
    mutations: {
        step(state, payload) {
            state.step = payload
        },
        flow(state, payload) {
            state.flow = payload
        },
        advanced(state, payload) {
            state.advanced = payload
        },
        loading(state, payload) {
            state.loading = payload
        },
        loaded(state, payload) {
            state.loaded = payload
        },
        waiting(state, payload) {
            state.waiting = payload
        },
        error(state, payload) {
            state.error = payload
        },
        tab(state, payload) {
            state.tab = payload
        },
        add(state, payload) {
            state.elements = _.concat(state.elements, payload)
            state.lastaction = 'add'
        },
        delete(state) {
            if (state.selected.length > 0) {
                selectedIds = _.map(state.selected, 'data.id')
                state.elements = _.filter(state.elements, function(ele) {
                    return (_.includes(selectedIds, ele.data.id) == false &&
                        _.includes(selectedIds, ele.data.source) == false &&
                        _.includes(selectedIds, ele.data.target) == false)
                })
                state.lastaction = 'delete'
            }
        },
        undo(state, payload) {
            if (payload == 'add') {
                addedIds = _.map(state.diff.elementsToAdd, 'data.id')
                state.elements = _.filter(state.elements, function(ele) {
                    return (_.includes(addedIds, ele.data.id) == false &&
                        _.includes(addedIds, ele.data.source) == false &&
                        _.includes(addedIds, ele.data.target) == false)
                })
                state.lastaction = 'delete'
            } else if (payload == 'delete') {
                state.elements = _.concat(state.elements, state.diff.elementsToRemove)
                state.lastaction = 'add'
            }
        },
        diff(state, payload) {
            oldElementIds = _.map(payload.oldElements, 'data.id')
            newElementIds = _.map(payload.newElements, 'data.id')
            idsToAdd = _.difference(newElementIds, oldElementIds)
            idsToRemove = _.difference(oldElementIds, newElementIds)
            elementsToAdd = _.filter(payload.newElements, function(ele) {
                return _.includes(idsToAdd, ele.data.id)
            })
            elementsToRemove = _.filter(payload.oldElements, function(ele) {
                return _.includes(idsToRemove, ele.data.id)
            })
            state.diff = {
                oldElementIds: oldElementIds,
                newElementIds: newElementIds,
                idsToAdd: idsToAdd,
                idsToRemove: idsToRemove,
                elementsToAdd: elementsToAdd,
                elementsToRemove: elementsToRemove
            }
        },
        clear(state) {
            state.elements = []
        },
        select(state, payload) {
            state.selected = payload
        },
        filter(state, payload) {
            state.filter = payload
        },
        layout(state, payload) {
            state.layout = payload
        },
        relayout(state, payload) {
            state.relayout = payload
        },
        fit(state, payload) {
            state.fit = payload
        },
        png(state, payload) {
            state.png = payload
        },
        json(state, payload) {
            state.json = payload
        },
        viewkey(state, payload) {
            state.viewkey = payload
        },
        runphysics(state, payload) {
            state.runphysics = payload
        },
        expandnode(state, payload) {
            state.expandnode = payload
        },
        uncoverdonors(state, payload) {
            state.uncoverdonors = payload
        },
        smartselect(state, payload) {
            state.smartselect = payload
        },
        showlink(state, payload) {
            state.showlink = payload
        }
    }
})

/* Helper Functions */

const mapLabels = function(payload) {
    let labels = _.keys(_.pickBy(payload, _.identity));
    return _.map(labels, function(x) { return _.startCase(x) });
}

const addData = function(payload) {
    axios.post('/api/graph/', payload)
        .then(function(response) {
            store.commit('add', response.data)
            store.commit('waiting', false)
            store.commit('error', false)
            store.commit('loaded', true)
        })
        .catch(function(error) {
            console.error(error)
            store.commit('waiting', false)
            store.commit('error', true)
        })
}

/* Initialize Components */

new Vue({
    el: '#main-sidebar',
    store,
    components: {
        'network': network
    }
})

new Vue({
    el: '#box',
    store,
    components: {
        'tabs': box.tabs,
        'tab': box.tab,
        'histogram-stat': stat.histogram,
        'stackbar-stat': stat.stackbar
    },
    data: {
        stats: [],
        numnodes: 0,
        numedges: 0
    },
    mounted() {
        this.$store.watch((state) => state.elements, () => {
            this.stats = this.$store.getters.stats
            this.numnodes = _.filter(this.stats, { label: 'nodes' })[0].count,
                this.numedges = _.filter(this.stats, { label: 'edges' })[0].count
        })
    }
})

new Vue({
    el: '#sidebar',
    components: {
        'datepicker': vuejsDatepicker,
        'toggle': toggle,
        'typeahead': typeahead
    },
    data: {
        disabledDates: DATERANGES.disabledDates.fec,
        search: {
            candidates: {
                cand_name: '',
                cand_pty_affiliation: 'all',
                cand_office: 'all',
                cand_office_st: 'all',
                cand_office_district: 'all',
                cand_election_yr: 'all',
                cand_ici: 'all'
            },
            committees: {
                cmte_nm: '',
                cmte_pty_affiliation: 'all',
                cmte_dsgn: 'all',
                cmte_tp: 'all'
            },
            donors: {
                name: '',
                employer: '',
                occupation: '',
                state: 'all',
                zip_code: '',
                entity_tp: 'all'
            },
            payees: {
                name: ''
            },
            sources: {
                domain: '',
                bias_score: {
                    liberal: true,
                    left: true,
                    moderate: true,
                    right: true,
                    conservative: true
                },
                factually_questionable_flag: false,
                conspiracy_flag: false,
                hate_group_flag: false,
                propaganda_flag: false,
                satire_flag: false
            },
            buyers: {
                name: ''
            },
            pages: {
                name: ''
            },
            tweeters: {
                screen_name: ''
            },
            dates: DATERANGES.dates.fec,
            pagination: {
                limit: 30,
                page: 1
            },
            options: {
                context: true
            }
        }
    },
    methods: {
        submit() {
            store.commit('waiting', true)
            store.commit('error', false)
            addData({
                type: 'search',
                flow: store.state.flow,
                parameters: this.search[store.state.flow],
                dates: {
                    min: moment(this.search.dates.min, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD'),
                    max: moment(this.search.dates.max, 'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD')
                },
                pagination: this.search.pagination,
                options: this.search.options
            })
            store.commit('step', 'results')
        }
    }
})

/* Initialize Modals */

new Vue({
    el: '#viewkey',
    components: {
        'modal': modal
    },
    methods: {
        cancel() {
            store.commit('viewkey', false)
        }
    }
})

new Vue({
    el: '#runphysics',
    store,
    components: {
        'modal': modal
    },
    data: {
        layout: store.state.layout
    },
    methods: {
        cancel() {
            store.commit('runphysics', false)
        },
        submit() {
            store.commit('layout', this.layout);
            store.commit('relayout', true);
            this.cancel()
        }
    }
})

new Vue({
    el: '#expandnode',
    components: {
        'modal': modal,
        'toggle': toggle
    },
    data: {
        labels: {
            candidate: true,
            committee: true,
            donor: true,
            employer: true,
            job: true,
            contribution: true,
            expenditure: true,
            payee: true,
            party: true,
            race: true,
            tweeter: true,
            tweet: true,
            retweet: true,
            hashtag: true,
            link: true,
            domain: true,
            source: true,
            ad: true,
            message: true,
            buyer: true,
            page: true,
            bill: false,
            vote: false,
            jurisdiction: false,
            member: false,
            zip: true,
            state: true,
            year: true,
            month: true,
            day: true
        },
        pagination: {
            limit: 30,
            page: 1
        }
    },
    methods: {
        all(value) {
            var self = this
            _.forEach(_.keys(this.labels), function(k) {
                self.labels[k] = value
            })
        },
        cancel() {
            store.commit('expandnode', false)
        },
        submit() {
            store.commit('waiting', true)
            store.commit('error', false)
            addData({
                type: 'expandnode',
                labels: mapLabels(self.labels),
                ids: _.map(store.state.selected, 'data.id'),
                pagination: this.pagination
            })
            store.commit('step', 'actions')
            store.commit('flow', 'expand node')
            this.cancel()
        }
    }
})

new Vue({
    el: '#uncoverdonors',
    components: {
        'modal': modal,
        'toggle': toggle
    },
    data: {
        labels: {
            committee: true,
            donor: true,
            employer: true
        },
        minTransactionAmt: 5000,
        limit: 1000
    },
    methods: {
        all(value) {
            var self = this
            _.forEach(_.keys(this.labels), function(k) {
                self.labels[k] = value
            })
        },
        cancel() {
            store.commit('uncoverdonors', false)
        },
        submit() {
            store.commit('waiting', true)
            store.commit('error', false)
            addData({
                type: 'uncoverdonors',
                labels: mapLabels(this.labels),
                ids: _.map(store.state.selected, 'data.id'),
                minTransactionAmt: this.minTransactionAmt,
                limit: this.limit
            })
            store.commit('step', 'actions')
            store.commit('flow', 'uncover donors')
            this.cancel()
        }
    }
})

new Vue({
    el: '#smartselect',
    components: {
        'modal': modal,
        'toggle': toggle
    },
    data: {
        filter: {
            type: 'degree',
            degree: 2,
            labels: {
                candidate: false,
                committee: true,
                donor: false,
                employer: false,
                job: false,
                contribution: false,
                expenditure: false,
                payee: false,
                party: false,
                race: false,
                tweeter: false,
                tweet: false,
                retweet: false,
                hashtag: false,
                link: false,
                domain: false,
                source: false,
                ad: false,
                message: false,
                buyer: false,
                page: false,
                bill: false,
                vote: false,
                jurisdiction: false,
                member: false,
                zip: false,
                state: false,
                year: false,
                month: false,
                day: false
            },
        }
    },
    methods: {
        all(value) {
            var self = this
            _.forEach(_.keys(this.filter.labels), function(k) {
                self.filter.labels[k] = value
            })
        },
        cancel() {
            store.commit('smartselect', false)
        },
        submit() {
            let filter = _.clone(this.filter)
            filter.labels = mapLabels(filter.labels)
            store.commit('filter', filter)
            store.commit('step', 'manipulations')
            store.commit('flow', 'smart select')
            this.cancel()
        }
    }
})

new Vue({
    el: '#showlink',
    store,
    components: {
        'modal': modal
    },
    data: {
        link: ROOTURL + "/graph/"
    },
    mounted() {
        this.$store.watch((state) => state.elements, () => {
            this.link = ROOTURL + "/graph/"
            let querystring = this.$store.getters.graphstring
            if (querystring.length > 0) {
                querystring = querystring.replace("&", "?")
                this.link += querystring
            }
        })
    },
    methods: {
        cancel() {
            store.commit('showlink', false)
        }
    }
})

/* Handle Routing */

const router = new VueRouter({
    mode: 'history',
    routes: []
})

new Vue({
    router,
    store,
    el: '#router',
    mounted() {
        let nodes = this.$route.query.nodes
        let edges = this.$route.query.edges
        if (!_.isUndefined(nodes) || !_.isUndefined(edges)) {
            store.commit('loading', true)
            addData({ type: 'ids', nodes: nodes, edges: edges })
            store.commit('step', 'start')
        }
    },
});

/* Loading Screen */
new Vue({
    store,
    el: '#loading'
});