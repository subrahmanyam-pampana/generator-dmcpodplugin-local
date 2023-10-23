sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function(Controller, Filter, FilterOperator) {
    "use strict";

    var SinglePluginSelectionViewController = Controller.extend("sap.dm.dme.podfoundation.controller.SinglePluginSelectionViewController", {

        config: {
            initialRank: 0,
            defaultRank: 10240
        },

        onSinglePluginSelectionSearch: function(oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("title", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);

            return oFilter;
        },

    });

    return SinglePluginSelectionViewController;
});