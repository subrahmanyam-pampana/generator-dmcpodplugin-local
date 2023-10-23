sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.logging.OrderPodClientContext", {

        constructor: function(sWorkCenter, sResource, sMaterial, sOrder) {
            if (!sWorkCenter || !sWorkCenter.trim()) {
                throw Error("Work center must be defined for backend logging.");
            }
            this._workCenter = sWorkCenter;
            this._resource = sResource;
            this._material = sMaterial;
            this._order = sOrder;
        },

        hasResource: function() {
            return !!this._resource;
        },

        hasMaterial: function() {
            return !!this._material;
        },

        hasOrder: function() {
            return !!this._order;
        },

        getKey: function() {
            let sKey = this._workCenter; // Work center is required so it must be defined.
            sKey = this.hasResource() ? sKey + this._resource : sKey;
            sKey = this.hasMaterial() ? sKey + this._material : sKey;
            return this.hasOrder() ? sKey + this._order : sKey;
        }
    });
});