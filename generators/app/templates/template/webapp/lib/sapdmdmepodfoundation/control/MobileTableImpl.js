/**
 * Provides class sap.dm.dme.control.MobileTableImpl.
 * This class is responsible for creating a sap.m.Table based on List Information
 *
 * this.aListColumnData optional Array of column data overrides for sap.m.Table
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
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/PopinDisplay",
    "sap/m/Text",
    "sap/ui/core/TextAlign",
    "./BaseTableImpl",
    "../util/PodUtility",
    "sap/dm/dme/formatter/DateTimeUtils"
], function(Table, Column, ColumnListItem, PopinDisplay, Text, TextAlign, BaseTableImpl, PodUtility, DateTimeUtils) {
    "use strict";

    return BaseTableImpl.extend("sap.dm.dme.podfoundation.control.MobileTableImpl", {

        /**
         * Factory function to create the sap.m.Table based on list configuration data.
         *
         * @param sId id for table
         * @param vBindingPath binding path in model (i.e; "/Worklist" or {path: "/Worklist", sorter: .., filters: .., groupHeaderFactory: fn} )
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

            var oTable = new Table(sId, oTableMetadata);

            var sColumnListItemId = sId + "-cli";
            // Check if columnListItem control exists, if so destroy it before creating. JIRA: 116508
            var oColumnListControl = sap.ui.getCore().byId(sColumnListItemId);
            if (oColumnListControl) {
                oColumnListControl.destroy();
            }

            var oColumnListItem = new ColumnListItem(sColumnListItemId, oColumnListItemMetadata);

            var sColumnName, oColumnListItemControl, oColumnData, sHAlign, bWrapping;
            var i;
            for (i = 0; i < aColumnList.length; i++) {
                sColumnName = aColumnList[i].columnId;
                oColumnListItemControl = undefined;
                if (this._aListColumnData && this._aListColumnData[sColumnName]) {
                    oColumnData = this._aListColumnData[sColumnName];
                    if (oColumnData) {
                        oColumnListItemControl = oColumnData.columnListItem;
                    }
                }
                if (!oColumnListItemControl) {
                    // there is no way to evaluate the type of a column at this point, the best we can now.
                    if (sColumnName.indexOf("DATE") >= 0) {
                        oColumnListItemControl = new Text().bindProperty("text", {
                            path: this._getColumnBinding(sColumnName).replace(/[{()}]/g, ''),
                            formatter: function(sDate) {
                                if (!sDate) {
                                    return "";
                                }
                                return DateTimeUtils.dmcDateTimeFormatterFromUTC(sDate, null, "medium");
                            },
                            wrapping: false
                        });
                    } else {
                        sHAlign = TextAlign.Begin;
                        bWrapping = false;
                        if (this._aListColumnData && this._aListColumnData[sColumnName]) {
                            oColumnData = this._aListColumnData[sColumnName];
                            if (oColumnData) {
                                if (PodUtility.isNotEmpty(oColumnData.hAlign)) {
                                    sHAlign = oColumnData.hAlign;
                                }
                                if (typeof oColumnData.wrapping !== "undefined") {
                                    bWrapping = oColumnData.wrapping;
                                }
                            }
                        }
                        oColumnListItemControl = new Text({
                            text: this._getColumnBinding(sColumnName),
                            textAlign: sHAlign,
                            wrapping: bWrapping
                        });
                    }
                }
                oColumnListItem.addCell(oColumnListItemControl);
            }
            if (vBindingPath) {
                if (typeof vBindingPath === "string" || vBindingPath instanceof String) {
                    oTable.bindItems(vBindingPath, oColumnListItem, null, null);
                } else if (PodUtility.isNotEmpty(vBindingPath.path)) {
                    oTable.bindItems({
                        path: vBindingPath.path,
                        template: oColumnListItem,
                        sorter: vBindingPath.sorter,
                        filters: vBindingPath.filters,
                        groupHeaderFactory: vBindingPath.groupHeaderFactory
                    });
                }
            }

            var sColumnId, sColumnHeaderId, sColumnWidth, sColumnText, sMinScreenWidth;
            var sPopinHAlign, sPopinDisplay, sVAlign, sStyleClass;
            var oColumn, oHeaderControl, oColumnMetadata;
            var bDemandPopin, bMergeDuplicates;
            for (i = 0; i < aColumnList.length; i++) {
                sColumnName = aColumnList[i].columnId;

                sColumnWidth = this._getColumnWidth(sColumnName);
                sColumnText = this._getColumnLabel(sColumnName);

                sMinScreenWidth = undefined;
                sPopinHAlign = undefined;
                sPopinDisplay = PopinDisplay.WithoutHeader;
                sHAlign = TextAlign.Begin;
                sVAlign = undefined;
                sStyleClass = undefined;
                bMergeDuplicates = false;
                bDemandPopin = false;
                bWrapping = true;

                oColumnMetadata = undefined;
                oHeaderControl = undefined;
                if (this._aListColumnData && this._aListColumnData[sColumnName]) {
                    oColumnData = this._aListColumnData[sColumnName];
                    if (oColumnData) {
                        oColumnMetadata = oColumnData.metadata;
                        oHeaderControl = oColumnData.header;
                        if (PodUtility.isNotEmpty(oColumnData.minScreenWidth)) {
                            sMinScreenWidth = oColumnData.minScreenWidth;
                        }
                        if (PodUtility.isNotEmpty(oColumnData.popinHAlign)) {
                            sPopinHAlign = oColumnData.popinHAlign;
                        }
                        if (PodUtility.isNotEmpty(oColumnData.popinDisplay)) {
                            sPopinDisplay = oColumnData.popinDisplay;
                        }
                        if (PodUtility.isNotEmpty(oColumnData.vAlign)) {
                            sVAlign = oColumnData.vAlign;
                        }
                        if (PodUtility.isNotEmpty(oColumnData.hAlign)) {
                            sHAlign = oColumnData.hAlign;
                        }
                        if (PodUtility.isNotEmpty(oColumnData.styleClass)) {
                            sStyleClass = oColumnData.styleClass;
                        }
                        if (typeof oColumnData.mergeDuplicates !== "undefined") {
                            bMergeDuplicates = oColumnData.mergeDuplicates;
                        }
                        if (typeof oColumnData.demandPopin !== "undefined" && oColumnData.demandPopin) {
                            bDemandPopin = true;
                        }
                        if (typeof oColumnData.wrapping !== "undefined" && !oColumnData.wrapping) {
                            bWrapping = false;
                        }
                    }
                }
                sColumnId = sId + "_" + sColumnName + "_column";
                oColumn = new Column(sColumnId, oColumnMetadata);
                if (PodUtility.isNotEmpty(sColumnWidth)) {
                    oColumn.setWidth(sColumnWidth);
                }
                if (PodUtility.isNotEmpty(sMinScreenWidth)) {
                    oColumn.setMinScreenWidth(sMinScreenWidth);
                }
                if (PodUtility.isNotEmpty(sHAlign)) {
                    oColumn.setHAlign(sHAlign);
                }
                if (PodUtility.isNotEmpty(sVAlign)) {
                    oColumn.setVAlign(sVAlign);
                }
                if (PodUtility.isNotEmpty(sPopinHAlign)) {
                    // this is deprecated and replaced with popinDisplay
                    oColumn.setPopinHAlign(sPopinHAlign);
                }
                if (PodUtility.isNotEmpty(sPopinDisplay)) {
                    oColumn.setPopinDisplay(sPopinDisplay);
                }
                oColumn.setDemandPopin(bDemandPopin);
                oColumn.setMergeDuplicates(bMergeDuplicates);

                if (!oHeaderControl) {
                    sColumnHeaderId = sColumnId + "_header";
                    oHeaderControl = new Text(sColumnHeaderId, {
                        text: sColumnText,
                        textAlign: sHAlign,
                        wrapping: bWrapping
                    });
                    oHeaderControl.setWidth(sColumnWidth);
                }
                if (oHeaderControl.getMetadata().getName() === "sap.m.Text" && oColumnData) {
                    oHeaderControl.setVisible(!oColumnData.hideLabel);
                }
                var oColumnHeader = oColumn.setHeader(oHeaderControl);

                if (PodUtility.isNotEmpty(sStyleClass)) {
                    oColumnHeader.setStyleClass(sStyleClass);
                }

                oTable.addColumn(oColumn);
            }

            if (!vBindingPath) {
                return {
                    "table": oTable,
                    "columnListItem": oColumnListItem
                };
            }

            return oTable;
        }

    });
}, true);