sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/ObjectTypeFormatter",
    "sap/dm/dme/browse/MaterialBrowse",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(BrowseBase, JSONModel, StatusFormatter, ObjectTypeFormatter, MaterialBrowse, Filter, FilterOperator) {
    "use strict";

    let oModelForMaterial;
    let ShopOrderBrowseType = BrowseBase.extend("sap.dm.dme.browse.ShopOrderBrowse", {

        statusFormatter: StatusFormatter,
        objectTypeFormatter: ObjectTypeFormatter,
        sMaterialRef: null,

        /**
         * @override
         */
        populateSelectItems: function() {
            this.getDialog().setModel(new JSONModel(this.statusFormatter.getShopOrderStatusList()), "shopOrderStatusItems");
            this.getDialog().setModel(new JSONModel(this.objectTypeFormatter.getShopOrderTypeList()), "shopOrderTypeItems");
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            return {
                ref: oBindingContext.getProperty("ref"),
                name: oBindingContext.getProperty("shopOrder"),
                buildQuantity: oBindingContext.getProperty("buildQuantity"),
                releasedQuantity: oBindingContext.getProperty("releasedQuantity")
            };
        },

        onMaterialBrowse: function(oEvent) {
            let sValue = oEvent.getSource().getValue();
            MaterialBrowse.open(this.getDialog(), sValue, function(oSelectedObject) {
                this.byId("materialFilter").setValue(oSelectedObject.name);
                this.sMaterialRef = oSelectedObject.ref;
                this.onFilterBarChange();
            }.bind(this), oModelForMaterial);
        },

        onFilterBarClear: function() {
            BrowseBase.prototype.onFilterBarClear.apply(this, arguments);
            this._clearMaterialRef();
        },

        onMaterialFilterBarChange: function() {
            this._clearMaterialRef();
            this.onFilterBarChange();
        },

        /**
         * @override
         */
        getExternalFilter: function() {
            return this._createFilterByMaterial(this.sMaterialRef);
        },

        _createFilterByMaterial: function(sRef) {
            if (sRef) {
                return new Filter({
                    path: "materialRef",
                    operator: FilterOperator.EQ,
                    value1: sRef
                });
            }
            return null;
        },

        _clearMaterialRef: function() {
            this.sMaterialRef = null;
        }
    });

    return {

        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {Function} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {Object} oDemandModel - should be passed if default model is not demand model.
         * @param {Object} oProductModel - required product model used to display materials in the filter bar.
         * @return {Object} new instance of the Shop Order Browse
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oDemandModel, oProductModel) {
            oModelForMaterial = oProductModel;
            return new ShopOrderBrowseType("shopOrderBrowse", {
                oModel: oDemandModel,
                sFragmentName: "sap.dm.dme.browse.view.ShopOrderBrowse",
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["shopOrder"],
                    sListBindingPath: "/ShopOrders",
                    aVariantFilterInfo: [{
                            sFilterItemName: "shopOrder"
                        },
                        {
                            sFilterItemName: "shopOrderType",
                            sSearchProperty: "shopOrderType/orderType"
                        },
                        {
                            sFilterItemName: "status"
                        },
                        {
                            sFilterItemName: "creationTimeRange",
                            sSearchProperty: "createdDateTime"
                        },
                        {
                            sFilterItemName: "plannedCompletionDate"
                        }
                    ]
                }
            });
        }
    };
});