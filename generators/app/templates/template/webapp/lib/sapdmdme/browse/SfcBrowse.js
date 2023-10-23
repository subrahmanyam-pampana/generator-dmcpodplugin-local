sap.ui.define([
    "sap/dm/dme/controller/SfcChargeBrowseBase",
    "sap/dm/dme/browse/MaterialBrowse",
    "sap/dm/dme/browse/ShopOrderBrowse"
], function(SfcChargeBrowseBase, MaterialBrowse, ShopOrderBrowse) {
    "use strict";

    let oMaterialModel;
    let oShopOrderModel;
    let SfcBrowseType = SfcChargeBrowseBase.extend("sap.dm.dme.browse.SfcBrowse", {

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
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {Function} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {Object} oProductionModel - should be passed if default model is not product model.
         * @param {Boolean} bHideFilterBar - should be true to hide Filter Bar. Filter Bar is shown by default.
         * @param {Object} oProductModel - should be passed for retrieving Material list items.
         * @param {Object} oDemandModel - should be passed for retrieving Shop Order list items.
         * @return {Object} new instance of the Sfc Browse
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oProductionModel, bHideFilterBar, oProductModel, oDemandModel) {
            oMaterialModel = oProductModel;
            oShopOrderModel = oDemandModel;
            return new SfcBrowseType("sfcBrowse", {
                oModel: oProductionModel,
                sFragmentName: "sap.dm.dme.browse.view.SfcBrowse",
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