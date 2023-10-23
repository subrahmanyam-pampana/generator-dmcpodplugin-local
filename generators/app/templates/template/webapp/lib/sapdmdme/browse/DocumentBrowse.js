sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/dm/dme/formatter/StatusFormatter"
], function(BrowseBase, StatusFormatter) {
    "use strict";

    let DocumentBrowseType = BrowseBase.extend("sap.dm.dme.browse.DocumentBrowse", {
        statusFormatter: StatusFormatter,

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                document: oBindingContext.getProperty("document"),
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
         * @param {Object} oDocumentModel - should be passed if default model is not a document model.
         * @returns {Object} new instance of the Document Browse used to access Browse instance
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oDocumentModel) {
            return new DocumentBrowseType("documentBrowse", {
                oModel: oDocumentModel,
                sFragmentName: "sap.dm.dme.browse.view.DocumentBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["document", "description"]
                }
            });
        }
    };
});