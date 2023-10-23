sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/dm/dme/browse/MaterialBrowse"
], function(BrowseBase, MaterialBrowse) {
    "use strict";

    let oModelForMaterial;
    let BatchesBrowseType = BrowseBase.extend("sap.dm.dme.browse.BatchesBrowse", {
        sMaterial: null,

        onMaterialBrowse: function(oEvent) {
            let sValue = oEvent.getSource().getValue();
            MaterialBrowse.open(this.getDialog(), sValue, function(oSelectedObject) {
                this.byId("materialFilter").setValue(oSelectedObject.name);
                this.sMaterial = oSelectedObject.name;
                this.onFilterBarChange();
            }.bind(this), oModelForMaterial);
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("batchNumber")
            };
        },

        onFilterBarClear: function() {
            BrowseBase.prototype.onFilterBarClear.apply(this, arguments);
            this._clearMaterial();
        },

        onMaterialFilterBarChange: function() {
            this._clearMaterial();
            this.onFilterBarChange();
        },

        /**
         * @override
         */
        getExternalFilter: function() {
            return this._createFilterByMaterial(this.sMaterial);
        },

        _createFilterByMaterial: function(sValue) {
            if (sValue) {
                return new sap.ui.model.Filter({
                    path: "material",
                    operator: sap.ui.model.FilterOperator.EQ,
                    value1: sValue
                });
            }
            return null;
        },

        _clearMaterial: function() {
            this.sMaterial = null;
        }
    });

    return {
        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {Function} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {Object} oInventoryModel - should be passed if default model is not product model.
         * @param {Object} oProductModel - should be passed if default model is not product model.
         * @return {Object} new instance of the Batches Browse
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oInventoryModel, oProductModel) {
            oModelForMaterial = oProductModel;
            return new BatchesBrowseType("batchesBrowse", {
                oModel: oInventoryModel,
                sFragmentName: "sap.dm.dme.browse.view.BatchesBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["batchNumber"],
                    sListBindingPath: "/Batches"
                }
            });
        }
    };
});