sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/formatter/EnumFormatter",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/podfoundation/formatter/BrowseFormatter"
], function(BrowseBase, JSONModel, EnumFormatter, StatusFormatter, Formatter) {
    "use strict";

    let WorkCenterBrowseType = BrowseBase.extend("sap.dm.dme.podfoundation.browse.WorkCenterBrowse", {

        enumFormatter: EnumFormatter,
        statusFormatter: StatusFormatter,
        formatter: Formatter,

        populateSelectItems: function() {

            this.getDialog().setModel(new JSONModel(this.statusFormatter.getWorkCenterStatusList()), "workCenterStatusItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext, oClickedListItem) {
            let oNewBindingContext = oClickedListItem.getBindingContext("plant");
            return {
                ref: oNewBindingContext.getProperty("ref"),
                name: oNewBindingContext.getProperty("workcenter")
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
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback) {

            return new WorkCenterBrowseType("workCenterBrowse", {

                sFragmentName: "sap.dm.dme.podfoundation.browse.view.WorkCenterBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["workcenter", "description"],
                    sListBindingPath: "/Workcenters",
                    aVariantFilterInfo: [{
                            sFilterItemName: "workcenter"
                        },
                        {
                            sFilterItemName: "description"
                        },
                        {
                            sFilterItemName: "status"
                        },
                        {
                            sFilterItemName: "workcenterCategory"
                        },
                        {
                            sFilterItemName: "creationTimeRange",
                            sSearchProperty: "createdDateTime"
                        },
                    ]
                }
            });
        }

    }
});