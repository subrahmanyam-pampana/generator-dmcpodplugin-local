sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/dm/dme/podfoundation/formatter/BrowseFormatter",
    "sap/ui/core/format/DateFormat"
], function(BrowseBase, JSONModel, Filter, FilterOperator, Formatter, DateFormat) {
    "use strict";

    let WorkCenterResourceBrowse = BrowseBase.extend("sap.dm.dme.podfoundation.browse.WorkCenterResourceBrowse", {
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
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("resource")
            };
        },

        getExternalFilter: function() {
            let oStatusFilter = this.byId("statusFilter");
            let oResourceTypeFilter = this.byId("resourceTypeFilter");
            let oCreationDateTimeFilter = this.byId("creationTimeRangeFilter");
            // Return an Array of Browse Filters
            return [this._createStatusFilter(oStatusFilter),
                this._createFilterByResourceType(oResourceTypeFilter),
                this._createDateTimeCreationFilter(oCreationDateTimeFilter)
            ];
        },

        _createStatusFilter: function(oStatusControl) {
            if (!oStatusControl.getSelectedItem()) {
                return null;
            }

            let sStatusFilterKey = oStatusControl.getSelectedItem().getKey()
            if (!sStatusFilterKey) {
                return null;
            }

            if (sStatusFilterKey !== "ALL") {
                return new Filter({
                    path: "status",
                    operator: FilterOperator.EQ,
                    variable: "item",
                    value1: sStatusFilterKey
                });
            } else {
                return null;
            }
        },

        _createFilterByResourceType: function(oResourceTypeControl) {
            if (!oResourceTypeControl.getSelectedItem()) {
                return null;
            }

            let sValue = oResourceTypeControl.getSelectedItem().getText();
            let oFilter = new Filter("resourceTypeAsText", sap.ui.model.FilterOperator.Contains, sValue);

            return oFilter;
        },

        _createDateTimeCreationFilter: function(oCreationDateTime) {
            if (oCreationDateTime.getDateValue() && oCreationDateTime.getSecondDateValue()) {
                let oDateFormatFrom = DateFormat.getDateInstance({
                    pattern: "yyyy-MM-ddT00:00:00.000"
                });
                let oDateFormatTo = DateFormat.getDateInstance({
                    pattern: "yyyy-MM-ddT23:59:59.999"
                });
                let sFromDate = oDateFormatFrom.format(new Date(oCreationDateTime.getDateValue())) + "Z";
                let sToDate = oDateFormatTo.format(new Date(oCreationDateTime.getSecondDateValue())) + "Z";
                return new Filter({
                    path: "resourceTypecreatedDateTime",
                    operator: FilterOperator.BT,
                    value1: sFromDate,
                    value2: sToDate
                });
            }
            return null;
        },


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
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {String} oModelData - Model Data
         * @param fnSelectionCallback - callback function called when user selects item in a list.
         */
        open: function(oParentControl, sDefaultSearchValue, oModelData, fnSelectionCallback) {
            return new WorkCenterResourceBrowse("resourceFilter", {
                sFragmentName: "sap.dm.dme.podfoundation.browse.view.WorkCenterResourceBrowse",
                oParentControl: oParentControl,
                oModel: new JSONModel(oModelData),
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["resource", "description"],
                    sListBindingPath: "/items",
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
                            sFilterItemName: "resourceTypeResourceType: "
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