sap.ui.define([
    "sap/ui/core/syncStyleClass",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/podfoundation/controller/BaseListMaintenanceController",
    "sap/dm/dme/podfoundation/controller/ListColumnEditorController"
], function(syncStyleClass, ResourceModel, JSONModel, BaseListMaintenanceController, ListColumnEditorController) {
    "use strict";

    return BaseListMaintenanceController.extend("sap.dm.dme.podfoundation.controller.ListNameSearchController", {

        beforeOpen: function() {
            var oTable = sap.ui.getCore().byId("listNameSearchTable");
            oTable.setModel(this._oTableModel);
            this.setInitialSelection(oTable);
        },

        setInitialSelection: function(oTable) {
            if (!this._sCurrentListName) {
                return;
            }

            var oListData = this._oTableModel.getData();
            if (!oListData || !oListData.ListNames) {
                return;
            }

            var aListItems = oTable.getItems();
            oListData.ListNames.some(function(element, index) {
                var bFound = this._sCurrentListName === element.listName;
                if (bFound && index < aListItems.length) {
                    oTable.setSelectedItem(aListItems[index]);
                }
                return bFound;
            }.bind(this));
        },

        setTableModel: function(oTableModel) {
            this._oTableModel = oTableModel;
        },

        setCurrentListName: function(sListName) {
            this._sCurrentListName = sListName;
        },

        setColumnEditorDetails: function(aColumnEditorDetails) {
            this._aColumnEditorDetails = aColumnEditorDetails;
        },

        setConfirmHandler: function(fnConfirmHandler, oFnContext) {
            this._fnConfirmHandler = fnConfirmHandler;
            this._oFnContext = oFnContext;
        },

        setCancelHandler: function(fnCancelHandler, oFnContext) {
            this._fnCancelHandler = fnCancelHandler;
            this._oFnContext = oFnContext;
        },

        _handleListNameDialogConfirm: function(oEvent) {
            var oTable = sap.ui.getCore().byId("listNameSearchTable");
            var oSelectedItem = oTable.getSelectedItem();
            var sPath = oSelectedItem.getBindingContext().getPath();
            var oModel = oTable.getModel();
            var oSelectedRowData = oModel.getProperty(sPath);

            this._fnConfirmHandler.call(this._oFnContext, oSelectedRowData.listName);
        },

        _handleListNameDialogCancel: function(oEvent) {
            this._fnCancelHandler.call(this._oFnContext);
        },

        _handleListNameDialogNew: function(oEvent) {
            var oDefaultData = {
                listType: this.getListType(),
                listName: "",
                worklistType: "SFC",
                description: "",
                maximumNumberOfRow: 100,
                allowOperatorToChangeColumnSequence: false,
                allowOperatorToSortRows: false,
                allowMultipleSelection: false,
                statusData: {
                    showActive: true,
                    showHold: true,
                    showInQueue: true,
                    showNew: true
                },
                maxRowPerPage: null,
                listIcons: {
                    showBuyOff: false,
                    showCollectParentNumber: false,
                    showComponent: false,
                    showDataCollection: false,
                    showTool: false,
                    showWorkInstruction: false
                },
                showChangeAlert: false,
                columns: []
            };
            var aCustomTypes = null;

            if (oDefaultData.listType === "POD_WORKLIST") {
                aCustomTypes = ["ITEM", "SHOP_ORDER"];
            }

            var oService = this.getListMaintenanceService();
            return oService.getCustomColumns(aCustomTypes)
                .then(function(aCustomColumns) {
                    this.showListColumnEditorDialog(oDefaultData, aCustomColumns, this.getMainView(), this.getListType(), "", this._aColumnEditorDetails);
                }.bind(this));
        },

        _showDetails: function(oEvent) {
            var oTable = sap.ui.getCore().byId("listNameSearchTable");
            var oModel = oTable.getModel();
            var path = oEvent.getSource().getBindingContext().getPath();
            var sListName = oModel.getProperty(path).listName;
            var sListType = this.getListType();
            var aCustomTypes = null;

            if (sListType === "POD_WORKLIST") {
                aCustomTypes = ["ITEM", "SHOP_ORDER"];
            }

            var oService = this.getListMaintenanceService();
            return oService.getListConfiguration(sListType, sListName)
                .then(function(oResponseData) {

                    return oService.getCustomColumns(aCustomTypes)
                        .then(function(aCustomColumns) {
                            this.showListColumnEditorDialog(oResponseData, aCustomColumns, this.getMainView(), sListType, sListName, this._aColumnEditorDetails);
                        }.bind(this));

                }.bind(this))
                .catch(function(oError) {
                    var sDefaultMessage = this.getI18nText("message.listSearchUnknownError");
                    this.showAjaxErrorMessage(sDefaultMessage, oError);
                }.bind(this));
        },

        _addAvailableCustomDataColumns: function(oResponseData, sListType) {
            // will append custom data columns for material and shop order)
        },

        showListColumnEditorDialog: function(oResponseData, aCustomColumns, oMainView, sListType, sListName, oColumnEditorDetails) {
            this._oLceDialogController = new ListColumnEditorController();

            this._oLceDialogController.setAvailableTableId("availableColumnsTable");
            this._oLceDialogController.setAssignedTableId("listColumnEditorTable");
            this._oLceDialogController.setAvailableKeyId("columnId");
            this._oLceDialogController.setAssignedKeyId("columnId");

            var oAvailableColumns = this._getAvailableColumns(oResponseData, aCustomColumns, oColumnEditorDetails);

            // sort columns by sequence
            oResponseData.columns.sort(function(a, b) {
                if (a.sequence > b.sequence) {
                    return 1;
                } else if (b.sequence > a.sequence) {
                    return -1;
                }
                return 0;
            });

            // eliminate columns no longer supported
            var aAssignedColumns = [];
            for (var i = 0; i < oResponseData.columns.length; i++) {
                for (var j = 0; j < oAvailableColumns.columns.length; j++) {
                    if (oResponseData.columns[i].columnId === oAvailableColumns.columns[j].columnId) {
                        aAssignedColumns[aAssignedColumns.length] = oResponseData.columns[i];
                        break;
                    }
                }
            }

            this._oLceModel = new JSONModel();
            this._oLceModel.setData(oAvailableColumns);
            this._oLceDialogController.setAssignmentModel(this._oLceModel);
            this._oLceDialogController.setAssignedColumns(aAssignedColumns);
            this._oLceDialogController.setMainView(oMainView);
            this._oLceDialogController.setListType(sListType);
            this._oLceDialogController.setListName(sListName);
            this._oLceDialogController.setSaveHandler(this._handleListColumnEditorDialogSave, this);
            this._oLceDialogController.setCancelHandler(this._handleListColumnEditorDialogCancel, this);
            // this._oLceDialogController.setDeleteHandler(this._handleListColumnEditorDialogDelete, this);

            this._oLceDialogDialog = this._createListColumnEditorDialog(oMainView, this._oLceDialogController);

            this._oLceDialogDialog.attachBeforeOpen(this._oLceDialogController.beforeOpen, this._oLceDialogController);
            this._oLceDialogDialog.attachAfterOpen(this._oLceDialogController.afterOpen, this._oLceDialogController);

            var oResourceModel = new sap.ui.model.resource.ResourceModel({
                bundleName: "sap.dm.dme.i18n.propertyEditor"
            });
            this._oLceDialogDialog.setModel(oResourceModel, "lceI18n");

            var oGlobalResourceModel = new sap.ui.model.resource.ResourceModel({
                bundleName: "sap.dm.dme.i18n.global"
            });
            this._oLceDialogDialog.setModel(oGlobalResourceModel, "i18n-global");
            this._oLceDialogDialog.setModel(this._oLceModel);

            var that = this;
            this._oLceDialogDialog.setEscapeHandler(function(oPromise) {
                that._handleListColumnEditorDialogCancel();
                oPromise.resolve();
            });

            oMainView.addDependent(this._oLceDialogDialog);

            this._oLceDialogDialog.open();
        },

        _createListColumnEditorDialog: function(oMainView, oDialogController) {
            // To support QUnit Tests
            var oDialog = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.ListColumnEditorDialog", oDialogController);
            syncStyleClass("sapUiSizeCompact", oMainView, oDialog);
            return oDialog;
        },

        _getAvailableColumns: function(oResponseData, aCustomColumns, oColumnEditorDetails) {
            var oAvailableColumns = {
                WorklistTypes: this._getWorklistTypes(),
                showMaximumNumberOfRows: false,
                showAllowMultipleSelection: false,
                allowOperatorToChangeColumnSequence: false,
                allowOperatorToSortRows: false,
                showWorklistType: false,
                showGlobalListFields: true,
                globalListSpacerWidth: "150px",
                showOperatorChangeColumnOrder: false,
                showOperatorChangeSortOrder: false,
                showOrderingOptions: false,
                showSortOrderColumn: true,
                showDetailsColumn: true,
                orderingOptionsSpacerWidth1: "200px",
                orderingOptionsSpacerWidth2: "20px",
                columns: []
            };

            // load available columns
            var i;
            if (oColumnEditorDetails && oColumnEditorDetails.columns && oColumnEditorDetails.columns.length > 0) {
                var iCount = 0;
                if (typeof oColumnEditorDetails.showMaximumNumberOfRows !== "undefined" && oColumnEditorDetails.showMaximumNumberOfRows) {
                    oAvailableColumns.showMaximumNumberOfRows = oColumnEditorDetails.showMaximumNumberOfRows;
                    iCount++;
                }
                if (typeof oColumnEditorDetails.showAllowMultipleSelection !== "undefined" && oColumnEditorDetails.showAllowMultipleSelection) {
                    oAvailableColumns.showAllowMultipleSelection = oColumnEditorDetails.showAllowMultipleSelection;
                    iCount++;
                }
                if (typeof oColumnEditorDetails.showWorklistType !== "undefined" && oColumnEditorDetails.showWorklistType) {
                    oAvailableColumns.showWorklistType = oColumnEditorDetails.showWorklistType;
                    iCount++;
                }
                if (iCount === 0) {
                    oAvailableColumns.showGlobalListFields = false;
                } else if (iCount === 1) {
                    oAvailableColumns.globalListSpacerWidth = "350px";
                } else if (iCount === 2) {
                    oAvailableColumns.globalListSpacerWidth = "250px";
                }

                iCount = 0;
                if (typeof oColumnEditorDetails.showOperatorChangeColumnOrder !== "undefined" && oColumnEditorDetails.showOperatorChangeColumnOrder) {
                    oAvailableColumns.showOperatorChangeColumnOrder = oColumnEditorDetails.showOperatorChangeColumnOrder;
                    iCount++;
                }
                if (typeof oColumnEditorDetails.showOperatorChangeSortOrder !== "undefined" && oColumnEditorDetails.showOperatorChangeSortOrder) {
                    oAvailableColumns.showOperatorChangeSortOrder = oColumnEditorDetails.showOperatorChangeSortOrder;
                    iCount++;
                }
                if (iCount > 0) {
                    oAvailableColumns.showOrderingOptions = true;
                    if (iCount === 1) {
                        oAvailableColumns.orderingOptionsSpacerWidth2 = "0px";
                        if (oAvailableColumns.showOperatorChangeColumnOrder) {
                            oAvailableColumns.orderingOptionsSpacerWidth1 = "300px";
                        } else {
                            oAvailableColumns.orderingOptionsSpacerWidth1 = "350px";
                        }
                    }
                }
                if (typeof oColumnEditorDetails.hideSortOrderColumn !== "undefined") {
                    oAvailableColumns.showSortOrderColumn = !oColumnEditorDetails.hideSortOrderColumn;
                }
                if (typeof oColumnEditorDetails.hideDetailsColumn !== "undefined") {
                    oAvailableColumns.showDetailsColumn = !oColumnEditorDetails.hideDetailsColumn;
                }

                if (oResponseData) {
                    oAvailableColumns.listType = oResponseData.listType;
                    oAvailableColumns.listName = oResponseData.listName;
                    oAvailableColumns.worklistType = oResponseData.worklistType;
                    oAvailableColumns.description = oResponseData.description;
                    if (typeof oResponseData.maximumNumberOfRow === "undefined" || !oResponseData.maximumNumberOfRow) {
                        //defaults to 100
                        oAvailableColumns.maximumNumberOfRow = 100;
                    } else {
                        oAvailableColumns.maximumNumberOfRow = oResponseData.maximumNumberOfRow;
                    }
                    oAvailableColumns.allowOperatorToChangeColumnSequence = oResponseData.allowOperatorToChangeColumnSequence;
                    oAvailableColumns.allowOperatorToSortRows = oResponseData.allowOperatorToSortRows;
                    oAvailableColumns.allowMultipleSelection = oResponseData.allowMultipleSelection;
                    oAvailableColumns.statusData = oResponseData.statusData;
                    oAvailableColumns.maxRowPerPage = oResponseData.maxRowPerPage;
                    oAvailableColumns.listIcons = oResponseData.listIcons;
                    oAvailableColumns.showChangeAlert = oResponseData.showChangeAlert;
                }

                if (!oAvailableColumns.statusData) {
                    oAvailableColumns.statusData = {
                        showActive: true,
                        showHold: true,
                        showInQueue: true,
                        showNew: true
                    };
                }

                if (!oAvailableColumns.listIcons) {
                    oAvailableColumns.listIcons = {
                        showBuyOff: false,
                        showCollectParentNumber: false,
                        showComponent: false,
                        showDataCollection: false,
                        showTool: false,
                        showWorkInstruction: false
                    };
                }

                // update response with display / edit flags
                this._loadColumnData(oColumnEditorDetails, oAvailableColumns, aCustomColumns);
            }

            // update response with display / edit flags
            this._loadDisplayEditFlags(oAvailableColumns, oColumnEditorDetails)

            return oAvailableColumns;
        },

        _loadColumnData: function(oColumnEditorDetails, oAvailableColumns, aCustomColumns) {
            var i, sColumnId, sDescription, sDescriptionPrefix;
            for (i = 0; i < oColumnEditorDetails.columns.length; i++) {
                sColumnId = oColumnEditorDetails.columns[i].name;
                sDescription = oColumnEditorDetails.columns[i].description;
                this._addAvailableColumn(oAvailableColumns, sColumnId, sDescription);
            }
            if (aCustomColumns && aCustomColumns.length > 0) {
                for (i = 0; i < aCustomColumns.length; i++) {
                    if (aCustomColumns[i].columnId.indexOf(".") > 0) {
                        sDescriptionPrefix = this.getI18nText("customDataFieldLabelPrefix_" + aCustomColumns[i].tableName);
                        sColumnId = aCustomColumns[i].columnId;
                        sDescription = sDescriptionPrefix + aCustomColumns[i].columnLabel;
                        this._addAvailableColumn(oAvailableColumns, sColumnId, sDescription, false);
                    }
                }
            }
        },

        _isSortableColumn: function(sColumnId, bShowSortField) {
            var aNonSortableColumns = ["ITEM_GROUP"];

            for (var i = 0; i < aNonSortableColumns.length; i++) {
                // Column was identified as not sortable
                if (sColumnId === aNonSortableColumns[i]) {
                    return false;
                }
            }

            return true;
        },

        _addAvailableColumn: function(oAvailableColumns, sColumnId, sDescription, bShowSortField) {
            var bShowSort = oAvailableColumns.showSortOrderColumn;
            // Prevent Sorting            
            if (typeof bShowSortField !== "undefined") {
                bShowSort = bShowSortField;
            } else {
                bShowSort = this._isSortableColumn(sColumnId, bShowSortField);
            }
            oAvailableColumns.columns[oAvailableColumns.columns.length] = {
                columnId: sColumnId,
                description: sDescription,
                Rank: this._oLceDialogController.config.initialRank,
                sequence: null,
                sortOrder: null,
                showSortField: bShowSort,
                sequenceEditable: true,
                sortOrderEditable: true,
                columnIdButtonEnabled: false,
                columnIdEditable: false,
                detailsVisible: false,
                switchVisible: false
            };
        },

        _loadDisplayEditFlags: function(oAvailableColumns, oColumnEditorDetails) {

            if (!oAvailableColumns.columns || oAvailableColumns.columns.length === 0) {
                return;
            }


            for (var i = 0; i < oAvailableColumns.columns.length; i++) {
                if (oColumnEditorDetails.infoColumn && oAvailableColumns.columns[i].columnId === oColumnEditorDetails.infoColumn.name) {
                    if (oColumnEditorDetails.infoColumn.controlType === "DETAIL_ICON") {
                        oAvailableColumns.columns[i].detailsVisible = true;
                    } else if (oColumnEditorDetails.infoColumn.controlType === "SWITCH") {
                        oAvailableColumns.columns[i].switchVisible = true;
                    }
                } else if (oColumnEditorDetails.statusColumn && oAvailableColumns.columns[i].columnId === oColumnEditorDetails.statusColumn.name) {
                    if (oColumnEditorDetails.statusColumn.controlType === "DETAIL_ICON") {
                        oAvailableColumns.columns[i].detailsVisible = true;
                    } else if (oColumnEditorDetails.statusColumn.controlType === "SWITCH") {
                        oAvailableColumns.columns[i].switchVisible = true;
                    }
                } else if (oColumnEditorDetails.statusIconColumn && oAvailableColumns.columns[i].columnId === oColumnEditorDetails.statusIconColumn.name) {
                    if (oColumnEditorDetails.statusIconColumn.controlType === "DETAIL_ICON") {
                        oAvailableColumns.columns[i].detailsVisible = true;
                    } else if (oColumnEditorDetails.statusIconColumn.controlType === "SWITCH") {
                        oAvailableColumns.columns[i].switchVisible = true;
                    }
                } else if (oColumnEditorDetails.riskEventColumn && oAvailableColumns.columns[i].columnId === oColumnEditorDetails.riskEventColumn.name) {
                    if (oColumnEditorDetails.riskEventColumn.controlType === "DETAIL_ICON") {
                        oAvailableColumns.columns[i].detailsVisible = true;
                    } else if (oColumnEditorDetails.riskEventColumn.controlType === "SWITCH") {
                        oAvailableColumns.columns[i].switchVisible = true;
                    }
                }

                // set description
                if (oColumnEditorDetails && oColumnEditorDetails.columns && oColumnEditorDetails.columns.length > 0) {
                    for (var j = 0; j < oColumnEditorDetails.columns.length; j++) {
                        if (oAvailableColumns.columns[i].columnId === oColumnEditorDetails.columns[j].name) {
                            oAvailableColumns.columns[i].description = oColumnEditorDetails.columns[j].description;
                            break;
                        }
                    }
                }
            }
        },

        _getWorklistTypes: function() {
            var aWorklistTypes = [{
                    worklistType: "SFC",
                    description: this.getI18nText("prop_SFC")
                },
                {
                    worklistType: "PROCESS_LOT",
                    description: this.getI18nText("prop_PROCESS_LOT")
                }
            ];
            return aWorklistTypes;
        },

        /******************  This is not supported now ***************
        _handleListColumnEditorDialogDelete: function (sListName) {
            var oTable = sap.ui.getCore().byId("listNameSearchTable");
            var oModel = oTable.getModel();
            var oData = oModel.getData();

            var index = this._findListNameRowIndex(oData.ListNames, sListName);

            oTable.removeSelections(true);
            if (index >= 0) {
                oData.ListNames.splice(index, 1);
            }
            oModel.refresh();

            this._handleListColumnEditorDialogCancel();
        },
        ***************************************************************/

        _handleListColumnEditorDialogSave: function(sListName, sDescription) {
            var oTable = sap.ui.getCore().byId("listNameSearchTable");
            var oModel = oTable.getModel();
            var oData = oModel.getData();

            var sI18nDescription = sDescription;
            if (sDescription && sDescription.indexOf("I18N[") === 0) {
                var sKey = sDescription.substring(sDescription.indexOf("[") + 1, sDescription.indexOf("]"));
                sI18nDescription = this.getListMaintenanceI18nText(sKey);
            }

            var index = this._findListNameRowIndex(oData.ListNames, sListName);

            if (index >= 0) {
                oData.ListNames[index].description = sI18nDescription;
            } else {
                oData.ListNames[oData.ListNames.length] = {
                    listType: this.getListType(),
                    listName: sListName,
                    description: sI18nDescription
                };
                oData.ListNames.sort(function(a, b) {
                    if (a.listName > b.listName) {
                        return 1;
                    } else if (b.listName > a.listName) {
                        return -1;
                    }
                    return 0;
                });

                // find added row
                index = this._findListNameRowIndex(oData.ListNames, sListName);
            }
            oModel.refresh();

            var aListItems = oTable.getItems();
            if (aListItems && index < aListItems.length) {
                oTable.setSelectedItem(aListItems[index]);
            }

            this._handleListColumnEditorDialogCancel();
        },

        _findListNameRowIndex: function(aListNames, sListName) {
            var index = -1;
            aListNames.some(function(oListName, i) {
                var bMatches = oListName.listName === sListName;
                index = bMatches ? i : -1;
                return bMatches;
            });
            return index;
        },

        _handleListColumnEditorDialogCancel: function() {
            this._oLceDialogDialog.detachBeforeOpen(this._oLceDialogController.beforeOpen, this._oLceDialogController);
            this._oLceDialogDialog.detachAfterOpen(this._oLceDialogController.afterOpen, this._oLceDialogController);
            this._oLceDialogDialog.close();
            this._oLceModel.destroy();
            this._oLceDialogDialog.destroy();
            this._oLceDialogDialog = null;
        }
    });
});