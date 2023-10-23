sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/controller/BrowseBase",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/ObjectTypeFormatter"
], function(JSONModel, BrowseBase, StatusFormatter, ObjectTypeFormatter) {
    "use strict";

    let RecipeBrowseType = BrowseBase.extend("sap.dm.dme.browse.RecipeBrowse", {

        objectTypeFormatter: ObjectTypeFormatter,
        statusFormatter: StatusFormatter,

        /**
         * @override
         */
        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(StatusFormatter.getStatusList()), "statusItems");
            this.getDialog().setModel(new JSONModel(ObjectTypeFormatter.getRecipeTypeList()), "routingTypeItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("routing"),
                version: oBindingContext.getProperty("version"),
                routingType: oBindingContext.getProperty("routingType")
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
            return new RecipeBrowseType("recipeBrowse", {
                oModel: oModel,
                sFragmentName: "sap.dm.dme.browse.view.RecipeBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    oDefaultFilter: "routing ne '_SYSTEM' and taskListType eq 'C'",
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
                            sFilterItemName: "routingType"
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