sap.ui.define([
    "sap/dm/dme/podfoundation/controller/BaseAssignmentListController",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/device/CrossPlatformUtilities"
], function(BaseAssignmentListController, JSONModel, CrossPlatformUtilities) {
    "use strict";

    var BaseActionAssignmentController = BaseAssignmentListController.extend("sap.dm.dme.podfoundation.controller.BaseActionAssignmentController", {

        setActionSelections: function(aActionSelections) {
            this._aActionSelections = aActionSelections;
        },

        setTabPageSelections: function(aTabPageSelections) {
            this._aTabPageSelections = aTabPageSelections;
        },

        setNavigationPageSelections: function(aNavigationPageSelections) {
            this._aNavigationPageSelections = aNavigationPageSelections;
        },

        setAssignedActions: function(aAssignedActions) {
            this._aAssignedActions = aAssignedActions;
        },

        setActionAssignmentDialog: function(oDialog) {
            this._oActionAssignmentDialog = oDialog;
        },

        getActionAssignmentDialog: function(oDialog) {
            return this._oActionAssignmentDialog;
        },

        getI18nText: function(sKey, aArgs) {
            return this._oMainControllerHelper._getI18nText(sKey, aArgs);
        },

        setMainControllerHelper: function(oMainControllerHelper) {
            this._oMainControllerHelper = oMainControllerHelper;
        },

        setMainController: function(oMainController) {
            this._oMainController = oMainController;
        },

        setPropertyEditors: function(aExecutionPropertyEditors) {
            this._aPropertyEditors = aExecutionPropertyEditors;
        },

        setEventPropertyEditors: function(aEventPropertyEditors) {
            this._aEventPropertyEditors = aEventPropertyEditors;
        },

        setTransactionPropertyEditors: function(aTransactionPropertyEditors) {
            this._aTransactionPropertyEditors = aTransactionPropertyEditors;
        },

        setProductionProcessPropertyEditors: function(aProductionProcessPropertyEditors) {
            this._aProductionProcessPropertyEditors = aProductionProcessPropertyEditors;
        },

        /**
         * Returns the assigned actions for the button
         * @return {array} Array of assigned actions
         * @public
         */
        getAssignedActions: function() {
            return this.getAssignedPlugins();
        },

        /**
         * @deprecated Use sap.dm.dme.podfoundation.controller.BaseActionAssignmentController#getAssignedActions()
         */
        getAssignedPlugins: function() {
            var oTable = this.getAssignedTable();
            var aRows = oTable.getBinding("items");
            var aAssignedPlugins = [];
            var iSequence = 0;
            for (var i = 0; i < aRows.aIndices.length; i++) {
                var oRowData = aRows.oList[aRows.aIndices[i]];
                iSequence = iSequence + 10;
                aAssignedPlugins[aAssignedPlugins.length] = {
                    pluginId: oRowData.plugin,
                    sequence: iSequence,
                    clearsInput: oRowData.clearsInput,
                    menuLabel: oRowData.menuLabel
                };
            }
            return aAssignedPlugins;
        },

        getDialogModel: function() {
            if (!this._oDialogModel) {
                this._oDialogModel = this._oActionAssignmentDialog.getModel("DialogModel");
            }
            return this._oDialogModel;
        },

        loadActionsTable: function() {
            var oDialogModel = this.getDialogModel();
            var oData = oDialogModel.getData();
            var oTableData = {
                Actions: oData.Actions
            };
            var oTable = this.getAssignedTable();
            var oModel = new JSONModel();
            oModel.setData(oTableData);
            oTable.setModel(oModel);

            if (this._aAssignedActions && this._aAssignedActions.length > 0) {
                for (var i = 0; i < this._aAssignedActions.length; i++) {
                    var sAssignedKeyValue = this._aAssignedActions[i][this._sAssignedKeyId];
                    var sActionId = sAssignedKeyValue;
                    if (sActionId.indexOf(".") > 0) {
                        sActionId = sAssignedKeyValue.substring(0, sActionId.indexOf("."));
                    }
                    var oObject = this._findAction(sActionId, oData);
                    if (oObject) {
                        oObject.menuLabel = this._aAssignedActions[i].menuLabel;
                        var oClonedData = CrossPlatformUtilities.cloneObject(oObject);
                        oClonedData.id = sAssignedKeyValue;
                        oClonedData.action = sAssignedKeyValue;
                        oClonedData.plugin = sAssignedKeyValue;

                        if (oClonedData.multiInstance &&
                            oClonedData.type === "VIEW_PLUGIN" &&
                            sAssignedKeyValue.indexOf(".") < 0) {
                            // don't show configuration icon if multi-instance plugin is
                            // only referencing another instance somewhere
                            oClonedData.showConfiguration = false;
                        }

                        this.addToAssigned(oClonedData, true);
                    }
                }
            }
        },

        updateAvailableActionRank: function(sActionId, iRank) {
            // keeps available action rankings updated when adding / removing actions from table
            var oObject = this.findAction(sActionId);
            if (oObject) {
                oObject.Rank = iRank;
            }
        },

        addAction: function(oAddData) {
            var sActionId = oAddData.typeDefinition;
            var oActionData = this.findAction(sActionId);
            if (oActionData) {
                oActionData.menuLabel = oAddData.menuLabel;
                oActionData.typeDefinitionTitle = oAddData.typeDefinitionTitle;
                oActionData.typeDefinitionEventKey = oAddData.typeDefinitionEventKey;
                oActionData.typeData = oAddData.typeData;
                oActionData.multiInstanceConfigurable = oAddData.multiInstanceConfigurable;
                this.addToAssigned(oActionData, false);
            }
        },

        findAction: function(sActionId) {
            var oDialogModel = this.getDialogModel();
            var oData = oDialogModel.getData();
            if (oData) {
                return this._findAction(sActionId, oData);
            }
            return null;
        },

        _findAction: function(sActionId, oData) {
            if (!oData) {
                return null;
            }
            var aAvailableActions = oData.AvailableActions;
            if (!aAvailableActions || aAvailableActions.length === 0) {
                return null;
            }

            for (var i = 0; i < aAvailableActions.length; i++) {
                if (sActionId === aAvailableActions[i][this._sAvailableKeyId]) {
                    return aAvailableActions[i];
                }
            }
            return null;
        },

        getSelectedRowInformation: function(sActionId) {
            var oTable = this.getAssignedTable();
            var oModel = oTable.getModel();
            var oTableData = oModel.getData();
            if (oTableData.Actions && oTableData.Actions.length > 0) {
                for (var i = 0; i < oTableData.Actions.length; i++) {
                    if (oTableData.Actions[i].action === sActionId) {
                        return {
                            rowIndex: i,
                            data: oTableData.Actions[i]
                        };
                    }
                }
            }
            return null;
        },

        removeFromAssigned: function(sActionId, oSelectedRowInformation) {
            var oRowInformation = oSelectedRowInformation;
            if (arguments.length === 1 && typeof oRowInformation === "undefined") {
                oRowInformation = this.getSelectedRowInformation(sActionId);
                if (!oRowInformation) {
                    return;
                }
            }
            var index = oRowInformation.rowIndex;
            var oData = oRowInformation.data;

            this.onRemoveFromAssigned(oData);

            var oTable = this.getAssignedTable();
            var oModel = oTable.getModel();
            var oTableData = oModel.getData();
            oTableData.Actions.splice(index, 1);
            this.updateAvailableActionRank(sActionId, this.config.initialRank);
            oModel.refresh(true);

            // select the previous row when there is no row to select
            var oNextContext = this._getContextByIndex(oTable, index + 1);
            if (!oNextContext) {
                this._setSelectedIndex(oTable, index - 1);
            }
        },

        onRemoveFromAssigned: function(oData) {
            // to be overridden by superclass
        },

        addToAssigned: function(oActionData, bInitialLoad) {

            var oTable = this.getAssignedTable();

            var iNumberOfRows = this._getNumberOfRows(oTable);
            var oRowContext, iNewRank;
            if (iNumberOfRows > 0) {
                // insert after last row
                oRowContext = this._getContextByIndex(oTable, iNumberOfRows - 1);
                iNewRank = this.config.defaultRank;
                if (oRowContext) {
                    iNewRank = this.config.rankAlgorithm.After(oRowContext.getProperty("Rank"));
                }
            } else {
                // insert always as a first row
                oRowContext = this._getContextByIndex(oTable, 0);
                iNewRank = this.config.defaultRank;
                if (oRowContext) {
                    iNewRank = this.config.rankAlgorithm.Before(oRowContext.getProperty("Rank"));
                }
            }

            var oModel = oTable.getModel();
            if (oModel) {
                // this updates "available" actions
                oActionData.Rank = iNewRank;
                this.updateAvailableActionRank(oActionData.action, iNewRank);

                // this updates "assigned" actions
                var oTableData = oModel.getData();
                if (!oTableData.Actions) {
                    oTableData.Actions = [];
                }
                var oClonedData = CrossPlatformUtilities.cloneObject(oActionData);
                oTableData.Actions[oTableData.Actions.length] = oClonedData;
                if (!bInitialLoad) {
                    this.onMoveToAssigned(oClonedData);
                } else {
                    this.updateActionData(oClonedData)
                }
                oModel.refresh(true);
            }

            // select the inserted row
            if (!bInitialLoad) {
                this._setSelectedIndex(oTable, iNumberOfRows);
            }
        },

        updateActionData: function(oData) {
            // to be overridden by superclass
        },

        selectRowForAssigned: function(sActionId) {
            var oTable = this.getAssignedTable();
            var oItem = this._findItemByColumnId(oTable, sActionId);
            var iIndex = oTable.indexOfItem(oItem);
            this._setSelectedIndex(oTable, iIndex);
        }
    });

    return BaseActionAssignmentController;
});