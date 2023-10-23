sap.ui.define([
    "sap/suite/ui/commons/networkgraph/Graph"
], function(Graph) {
    "use strict";

    return Graph.extend("sap.dm.dme.control.networkgraph.DroppableGraph", {
        metadata: {
            dnd: {
                draggable: false,
                droppable: true
            },

            aggregations: {
                /**
                 * Holds the lines to be displayed in the graph.
                 */
                lines: {
                    type: "sap.suite.ui.commons.networkgraph.Line",
                    multiple: true,
                    singularName: "line"
                },
                /**
                 * Holds the nodes to be displayed in the graph.
                 */
                nodes: {
                    type: "sap.suite.ui.commons.networkgraph.Node",
                    multiple: true,
                    singularName: "node"
                },
                /**
                 * Holds a list of groups used in the graph.
                 */
                groups: {
                    type: "sap.suite.ui.commons.networkgraph.Group",
                    multiple: true,
                    singularName: "group"
                },

                /**
                 * Holds a collection of custom statuses that can be used to assign custom colors to nodes, lines,
                 * and groups of nodes, based on their status.
                 */
                statuses: {
                    type: "sap.suite.ui.commons.networkgraph.Status",
                    multiple: true,
                    singularName: "status"
                },

                dragDropConfig: {
                    name: "dragDropConfig",
                    type: "sap.ui.core.dnd.DragDropBase",
                    multiple: true,
                    singularName: "dragDropConfig"
                }
            }
        },
        renderer: {}
    });
});