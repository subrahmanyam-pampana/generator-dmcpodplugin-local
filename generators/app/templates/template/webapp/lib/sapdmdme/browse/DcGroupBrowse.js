sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/controller/BrowseBase",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(
    JSONModel,
    BrowseBase,
    StatusFormatter,
    Filter,
    FilterOperator
) {
    "use strict";

    let DcGroupBrowseType = BrowseBase.extend("sap.dm.dme.browse.DcGroupBrowse", {

        statusFormatter: StatusFormatter,

        /**
         * @override
         */
        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(this.statusFormatter.getDcGroupStatusList()), "dcGroupStatusItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("dcGroup"),
                version: oBindingContext.getProperty("version")
            };
        },

        /**
         * @override
         */
        getExternalFilter: function() {
            let sDcParameterName = this.byId("dcParametersNameFilter").getValue();
            let sDcParameterDesc = this.byId("dcParametersDescFilter").getValue();
            return this._createFilterByDcParameter(sDcParameterName, sDcParameterDesc);
        },

        _createFilterByDcParameter: function(sName, sDescription, sType) {
            return new Filter({
                path: "dcParameters",
                operator: FilterOperator.Any,
                variable: "item",
                condition: new Filter({
                    filters: [
                        new Filter({
                            path: "item/parameterName",
                            operator: FilterOperator.Contains,
                            value1: sName
                        }),
                        new Filter({
                            path: "item/description",
                            operator: FilterOperator.Contains,
                            value1: sDescription
                        })
                    ],
                    and: true
                })
            });
        }
    });

    return {

        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {Function} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {Object} oDataCollectionModel - data collection Model.
         * @return {Object} new instance of the DC Group Browse.
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oDataCollectionModel) {
            return new DcGroupBrowseType("dcGroupBrowseType", {
                oModel: oDataCollectionModel,
                sFragmentName: "sap.dm.dme.browse.view.DcGroupBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["dcGroup", "description"],
                    sListBindingPath: "/DataCollectionGroups",
                    aVariantFilterInfo: [{
                            sFilterItemName: "dcGroup"
                        },
                        {
                            sFilterItemName: "description"
                        },
                        {
                            sFilterItemName: "version"
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
                            oFilterOperator: sap.ui.model.FilterOperator.Any
                        }
                    ]
                }
            });
        }
    };
});