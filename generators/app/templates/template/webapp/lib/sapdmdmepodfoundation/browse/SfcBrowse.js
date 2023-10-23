sap.ui.define([
    "sap/dm/dme/controller/SfcChargeBrowseBase",
    "sap/dm/dme/podfoundation/browse/SfcBrowseListFilter",
    "sap/dm/dme/browse/MaterialBrowse",
    "sap/dm/dme/podfoundation/browse/SfcShopOrderBrowse"
], function(SfcChargeBrowseBase, SfcBrowseListFilter, MaterialBrowse, ShopOrderBrowse) {
    "use strict";

    const EXCLUDE_STATUSES = ["SCRAPPED", "INVALID", "DELETED", "DONE_HOLD", "RETURNED", "GOLDEN_UNIT", "DONE"];
    const VALID_STATUSES = ["ALL", "NEW", "IN_QUEUE", "ACTIVE", "HOLD"];

    let oMaterialModel;
    let oShopOrderModel;
    let SfcBrowseType = SfcChargeBrowseBase.extend("sap.dm.dme.podfoundation.browse.SfcBrowse", {
        constructor: function(sId, mSettings) {
            this.loadStatusExlusions(mSettings.validStatuses);
            SfcChargeBrowseBase.apply(this, arguments);
            this.initializeDialog(mSettings);
        },

        loadStatusExlusions: function(aValidStatuses) {
            this.aStatusExcludes = [];
            if (!aValidStatuses || aValidStatuses.length === 0) {
                this.aStatusExcludes = EXCLUDE_STATUSES;
                this.aValidStatuses = VALID_STATUSES;
                return;
            }
            this.aValidStatuses = this.loadValidStatuses(aValidStatuses);
            for (let sExclude of EXCLUDE_STATUSES) {
                let bFound = false;
                for (let sValidStatus of this.aValidStatuses) {
                    if (sExclude === sValidStatus) {
                        bFound = true;
                        break;
                    }
                }
                if (!bFound) {
                    this.aStatusExcludes[this.aStatusExcludes.length] = sExclude;
                }
            }
        },

        loadValidStatuses: function(aValidStatuses) {
            let aStatuses = VALID_STATUSES;
            if (!aValidStatuses || aValidStatuses.length === 0) {
                return aStatuses;
            }
            for (let sValidStatus of aValidStatuses) {
                let bFound = false;
                for (let sStatus of VALID_STATUSES) {
                    if (sStatus === sValidStatus) {
                        bFound = true;
                        break;
                    }
                }
                if (!bFound) {
                    aStatuses[aStatuses.length] = sValidStatus;
                }
            }
            return aStatuses;
        },

        initializeDialog: function(mSettings) {
            let oTable = this.byId("resultTable");
            oTable.setMode(mSettings.tableSelectMode);
            if (mSettings.tableSelectMode === "SingleSelectMaster") {
                oTable.attachSelectionChange(this.onSelect, this);
                let oButton = this.byId("okButton");
                oButton.setVisible(false);
            }
            this.sShopOrderBrowseFragment = "sap.dm.dme.browse.view.ShopOrderBrowse";
            if (mSettings.sFragmentName === "sap.dm.dme.podfoundation.browse.view.SfcBrowse") {
                this.sShopOrderBrowseFragment = "sap.dm.dme.podfoundation.browse.view.ShopOrderBrowse";
            }
        },

        /**
         * @override
         */
        getListFilter: function(mFilterSettings) {
            return new SfcBrowseListFilter(mFilterSettings);
        },

        /**
         * @override
         */
        populateSelectItems: function() {
            SfcChargeBrowseBase.prototype.populateSelectItems.apply(this, arguments);
            let oModel = this.getDialog().getModel("sfcStatusItems");
            let aListData = oModel.getData();
            let aNewListData = [];
            for (let oListData of aListData) {
                let bFound = false;
                for (let sExclude of this.aStatusExcludes) {
                    if (oListData.key === sExclude) {
                        bFound = true;
                        break;
                    }
                }
                if (bFound) {
                    continue;
                }
                for (let sInclude of this.aValidStatuses) {
                    if (oListData.key === sInclude) {
                        aNewListData[aNewListData.length] = oListData;
                        break;
                    }
                }
            }
            oModel.setData(aNewListData);
        },

        onShopOrderBrowse: function(oEvent) {
            let sValue = oEvent.getSource().getValue();
            let mSettings = {
                sFragmentName: this.sShopOrderBrowseFragment
            };
            ShopOrderBrowse.open(this.getDialog(), sValue, mSettings, this._processSelectedShopOrder.bind(this), oShopOrderModel, oMaterialModel);
        },

        onMaterialBrowse: function(oEvent) {
            let sValue = oEvent.getSource().getValue();
            MaterialBrowse.open(this.getDialog(), sValue, this._processSelectedMaterial.bind(this), oMaterialModel);
        },

        /**
         * @override
         */
        onSelect: function() {
            let oTable = this.byId("resultTable");
            let aSelectedItems = oTable.getSelectedItems();
            let aSelectedEntities = [];
            for (let oSelection of aSelectedItems) {
                let oSelectedContext = oSelection.getBindingContext();
                aSelectedEntities[aSelectedEntities.length] = this.createResultData(oSelectedContext);
            }
            this.getDialog().close();
            if (this._fnSelectionCallback) {
                this._fnSelectionCallback(aSelectedEntities);
                this._fnSelectionCallback = null; // prevent multiple selection on multiple rows click during dialog close process
            }
        }
    });

    return {
        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param {Function} fnSelectionCallback - callback function called when user selects item in a list.
         * @param {object} mSettings - Settings used in creation of browse
         * @param {Object} oProductionModel - should be passed if default model is not product model.
         * @param {Boolean} bHideFilterBar - should be true to hide Filter Bar. Filter Bar is shown by default.
         * @param {Object} oProductModel - should be passed for retrieving Material list items.
         * @param {Object} oDemandModel - should be passed for retrieving Shop Order list items.
         * @return {Object} new instance of the Sfc Browse
         */
        open: function(oParentControl, sDefaultSearchValue, mSettings, fnSelectionCallback, oProductionModel, bHideFilterBar, oProductModel, oDemandModel) {
            oMaterialModel = oProductModel;
            oShopOrderModel = oDemandModel;

            let sTableSelectMode = "SingleSelectMaster";
            let sSfcBrowseFragment = "sap.dm.dme.podfoundation.browse.view.SfcBrowse";
            if (mSettings) {
                if (typeof mSettings.tableSelectMode !== "undefined") {
                    sTableSelectMode = mSettings.tableSelectMode;
                }
                if (typeof mSettings.sfcBrowseFragment !== "undefined") {
                    sSfcBrowseFragment = mSettings.sfcBrowseFragment;
                }
            }
            return new SfcBrowseType("sfcBrowse", {
                oModel: oProductionModel,
                sFragmentName: sSfcBrowseFragment,
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                tableSelectMode: sTableSelectMode,
                validStatuses: mSettings.validStatuses,
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