sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("sap.dm.dme.controller.App", {

        onInit: function() {
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
    });
});