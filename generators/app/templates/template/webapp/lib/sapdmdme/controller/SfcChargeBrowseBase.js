sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(BrowseBase, JSONModel, StatusFormatter, Filter, FilterOperator) {
    "use strict";

    return BrowseBase.extend("sap.dm.dme.browse.SfcChargeBrowseBase", {

        sMaterialRef: null,
        sShopOrderRef: null,
        statusFormatter: StatusFormatter,

        /**
         * @override
         */
        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(this.statusFormatter.getSfcStatusList()), "sfcStatusItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("sfc")
            };
        },

        _processSelectedMaterial: function(oSelectedMaterial) {
            this.byId("materialFilter").setValue(oSelectedMaterial.name);
            this.byId("materialVersionFilter").setValue(oSelectedMaterial.version);
            this.sMaterialRef = oSelectedMaterial.ref;
            this.onFilterBarChange();
        },

        _processSelectedShopOrder: function(oSelectedShopOrder) {
            this.byId("shopOrderFilter").setValue(oSelectedShopOrder.name);
            this.sShopOrderRef = oSelectedShopOrder.ref;
            this.onFilterBarChange();
        },

        onFilterBarClear: function() {
            this.sMaterialRef = null;
            this.sShopOrderRef = null;
            BrowseBase.prototype.onFilterBarClear.apply(this, arguments);
        },

        onMaterialFilterBarChange: function() {
            this.sMaterialRef = null;
            this.onFilterBarChange();
        },

        onShopOrderFilterBarChange: function() {
            this.sShopOrderRef = null;
            this.onFilterBarChange();
        },

        /**
         * @override
         */
        getExternalFilter: function() {
            return [
                this._createExternalFilter(this.sMaterialRef, "materialRef"),
                this._createExternalFilter(this.sShopOrderRef, "shopOrderRef")
            ];
        },

        _createExternalFilter: function(sRef, sPath) {
            if (sRef) {
                return new Filter({
                    path: sPath,
                    operator: FilterOperator.EQ,
                    value1: sRef
                });
            }
            return null;
        }
    });
});