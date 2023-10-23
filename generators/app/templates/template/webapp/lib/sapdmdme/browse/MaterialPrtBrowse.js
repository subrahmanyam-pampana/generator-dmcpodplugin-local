sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/ObjectTypeFormatter",
    "sap/dm/dme/browse/BomBrowse",
    "sap/dm/dme/browse/RoutingBrowse"
], function(BrowseBase, JSONModel, StatusFormatter, ObjectTypeFormatter, BomBrowse, RoutingBrowse) {
    "use strict";

    let MaterialBrowseType = BrowseBase.extend("sap.dm.dme.browse.MaterialPrtBrowse", {

        statusFormatter: StatusFormatter,
        objectTypeFormatter: ObjectTypeFormatter,

        /**
         * @override
         */
        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(this.statusFormatter.getStatusList()), "materialStatusItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                prtNumber: oBindingContext.getProperty("material"),
                version: oBindingContext.getProperty("version"),
                prtDescription: oBindingContext.getProperty("description"),
                prtType: oBindingContext.getProperty("materialType")
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
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oModel) {
            return new MaterialBrowseType("MaterialPrtBrowse", {
                oModel: oModel,
                sFragmentName: "sap.dm.dme.browse.view.MaterialPrtBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    oDefaultFilter: "materialType eq com.sap.mes.odata.MaterialType'PRT'",
                    aLiveSearchProperties: ["material"],
                    sListBindingPath: "/Materials",
                    aVariantFilterInfo: [{
                            sFilterItemName: "material"
                        },
                        {
                            sFilterItemName: "status"
                        },
                        {
                            sFilterItemName: "description",
                            sSearchProperty: "descriptions",
                            oFilterOperator: sap.ui.model.FilterOperator.Any,
                            oCondition: {
                                sSearchProperty: "description/description"
                            }
                        }
                    ]
                }
            });
        }
    };
});