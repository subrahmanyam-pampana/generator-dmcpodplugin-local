sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(BrowseBase, JSONModel, StatusFormatter, Filter, FilterOperator) {
    "use strict";

    let sSpecificPlant;
    let fnSetODataModelPlantHeader = function(oModel) {
        if (oModel) {
            oModel.mHeaders["x-dme-plant"] = sSpecificPlant;
        }
        return oModel;
    };
    let fnDeleteODataModelPlantHeader = function(oModel) {
        delete oModel.mHeaders["x-dme-plant"];
        sSpecificPlant = null;
    };
    let OperationActivityBrowseType = BrowseBase.extend("sap.dm.dme.browse.OperationActivityBrowse", {

        statusFormatter: StatusFormatter,

        /**
         * @override
         */
        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(this.statusFormatter.getStatusList()), "productStatusItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("operation"),
                version: oBindingContext.getProperty("version")
            };
        },

        /**
         * @override
         */
        onClose: function() {
            if (sSpecificPlant) {
                fnDeleteODataModelPlantHeader(this._oDialog.getModel());
            }
            BrowseBase.prototype.onClose.apply(this, arguments);
        },

        /**
         * @override
         */
        getExternalFilter: function() {
            let sResourceTypeRef = this.byId("resourceTypeFilter").getSelectedKey();
            return this._createFilterByResourceType(sResourceTypeRef);
        },

        _createFilterByResourceType: function(sRef) {
            if (sRef) {
                return new Filter({
                    path: "resourceTypeRef",
                    operator: FilterOperator.EQ,
                    value1: sRef
                });
            }
            return null;
        }
    });

    return {

        /**
         * Used outside DME to open a Browse with a specific plant.
         * @param {string} sPlant: a specific plant for Browse List binding.
         */
        setPlant: function(sPlant) {
            sSpecificPlant = sPlant;
        },

        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {Function} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {Object} oProductModel - should be passed if default model is not demand model.
         * @return {Object} new instance of the Operation Activity Browse
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oProductModel) {
            return new OperationActivityBrowseType("operationActivityBrowse", {
                oModel: sSpecificPlant ? fnSetODataModelPlantHeader(oProductModel) : oProductModel,
                sFragmentName: "sap.dm.dme.browse.view.OperationActivityBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["operation"],
                    oDefaultFilter: "operation ne '_SYSTEM'",
                    sListBindingPath: "/Operations",
                    aVariantFilterInfo: [{
                            sFilterItemName: "operation"
                        },
                        {
                            sFilterItemName: "description"
                        },
                        {
                            sFilterItemName: "status"
                        },
                        {
                            sFilterItemName: "creationTimeRange",
                            sSearchProperty: "createdDateTime"
                        },
                        {
                            sFilterItemName: "currentVersion",
                            oFilterOperator: FilterOperator.Any
                        }
                    ]
                }
            });
        }
    };
});