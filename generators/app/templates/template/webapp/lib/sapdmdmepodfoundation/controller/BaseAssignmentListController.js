sap.ui.define([
    "sap/dm/dme/podfoundation/controller/BaseListMaintenanceController"
], function(BaseListMaintenanceController) {
    "use strict";

    var BaseAssignmentListController = BaseListMaintenanceController.extend("sap.dm.dme.podfoundation.controller.BaseAssignmentListController", {
        setAvailableTableId: function(sAvailableTableId) {
            this._sAvailableTableId = sAvailableTableId;
        },

        setAssignedTableId: function(sAssignedTableId) {
            this._sAssignedTableId = sAssignedTableId;
        },

        setAssignedKeyId: function(sAssignedRowKeyId) {
            this._sAssignedKeyId = sAssignedRowKeyId;
        },

        setAvailableKeyId: function(sAvailableKeyId) {
            this._sAvailableKeyId = sAvailableKeyId;
        },

        setAssignedColumns: function(aAssignedColumns) {
            this._aAssignedColumns = aAssignedColumns;
        },

        getAssignmentModel: function() {
            if (!this._oAssignmentModel) {
                var oTable = this.getAssignedTable();
                if (oTable) {
                    this._oAssignmentModel = oTable.getModel();
                }
            }
            return this._oAssignmentModel;
        },

        getAvailableTable: function() {
            if (!this._oAvailableTable) {
                this._oAvailableTable = this._byId(this._sAvailableTableId);
            }
            return this._oAvailableTable;
        },

        getAssignedTable: function() {
            if (!this._oAssignedTable) {
                this._oAssignedTable = this._byId(this._sAssignedTableId);
            }
            return this._oAssignedTable;
        },

        _getTableById: function(sTableId) {
            if (!this._oAssignedTable) {
                this._oAssignedTable = this._byId(this._sAssignedTableId);
            }
            return this._oAssignedTable;
        },

        _byId: function(sId) {
            // added to support QUnit tests
            return sap.ui.getCore().byId(sId);
        },

        config: {
            initialRank: 0,
            defaultRank: 10240,
            rankAlgorithm: {
                Before: function(iRank) {
                    return iRank + 10240;
                },
                Between: function(iRank1, iRank2) {
                    return (iRank1 + iRank2) / 2;
                },
                After: function(iRank) {
                    return iRank / 2;
                }
            }
        },

        _getNumberOfRows: function(oTable) {
            var aItems = oTable.getItems();
            if (!aItems) {
                return 0;
            }
            return aItems.length;
        },

        _getContextByIndex: function(oTable, iSelectedRowIndex) {
            var aItems = oTable.getItems();
            if (aItems && aItems.length > 0 && iSelectedRowIndex >= 0 && iSelectedRowIndex < aItems.length) {
                return aItems[iSelectedRowIndex].getBindingContext();
            }
            return undefined;
        },

        _setSelectedIndex: function(oTable, iIndex) {
            var aItems = oTable.getItems();
            if (aItems && aItems.length > 0 && iIndex >= 0 && iIndex < aItems.length) {
                oTable.setSelectedItem(aItems[iIndex], true);
                aItems[iIndex].setSelected(true);
                oTable.fireSelectionChange({
                    listItem: aItems[iIndex],
                    selected: true
                });
            }
        },

        getSelectedRowContext: function(oTable, fnCallback) {
            var aSelectedItems = oTable.getSelectedItems();
            var aMoveColumnId = [];
            var i;
            for (i = 0; i < aSelectedItems.length; i++) {
                var oSelectedContext = aSelectedItems[i].getBindingContext();
                var sSelectedRowKeyValue = oSelectedContext.getProperty(this._sAvailableKeyId);
                aMoveColumnId[aMoveColumnId.length] = sSelectedRowKeyValue;
            }
            oTable.removeSelections(true);

            for (i = 0; i < aMoveColumnId.length; i++) {
                var oItem = this._findItemByColumnId(oTable, aMoveColumnId[i]);
                if (oItem) {
                    var oBindingContext = oItem.getBindingContext();
                    var iIndex = oTable.indexOfItem(oItem);
                    if (oBindingContext && fnCallback) {
                        fnCallback.call(this, oBindingContext, iIndex, oTable);
                    }
                }
            }

            return oSelectedContext;
        },

        _findItemByColumnId: function(oTable, sSelectedRowKeyValue) {
            var aItems = oTable.getItems();
            if (aItems && aItems.length > 0) {
                for (var i = 0; i < aItems.length; i++) {
                    var oBindingContext = aItems[i].getBindingContext();
                    if (sSelectedRowKeyValue === oBindingContext.getProperty(this._sAvailableKeyId)) {
                        return aItems[i];
                    }
                }
            }
            return undefined;
        },

        moveAvailableToAssigned: function() {
            if (this._aAssignedColumns && this._aAssignedColumns.length > 0) {
                var oTable1 = this.getAvailableTable();
                var oTable2 = this.getAssignedTable();

                for (var i = 0; i < this._aAssignedColumns.length; i++) {
                    var sAssignedKeyValue = this._aAssignedColumns[i][this._sAssignedKeyId];
                    var sSortOrder = this._aAssignedColumns[i].sortOrder;

                    var j = 0;
                    var oSelectedContext = this._getContextByIndex(oTable1, j);
                    while (oSelectedContext) {
                        var oObject = oSelectedContext.getObject();
                        if (oObject && sAssignedKeyValue === oObject[this._sAvailableKeyId]) {
                            var iNumberOfRows = this._getNumberOfRows(oTable2);
                            var oRowContext, iNewRank;
                            if (iNumberOfRows > 0) {
                                // insert after last row
                                oRowContext = this._getContextByIndex(oTable2, iNumberOfRows - 1);
                                iNewRank = this.config.defaultRank;
                                if (oRowContext) {
                                    iNewRank = this.config.rankAlgorithm.After(oRowContext.getProperty("Rank"));
                                }
                            } else {
                                // insert always as a first row
                                oRowContext = this._getContextByIndex(oTable2, 0);
                                iNewRank = this.config.defaultRank;
                                if (oRowContext) {
                                    iNewRank = this.config.rankAlgorithm.Before(oRowContext.getProperty("Rank"));
                                }
                            }
                            var oModel = this.getAssignmentModel();
                            if (oModel) {
                                oModel.setProperty("Rank", iNewRank, oSelectedContext);
                                oModel.setProperty("sortOrder", sSortOrder, oSelectedContext);
                                oModel.refresh(true);
                            }
                            break;
                        }
                        j++;
                        oSelectedContext = this._getContextByIndex(oTable1, j);
                    }
                }
            }
        },

        moveToAvailable: function() {
            this.getSelectedRowContext(this.getAssignedTable(), function(oSelectedRowContext, iSelectedRowIndex, oTable2) {
                // reset the rank property and update the model to refresh the bindings
                var oModel = this.getAssignmentModel();
                if (oModel) {
                    var oData = oSelectedRowContext.getObject();
                    this.onMoveToAvailable(oData);
                    oModel.setProperty("Rank", this.config.initialRank, oSelectedRowContext);
                    oModel.refresh(true);
                }

                // select the previous row when there is no row to select
                var oNextContext = this._getContextByIndex(oTable2, iSelectedRowIndex + 1);
                if (!oNextContext) {
                    this._setSelectedIndex(oTable2, iSelectedRowIndex - 1);
                }
            });
        },

        onMoveToAvailable: function(oSelectedRowData) {
            // allow subclasses to handle removes
        },

        moveToAssigned: function() {
            this.getSelectedRowContext(this.getAvailableTable(), function(oSelectedRowContext) {
                var oTable2 = this.getAssignedTable();

                var iNumberOfRows = this._getNumberOfRows(oTable2);
                var oRowContext, iNewRank;
                if (iNumberOfRows > 0) {
                    // insert after last row
                    oRowContext = this._getContextByIndex(oTable2, iNumberOfRows - 1);
                    iNewRank = this.config.defaultRank;
                    if (oRowContext) {
                        iNewRank = this.config.rankAlgorithm.After(oRowContext.getProperty("Rank"));
                    }
                } else {
                    // insert always as a first row
                    oRowContext = this._getContextByIndex(oTable2, 0);
                    iNewRank = this.config.defaultRank;
                    if (oRowContext) {
                        iNewRank = this.config.rankAlgorithm.Before(oRowContext.getProperty("Rank"));
                    }
                }

                var oModel = this.getAssignmentModel();
                if (oModel) {
                    oModel.setProperty("Rank", iNewRank, oSelectedRowContext);
                    oModel.refresh(true);
                    var oData = oSelectedRowContext.getObject();
                    this.onMoveToAssigned(oData);
                }

                // select the inserted row
                this._setSelectedIndex(oTable2, iNumberOfRows);
            });
        },

        onMoveToAssigned: function(oSelectedRowData) {
            // allow subclasses to handle removes
        },

        moveSelectedRow: function(sDirection) {
            this.getSelectedRowContext(this.getAssignedTable(), function(oSelectedRowContext, iSelectedRowIndex, oTable2) {
                var iSiblingRowIndex = iSelectedRowIndex + (sDirection === "Up" ? -1 : 1);
                var oSiblingRowContext = this._getContextByIndex(oTable2, iSiblingRowIndex);
                if (!oSiblingRowContext) {
                    return;
                }

                // swap the selected and the siblings rank
                var iSiblingRowRank = oSiblingRowContext.getProperty("Rank");
                var iSelectedRowRank = oSelectedRowContext.getProperty("Rank");
                var oModel = this.getAssignmentModel();
                if (oModel) {
                    oModel.setProperty("Rank", iSiblingRowRank, oSelectedRowContext);
                    oModel.setProperty("Rank", iSelectedRowRank, oSiblingRowContext);
                    oModel.refresh(true);
                }

                // after move select the sibling
                this._setSelectedIndex(oTable2, iSiblingRowIndex);
            });
        },

        moveUp: function() {
            this.moveSelectedRow("Up");
        },

        moveDown: function() {
            this.moveSelectedRow("Down");
        }
    });

    return BaseAssignmentListController;
});