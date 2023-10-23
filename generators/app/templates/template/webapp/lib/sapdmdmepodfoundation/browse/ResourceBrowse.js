sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/dm/dme/podfoundation/formatter/BrowseFormatter"
], function(BrowseBase, JSONModel, Filter, FilterOperator, Formatter) {
    "use strict";

    let ResourceBrowseType = BrowseBase.extend("sap.dm.dme.podfoundation.browse.ResourceBrowse", {
        formatter: Formatter,

        /**
         * @override
         */
        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(Formatter.getResourceStatusList()), "statusItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext, oClickedListItem) {
            let oCurrentBindingContext = oClickedListItem.getBindingContext("plant");
            return {
                ref: oCurrentBindingContext.getProperty("ref"),
                name: oCurrentBindingContext.getProperty("resource")
            };
        },

        /**
         * @override
         */
        getExternalFilter: function() {
            let sName = this.byId("resourceTypeFilter").getValue();
            return this._createFilterByResourceType(sName);
        },

        _createFilterByResourceType: function(sName) {
            if (!sName) {
                return null;
            }

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
        },

        getResourceTypesAsText: function(sRef) {
            let aItems = this.byId("resultTable").getItems();
            let aResourceTypes = null;
            let aResult;

            aItems.some(function(oItem) {
                if (oItem.getBindingContext("plant").getProperty("ref") === sRef) {
                    aResourceTypes = oItem.getBindingContext("plant").getObject("resourceTypeResources");
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
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param fnSelectionCallback - callback function called when user selects item in a list.
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback) {
            return new ResourceBrowseType("resourceBrowse", {
                sFragmentName: "sap.dm.dme.podfoundation.browse.view.ResourceBrowse",
                oParentControl: oParentControl,
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
    }
});