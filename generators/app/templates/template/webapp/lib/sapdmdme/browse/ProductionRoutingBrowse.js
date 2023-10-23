sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/controller/BrowseBase",
    "sap/dm/dme/formatter/StatusFormatter"
], function(JSONModel, BrowseBase, StatusFormatter) {
    "use strict";

    let ProductionRoutingBrowseType = BrowseBase.extend("sap.dm.dme.browse.ProductionRoutingBrowse", {

        statusFormatter: StatusFormatter,

        /**
         * @override
         */
        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(StatusFormatter.getStatusList()), "statusItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("routing"),
                version: oBindingContext.getProperty("version")
            };
        }

    });

    return {

        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param fnSelectionCallback - callback function called when user selects item in a list.
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oModel) {
            return new ProductionRoutingBrowseType("productionRoutingBrowse", {
                oModel: oModel,
                sFragmentName: "sap.dm.dme.browse.view.ProductionRoutingBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    oDefaultFilter: "routing ne '_SYSTEM' and routingType eq com.sap.mes.odata.RoutingType'PRODUCTION'",
                    aLiveSearchProperties: ["routing", "description"],
                    sListBindingPath: "/Routings",
                    aVariantFilterInfo: [{
                            sFilterItemName: "routing"
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
                            oFilterOperator: sap.ui.model.FilterOperator.Any
                        }
                    ]
                }
            });
        }
    };
});