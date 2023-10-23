sap.ui.define([
    "sap/dm/dme/controller/BrowseBase"
], function(BrowseBase, Formatter) {
    "use strict";

    let FormulasBrowseType = BrowseBase.extend("sap.dm.dme.browse.FormulasBrowse", {
        formatter: Formatter,

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                formulaName: oBindingContext.getProperty("formulaName"),
                description: oBindingContext.getProperty("description"),
                expression: oBindingContext.getProperty("expression"),
                variables: oBindingContext.getObject().variables || []
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
            return new FormulasBrowseType("FormulasBrowse", {
                sFragmentName: "sap.dm.dme.browse.view.FormulasBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["formulaName", "description"]
                }
            });
        }
    };
});