sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/dm/dme/formatter/StatusFormatter"
], function(BrowseBase, JSONModel, Filter, FilterOperator, StatusFormatter) {
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
    let ResourceBrowseType = BrowseBase.extend("sap.dm.dme.browse.ResourceBrowse", {

        statusFormatter: StatusFormatter,

        /**
         * @override
         */
        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(StatusFormatter.getResourceStatusList()), "statusItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("resource")
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
            let sName = this.byId("resourceTypeFilter").getValue();
            return this._createFilterByResourceType(sName);
        },

        _createFilterByResourceType: function(sName) {
            if (sName) {
                return new Filter({
                    path: "resourceTypeResources",
                    operator: FilterOperator.Any,
                    variable: "item",
                    condition: new Filter({
                        path: "item/resourceType/resourceType",
                        operator: FilterOperator.StartsWith,
                        value1: sName
                    })
                });
            }
        },

        /**
         * Returns resource type as text.
         * @param {String} sRef The resource type reference.
         * @return {String} The resource type.
         */
        getResourceTypesAsText: function(sRef) {
            let aItems = this.byId("resultTable").getItems();
            let aResourceTypes = null;
            let aResult;

            aItems.some(function(oItem) {
                if (oItem.getBindingContext().getProperty("ref") === sRef) {
                    aResourceTypes = oItem.getBindingContext().getObject("resourceTypeResources");
                }
                return aResourceTypes !== null;
            });

            aResourceTypes = aResourceTypes || [];
            aResult = aResourceTypes.map(function(oResourceType) {
                return oResourceType.resourceType.resourceType;
            });

            return aResult.join(", ");
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
         * @param {function} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {Object} oModel - should be passed if default model is not a resorce model.
         * @returns {Object} new instance of the Resource Browse used to access Browse instance
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oModel) {
            return new ResourceBrowseType("resourceBrowse", {
                sFragmentName: "sap.dm.dme.browse.view.ResourceBrowse",
                oParentControl: oParentControl,
                oModel: sSpecificPlant ? fnSetODataModelPlantHeader(oModel) : oModel,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["resource", "description"],
                    sListBindingPath: "/Resources",
                    aVariantFilterInfo: [{
                            sFilterItemName: "resource"
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
                        }
                    ]
                }
            });
        }
    };
});