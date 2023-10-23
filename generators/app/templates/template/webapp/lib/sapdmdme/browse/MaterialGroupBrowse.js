sap.ui.define([
    "sap/dm/dme/controller/BrowseBase"
], function(BrowseBase) {
    "use strict";

    let MaterialGroupBrowseType = BrowseBase.extend("sap.dm.dme.browse.MaterialGroupBrowse", {
        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                materialGroup: oBindingContext.getProperty("materialGroup"),
                description: oBindingContext.getProperty("description")
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
         * @return {Object} new instance of Material Group Browse
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oProductModel) {
            return new MaterialGroupBrowseType("materialGroupBrowse", {

                oModel: oProductModel,
                sFragmentName: "sap.dm.dme.browse.view.MaterialGroupBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["materialGroup", "description"],
                    sListBindingPath: "/MaterialGroups",
                    aVariantFilterInfo: [{
                            sFilterItemName: "materialGroup"
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