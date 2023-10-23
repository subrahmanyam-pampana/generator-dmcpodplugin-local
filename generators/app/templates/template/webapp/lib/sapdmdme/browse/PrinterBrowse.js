sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/dm/dme/formatter/StatusFormatter"
], function(BrowseBase, StatusFormatter) {
    "use strict";

    let PrinterBrowseType = BrowseBase.extend("sap.dm.dme.browse.PrinterBrowse", {
        statusFormatter: StatusFormatter,

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                printer: oBindingContext.getProperty("printer")
            };
        },

        formatPrinterType: function(sValue) {
            return this._oParentControl.getModel("i18n-printer").getResourceBundle().getText(`enum.printerType.${sValue}`);
        }
    });

    return {
        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {Function} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {Object} oPrinterModel - should be passed if default model is not a printer model.
         * @returns {Object} new instance of the Printer Browse used to access Browse instance
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oPrinterModel) {
            return new PrinterBrowseType("printerBrowse", {
                oModel: oPrinterModel,
                sFragmentName: "sap.dm.dme.browse.view.PrinterBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["printer", "description"]
                }
            });
        }
    };
});