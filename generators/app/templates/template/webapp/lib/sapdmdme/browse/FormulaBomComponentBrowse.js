sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/dm/dme/formatter/ObjectTypeFormatter"
], function(BrowseBase, ObjectTypeFormatter) {
    "use strict";

    let FormulaComponentBrowseType = BrowseBase.extend("sap.dm.dme.browse.FormulaComponentBrowseType", {

        objectTypeFormatter: ObjectTypeFormatter,

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("material/material"),
                version: oBindingContext.getProperty("version")
            };
        }
    });

    return {

        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {String} sBomRef - BOM ref.
         * @param fnSelectionCallback - callback function called when user selects item in a list.
         */
        open: function(oParentControl, sDefaultSearchValue, sBomRef, fnSelectionCallback) {
            return new FormulaComponentBrowseType("formulaComponentBrowse", {
                sFragmentName: "sap.dm.dme.browse.view.FormulaBomComponentBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    oDefaultFilter: new sap.ui.model.Filter({
                        path: "bom/ref",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: sBomRef
                    }),
                    aLiveSearchProperties: ["material/material"]
                }
            });
        }
    };
});