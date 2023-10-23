sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/formatter/StatusFormatter",
    "sap/dm/dme/formatter/ObjectTypeFormatter",
    "sap/dm/dme/browse/MaterialBrowse",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/dm/dme/podfoundation/browse/SfcShopOrderBrowseListFilter"
], function(BrowseBase, JSONModel, StatusFormatter, ObjectTypeFormatter, MaterialBrowse, Filter, FilterOperator, SfcShopOrderBrowseListFilter) {
    "use strict";

    const EXCLUDE_STATUSES = ["DONE", "CLOSED", "DISCARDED"];

    let oModelForMaterial;

    let ShopOrderBrowseType = BrowseBase.extend("sap.dm.dme.podfoundation.browse.SfcShopOrderBrowse", {

        statusFormatter: StatusFormatter,
        objectTypeFormatter: ObjectTypeFormatter,
        sMaterialRef: null,

        populateSelectItems: function() {
            let aStatusList = this.statusFormatter.getShopOrderStatusList();
            if (!this.isInactiveSfsSupported()) {
                aStatusList = this.removeInactiveStatuses(aStatusList);
            }
            this.getDialog().setModel(new JSONModel(aStatusList), "shopOrderStatusItems");
            this.getDialog().setModel(new JSONModel(this.objectTypeFormatter.getShopOrderTypeList()), "shopOrderTypeItems");
        },

        isInactiveSfsSupported: function() {
            let oModel = this._oParentControl.getModel("sfcStatusItems");
            let aListData = oModel.getData();
            for (let oListData of aListData) {
                if (oListData.key === "DONE") {
                    return true;
                }
            }
            return false;
        },

        removeInactiveStatuses: function(aListData) {
            let aNewListData = [];
            for (let oListData of aListData) {
                let bFound = false;
                for (let sExclude of EXCLUDE_STATUSES) {
                    if (oListData.key === sExclude) {
                        bFound = true;
                        break;
                    }
                }
                if (!bFound) {
                    aNewListData[aNewListData.length] = oListData;
                }
            }
            return aNewListData;
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
        },

        /**
         * @override
         */
        getListFilter: function(mFilterSettings) {
            if (!this.isInactiveSfsSupported()) {
                return new SfcShopOrderBrowseListFilter(mFilterSettings);
            }
            return BrowseBase.prototype.getListFilter.apply(this, arguments);
        }
    });

    return {
        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {object} mSettings - Settings used in creation of browse
         * @param {Function} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {Object} oDemandModel - should be passed if default model is not demand model.
         * @param {Object} oProductModel - required product model used to display materials in the filter bar.
         * @return {Object} new instance of the Shop Order Browse
         */
        open: function(oParentControl, sDefaultSearchValue, mSettings, fnSelectionCallback, oDemandModel, oProductModel) {
            oModelForMaterial = oProductModel;
            let sShopOrderBrowseFragment = mSettings.sFragmentName;
            return new ShopOrderBrowseType("shopOrderBrowse", {
                oModel: oDemandModel,
                sFragmentName: sShopOrderBrowseFragment,
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