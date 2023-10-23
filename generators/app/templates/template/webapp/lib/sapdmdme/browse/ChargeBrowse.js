sap.ui.define([
    "sap/dm/dme/controller/SfcChargeBrowseBase",
    "sap/dm/dme/browse/MaterialBrowse",
    "sap/dm/dme/browse/ShopOrderBrowse"
], function(SfcChargeBrowseBase, MaterialBrowse, ShopOrderBrowse) {
    "use strict";

    let oMaterialModel;
    let oShopOrderModel;
    let ChargeBrowseType = SfcChargeBrowseBase.extend("sap.dm.dme.browse.ChargeBrowse", {

        onShopOrderBrowse: function(oEvent) {
            let sValue = oEvent.getSource().getValue();
            ShopOrderBrowse.open(this.getDialog(), sValue, this._processSelectedShopOrder.bind(this), oShopOrderModel, oMaterialModel);
        },

        onMaterialBrowse: function(oEvent) {
            let sValue = oEvent.getSource().getValue();
            MaterialBrowse.open(this.getDialog(), sValue, this._processSelectedMaterial.bind(this), oMaterialModel);
        }
    });

    return {
        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {Function} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {Boolean} bHideFilterBar - should be true to hide Filter Bar. Filter Bar is shown by default.
         * @param {Object} oProductionModel - should be passed if default model is not product model.
         * @param {Object} oDemandModel - should be passed for retrieving Shop Order list items.
         * @param {Object} oProductModel - should be passed for retrieving Material list items.
         * @return {Object} new instance of the Charge Browse
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oProductionModel, bHideFilterBar, oProductModel, oDemandModel) {
            oMaterialModel = oProductModel;
            oShopOrderModel = oDemandModel;
            return new ChargeBrowseType("ChargeBrowse", {
                oModel: oProductionModel,
                sFragmentName: "sap.dm.dme.browse.view.ChargeBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                bHideFilterBar: bHideFilterBar,
                oFilterSettings: {
                    aLiveSearchProperties: ["sfc", "shopOrderRef", "materialRef"],
                    sListBindingPath: "/Sfcs",
                    aVariantFilterInfo: [{
                            sFilterItemName: "status"
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