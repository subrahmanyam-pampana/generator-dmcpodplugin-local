/**
 * Provides class sap.dm.dme.control.ViewSettingsDialogFactory.
 * This class is responsible for creating a ViewSettingsDialog based on List Information to perform sorting
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/m/ViewSettingsDialog",
    "sap/m/ViewSettingsItem",
    "sap/ui/model/Sorter",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(BaseObject, ViewSettingsDialog, ViewSettingsItem, Sorter, PodUtility) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.control.ViewSettingsDialogFactory", {

        /**
         * @param {sap.m.Table} oTable sap.m.Table to perform sorting on
         * @param {object} oListConfiguration object containing list configuration
         * @param {object} oResourceBundle jQuery.sap.util.ResourceBundle to get internationalized text
         * @param {object} oGroupSorter Optional Sorter defined with grouping
         */
        constructor: function(oTable, oListConfiguration, oResourceBundle, oGroupSorter) {
            BaseObject.call(this);
            this._oTable = oTable;
            this._oListConfiguration = oListConfiguration;
            this._oResourceBundle = oResourceBundle;
            this._oGroupSorter = oGroupSorter;
            this._iLastSelectedIndex = -1;
            this._sSortPath = "";
            this._bDescending = false;
        },

        /**
         * Return the current view settings information
         *
         * @return JSON object with current view settings
         */
        getViewSettings: function() {
            let oViewSettings = {
                lastSelectedIndex: this._iLastSelectedIndex,
                lastSortPath: this._sSortPath,
                lastSortDescending: this._bDescending
            };
            return oViewSettings;
        },

        /**
         * update the view settings and perform update to table
         *
         * @param oViewSettings JSON object to use for updating
         */
        setViewSettings: function(oViewSettings) {
            this._iLastSelectedIndex = -1;
            this._sSortPath = "";
            this._bDescending = false;
            if (oViewSettings) {
                this._iLastSelectedIndex = oViewSettings.lastSelectedIndex;
                if (oViewSettings.lastSortPath) {
                    this._sSortPath = oViewSettings.lastSortPath;
                }
                if (oViewSettings.lastSortDescending) {
                    this._bDescending = oViewSettings.lastSortDescending;
                }
            }
        },

        /**
         * update table with current view settings
         */
        updateTable: function() {
            if (this._sSortPath && this._sSortPath !== "") {
                this._updateTable(this._sSortPath, this._bDescending);
            }
        },

        /**
         * Factory function to create the sap.m.ViewSettingsDialog based on list configuration data.
         *
         * @return {sap.m.ViewSettingsDialog}
         */
        createDialog: function() {
            if (!this._oListConfiguration || !this._oListConfiguration.columns || this._oListConfiguration.columns.length === 0) {
                return undefined;
            }

            let aColumnList = this._oListConfiguration.columns;

            this._oViewSettingsDialog = new ViewSettingsDialog({
                sortDescending: this._bDescending,
                confirm: [this._handleConfirm, this]
            });

            if (this._iLastSelectedIndex < 0) {
                this._iLastSelectedIndex = this._getLastSelectedIndex(aColumnList);
            }

            this._addSortItems(this._oViewSettingsDialog, aColumnList);

            return this._oViewSettingsDialog;
        },

        _getLastSelectedIndex: function(aColumnList) {
            let iLastSelectedIndex = -1;
            let iLowest = 9999999;
            for (let i = 0; i < aColumnList.length; i++) {
                if (aColumnList[i].sortOrder && aColumnList[i].sortOrder > 0) {
                    if (aColumnList[i].sortOrder < iLowest) {
                        iLastSelectedIndex = i;
                        iLowest = aColumnList[i].sortOrder;
                    }
                }
            }
            return iLastSelectedIndex;
        },

        _addSortItems: function(oDialog, aColumnList) {
            let sColumnName, bSelected, oViewSettingsItem;
            for (let i = 0; i < aColumnList.length; i++) {
                let oColumn = aColumnList[i];
                sColumnName = oColumn.columnId;
                if (oColumn.showSort === false) {
                    continue;
                }
                if (sColumnName.indexOf(".") > 0) {
                    continue;
                }
                bSelected = false;
                if (i === this._iLastSelectedIndex) {
                    bSelected = true;
                }
                oViewSettingsItem = new ViewSettingsItem({
                    text: this._getColumnLabel(oColumn),
                    key: this._getColumnBindingKey(oColumn),
                    selected: bSelected
                });
                oDialog.addSortItem(oViewSettingsItem);
            }
        },

        _handleConfirm: function(oEvent) {
            if (!this._oTable) {
                return;
            }
            let mParams = oEvent.getParameters();
            this._sSortPath = mParams.sortItem.getKey();
            this._bDescending = mParams.sortDescending;
            this._updateTable(this._sSortPath, this._bDescending);
            this._updateLastSelectedIndex(this._sSortPath);
        },

        _updateTable: function(sPath, bDescending) {
            if (!this._oTable) {
                return;
            }
            let oBinding = this._oTable.getBinding("items");
            if (!oBinding) {
                return;
            }
            if (this._oTable.getId().indexOf("operationListPlugin") >= 0) {
                if (sPath === "operationStepId") {
                    sPath = "stepId";
                }
            }
            let aSorters = [];

            // if group sorting, add that sorter first in array
            if (this._oGroupSorter) {
                let vGroup = this._oGroupSorter.fnGroup;
                let sGroupPath = this._oGroupSorter.sPath;
                let oGroupSorter = new Sorter(sGroupPath, false, vGroup);
                aSorters.push(oGroupSorter);
            }

            let oRowSorter = new Sorter(sPath, bDescending);
            aSorters.push(oRowSorter);

            oBinding.sort(aSorters);
        },

        _updateLastSelectedIndex: function(sPath) {
            let aColumnList = this._oListConfiguration.columns;
            for (let i = 0; i < aColumnList.length; i++) {
                let sKey = this._getColumnBindingKey(aColumnList[i]);
                if (sPath === sKey) {
                    this._iLastSelectedIndex = i;
                    break;
                }
            }
        },

        _getColumnLabel: function(oColumn) {
            if (PodUtility.isNotEmpty(oColumn.label)) {
                // for custom extensions column label
                return oColumn.label;
            }
            let sColumn = oColumn.columnId;
            if (!this._oResourceBundle) {
                return sColumn;
            }
            let sValue = this._oResourceBundle.getText(sColumn + ".LABEL");
            if (!sValue || sValue === "") {
                return sColumn;
            }
            return sValue;
        },

        _getColumnBindingKey: function(oColumn) {
            if (PodUtility.isNotEmpty(oColumn.binding)) {
                // for custom extensions column binding
                return oColumn.binding;
            }
            let sColumn = oColumn.columnId;
            if (!this._oResourceBundle) {
                return sColumn;
            }
            let sValue = this._oResourceBundle.getText(sColumn + ".BINDING");
            if (!sValue || sValue === "") {
                return sColumn;
            }
            // remove "{}" from binding
            return sValue.substring(1, sValue.length - 1);
        }
    });
}, true);