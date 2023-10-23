/**
 * Provides class sap.dm.dme.control.GridTableImpl.
 * This class is responsible for creating a sap.ui.table.Table based on List Information
 *
 * this.aListColumnData optional Array of column data overrides for sap.ui.table.Table
 * <pre>
 *        aListColumnData[columnId].binding = "{ShopOrder}" (optional, default is in ResourceBundle)
 *        aListColumnData[columnId].label = "override label" (optional, default is in ResourceBundle)
 *        aListColumnData[columnId].width = "10em" (optional, default is in ResourceBundle)
 *        aListColumnData[columnId].metadata = {minScreenWidth="Tablet",demandPopin="true",hAlign="End", ..} (optional)
 *        aListColumnData[columnId].header = sap.ui.core.Control (optional, default is sap.m.Text)
 *        aListColumnData[columnId].columnListItem = sap.ui.core.Control (optional, default is sap.m.Text)
 * </pre>
 */
sap.ui.define([
    "sap/ui/table/Table",
    "sap/ui/table/Column",
    "sap/m/Text",
    "sap/ui/core/TextAlign",
    "./BaseTableImpl"
], function(Table, Column, Text, TextAlign, BaseTableImpl) {
    "use strict";

    return BaseTableImpl.extend("sap.dm.dme.podfoundation.control.GridTableImpl", {

        /**
         * Factory function to create the sap.m.Table based on list configuration data.
         *
         * @param sId id for table
         * @param vBindingPath binding path in model (i.e; "/Worklist" or {path: "/Worklist"} )
         * @param oTableMetadata metadata for Table
         * @param oColumnListItemMetadata metadata for ColumnListItem
         * @return {sap.m.Table}
         */
        createTable: function(sId, vBindingPath, oTableMetadata, oColumnListItemMetadata) {
            if (!this._oListConfiguration || !this._oListConfiguration.columns || this._oListConfiguration.columns.length === 0) {
                return undefined;
            }

            var aColumnList = this._oListConfiguration.columns;

            // sort by sequence order
            aColumnList.sort(function(a, b) {
                if (a.sequence < b.sequence) {
                    return -1;
                } else if (a.sequence > b.sequence) {
                    return 1;
                }
                return 0;
            });

            var sSelectionMode = "Single";
            if (this._oListConfiguration.allowMultipleSelection) {
                sSelectionMode = "MultiToggle";
            }

            var oMetaData = {
                alternateRowColors: oTableMetadata.alternateRowColors,
                selectionMod: sSelectionMode,
                visibleRowCountMode: "Auto"
            };

            var oTable = new Table(sId, oMetaData);

            if (this._oListConfiguration.allowOperatorToChangeColumnSequence) {
                oTable.setEnableColumnReordering(true);
            }

            if (vBindingPath) {
                var sBindingPath = vBindingPath;
                if (typeof vBindingPath !== "string" && jQuery.trim(vBindingPath.path)) {
                    sBindingPath = vBindingPath.path;
                }
                oTable.bindRows(sBindingPath);
            }

            var sColumnId, sColumnName, sColumnBinding, sColumnHeaderId, sColumnWidth, sColumnText, sHAlign;
            var oColumn, oColumnData, oColumnListItemControl;
            var bWrapping;
            for (var i = 0; i < aColumnList.length; i++) {
                sColumnName = aColumnList[i].columnId;
                sColumnBinding = this._getColumnBinding(sColumnName);
                sColumnWidth = this._getColumnWidth(sColumnName);
                sColumnText = this._getColumnLabel(sColumnName);

                sHAlign = TextAlign.Begin;
                bWrapping = true;
                oColumnListItemControl = undefined;
                if (this._aListColumnData && this._aListColumnData[sColumnName]) {
                    if (this._aListColumnData && this._aListColumnData[sColumnName]) {
                        oColumnData = this._aListColumnData[sColumnName];
                        if (oColumnData) {
                            oColumnListItemControl = oColumnData.columnListItem;
                            if (oColumnData.hAlign && oColumnData.hAlign !== "") {
                                sHAlign = oColumnData.hAlign;
                            }
                            if (typeof oColumnData.wrapping !== "undefined" && !oColumnData.wrapping) {
                                bWrapping = false;
                            }
                        }
                    }
                }
                if (!oColumnListItemControl) {
                    oColumnListItemControl = new Text({
                        text: this._getColumnBinding(sColumnName),
                        textAlign: sHAlign,
                        wrapping: false
                    });
                }
                sColumnId = sId + "_" + sColumnName + "_column";
                sColumnHeaderId = sColumnId + "_header";

                oColumn = new sap.ui.table.Column(sColumnId, {
                    label: new Text(sColumnHeaderId, {
                        text: sColumnText,
                        textAlign: sHAlign,
                        wrapping: bWrapping
                    }),
                    template: oColumnListItemControl,
                    resizable: true
                });

                if (this._oListConfiguration.allowOperatorToSortRows) {
                    oColumn.setSortProperty(sColumnBinding);
                }

                // oColumn.setFilterProperty(sColumnBinding);

                if (jQuery.trim(sColumnWidth)) {
                    oColumn.setWidth(sColumnWidth);
                }

                oTable.addColumn(oColumn);
            }
            return oTable;
        }
    });
}, true);