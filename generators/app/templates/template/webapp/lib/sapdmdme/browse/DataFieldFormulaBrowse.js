sap.ui.define([
    "sap/dm/dme/controller/BrowseBase"
], function(BrowseBase, Formatter) {
    "use strict";

    let DataFieldBrowseType = BrowseBase.extend("sap.dm.dme.browse.DataFieldFormulaBrowse", {
        formatter: Formatter,

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                fieldName: oBindingContext.getProperty("fieldName"),
                description: oBindingContext.getProperty("description"),
                formula: oBindingContext.getProperty("formula/ref"),
                modifiedDateTime: oBindingContext.getProperty("modifiedDateTime")
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
            return new DataFieldBrowseType("dataFieldFormulaBrowse", {
                sFragmentName: "sap.dm.dme.browse.view.DataFieldFormulaBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    oDefaultFilter: "type eq com.sap.mes.odata.FieldType'FORMULA'",
                    aLiveSearchProperties: ["fieldName", "fieldLabel", "description"]
                }
            });
        }
    };
});