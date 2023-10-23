sap.ui.define([
    "sap/dm/dme/controller/BrowseBase",
    "sap/ui/model/Filter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/dm/dme/i18n/i18nBundles",
    "sap/dm/dme/message/ErrorHandler",
    "sap/dm/dme/formatter/DateTimeUtils",
    "sap/dm/dme/formatter/NumberFormatter"
], function(BrowseBase, Filter, JSONModel, MessageBox, Bundles, ErrorHandler, DateTimeUtils, NumberFormatter) {
    "use strict";

    const SELECTED_CONTEXT_MODEL = "selectedContext";
    const TYPE_NEW = "new";
    let VIEW_MODEL_NAME = "viewModel";

    let BatchCharacValueSelectBrowse = BrowseBase.extend("sap.dm.dme.browse.BatchCharacValueSelectBrowse", {

        DateTimeUtils: DateTimeUtils,

        onSearchLiveChange: function(oEvent) {
            this._dataSearch(oEvent.getSource().getValue(), [
                "charcValue"
            ]);
        },

        _dataSearch: function(sValue, aFieldValues) {
            let aFilters = aFieldValues.map(function(oValue) {
                return new Filter(oValue, sap.ui.model.FilterOperator.Contains, sValue.toUpperCase());
            });
            // update list binding
            let aBinding = this.getResultTable().getBinding("items");
            aBinding.sFilterParams = "";
            aBinding.filter(new sap.ui.model.Filter(aFilters, false));
        },

        /**
         * @override
         */
        createViewModel: function() {
            this.getDialog().setModel(new JSONModel({
                listLength: 0
            }), VIEW_MODEL_NAME);

            if (this.getTableIsMultiMode()) {
                let aDefaultBatchCharcValueContexts = this.getDialog().getModel().getProperty("/defaultBatchCharcValueContexts");
                this._updateTabelSelectedContextPaths(aDefaultBatchCharcValueContexts);
            }
        },

        _updateTabelSelectedContextPaths: function(aSelectedContextPaths) {
            this.getResultTable().setSelectedContextPaths(aSelectedContextPaths);
            this.getResultTable().updateItems();
            this.getDialog().setModel(new JSONModel({
                selectedLength: aSelectedContextPaths.length
            }), SELECTED_CONTEXT_MODEL);
        },

        /**
         * @override
         */
        createResultData: function(oBindingContext) {
            let oDialogModelData = this.getDialog().getModel().getData();
            let sCharcValue = oBindingContext.getProperty("charcValue");
            if (oDialogModelData.dataType === "NUM" && oBindingContext.getProperty("type") === TYPE_NEW) {
                sCharcValue = String(NumberFormatter.dmcLocaleNumberParser(sCharcValue));
            }
            return {
                charcId: oBindingContext.getProperty("charcId"),
                charcValue: sCharcValue,
                charcValuePositionNumber: oBindingContext.getProperty("charcValuePositionNumber")
            };
        },

        getResultTable: function() {
            return this.byId("resultTable");
        },

        /**
         * @override
         */
        onSelect: function(oEvent) {
            if (this.getTableIsMultiMode()) {
                this._refreshMultipleSelectedModeModel();
            } else {
                let oValidateResult = this._validateTableRows(true);
                let nSelectedRowIndex = this.getResultTable().indexOfItem(this.getResultTable().getSelectedItem());
                // can not select empty value row
                if (oValidateResult.emptyValueIndexes.indexOf(nSelectedRowIndex) > -1 || !oValidateResult.isValidate) {
                    this.getResultTable().removeSelections();
                } else {
                    let oClickedListItem = oEvent.getParameter("listItem");
                    let oBindingContext = oClickedListItem.getBindingContext();
                    this._handleRowSelectionChange(oBindingContext);
                }
            }
        },

        _handleRowSelectionChange: function(oSelectedRowBindingContext) {
            let that = this;
            let aNewTypeRows = this.getDialog().getModel().getProperty("/charcAllowedValues").filter(function(oRowData) {
                return oRowData.type === TYPE_NEW;
            }.bind(this));
            let aSelectedNewRowsContexts = this.getListSelectedContexts().filter(function(_oBindingContext) {
                return _oBindingContext.getProperty("type") === TYPE_NEW;
            }.bind(this));
            //if did not select addition value row
            if (aNewTypeRows.length !== aSelectedNewRowsContexts.length) {
                MessageBox.confirm(Bundles.getGoodreceiptText("characteristic.warning.additional.row.notSelected"), {
                    icon: MessageBox.Icon.WARNING,
                    title: Bundles.getGlobalText("warning"),
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function(oAction) {
                        that._handleRowSelectionChangeOnCloseBtnPress(oAction, oSelectedRowBindingContext);
                    }
                });
            } else {
                if (that.getTableIsMultiMode()) {
                    that._handleCloseDialogWithMultiMode();
                } else {
                    that._handleCloseDialogWithSingleMode(oSelectedRowBindingContext);
                }
            }
        },

        _handleRowSelectionChangeOnCloseBtnPress: function(oAction, oSelectedRowBindingContext) {
            let that = this;
            if (oAction === "NO") {
                if (that.getTableIsMultiMode()) {
                    let aSelectedContexts = that.getResultTable().getSelectedContextPaths();
                    let aNewtypeRowContexts = that.getResultTable().getBinding("items").getContexts().filter(function(_oBindingContext) {
                        return _oBindingContext.getProperty("type") === TYPE_NEW;
                    }).map(function(_oBindingContext) {
                        return _oBindingContext.getPath();
                    });
                    aNewtypeRowContexts.forEach(function(_oBindingContext) {
                        if (aSelectedContexts.indexOf(_oBindingContext) === -1) {
                            aSelectedContexts.push(_oBindingContext);
                        }
                    });
                    that._updateTabelSelectedContextPaths(aSelectedContexts);
                } else {
                    that.getResultTable().removeSelections();
                }
            }
            if (oAction === "YES") {
                if (that.getTableIsMultiMode()) {
                    that._handleCloseDialogWithMultiMode();
                } else {
                    that._handleCloseDialogWithSingleMode(oSelectedRowBindingContext);
                }
            }
        },

        _handleCloseDialogWithSingleMode: function(oBindingContext) {
            let oSelectedEntity = this.createResultData(oBindingContext);
            if (this._fnSelectionCallback) {
                this._fnSelectionCallback(oSelectedEntity);
                this._fnSelectionCallback = null; // prevent multiple selection on multiple rows click during dialog close process
            }
            this.getDialog().close();
        },

        _handleCloseDialogWithMultiMode: function() {
            if (this._fnSelectionCallback) {
                let aBindingContexts = this.getListSelectedContexts();
                let aSelectedEntitys = aBindingContexts.map(function(oBindingContext) {
                    return this.createResultData(oBindingContext);
                }.bind(this));
                this._fnSelectionCallback(aSelectedEntitys);
                this._fnSelectionCallback = null; // prevent multiple selection on multiple rows click during dialog close process
            }
            this.getDialog().close();
        },

        _refreshMultipleSelectedModeModel: function() {
            let aSelectedContexts = this.getListSelectedContexts();
            if (aSelectedContexts) {
                this.getDialog().getModel(SELECTED_CONTEXT_MODEL).setProperty("/selectedLength", aSelectedContexts.length);
            }
        },

        _charcNumberFormat: function(sValue) {
            let oDialogModelData = this.getDialog().getModel().getData();
            let sUom = oDialogModelData.uom;
            let nDecimalPlaces = oDialogModelData.decimalPlaces;
            let options = {
                maxFractionDigits: nDecimalPlaces,
                minFractionDigits: nDecimalPlaces
            };
            let sFormatedValue = NumberFormatter.dmcLocaleQuantityFormatterDisplay(sValue, "", options);
            return sUom ? (sFormatedValue + " " + sUom) : sFormatedValue;
        },

        charcValueChange: function(oEvent) {
            let oDialogModelData = this.getDialog().getModel().getData();
            let oBindingContext = oEvent.getSource().getBindingContext();
            let nRowIndex = this._getRowIndexFromPath(oBindingContext.getPath());
            let sCharcValue = oBindingContext.getProperty("charcValue");
            let oValidateresult = this._validateNewCharc(sCharcValue, nRowIndex);
            if (oDialogModelData.dataType === "NUM" && oValidateresult.isValidate && sCharcValue !== "") {
                // format number by decimalPlaces
                let options = {
                    maxFractionDigits: oDialogModelData.decimalPlaces,
                    minFractionDigits: oDialogModelData.decimalPlaces
                };
                let sNumber = NumberFormatter.dmcLocaleNumberParser(sCharcValue);
                let nFormattedValue = NumberFormatter.dmcLocaleQuantityFormatterDisplay(sNumber, "", options);
                oEvent.getSource().setValue(nFormattedValue);
            }
        },

        _validateNewCharc: function(sCharcValue, nRowIndex, bIgnoreEmptyValue) {
            let oDialogModelData = this.getDialog().getModel().getData();
            let oRowData = oDialogModelData["charcAllowedValues"][nRowIndex];
            let oInputCtrl = this._getTextInputCtrl(nRowIndex, oDialogModelData.dataType);
            let isValidate = true;
            let isEmptyValue = false;

            if (sCharcValue === null || sCharcValue.trim() === "") {
                isEmptyValue = true;
                if (!bIgnoreEmptyValue) {
                    isValidate = false;
                }
                ErrorHandler.setErrorState(oInputCtrl, Bundles.getGoodreceiptText("characteristic.error.value.notEmpty"));
            } else {
                if (this.fnHandleValidateCharacteristicValueAndUpdateInputState) {
                    if (oDialogModelData.dataType === "NUM") {
                        sCharcValue = String(NumberFormatter.dmcLocaleNumberParser(sCharcValue));
                    }
                    isValidate = this._validateNewCharcOnCallBackFn(oDialogModelData, sCharcValue, oInputCtrl);
                }
            }
            return {
                isValidate: isValidate,
                emptyValueRowIndex: isEmptyValue ? nRowIndex : null
            };
        },

        _validateNewCharcOnCallBackFn: function(oDialogModelData, sCharcValue, oInputCtrl) {
            let oValidateResult = this.fnHandleValidateCharacteristicValueAndUpdateInputState(oDialogModelData, sCharcValue, oInputCtrl);
            let isValidate = oValidateResult.isValidate;
            if (isValidate) {
                let aSameCharcValueRow = oDialogModelData["charcAllowedValues"].filter(function(oItem) {
                    return oItem.charcValue && String(oItem.charcValue.toUpperCase()) === String(sCharcValue.toUpperCase());
                });
                if (aSameCharcValueRow.length > 1) {
                    isValidate = false;
                    ErrorHandler.setErrorState(oInputCtrl, Bundles.getGoodreceiptText("characteristic.error.valueSameInValues"));
                } else if (oValidateResult.bNoWarning) {
                    ErrorHandler.clearErrorState(oInputCtrl);
                }
            }
            return isValidate;
        },

        _getTextInputCtrl: function(nRowIndex, sDataType) {
            let nColumnIndex;
            switch (sDataType) {
                case "DATE":
                    nColumnIndex = 5;
                    break;
                case "TIME":
                    nColumnIndex = 7;
                    break;
                case "NUM":
                    nColumnIndex = 3;
                    break;
                case "CHAR":
                default:
                    nColumnIndex = 1;
                    break;
            }
            return this.getResultTable().getItems()[nRowIndex].getCells()[0].getItems()[0].getItems()[nColumnIndex];
        },

        _getRowIndexFromPath: function(sPath) {
            return Number(sPath.substr(sPath.lastIndexOf("/") + 1));
        },

        onSure: function() {
            let oValidateResult = this._validateTableRows(true);
            let bSelectedEmptyValueRow = false;
            let aSelectedRowIndexes = this.getResultTable().getSelectedItems().map(function(oSelectedItem) {
                return this.getResultTable().indexOfItem(oSelectedItem);
            }.bind(this));
            aSelectedRowIndexes.forEach(function(nRowIndex) {
                if (oValidateResult.emptyValueIndexes.indexOf(nRowIndex) > -1) {
                    bSelectedEmptyValueRow = true;
                }
            });

            if (this.getTableIsMultiMode() && oValidateResult.isValidate && !bSelectedEmptyValueRow) {
                this._handleRowSelectionChange();
            }
        },

        _validateTableRows: function(bIgnoreEmptyValue) {
            let isValidate = true;
            let aEmptyValueIndexes = [];
            this.getDialog().getModel().getProperty("/charcAllowedValues").forEach(function(oRowData, nRowIndex) {
                if (oRowData.type === TYPE_NEW) {
                    let oValidateResult = this._validateNewCharc(oRowData.charcValue, nRowIndex, bIgnoreEmptyValue);
                    if (!oValidateResult.isValidate) {
                        isValidate = false;
                    }
                    if (oValidateResult.emptyValueRowIndex !== null) {
                        aEmptyValueIndexes.push(nRowIndex);
                    }
                }
            }.bind(this));
            return {
                isValidate: isValidate,
                emptyValueIndexes: aEmptyValueIndexes
            }
        },

        /**
         * get multiable selected Table selected contexts
         */
        getListSelectedContexts: function() {
            return this.getResultTable().getSelectedContexts();
        },

        getViewModel: function() {
            return this.getDialog().getModel(VIEW_MODEL_NAME);
        },

        onDeletePressed: function(oEvent) {
            let sPath = oEvent.getSource().getParent().getBindingContext().getPath();
            let index = this._getRowIndexFromPath(sPath);
            let aNewCharcAllowedValues = this.getDialog().getModel().getProperty("/charcAllowedValues").filter(function(oRowData, nRowIndex) {
                return nRowIndex !== index;
            });
            this.getDialog().getModel().setProperty("/charcAllowedValues", aNewCharcAllowedValues);
            let aNewBatchCharcValueContextPaths = this._getNewBatchCharcValueSelectedContextPaths(index);
            this._updateTabelSelectedContextPaths(aNewBatchCharcValueContextPaths);
        },

        onAddPressed: function() {
            let oValidateResult = this._validateTableRows();
            if (oValidateResult.isValidate) {
                let oDialogData = this.getDialog().getModel().getData();
                let bTableIsMultiMode = this.getTableIsMultiMode();
                if (oDialogData.addBtnVisible) {
                    oDialogData.charcAllowedValues.unshift({
                        charcId: oDialogData.headerKey,
                        charcValue: null,
                        charcValuePositionNumber: this.getNewCharcPostionNumber(oDialogData),
                        type: TYPE_NEW
                    });
                    this.getDialog().getModel().refresh();

                    let aNewBatchCharcValueContextPaths = this._getNewBatchCharcValueSelectedContextPaths(-1);
                    if (bTableIsMultiMode) {
                        aNewBatchCharcValueContextPaths.push("/charcAllowedValues/0");
                    }
                    this._updateTabelSelectedContextPaths(aNewBatchCharcValueContextPaths);

                    let oInputCtrl = this._getTextInputCtrl(0, oDialogData.dataType);
                    oInputCtrl && oInputCtrl.focus();
                }
            }
        },

        _getNewBatchCharcValueSelectedContextPaths: function(index) {
            return this.getResultTable().getSelectedContextPaths().filter(function(sPath) {
                let nRowIndex = this._getRowIndexFromPath(sPath);
                return nRowIndex !== index;
            }.bind(this)).map(function(sPath) {
                let nRowIndex = this._getRowIndexFromPath(sPath);
                if (nRowIndex > index) {
                    if (index > -1) {
                        return sPath.replace(nRowIndex, nRowIndex - 1);
                    } else {
                        return sPath.replace(nRowIndex, nRowIndex + 1);
                    }
                } else {
                    return sPath;
                }
            }.bind(this));
        },

        getNewCharcPostionNumber: function(oDialogData) {
            let aAllowedValueList = $.extend(true, [], oDialogData.charcAllowedValues);
            //find the biggest charcValuePositionNumber
            let aSortCharcAllowedValues = aAllowedValueList.sort(function(oPre, oNext) {
                return Number(oNext.charcValuePositionNumber) - Number(oPre.charcValuePositionNumber);
            });
            return aSortCharcAllowedValues.length > 0 ? (Number(aSortCharcAllowedValues[0]["charcValuePositionNumber"]) + 1) : 1;
        },

        getTableIsMultiMode: function() {
            return this.getDialog().getModel().getProperty("/isMultipleValuesAllowed");
        }
    });

    return {

        /**
         * Instantiates and opens value help dialog.
         * @param {sap.ui.core.Element} oParentControl - value help dialog will be set as dependent to it.
         * @param {String} sDefaultSearchValue - default value placed in a search field and a list is filtered by.
         * @param fnSelectionCallback - callback function called when user selects item in a list.
         * @param {object} oModel datamodel to be binded
         * @param {string} sTableId Id of the table in batch browse, used for setting new binding to ListFilter
         */
        open: function(oParentControl, sDefaultSearchValue, fnSelectionCallback, oModel, sTableId, fnHandleValidateCharacteristicValueAndUpdateInputState) {
            let sFragmentName = "sap.dm.dme.browse.view.BatchCharacValueSelectBrowse";
            if (oModel.getProperty("/isMultipleValuesAllowed")) {
                sFragmentName = "sap.dm.dme.browse.view.BatchCharacValueMultiSelectBrowse";
            }

            if (oModel.getProperty("/dataType") === "NUM") {
                let nDecimalPlaces = oModel.getProperty("/decimalPlaces");
                let aCharcAllowedValues = oModel.getProperty("/charcAllowedValues").map(function(oItem) {
                    let options = {
                        maxFractionDigits: nDecimalPlaces,
                        minFractionDigits: nDecimalPlaces
                    };
                    if (oItem.type === TYPE_NEW) {
                        oItem.charcValue = NumberFormatter.dmcLocaleQuantityFormatterDisplay(oItem.charcValue, "", options);
                    }
                    return oItem;
                });
                oModel.setProperty("/charcAllowedValues", aCharcAllowedValues);
            }

            let oBatchCharacValueSelectBrowse = new BatchCharacValueSelectBrowse("batchCharacValueSelectBrowse", {

                oModel: oModel,
                sFragmentName: sFragmentName,
                oParentControl: oParentControl,
                sDefaultSearchValue: sDefaultSearchValue,
                fnSelectionCallback: fnSelectionCallback,
                oFilterSettings: {
                    aLiveSearchProperties: ["charcValue"]
                }
            });

            oBatchCharacValueSelectBrowse._sTableId = sTableId;
            oBatchCharacValueSelectBrowse.fnHandleValidateCharacteristicValueAndUpdateInputState = fnHandleValidateCharacteristicValueAndUpdateInputState;

            return oBatchCharacValueSelectBrowse;
        }
    };
});