sap.ui.define([
    "sap/ui/core/syncStyleClass",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/dm/dme/device/CrossPlatformUtilities",
    "sap/dm/dme/podfoundation/controller/BaseAssignmentListController",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(syncStyleClass, ResourceModel, JSONModel, MessageBox,
    CrossPlatformUtilities, BaseAssignmentListController, PodUtility) {
    "use strict";

    var ListColumnEditorController = BaseAssignmentListController.extend("sap.dm.dme.podfoundation.controller.ListColumnEditorController", {

        beforeOpen: function(oEvent) {
            var oTable = this.getAvailableTable();
            oTable.setModel(this._oAssignmentModel);
            oTable = this.getAssignedTable();
            oTable.setModel(this._oAssignmentModel);
        },

        afterOpen: function(oEvent) {
            this.moveAvailableToAssigned();
        },

        setAssignmentModel: function(oAssignmentModel) {
            this._oAssignmentModel = oAssignmentModel;
        },

        setListName: function(sListName) {
            this._sListName = sListName;
        },

        /************  this is not supported for now  ***************
        setDeleteHandler: function (fnDeleteHandler, oFnContext) {
            this._fnDeleteHandler = fnDeleteHandler;
            this._oFnContext = oFnContext;
        },
        ***************************************************************************/

        setSaveHandler: function(fnSaveHandler, oFnContext) {
            this._fnSaveHandler = fnSaveHandler;
            this._oFnContext = oFnContext;
        },

        setCancelHandler: function(fnCancelHandler, oFnContext) {
            this._fnCancelHandler = fnCancelHandler;
            this._oFnContext = oFnContext;
        },

        handleListNameChange: function(oEvent) {
            var oInputField = oEvent.getSource();
            if (oInputField) {
                var sValue = oInputField.getValue();
                if (jQuery.trim(sValue)) {
                    oInputField.setValue(sValue.toUpperCase());
                }
            }
        },

        _onSortOrderLiveChange: function(oEvent) {
            // using live change check instead of type=Number because of issue handling blank.
            var oInputField = oEvent.getSource();
            var val = oInputField.getValue();
            val = val.replace(/[^\d]/g, "");
            oInputField.setValue(val);
        },

        _handleListColumnEditorDialogSave: function(oEvent) {
            var oTable = this.getAssignedTable();
            var oModel = oTable.getModel();
            var oData = oModel.getData();

            var sListName = oData.listName;
            if (PodUtility.isEmpty(sListName)) {
                this.showErrorMessage(this.getI18nText("message.listNameRequiredMessage"));
                return;
            }

            if (PodUtility.isEmpty(this.getListType())) {
                this.showErrorMessage(this.getI18nText("message.listTypeRequiredMessage"));
                return;
            }

            var oTempData = CrossPlatformUtilities.cloneObject(oData);

            var oAssignedData = oTempData;
            oAssignedData.columns = this._getAssignedColumns(oTempData.columns);
            if (!this._checkDuplicateSortOrder(oAssignedData.columns)) {
                this.showErrorMessage(this.getI18nText("message.duplicateSortOrderValues"));
                return;
            }

            if (!this._sListName || this._sListName !== sListName) {
                this._createNewList(sListName, oAssignedData);
            } else {
                this._updateExistingList(sListName, oAssignedData);
            }
        },

        _createNewList: function(sListName, oAssignedData) {
            var oService = this.getListMaintenanceService();
            return oService.createNewList(sListName, oAssignedData)
                .then(function() {
                    this._fnSaveHandler.call(this._oFnContext, sListName, oAssignedData.description);
                }.bind(this))
                .catch(function(oError) {
                    this._handleListSaveError(oError);
                }.bind(this));
        },

        _updateExistingList: function(sListName, oAssignedData) {
            const oService = this.getListMaintenanceService();
            return oService.updateExistingList(sListName, oAssignedData)
                .then(function() {
                    this._fnSaveHandler.call(this._oFnContext, sListName, oAssignedData.description);
                }.bind(this))
                .catch(function(oError) {
                    this._handleListSaveError(oError)
                }.bind(this));
        },

        _handleListSaveError: function(oError) {
            let sMessage;
            if (oError.nHttpStatus === 403) {
                let appTitle = this.getMainView().getController().getI18nText("appTitle");
                sMessage = this.getGlobalI18nText("message.errorNoAccessToModifyData", appTitle);
            } else {
                sMessage = this.getI18nText("message.listUpdateUnknownError");
            }
            this.showAjaxErrorMessage(sMessage, oError.oResponse);
        },

        _checkDuplicateSortOrder: function(aColumns) {

            if (!aColumns || aColumns.length === 0) {
                return true;
            }

            var i, j, sortOrder, sortOrder2;
            for (i = 0; i < aColumns.length; i++) {
                sortOrder = aColumns[i].sortOrder;
                if (typeof sortOrder === "string") {
                    if (aColumns[i].sortOrder === "") {
                        aColumns[i].sortOrder = null;
                    } else {
                        aColumns[i].sortOrder = parseInt(sortOrder, 10);
                    }
                }
            }

            for (i = 0; i < aColumns.length; i++) {
                sortOrder = aColumns[i].sortOrder;
                if (typeof sortOrder !== "number") {
                    continue;
                }
                if (i < aColumns.length - 1) {
                    for (j = i + 1; j < aColumns.length; j++) {
                        sortOrder2 = aColumns[j].sortOrder;
                        if (typeof sortOrder2 === "number") {
                            if (sortOrder === sortOrder2) {
                                return false;
                            }
                        }
                    }
                }
            }

            return true;
        },

        _getAssignedColumns: function(aColumns) {
            aColumns.sort(function(o1, o2) {
                if (o1.Rank === o2.Rank) {
                    return 0;
                }
                if (o1.Rank < o2.Rank) {
                    return 1;
                }
                return -11;
            });

            var aAssignedColumns = [];
            var iSequence = 0;
            for (var i = 0; i < aColumns.length; i++) {
                if (aColumns[i].Rank > 0) {
                    iSequence = iSequence + 10;
                    aAssignedColumns[aAssignedColumns.length] = {
                        columnId: aColumns[i].columnId,
                        description: aColumns[i].description,
                        sequence: iSequence,
                        sortOrder: aColumns[i].sortOrder
                    };
                }
            }
            return aAssignedColumns;
        },

        _handleListColumnEditorDialogCancel: function(oEvent) {
            this._fnCancelHandler.call(this._oFnContext);
        },

        _showColumnDetails: function(oEvent) {

            this.sColumnDetailsDialogColumnName = this._getColumnNameForColumnDetails(oEvent);

            var sWidth = "100px";
            var sHeight = "270px";
            var sTitle = "";
            var sColumnTitle = "";
            var oListData = [];
            if (this.sColumnDetailsDialogColumnName === "STATUS") {
                sTitle = this.getI18nText("statusDialogTitle");
                sColumnTitle = this.getI18nText("statusDialogColumnTitle");
                oListData = this._getStatusNames();
            } else if (this.sColumnDetailsDialogColumnName === "STATUS_ICON") {
                sTitle = this.getI18nText("statusIconDialogTitle");
                sColumnTitle = this.getI18nText("statusIconDialogColumnTitle");
                oListData = this._getStatusNames();
                /**************** INFO is not implemented yet **********************
                } else if (this.sColumnDetailsDialogColumnName === "INFO") {
                    sTitle = this.getI18nText("infoIconDialogTitle");
                    sColumnTitle = this.getI18nText("infoIconDialogColumnTitle");
                    oListData = this._getInfoIconListNames();
                    sHeight = "370px";
                    sWidth = "350px";
                    ****************************************************************/
            }

            this.showColumnDetailsDialog(oListData, sTitle, sColumnTitle, sWidth, sHeight);
        },

        _getColumnNameForColumnDetails: function(oEvent) {
            // added to support QUnit tests
            var oTable = this.getAssignedTable();
            var oModel = oTable.getModel();
            var path = oEvent.getSource().getBindingContext().getPath();
            var obj = oModel.getProperty(path);

            return obj.columnId;
        },

        showColumnDetailsDialog: function(oListData, sTitle, sColumnTitle, sWidth, sHeight) {
            var oModelData = {
                contentWidth: sWidth,
                contentHeight: sHeight,
                visibleRowCount: oListData.length,
                title: sTitle,
                columnTitle: sColumnTitle,
                Details: oListData
            };
            this._oCddModel = new JSONModel();
            this._oCddModel.setData(oModelData);

            this._oCddDetailsDialog = this._getDetailsDialogFragment();
            var oResourceModel = new ResourceModel({
                bundleName: "sap.dm.dme.i18n.propertyEditor"
            });
            this._oCddDetailsDialog.setModel(oResourceModel, "cddI18n");

            var oGlobalResourceModel = new ResourceModel({
                bundleName: "sap.dm.dme.i18n.global"
            });
            this._oCddDetailsDialog.setModel(oGlobalResourceModel, "i18n-global");

            this._oCddDetailsDialog.setModel(this._oCddModel);

            var that = this;
            this._oCddDetailsDialog.setEscapeHandler(function(oPromise) {
                that._handleColumnDetailsDialogCancel();
                oPromise.resolve();
            });

            this.getMainView().addDependent(this._oCddDetailsDialog);

            this._openColumnDetailsDialog(this._oCddDetailsDialog);
        },

        _getDetailsDialogFragment: function() {
            // added to support QUnit tests
            return sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.ColumnDetailsDialog", this);
        },

        _openColumnDetailsDialog: function(oDialog) {
            // added to support QUnit tests
            syncStyleClass("sapUiSizeCompact", this.getMainView(), oDialog);
            oDialog.open();
        },

        _handleColumnDetailsDialogApply: function(oEvent) {
            var oTable = this._byId("columnDetailsDialogTable");
            var oModel1 = oTable.getModel();
            var oFromData = oModel1.getData();

            oTable = this.getAssignedTable();
            var oModel2 = oTable.getModel();
            var oToData = oModel2.getData();

            if (this.sColumnDetailsDialogColumnName === "STATUS" ||
                this.sColumnDetailsDialogColumnName === "STATUS_ICON") {
                oToData.statusData.showActive = oFromData.Details[0].selected;
                oToData.statusData.showHold = oFromData.Details[1].selected;
                oToData.statusData.showInQueue = oFromData.Details[2].selected;
                oToData.statusData.showNew = oFromData.Details[3].selected;
                /******************* this is not supported yet ***********************
                } else if (this.sColumnDetailsDialogColumnName === "INFO") {
                    oToData.listIcons.showBuyoff = oFromData.Details[0].selected;
                    oToData.listIcons.showCollectParentNumber = oFromData.Details[1].selected;
                    oToData.listIcons.showDataCollection = oFromData.Details[2].selected;
                    oToData.listIcons.showComponent = oFromData.Details[3].selected;
                    oToData.listIcons.showTool = oFromData.Details[4].selected;
                    oToData.listIcons.showWorkInstruction = oFromData.Details[5].selected;
                    ******************************************************************/
            }
            oModel2.refresh();

            this._handleColumnDetailsDialogCancel();
        },

        _handleColumnDetailsDialogCancel: function() {
            this._oCddDetailsDialog.close();
            this._oCddModel.destroy();
            this._oCddDetailsDialog.destroy();
            this._oCddDetailsDialog = null;
        },

        _getStatusNames: function() {
            var oTable = this.getAssignedTable();
            var oModel = oTable.getModel();
            var oData = oModel.getData();
            return this._getStatusNamesFromTableModelData(oData);
        },

        _getStatusNamesFromTableModelData: function(oData) {
            var aStatusNamesList = [];
            aStatusNamesList[aStatusNamesList.length] = {
                name: this.getGlobalI18nText("active"),
                selected: oData.statusData.showActive
            };
            aStatusNamesList[aStatusNamesList.length] = {
                name: this.getGlobalI18nText("hold"),
                selected: oData.statusData.showHold
            };
            aStatusNamesList[aStatusNamesList.length] = {
                name: this.getGlobalI18nText("inQueue"),
                selected: oData.statusData.showInQueue
            };
            aStatusNamesList[aStatusNamesList.length] = {
                name: this.getGlobalI18nText("new"),
                selected: oData.statusData.showNew
            };
            return aStatusNamesList;
        },

        /******************* the following functions are not supported yet ***********************
        _getInfoIconListNames: function () {
            var oTable = this.getAssignedTable();
            var oModel = oTable.getModel();
            var oData = oModel.getData();
            return this._getInfoIconListNamesFromTableModelData(oData);
        },

        _getInfoIconListNamesFromTableModelData: function (oData) {
            var aIconList = [];
            aIconList[aIconList.length] = { name: this.getGlobalI18nText("buyoff"), selected: oData.listIcons.showBuyOff };
            aIconList[aIconList.length] = { name: this.getGlobalI18nText("collectParentSerialNumber"), selected: oData.listIcons.showCollectParentNumber };
            aIconList[aIconList.length] = { name: this.getGlobalI18nText("dataCollection"), selected: oData.listIcons.showDataCollection };
            aIconList[aIconList.length] = { name: this.getGlobalI18nText("componentList"), selected: oData.listIcons.showComponent };
            aIconList[aIconList.length] = { name: this.getGlobalI18nText("toolList"), selected: oData.listIcons.showTool };
            aIconList[aIconList.length] = { name: this.getGlobalI18nText("workInstruction"), selected: oData.listIcons.showWorkInstruction };
            return aIconList;
        },
 
        _handleListColumnEditorDialogDelete: function (oEvent) {
            var oTable = this.getAssignedTable();
            var oModel = oTable.getModel();
            var oData = oModel.getData();

            var sListName = oData.listName;
            if (PodUtility.isEmpty(sListName)) {
                this.showErrorMessage(this.getI18nText("message.listNameRequiredMessage"));
            }

            if (PodUtility.isEmpty(this.getListType())) {
                this.showErrorMessage(this.getI18nText("message.listTypeRequiredMessage"));
                return;
            }

            var that = this;
            var bCompact = !!this.getMainView().$().closest(".sapUiSizeCompact").length;

            MessageBox.confirm(this.getGlobalI18nText("confirmDeletePrompt"), {
                title: this.getGlobalI18nText("confirmDeleteTitle"),
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                styleClass: bCompact ? "sapUiSizeCompact" : "",
                onClose: function (sAction) {
                    if (sAction === sap.m.MessageBox.Action.OK) {
                        that._doListColumnEditorDialogDelete(sListName);
                    }
                }
            });
        },

        _doListColumnEditorDialogDelete: function (sListName) {
            var sUri = this._getProductionDataSourceUri(this.getMainView().getController());
            var sUrl = sUri + "deleteListConfig/" + this.getListType() + "/" + sListName;

            var that = this;
            AjaxUtil.delete(sUrl,
                function (oResponseData) {
                    that._fnDeleteHandler.call(that._oFnContext, sListName);
                },
                function (oError, sHttpErrorMessage) {
                    var sMessage = that.getI18nText("message.listDeleteUnknownError");
                    if (oError && oError.message) {
                        sMessage = oError.message;
                    } else if (oError && oError.error && oError.error.message) {
                        sMessage = oError.error.message;
                    } else if (sHttpErrorMessage) {
                        sMessage = sHttpErrorMessage;
                    }
                    that.showErrorMessage(sMessage);
                }
            );
        },
        *************************************************************/

        _byId: function(sId) {
            // added to support QUnit tests
            return sap.ui.getCore().byId(sId);
        }
    });
    return ListColumnEditorController;
});