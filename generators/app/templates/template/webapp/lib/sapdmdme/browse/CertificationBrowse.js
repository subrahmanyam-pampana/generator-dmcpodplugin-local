sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/dm/dme/formatter/StatusFormatter"
], function(BrowseBase, StatusFormatter) {
    "use strict";

    let CertificationBrowseType = BrowseBase.extend("sap.dm.dme.browse.CertificationBrowse", {
        statusFormatter: StatusFormatter,

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("certification"),
                description: oBindingContext.getProperty("description"),
                status: oBindingContext.getProperty("status")
            };
        }
    });

    return {
        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param fnSelectionCallback - callback function called when user selects item in a list.
         * @param {Object} oPlantModel - (optional) should be passed if default model is not a plant model.
         * @return {Object} new instance of the Operation Activity Browse
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oPlantModel) {
            return new CertificationBrowseType("certificationBrowse", {
                sFragmentName: "sap.dm.dme.browse.view.CertificationBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oModel: oPlantModel,
                oFilterSettings: {
                    aLiveSearchProperties: ["certification", "description"]
                }
            });
        }
    };
});