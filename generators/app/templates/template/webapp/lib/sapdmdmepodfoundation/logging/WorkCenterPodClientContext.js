sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.logging.WorkCenterPodClientContext", {

        constructor: function(sWorkCenter, oResource) {
            this._workCenter = sWorkCenter;
            this._resource = oResource ? oResource.resource : null;
        },

        //interface
        getKey: function() {
            return this._resource ? this._workCenter + this._resource : this._workCenter;
        },

        hasResource: function() {
            return !!this._resource;
        }
    });
});