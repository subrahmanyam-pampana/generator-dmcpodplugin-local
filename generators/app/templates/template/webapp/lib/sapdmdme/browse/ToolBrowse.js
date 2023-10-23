sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/ObjectTypeFormatter",
    "sap/ui/core/ValueState"
], function(BrowseBase, JSONModel, StatusFormatter, ObjectTypeFormatter, ValueState) {
    "use strict";

    let ToolBrowseType = BrowseBase.extend("sap.dm.dme.browse.ToolBrowse", {

        statusFormatter: StatusFormatter,
        objectTypeFormatter: ObjectTypeFormatter,

        /**
         * @override
         */
        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(this.statusFormatter.getToolStatusList()), "toolStatusItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                toolNumber: oBindingContext.getProperty("toolNumber"),
                id: oBindingContext.getProperty("id"),
            };
        },

        getStatusState: function(sStatusValue) {
            switch (sStatusValue) {
                case "ENABLED":
                    return ValueState.None;
            }
            return ValueState.Error;
        }
    });

    return {
        /**
         * Instantiates and opens value help dialog.
         * Need to Import and Initialize StatusFormatter and ObjectTypeFormatter when using.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {Function} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {Object} oToolModel - should be passed if default model is not tool model.
         * @return {Object} new instance of the Sfc Browse
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oToolModel) {
            return new ToolBrowseType("toolBrowse", {
                oModel: oToolModel,
                sFragmentName: "sap.dm.dme.browse.view.ToolBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["toolNumber"],
                    sListBindingPath: "/Tools",
                    aVariantFilterInfo: [{
                        sFilterItemName: "status"
                    }, ]
                }
            });
        },
    };
});