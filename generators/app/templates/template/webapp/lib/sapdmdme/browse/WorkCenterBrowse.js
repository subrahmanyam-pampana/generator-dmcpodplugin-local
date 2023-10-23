sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/EnumFormatter"
], function(BrowseBase, JSONModel, StatusFormatter, EnumFormatter) {
    "use strict";

    let sSpecificPlant;
    let fnSetODataModelPlantHeader = function(oModel) {
        if (oModel) {
            oModel.mHeaders["x-dme-plant"] = sSpecificPlant;
        }
        return oModel;
    };
    let fnDeleteODataModelPlantHeader = function(oModel) {
        delete oModel.mHeaders["x-dme-plant"];
        sSpecificPlant = null;
    };
    let WorkCenterBrowseType = BrowseBase.extend("sap.dm.dme.browse.WorkCenterBrowse", {

        statusFormatter: StatusFormatter,
        enumFormatter: EnumFormatter,

        /**
         * @override
         */
        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(this.statusFormatter.getWorkCenterStatusList()), "workCenterStatusItems");
            this.getDialog().setModel(new JSONModel(this.enumFormatter.getWorkCenterCategoryListForFilter()), "workCenterCategoryItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("workcenter")
            };
        },

        /**
         * @override
         */
        onClose: function() {
            if (sSpecificPlant) {
                fnDeleteODataModelPlantHeader(this._oDialog.getModel());
            }
            BrowseBase.prototype.onClose.apply(this, arguments);
        }
    });

    return {

        /**
         * Used outside DME to open a Browse with a specific plant.
         * @param {string} sPlant: a specific plant for Browse List binding.
         */
        setPlant: function(sPlant) {
            sSpecificPlant = sPlant;
        },

        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param fnSelectionCallback - callback function called when user selects item in a list.
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oModel) {
            return new WorkCenterBrowseType("workCenterBrowse", {
                oModel: sSpecificPlant ? fnSetODataModelPlantHeader(oModel) : oModel,
                sFragmentName: "sap.dm.dme.browse.view.WorkCenterBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["workcenter", "description"],
                    sListBindingPath: "/Workcenters",
                    aVariantFilterInfo: [{
                            sFilterItemName: "workcenter"
                        },
                        {
                            sFilterItemName: "description"
                        },
                        {
                            sFilterItemName: "status"
                        },
                        {
                            sFilterItemName: "workcenterCategory"
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