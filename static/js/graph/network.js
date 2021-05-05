const network = {
    template: '<div id="cy" ref="cy"></div>',
    methods: {
        selectElement(data) {
            this.$store.commit('select', data)
        }
    },
    mounted() {
        let self = this
            // initialize cytoscape
        let cy = cytoscape({
            container: this.$refs.cy,
            style: cytostyle
        });

        let allSelected = function(type) {
            if (type == 'node') {
                return cy.nodes().length == cy.nodes(':selected').length;
            } else if (type == 'edge') {
                return cy.edges().length == cy.edges(':selected').length;
            }
            return false;
        }

        let selectAllOfTheSameType = function(type) {
            if (type == 'node') {
                cy.nodes().select();
            } else if (type == 'edge') {
                cy.edges().select();
            }
        };

        let unselectAllOfTheSameType = function(type) {
            if (type == 'node') {
                cy.nodes().unselect();;
            } else if (type == 'edge') {
                cy.edges().unselect();
            }
        };

        let contextMenu = cy.contextMenus({
            submenuIndicator: { src: '../static/js/graph/assets/submenu-indicator-default.svg', width: 12, height: 12 },

            menuItems: [{
                    id: 'node-expander',
                    content: 'expand node',
                    selector: 'node',
                    coreAsWell: true,
                    show: false,
                    onClickFunction: function(e) {
                        self.$store.commit('expandnode', true);
                    }
                },
                {
                    id: 'nodes-expander',
                    content: 'expand nodes',
                    selector: 'node',
                    coreAsWell: true,
                    show: false,
                    onClickFunction: function(e) {
                        self.$store.commit('expandnode', true);
                    }
                },
                {
                    id: 'uncover-donors',
                    content: 'uncover donors',
                    selector: 'node',
                    coreAsWell: true,
                    show: false,
                    onClickFunction: function(e) {
                        self.$store.commit('uncoverdonors', true);
                    }
                },
                {
                    id: 'delete-selected',
                    content: 'delete selected',
                    selector: 'node, edge',
                    show: false,
                    coreAsWell: true,
                    onClickFunction: function(e) {
                        contextMenu.hideMenuItem('delete-selected');
                        self.$store.commit('delete');
                        self.$store.commit('step', 'manipulations');
                        self.$store.commit('flow', 'delete elements');
                        contextMenu.showMenuItem('undo-last-deletion');
                    },
                    hasTrailingDivider: true
                },
                {
                    id: 'undo-last-deletion',
                    content: 'undo last deletion',
                    selector: 'node, edge',
                    show: false,
                    coreAsWell: true,
                    onClickFunction: function(e) {
                        contextMenu.hideMenuItem('delete-selected');
                        contextMenu.hideMenuItem('undo-last-deletion');
                        self.$store.commit('undo', 'delete');
                        self.$store.commit('step', 'manipulations');
                        self.$store.commit('flow', 'undo last deletion');
                    },
                    hasTrailingDivider: true
                },
                {
                    id: 'select-all-nodes',
                    content: 'select all nodes',
                    selector: 'node',
                    coreAsWell: true,
                    show: true,
                    onClickFunction: function(event) {
                        selectAllOfTheSameType('node');
                    }
                },
            ]
        });

        // watch for updates
        this.$store.watch((state) => state.elements, (newElements, oldElements) => {
            self.$store.commit('diff', { newElements: newElements, oldElements: oldElements })
                // style selecting elements
            let styleSelected = function() {
                cy.elements().addClass('faded');
                cy.$(':selected').closedNeighborhood().removeClass('faded').addClass('connected');
                cy.$(':selected').connectedNodes().removeClass('faded').addClass('connected');
                cy.$(':selected').removeClass('faded').removeClass('connected');
            }

            // add new elements
            if (self.$store.state.diff.elementsToAdd.length > 0) {
                cy.elements().lock()
                cy.add(self.$store.state.diff.elementsToAdd)
                if (cy.$(':selected').length > 0) {
                    styleSelected()
                }
                cy.layout({ name: self.$store.state.layout }).run()
                cy.elements().unlock()
            }

            // remove deleted elements
            for (let i = 0; i < self.$store.state.diff.idsToRemove.length; i++) {
                cy.$id(self.$store.state.diff.idsToRemove[i]).unselect().remove()
            }

            // logic for applying styles on select and unselect
            cy.elements().on('select', _.debounce(function(e) {
                styleSelected();
                self.selectElement(cy.$(':selected').jsons());

                // if only nodes are selected then we can expand
                if (self.$store.state.selected.length > 0) {
                    contextMenu.showMenuItem('delete-selected');
                    contextMenu.hideMenuItem('select-all-nodes');
                    contextMenu.showMenuItem('uncover-donors');
                    if (self.$store.getters.type == 'Node') {
                        contextMenu.showMenuItem('node-expander');
                        contextMenu.hideMenuItem('nodes-expander');
                    } else if (self.$store.getters.type == 'Nodes') {
                        contextMenu.showMenuItem('nodes-expander');
                        contextMenu.hideMenuItem('node-expander');
                    } else {
                        contextMenu.hideMenuItem('node-expander');
                        contextMenu.hideMenuItem('nodes-expander');
                    }
                } else {
                    contextMenu.hideMenuItem('delete-selected');
                }
            }, 100));
            cy.elements().on('unselect', _.debounce(function(e) {
                cy.elements().removeClass('faded').removeClass('connected');
                if (cy.$(':selected').length > 0) {
                    styleSelected();
                }
                self.selectElement(cy.$(':selected').jsons());
                contextMenu.hideMenuItem('node-expander');
                contextMenu.hideMenuItem('nodes-expander');
                contextMenu.hideMenuItem('uncover-donors');
                contextMenu.showMenuItem('select-all-nodes');
                contextMenu.hideMenuItem('delete-selected');
            }, 100));
        })
        this.$store.watch((state) => state.filter, (newFilter, oldFilter) => {
            // filter elements when the signal is received
            if (!_.isEmpty(newFilter)) {
                cy.elements().unselect()
                if (this.$store.state.filter.type == 'degree') {
                    cy.nodes(function(n) {
                        return n.degree() < self.$store.state.filter.degree
                    }).select()
                } else if (this.$store.state.filter.type == 'label') {
                    cy.nodes(function(n) {
                        return _.includes(self.$store.state.filter.labels, n.data('label'))
                    }).select()
                }
                this.$store.commit('filter', false)
            }
        }, { deep: true })
        this.$store.watch((state) => state.relayout, (newRelayout, oldRelayout) => {
            // re-run layout when the signal is received
            if (newRelayout == true) {
                cy.layout({ name: self.$store.state.layout }).run()
                this.$store.commit('relayout', false)
            }
        })
        this.$store.watch((state) => state.fit, (newFit, oldFit) => {
            // fit all elements into the viewport when the signal is received
            if (newFit == true) {
                cy.fit(padding = 30)
                this.$store.commit('fit', false)
            }
        })
        this.$store.watch((state) => state.png, (newPNG, oldPNG) => {
            // export viewport as png when the signal is received
            if (newPNG == true) {
                data = cy.png({ output: 'blob' })
                file = new Blob([data], { type: 'image/png' })
                saveAs(file, 'viewport.png');
                this.$store.commit('png', false)
            }
        })
        this.$store.watch((state) => state.json, (newJSON, oldJSON) => {
            // export graph as json when the signal is received
            if (newJSON == true) {
                DOWNLOAD(cy.json().elements, 'json', 'graph')
                this.$store.commit('json', false)
            }
        })
    }
}

const cytostyle = [{
    'selector': 'core',
    'style': {
        'selection-box-color': '#eee',
        'selection-box-border-color': '#ccc',
        'selection-box-opacity': '0.2'
    }
}, {
    'selector': 'node',
    'style': {
        'font-size': '3px',
        'color': '#fff',
        'text-wrap': 'ellipsis',
        'text-max-width': '50px',
        'text-valign': 'center',
        'text-halign': 'center',
        'background-color': '#999',
        'width': '20px',
        'height': '20px',
        'border-color': '#555',
        'border-opacity': '0',
        'overlay-padding': '2px',
        'z-index': '10',
        'text-outline-color': 'black',
        'text-outline-width': '0.15px'
    }
}, {
    'selector': 'node[label=\'Candidate\']',
    'style': {
        'content': 'data(properties.cand_name)',
        'background-color': "#005bae",
        'border-color': '#005bae'
    }
}, {
    'selector': 'node[label=\'Committee\']',
    'style': {
        'content': 'data(properties.cmte_nm)',
        'background-color': '#282252',
        'border-color': '#282252'
    }
}, {
    'selector': 'node[label=\'Donor\']',
    'style': {
        'content': 'data(properties.name)',
        'background-color': '#5C268E',
        'border-color': '#5C268E'
    }
}, {
    'selector': 'node[label=\'Employer\']',
    'style': {
        'content': 'data(properties.name)',
        'background-color': '#eb5581',
        'border-color': '#eb5581'
    }
}, {
    'selector': 'node[label=\'Job\']',
    'style': {
        'content': 'data(properties.name)',
        'background-color': '#D0021B',
        'border-color': '#D0021B'
    }
}, {
    'selector': 'node[label=\'Contribution\']',
    'style': {
        'content': function(ele) { return '$' + ele.data('properties').transaction_amt.toLocaleString('en') },
        'background-color': '#f37b3c',
        'border-color': '#f37b3c'
    }
}, {
    'selector': 'node[label=\'Expenditure\']',
    'style': {
        'content': function(ele) { return '$' + ele.data('properties').exp_amt.toLocaleString('en') },
        'background-color': '#e9c464',
        'border-color': '#e9c464'
    }
}, {
    'selector': 'node[label=\'Payee\']',
    'style': {
        'content': 'data(properties.name)',
        'background-color': '#357045',
        'border-color': '#357045'
    }
}, {
    'selector': 'node[label=\'Party\']',
    'style': {
        'content': 'data(properties.abbreviation)',
        'background-color': '#54B59F',
        'border-color': '#54B59F'
    }
}, {
    'selector': 'node[label=\'Race\']',
    'style': {
        'content': 'data(properties.office)',
        'background-color': '#78CADB',
        'border-color': '#78CADB'
    }
}, {
    'selector': 'node[label=\'Tweeter\']',
    'style': {
        'content': 'data(properties.screen_name)',
        'background-color': '#4b5b82',
        'border-color': '#4b5b82'
    }
}, {
    'selector': 'node[label=\'Tweet\']',
    'style': {
        'content': 'data(properties.tweet_id)',
        'background-color': '#2a2831',
        'border-color': '#2a2831'
    }
}, {
    'selector': 'node[label=\'Retweet\']',
    'style': {
        'content': 'data(properties.datetime)',
        'background-color': '#55356e',
        'border-color': '#55356e'
    }
}, {
    'selector': 'node[label=\'Hashtag\']',
    'style': {
        'content': 'data(properties.text)',
        'background-color': '#c57385',
        'border-color': '#c57385'
    }
}, {
    'selector': 'node[label=\'Link\']',
    'style': {
        'content': 'data(properties.url)',
        'background-color': '#b43f34',
        'border-color': '#b43f34'
    }
}, {
    'selector': 'node[label=\'Domain\']',
    'style': {
        'content': 'data(properties.host)',
        'background-color': '#d78a64',
        'border-color': '#d78a64'
    }
}, {
    'selector': 'node[label=\'Source\']',
    'style': {
        'content': 'data(properties.domain)',
        'background-color': '#dbc699',
        'border-color': '#dbc699'
    }
}, {
    'selector': 'node[label=\'Ad\']',
    'style': {
        'content': 'data(properties.uuid)',
        'background-color': '#5b675d',
        'border-color': '#5b675d'
    }
}, {
    'selector': 'node[label=\'Message\']',
    'style': {
        'content': 'data(properties.simhash)',
        'background-color': '#97a8a3',
        'border-color': '#97a8a3'
    }
}, {
    'selector': 'node[label=\'Buyer\']',
    'style': {
        'content': 'data(properties.name)',
        'background-color': '#bebebe',
        'border-color': '#bebebe'
    }
}, {
    'selector': 'node[label=\'Page\']',
    'style': {
        'content': 'data(properties.name)',
        'background-color': '#002167',
        'border-color': '#002167'
    }
}, {
    'selector': 'node[label=\'Bill\']',
    'style': {
        'content': 'data(properties.name)',
        'background-color': '#000019',
        'border-color': '#000019'
    }
}, {
    'selector': 'node[label=\'Vote\']',
    'style': {
        'content': 'data(properties.name)',
        'background-color': '#16004a',
        'border-color': '#16004a'
    }
}, {
    'selector': 'node[label=\'Jurisdiction\']',
    'style': {
        'content': 'data(properties.name)',
        'background-color': '#990040',
        'border-color': '#990040'
    }
}, {
    'selector': 'node[label=\'Member\']',
    'style': {
        'content': 'data(properties.name)',
        'background-color': '#7b0000',
        'border-color': '#7b0000'
    }
}, {
    'selector': 'node[label=\'Zip\']',
    'style': {
        'content': 'data(properties.zip_code)',
        'background-color': '#9f3500',
        'border-color': '#9f3500'
    }
}, {
    'selector': 'node[label=\'State\']',
    'style': {
        'content': 'data(properties.abbreviation)',
        'background-color': '#9a7d1d',
        'border-color': '#9a7d1d'
    }
}, {
    'selector': 'node[label=\'Year\']',
    'style': {
        'content': 'data(properties.year)',
        'background-color': '#002f09',
        'border-color': '#002f09'
    }
}, {
    'selector': 'node[label=\'Month\']',
    'style': {
        'content': 'data(properties.month)',
        'background-color': '#006e5b',
        'border-color': '#006e5b'
    }
}, {
    'selector': 'node[label=\'Day\']',
    'style': {
        'content': 'data(properties.date)',
        'background-color': '#278292',
        'border-color': '#278292'
    }
}, {
    'selector': 'node:selected',
    'style': {
        'border-width': '5px',
        'border-opacity': '0.8'
    }
}, {
    'selector': 'node.faded',
    'style': {
        'background-color': '#eee'
    }
}, {
    'selector': 'node.connected',
    'style': {
        'background-opacity': '0.4'
    }
}, {
    'selector': 'edge',
    'style': {
        'label': 'data(type)',
        'font-size': '3px',
        'color': '#333',
        'text-rotation': 'autorotate',
        'line-color': '#bcbcbc',
        'width': '2px',
        'curve-style': 'straight',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': '#bcbcbc',
        'arrow-scale': 0.5,
        'overlay-padding': '2px'
    }
}, {
    'selector': 'edge[type=\'related_to\']',
    'style': {
        'target-arrow-shape': 'none'
    }
}, {
    'selector': 'edge:selected',
    'style': {
        'target-arrow-color': '#333',
        'line-color': '#333',
        'color': '#fff'
    }
}, {
    'selector': 'edge.faded',
    'style': {
        'target-arrow-color': '#eee',
        'line-color': '#eee',
        'color': '#ccc'
    }
}]