sap.ui.define([
    "sap/dm/dme/controller/BrowseBase"
], function(BrowseBase) {
    "use strict";

    let NcGroupBrowseType = BrowseBase.extend("sap.dm.dme.browse.NcGroupBrowse", {

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("ncGroup")
            };
        }

    });

    return {

        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {Object} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {Object} oProductModel - required product model.
         * @return {Object} new instance of Nonconformance Group Browse
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oProductModel) {
            return new NcGroupBrowseType("ncGroupBrowse", {

                oModel: oProductModel,
                sFragmentName: "sap.dm.dme.browse.view.NcGroupBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["ncGroup", "description"],
                    sListBindingPath: "/NonConformanceGroups",
                    aVariantFilterInfo: [{
                            sFilterItemName: "ncGroup"
                        },
                        {
                            sFilterItemName: "description"
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