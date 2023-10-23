sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/controller/BrowseBase",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/ObjectTypeFormatter"
], function(JSONModel, BrowseBase, StatusFormatter, ObjectTypeFormatter) {
    "use strict";

    let ProductionRecipeBrowseType = BrowseBase.extend("sap.dm.dme.browse.ProductionRecipeBrowse", {

        objectTypeFormatter: ObjectTypeFormatter,
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

        oBrowse: null,

        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param fnSelectionCallback - callback function called when user selects item in a list.
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oModel) {
            return new ProductionRecipeBrowseType("productionRecipeBrowse", {
                oModel: oModel,
                sFragmentName: "sap.dm.dme.browse.view.ProductionRecipeBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    oDefaultFilter: "routing ne '_SYSTEM' and routingType eq com.sap.mes.odata.RoutingType'PRODUCTION_RECIPE'",
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