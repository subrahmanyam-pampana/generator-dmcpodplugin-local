sap.ui.define([
    "sap/dm/dme/controller/RelatedObject.controller",
    "sap/dm/dme/message/ErrorHandler"
], function(RelatedObjectController, ErrorHandler) {
    "use strict";

    return RelatedObjectController.extend("sap.dm.dme.controller.RoutingRelatedObject", {

        /**
         * Overidden
         */
        _clearObjectVersion: function() {
            RelatedObjectController.prototype._clearObjectVersion.apply(this, arguments);
            // cleaning-up the "activityId" field
            this._clearActivityId();
        },

        _clearActivityId: function(oObject) {
            if (typeof this._oSettings.oActivityIdClear === "function") {
                this._oSettings.oActivityIdClear();
            }
        }

    });
}, true);