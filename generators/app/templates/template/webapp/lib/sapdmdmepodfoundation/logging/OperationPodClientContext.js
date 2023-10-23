sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.logging.OperationPodClientContext", {

        constructor: function(sOperationActivity, sResource) {
            this._operationActivity = sOperationActivity;
            this._resource = sResource;
        },

        getKey: function() {
            return this._operationActivity + this._resource;
        }
    });
});