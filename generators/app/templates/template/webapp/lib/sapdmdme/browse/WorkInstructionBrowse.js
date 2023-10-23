sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/controller/BrowseBase",
    "sap/dm/dme/formatter/StatusFormatter"
], function(
    JSONModel,
    BrowseBase,
    StatusFormatter
) {
    "use strict";

    let WorkInstructionBrowseType = BrowseBase.extend("sap.dm.dme.browse.WorkInstructionBrowse", {

        statusFormatter: StatusFormatter,

        /**
         * @override
         */
        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(this.statusFormatter.getStatusList()), "wiStatusItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("workInstruction"),
                version: oBindingContext.getProperty("version")
            };
        }
    });

    return {

        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {Function} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {Object} oWorkInstructionModel - Work Instruction Model.
         * @return {Object} new instance of the Work Instruction Browse.
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oWorkInstructionModel) {
            return new WorkInstructionBrowseType("workInstructionBrowseType", {
                oModel: oWorkInstructionModel,
                sFragmentName: "sap.dm.dme.browse.view.WorkInstructionBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["workInstruction", "description"],
                    sListBindingPath: "/WorkInstructions",
                    aVariantFilterInfo: [{
                            sFilterItemName: "workInstruction"
                        },
                        {
                            sFilterItemName: "description"
                        },
                        {
                            sFilterItemName: "version"
                        },
                        {
                            sFilterItemName: "status"
                        },
                        {
                            sFilterItemName: "creationTimeRange",
                            sSearchProperty: "createdDateTime"
                        },
                        {
                            sFilterItemName: "currentVersion",
                            oFilterOperator: sap.ui.model.FilterOperator.Any
                        }
                    ]
                }
            });
        }
    };
});