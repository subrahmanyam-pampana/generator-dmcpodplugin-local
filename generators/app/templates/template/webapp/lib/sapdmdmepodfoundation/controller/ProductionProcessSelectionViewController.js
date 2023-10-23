sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function(Controller, Filter, FilterOperator) {
    "use strict";

    var ProductionProcessSelectionViewController = Controller.extend("sap.dm.dme.podfoundation.controller.ProductionProcessSelectionViewController", {

        onProductionProcessSelectionSearch: function(oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("name", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);

            return oFilter;
        },

    });

    return ProductionProcessSelectionViewController;
});