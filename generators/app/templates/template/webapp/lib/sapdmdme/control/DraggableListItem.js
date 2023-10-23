sap.ui.define([
    "jquery.sap.global",
    "sap/m/StandardListItem"
], function(jQuery, StandardListItem) {
    "use strict";

    let DraggableListItem = StandardListItem.extend("sap.dm.dme.control.DraggableListItem", {
        metadata: {
            events: {
                dragStart: {
                    parameters: {
                        oevent: {
                            type: "object"
                        }
                    }
                }
            }
        },

        constructor: function(sId, mSettings) {
            StandardListItem.apply(this, arguments);
        },

        renderer: {},

        onAfterRendering: function() {
            if (StandardListItem.prototype.onAfterRendering) {
                StandardListItem.prototype.onAfterRendering.apply(this, arguments);
            }
            let sId = this.getId();
            let oSelection = jQuery("#" + sId)[0];

            // remove any previous definitions
            oSelection.ondragstart = null;

            let that = this;
            oSelection.draggable = true;
            oSelection.ondragstart = function(oEvent) {
                that._handleDragStart(oEvent);
            };
            oSelection.style.webkitUserDrag = "element";
        },

        _handleDragStart: function(oEvent) {
            this.fireDragStart(oEvent);
        }
    });

    return DraggableListItem;
});