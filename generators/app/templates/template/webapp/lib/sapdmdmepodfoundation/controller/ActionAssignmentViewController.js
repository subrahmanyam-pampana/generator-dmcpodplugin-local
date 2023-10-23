sap.ui.define([
    "sap/m/MessageBox",
    "sap/ui/core/syncStyleClass",
    "sap/ui/core/ValueState",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/podfoundation/controller/BaseActionAssignmentController",
    "sap/dm/dme/podfoundation/controller/SinglePluginSelectionViewController",
    "sap/dm/dme/podfoundation/controller/ProductionProcessSelectionViewController",
    "sap/dm/dme/podfoundation/service/ServiceRegistry",
    "sap/dm/dme/device/CrossPlatformUtilities",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(MessageBox, syncStyleClass, ValueState, JSONModel, BaseActionAssignmentController,
    SinglePluginSelectionViewController, ProductionProcessSelectionViewController,
    ServiceRegistry, CrossPlatformUtilities, PodUtility) {
    "use strict";

    const EXECUTION_PLUGIN = "EXECUTION_PLUGIN";
    const VIEW_PLUGIN = "VIEW_PLUGIN";
    const EVENT_PLUGIN = "EVENT_PLUGIN";
    const TRANSACTION_PLUGIN = "TRANSACTION_PLUGIN";
    const PRODUCTION_PROCESS_PLUGIN = "PRODUCTION_PROCESS_PLUGIN";

    const PLUGIN_KEY = "PLUGIN";
    const EVENT_KEY = "EVENT";
    const TRANSACTION_KEY = "TRANSACTION";
    const PRODUCTION_PROCESS_KEY = "PRODUCTION_PROCESS";

    const COMPACT_SIZE_CLASS = ".sapUiSizeCompact";

    let ActionAssignmentViewController = BaseActionAssignmentController.extend("sap.dm.dme.podfoundation.controller.ActionAssignmentViewController", {

        beforeOpen: function(oEvent) {
            this._initializeDialogControlIds();
            this._initializeEventTypes();
            this._initializeAvailableActions();
            let oTable = this.getAssignedTable();
            let aColumns = oTable.getColumns();
            aColumns[aColumns.length - 2].setVisible(this.getShowPopupPropertiesColumn());
        },

        afterOpen: function(oEvent) {
            this.loadActionsTable();
        },

        _initializeDialogControlIds: function() {
            let oDialog = this.getActionAssignmentDialog();
            let oDynamicSideContent = this._findDynamicSideContent(oDialog);
            if (oDynamicSideContent) {
                this.setSideContentControlId(oDynamicSideContent.getId());
                let oAssignedTable = this._findAssignedTable(oDynamicSideContent);
                if (oAssignedTable) {
                    this.setAssignedTableId(oAssignedTable.getId());
                }
                let oForm = this._findSidePanelForm(oDynamicSideContent);
                if (oForm) {
                    this.setSidePanelFormId(oForm.getId());
                }
            }
        },

        _findDynamicSideContent: function(oDialog) {
            return oDialog.getContent()[0];
        },

        _findSidePanelForm: function(oDynamicSideContent) {
            let oVBox = oDynamicSideContent.getSideContent()[0];
            let oPanel = oVBox.getItems()[0];
            return oPanel.getContent()[0];
        },

        _findAssignedTable: function(oDynamicSideContent) {
            let oHBox = oDynamicSideContent.getMainContent()[0];
            let oPanel = oHBox.getItems()[0];
            let aPanelContent = oPanel.getContent();
            if (aPanelContent[0].getVisible()) {
                return aPanelContent[0].getItems()[0];
            }
            return aPanelContent[1].getItems()[0];
        },

        _initializeEventTypes: function() {
            let aEventTypes = this._oMainControllerHelper.getPluginSubscribedEvents();
            aEventTypes.sort((a, b) => a.title.localeCompare(b.title));
            let oDialogModel = this.getDialogModel();
            let oDialogData = oDialogModel.getData();
            oDialogData.EventTypes = aEventTypes;
        },

        _initializeAvailableActions: function() {
            let oDialogModel = this.getDialogModel();
            let oDialogData = oDialogModel.getData();
            let aAvailableActions = oDialogData.AvailableActions;
            this._aAvailableActions = CrossPlatformUtilities.cloneObject(aAvailableActions);

            // prepare and initialize the rank property
            aAvailableActions.forEach(function(oActionData) {
                oActionData.Rank = this.config.initialRank;
                oActionData.sequence = 0;
                oActionData.clearsInput = false;
                oActionData.action = oActionData.plugin;
                oActionData.typeDefinition = oActionData.action;
                if (oActionData.type === EXECUTION_PLUGIN || oActionData.type === VIEW_PLUGIN) {
                    oActionData.actionType = this.getI18nText("actionType.enum.plugin");
                    oActionData.actionTypeKey = PLUGIN_KEY;
                    oActionData.typeDefinitionTitle = oActionData.title;
                }
                if (oActionData.type === EVENT_PLUGIN) {
                    oActionData.actionType = this.getI18nText("actionType.enum.event");
                    oActionData.actionTypeKey = EVENT_KEY;
                    oActionData.typeDefinitionTitle = oActionData.typeDefinitionValue;
                }
                if (oActionData.type === TRANSACTION_PLUGIN) {
                    oActionData.actionType = this.getI18nText("actionType.enum.transaction");
                    oActionData.actionTypeKey = TRANSACTION_KEY;
                    oActionData.typeDefinitionTitle = oActionData.typeDefinitionValue;
                }
                if (oActionData.type === PRODUCTION_PROCESS_PLUGIN) {
                    oActionData.actionType = this.getI18nText("actionType.enum.productionprocess");
                    oActionData.actionTypeKey = PRODUCTION_PROCESS_KEY;
                    oActionData.typeDefinitionTitle = oActionData.typeDefinitionValue;
                }
            }, this);
        },

        setSideContentControlId: function(sId) {
            this._sSideContentControlId = sId;
        },

        getSideContentControlId: function() {
            return this._sSideContentControlId;
        },

        setSidePanelFormId: function(sId) {
            this._sSidePanelFormId = sId;
        },

        getSidePanelFormId: function() {
            return this._sSidePanelFormId;
        },

        setAddActionDialog: function(oAddActionDialog) {
            this._oAddActionDialog = oAddActionDialog;
        },

        getAddActionDialog: function() {
            return this._oAddActionDialog;
        },

        onAddAction: function(oEvent) {

            if (!this._addActionDialog) {
                let oView = this._oMainController.getView();

                this._addActionDialog = this._getAddActionDialog(this, oView);
                let that = this;
                this._addActionDialog.setEscapeHandler(function(oPromise) {
                    that.onAddActionCancel();
                    oPromise.resolve();
                });
            }

            let oDialogModel = this.getDialogModel();
            let oDialogData = oDialogModel.getData();

            let bShowMenuLabel = false;
            if (oDialogData.buttonType === "MENU_BUTTON") {
                bShowMenuLabel = true;
            }

            let oAddDialogData = {
                multiInstanceConfigurable: true,
                showMultiInstanceSwitch: false,
                showMenuLabel: bShowMenuLabel,
                menuLabel: "",
                actionType: PLUGIN_KEY,
                typeDefinition: "",
                typeDefinitionTitle: ""
            };
            let oAddDialogModel = new JSONModel(oAddDialogData);
            this._addActionDialog.setModel(oAddDialogModel, "AddActionData");

            let oEventTypesModel = new JSONModel(oDialogData.EventTypes);
            this._addActionDialog.setModel(oEventTypesModel, "EventTypes");

            let oI18nLabelsModel = new JSONModel(oDialogData.I18nButtonLabels);
            this._addActionDialog.setModel(oI18nLabelsModel, "I18nButtonLabels");

            let aActionTypes = [{
                    name: this.getI18nText("actionType.enum.plugin"),
                    actionType: PLUGIN_KEY
                },
                {
                    name: this.getI18nText("actionType.enum.productionprocess"),
                    actionType: PRODUCTION_PROCESS_KEY
                },
                {
                    name: this.getI18nText("actionType.enum.transaction"),
                    actionType: TRANSACTION_KEY
                }
            ];

            if (oDialogData.EventTypes && oDialogData.EventTypes.length > 0) {
                // only show if event types exist for this POD type
                aActionTypes[aActionTypes.length] = {
                    name: this.getI18nText("actionType.enum.event"),
                    actionType: EVENT_KEY
                }
            }

            let oActionTypesModel = new JSONModel(aActionTypes);
            this._addActionDialog.setModel(oActionTypesModel, "ActionTypes");
            this.setAddActionDialog(this._addActionDialog);
            this._addActionDialog.open();
        },

        _getAddActionDialog: function(oController, oView) {
            // added to support QUnit tests
            let oDialog = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.AddActionDialog", oController);
            oView.addDependent(oDialog);
            syncStyleClass("sapUiSizeCompact", oView, oDialog);
            return oDialog;
        },

        onMenuLabelChange: function(oEvent) {
            let oData = this._getInputDataFromEvent(oEvent);
            if (oData.actionObject) {
                oData.actionObject.menuLabel = oData.value;
            }
        },

        onTypeDefinitionTitleChange: function(oEvent) {
            let oData = this._getInputDataFromEvent(oEvent);
            if (oData.propertyEditor) {
                oData.propertyEditor.setTypeDefinition(oData.value);
                this._refreshFormContainer(oData.propertyEditor);
            }
        },

        _getInputDataFromEvent: function(oEvent) {
            let oInput = oEvent.getSource();
            let sValue = null;
            if (oInput.getValue) {
                sValue = oInput.getValue();
            }
            let sPluginId = oInput.data("actionId");
            let sActionId = sPluginId;
            if (sPluginId.indexOf(".") > 0) {
                sActionId = sPluginId.substring(0, sPluginId.indexOf("."));
            }
            let oAction = this.findAction(sActionId);
            let bIgnoreInstanceId = false;
            if (oAction && !oAction.showConfiguration && !oAction.multiInstance && oAction.type === VIEW_PLUGIN) {
                bIgnoreInstanceId = true;
            }

            let oPropertyEditor = this._findPropertyEditor(sPluginId, bIgnoreInstanceId);

            return {
                value: sValue,
                propertyEditor: oPropertyEditor,
                actionObject: oAction
            };
        },

        onActionTypeChange: function(oEvent) {
            let oSelectedItem = oEvent.getSource();
            let sActionType = oSelectedItem.getSelectedKey();
            let oAddDialogModel = this.getAddActionDialog().getModel("AddActionData");
            let oAddDialogData = oAddDialogModel.getData();
            oAddDialogData.actionType = sActionType;
            oAddDialogData.typeDefinition = "";
            oAddDialogData.typeDefinitionTitle = "";
            oAddDialogData.typeDefinitionEventKey = "";

            if (sActionType === "EVENT") {
                let oEventTypesModel = this.getAddActionDialog().getModel("EventTypes");
                let aEventTypes = oEventTypesModel.getData();
                if (aEventTypes && aEventTypes.length > 0) {
                    oAddDialogData.typeDefinitionEventKey = aEventTypes[0].event;
                    oAddDialogData.typeDefinitionTitle = aEventTypes[0].title;
                    oAddDialogData.menuLabel = aEventTypes[0].title;
                }
            }

            oAddDialogModel.refresh();
            this.getAddActionDialog().invalidate();
        },

        onPluginTypeDefinitionBrowse: function(oEvent) {
            if (!this._oValueHelpSingleSelectPluginDialog) {
                let oView = this._oMainController.getView();
                this._singlePluginSelectionDialogController = new SinglePluginSelectionViewController();
                this._oValueHelpSingleSelectPluginDialog = this._getPluginTypeDefinitionBrowseDialog(this._singlePluginSelectionDialogController, oView);
                this._oValueHelpSingleSelectPluginDialog.attachConfirm(this.onPluginItemSelected, this);
                this._oValueHelpSingleSelectPluginDialog.attachCancel(this.handleSinglePluginSelectionDialogClose, this);
            }

            // load dialog model
            let oDialogModel = this.getDialogModel();
            let oDialogData = oDialogModel.getData();
            let oModelData = this._getAvailablePlugins(oDialogData.AvailableActions);
            let oModel = new JSONModel();
            oModel.setData(oModelData);
            this._oValueHelpSingleSelectPluginDialog.setModel(oModel);

            // open dialog
            this._oValueHelpSingleSelectPluginDialog.open();
        },

        _getPluginTypeDefinitionBrowseDialog: function(oController, oView) {
            // added to support QUnit tests
            let oDialog = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.SinglePluginSelectionDialog", oController);
            oView.addDependent(oDialog);
            syncStyleClass("sapUiSizeCompact", oView, oDialog);
            return oDialog;
        },

        onPluginItemSelected: function(oEvent) {
            let oSelectedItem = oEvent.getParameter("selectedItem");
            let sPluginId = oSelectedItem.data("pluginId");
            let sTitle = oSelectedItem.data("title");
            let oAction = this.findAction(sPluginId);
            let oAddDialogModel = this.getAddActionDialog().getModel("AddActionData");
            let oAddDialogData = oAddDialogModel.getData();
            oAddDialogData.showMultiInstanceSwitch = oAction.multiInstance;
            oAddDialogData.multiInstanceConfigurable = false;
            if (oAction.popupsOnly && oAction.multiInstance) {
                oAddDialogData.showMultiInstanceSwitch = false;
                oAddDialogData.multiInstanceConfigurable = true;
            }
            oAddDialogData.typeDefinition = sPluginId;
            oAddDialogData.typeDefinitionTitle = sTitle;
            oAddDialogData.menuLabel = sTitle;
            oAddDialogModel.refresh();
            this.handleSinglePluginSelectionDialogClose();
        },

        onProductionProcessItemSelected: function(oEvent) {
            let oSelectedItem = oEvent.getParameter("selectedItem");
            let oRowData = oSelectedItem.getBindingContext().getObject();

            let oAddDialogModel = this.getAddActionDialog().getModel("AddActionData");
            let oAddDialogData = oAddDialogModel.getData();

            oAddDialogData.typeDefinition = oRowData.name;
            oAddDialogData.typeDefinitionTitle = oRowData.name;
            oAddDialogData.typeData = oRowData;
            oAddDialogData.menuLabel = oRowData.displayName;
            oAddDialogModel.refresh();
            this.handleProductionProcessDialogClose();
        },

        handleSinglePluginSelectionDialogClose: function() {
            this._oValueHelpSingleSelectPluginDialog.destroy();
            this._oValueHelpSingleSelectPluginDialog = null;
        },

        handleProductionProcessDialogClose: function() {
            this._oValueHelpProductionProcessDialog.destroy();
            this._oValueHelpProductionProcessDialog = null;
        },

        getServiceRegistryDataSourceUri: function() {
            return this._oMainController.getOwnerComponent().getDataSourceUriByName("serviceregistry-RestSource");
        },

        _getServiceRegistry: function(sUrl) {
            if (!this._oServiceRegistry) {
                this._oServiceRegistry = new ServiceRegistry(sUrl);
            }
            return this._oServiceRegistry;
        },

        _getServiceRegistryGroupData: function() {
            let that = this;
            return new Promise(function(resolve) {
                let oServiceRegistry = that._getServiceRegistry(that.getServiceRegistryDataSourceUri());
                return oServiceRegistry.getProductionProcesses()
                    .then(function(oResponseData) {
                        let oModel = new JSONModel();
                        oModel.setData(oResponseData);
                        that._oValueHelpProductionProcessDialog.setModel(oModel);
                        that._oValueHelpProductionProcessDialog.open();
                        that._oAddActionDialog.setBusy(false);
                        resolve();
                    }.bind(that))
                    .catch(function() {
                        // No Data, dialog will show no results so no error is thrown here.
                        let oModel = new JSONModel();
                        oModel.setData({});
                        that._oValueHelpProductionProcessDialog.setModel(oModel);
                        that._oValueHelpProductionProcessDialog.open();
                        that._oAddActionDialog.setBusy(false);
                        resolve();
                    }.bind(that));
            });
        },

        onProductionProcessTypeDefinitionBrowse: function(oEvent) {
            if (!this._oValueHelpProductionProcessDialog) {
                let oView = this._oMainController.getView();
                this._productionProcessDialogController = new ProductionProcessSelectionViewController();
                this._oValueHelpProductionProcessDialog = this._getTypeDefinitionProductionProcessBrowseDialog(this._productionProcessDialogController, oView);
                this._oValueHelpProductionProcessDialog.attachConfirm(this.onProductionProcessItemSelected, this);
                this._oValueHelpProductionProcessDialog.attachCancel(this.handleProductionProcessDialogClose, this);
            }

            // set busy to disable Add Action dialog
            this._oAddActionDialog.setBusy(true);

            // delay allow busy to display before retrieving and showing PP's
            let that = this;
            setTimeout(function() {
                that._getServiceRegistryGroupData();
            }, 125);
        },

        _getTypeDefinitionProductionProcessBrowseDialog: function(oController, oView) {
            // added to support QUnit tests
            let oDialog = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.ProductionProcessSelectionDialog", oController);
            oView.addDependent(oDialog);
            syncStyleClass("sapUiSizeCompact", oView, oDialog);
            return oDialog;
        },

        onEventTypeDefinitionChange: function(oEvent) {
            let oSelectedItem = oEvent.getSource();
            let sEventKey = oSelectedItem.getSelectedKey();
            let oAddDialogModel = this.getAddActionDialog().getModel("AddActionData");
            let oAddDialogData = oAddDialogModel.getData();

            let oEventTypesModel = this.getAddActionDialog().getModel("EventTypes");
            let aEventTypes = oEventTypesModel.getData();
            if (aEventTypes && aEventTypes.length > 0) {
                for (let oEvent of aEventTypes) {
                    if (oEvent.event === sEventKey) {
                        oAddDialogData.typeDefinitionEventKey = sEventKey
                        oAddDialogData.typeDefinitionTitle = oEvent.title;
                        oAddDialogData.menuLabel = oEvent.title;
                        oAddDialogModel.refresh();
                        break;
                    }
                }
            }
        },

        onTransactionTypeDefinitionChange: function(oEvent) {
            // to be implemented by sub-class
        },

        _getAvailablePlugins: function(aAvailableActions) {
            let oModelData = {
                Plugins: []
            };

            let aActions = CrossPlatformUtilities.cloneObject(aAvailableActions);
            aActions.forEach(function(oActionData) {
                if (oActionData.type === EXECUTION_PLUGIN || oActionData.type === VIEW_PLUGIN) {
                    if (oActionData.type === VIEW_PLUGIN && oActionData.multiInstance) {
                        oActionData.Rank = 0;
                    }
                    oModelData.Plugins[oModelData.Plugins.length] = oActionData;
                }
            }, this);
            return oModelData;
        },

        onAddActionCreate: function(oEvent) {
            let oAddDialogModel = this.getAddActionDialog().getModel("AddActionData");
            let oAddDialogData = oAddDialogModel.getData();
            let oInput;

            if (PodUtility.isEmpty(oAddDialogData.typeDefinitionTitle)) {
                if (oAddDialogData.actionType === PLUGIN_KEY) {
                    oInput = this._byId("pluginTypeDefinitionInput");
                } else if (oAddDialogData.actionType === PRODUCTION_PROCESS_KEY) {
                    oInput = this._byId("productionProcessTypeDefinitionInput");
                } else if (oAddDialogData.actionType === TRANSACTION_KEY) {
                    oInput = this._byId("transactionTypeDefinitionInput");
                } else if (oAddDialogData.actionType === EVENT_KEY) {
                    oInput = this._byId("eventTypeDefinitionInput");
                }
                if (oInput) {
                    oInput.setValueState(ValueState.Error);
                    oInput.setValueStateText(this.getI18nText("addActionTypeDefinitionRequired"));
                }
                return;
            }
            if (oAddDialogData.actionType === TRANSACTION_KEY) {
                oAddDialogData.typeDefinition = this._aTransactionPropertyEditors[0].getId();
                oAddDialogData.multiInstanceConfigurable = true;
            } else if (oAddDialogData.actionType === EVENT_KEY) {
                oAddDialogData.typeDefinition = this._aEventPropertyEditors[0].getId();
                oAddDialogData.multiInstanceConfigurable = true;
            } else if (oAddDialogData.actionType === PRODUCTION_PROCESS_KEY) {
                oAddDialogData.typeDefinition = this._aProductionProcessPropertyEditors[0].getId();
                oAddDialogData.multiInstanceConfigurable = true;
            }
            this.onAddActionCancel(oEvent);
            let that = this;
            setTimeout(function() {
                that.addAction(oAddDialogData);
            }, 0);
        },

        onAddActionCancel: function(oEvent) {
            this.getAddActionDialog().close();
            this._addActionDialog.destroy();
            this._addActionDialog = null;
        },

        onRemoveAction: function(oEvent) {
            // this occurs when remove icon row is pressed
            let oButton = oEvent.getSource();
            let sActionId = "";
            if (oButton) {
                sActionId = oButton.data("actionId");
            }
            this.promptToRemovePlugin(sActionId);
        },

        promptToRemovePlugin: function(sPluginId) {
            let oRowInformation = this.getSelectedRowInformation(sPluginId);
            if (!oRowInformation) {
                return;
            }
            let bShowConfiguration = true;
            if (typeof oRowInformation.data.showConfiguration === "undefined" ||
                !oRowInformation.data.showConfiguration) {
                // reference, just remove
                this.removeFromAssigned(sPluginId, oRowInformation);
                return;
            }

            // plugin instance, prompt user to remove
            let aReferenced = this._oMainControllerHelper.getWherePluginReferenced(sPluginId);
            let sTitleKey = "confirmRemovePluginPrompt";
            if (aReferenced && aReferenced.length > 1) {
                sTitleKey = "confirmRemovePluginAndReferencesPrompt";
            }
            let that = this;
            let bCompact = this._isViewCompactSize();
            MessageBox.confirm(this.getI18nText(sTitleKey), {
                title: this.getI18nText("confirmRemovePluginTitle"),
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                styleClass: bCompact ? "sapUiSizeCompact" : "",
                onClose: function(sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        that.removeFromAssigned(sPluginId, oRowInformation);
                    }
                }
            });
        },

        _isViewCompactSize: function() {
            let oView = this._oMainController.getView();
            return !!oView.$().closest(COMPACT_SIZE_CLASS).length;
        },

        onRemoveFromAssigned: function(oSelectedRowData) {
            if (!oSelectedRowData) {
                return;
            }
            if (typeof oSelectedRowData.showConfiguration === "undefined" || !oSelectedRowData.showConfiguration) {
                // just a reference to a plugin in a layout area, just return
                return;
            }
            let sPluginId = oSelectedRowData.action;

            let aRegisteredPlugins = [];
            this._oMainControllerHelper.loadNestedRegisteredActions(sPluginId, aRegisteredPlugins, null);

            let oPropertyEditor = this._findPropertyEditor(sPluginId, false);
            if (oPropertyEditor) {
                let oPluginData = this._getPluginData(sPluginId);
                this.setPopupEnabled(oPluginData, false);
            }

            // remove current plugin property editor
            let aReferenced = this._oMainControllerHelper.getWherePluginReferenced(sPluginId);
            if (aReferenced && aReferenced.length === 1) {
                // only remove if last reference
                this._oMainControllerHelper.removeAssignedPluginPropertyEditor(sPluginId);
            }
            this._oMainControllerHelper.removeAndUnregisterNestedPlugins(aRegisteredPlugins);
        },

        onMoveToAssigned: function(oSelectedRowData) {
            if (!oSelectedRowData) {
                return;
            }

            let sAction = oSelectedRowData.action;
            let sType = oSelectedRowData.type;
            let sNewActionInstanceId = this._createUniqueInstanceId(oSelectedRowData);

            let bShowConfiguration = oSelectedRowData.showConfiguration;
            if (oSelectedRowData.multiInstance && oSelectedRowData.type === "VIEW_PLUGIN") {
                if (!oSelectedRowData.multiInstanceConfigurable) {
                    bShowConfiguration = false;
                    oSelectedRowData.showConfiguration = false;
                } else {
                    // multi-instance view plugin now has been assigned
                    oSelectedRowData.viewPluginNotAssigned = false;
                }
            }

            // find and create Plugin Property Editor and add menu label
            let oPropertyEditor = this._findOrCreatePropertyEditor(sAction, sNewActionInstanceId, sType);
            if (oPropertyEditor) {
                oSelectedRowData.id = sNewActionInstanceId;
                oSelectedRowData.action = sNewActionInstanceId;
                oSelectedRowData.plugin = sNewActionInstanceId;
                if (oPropertyEditor.setTypeDefinition) {
                    if (oSelectedRowData.type === "EVENT_PLUGIN") {
                        oPropertyEditor.setTypeDefinition(oSelectedRowData.typeDefinitionEventKey);
                        if (oPropertyEditor.setTypeDefinitionTitle) {
                            oPropertyEditor.setTypeDefinitionTitle(oSelectedRowData.typeDefinitionTitle);
                        }
                    } else {
                        oPropertyEditor.setTypeDefinition(oSelectedRowData.typeDefinitionTitle);
                    }
                }
                if (oPropertyEditor.setServiceRegistryName) {
                    oPropertyEditor.setServiceRegistryName(oSelectedRowData.typeDefinitionTitle);
                }
                if (oPropertyEditor.setServiceRegistryData) {
                    oPropertyEditor.setServiceRegistryData(oSelectedRowData.typeData);
                }
                if (oPropertyEditor.initializeProperties) {
                    oPropertyEditor.initializeProperties();
                }
                let bPopupEnabled = false;
                if (oPropertyEditor.hasConfigurationProperties && bShowConfiguration) {
                    oSelectedRowData.showConfiguration = oPropertyEditor.hasConfigurationProperties();
                    if (oSelectedRowData.showConfiguration && sType === VIEW_PLUGIN) {
                        oPropertyEditor.setShowPopupProperties(this.bShowPopupProperties);
                        let oPropertyData = oPropertyEditor.getPropertyData();
                        let oPopupPropertyData = oPropertyEditor.getPopupPropertyData();
                        if (PodUtility.isNotEmpty(oPopupPropertyData.popup)) {
                            bPopupEnabled = true;
                        }
                    }
                }
                this.setPopupEnabled(oPropertyEditor, bPopupEnabled);
            }
        },

        updateActionData: function(oActionData) {
            if (!oActionData) {
                return;
            }
            let oPropertyEditor = this._oMainControllerHelper.findAssignedPluginPropertyEditor(oActionData.action);
            if (oPropertyEditor) {
                if (oPropertyEditor.getTypeDefinition) {
                    if (oActionData.type === "EVENT_PLUGIN") {
                        let sKey = oPropertyEditor.getTypeDefinition();
                        oActionData.typeDefinitionEventKey = sKey;
                        oActionData.typeDefinitionTitle = this._getEventTypeDefinitionTitle(sKey);
                    } else {
                        oActionData.typeDefinitionTitle = oPropertyEditor.getTypeDefinition();
                    }
                }
                if (oPropertyEditor.getServiceRegistryName) {
                    oActionData.typeDefinitionTitle = oPropertyEditor.getServiceRegistryName();
                }
                if (oPropertyEditor.getServiceRegistryData) {
                    oActionData.typeData = oPropertyEditor.getServiceRegistryData();
                }
                if (oPropertyEditor.hasConfigurationProperties && oActionData.showConfiguration) {
                    oActionData.showConfiguration = oPropertyEditor.hasConfigurationProperties();
                }
            }
        },

        _getEventTypeDefinitionTitle: function(sKey) {
            let oDialogModel = this.getDialogModel();
            let oDialogData = oDialogModel.getData();
            for (let oEvent of oDialogData.EventTypes) {
                if (oEvent.event === sKey) {
                    return oEvent.title
                }
            }
            return sKey;
        },

        _saveTransactionParameters: function() {
            let oTable = sap.ui.getCore().byId("inputParameterTable");
            if (oTable && this.oLastTransactionPropetyEditor && this.oLastTransactionPropetyEditor.setInputParams) {
                let oModel = oTable.getModel("oTableModel");
                this.oLastTransactionPropetyEditor.setInputParams(oTable, oModel, oModel.getData().parameters);
            }
        },

        _createUniqueInstanceId: function(oActionData) {
            let sAction = oActionData.action;
            let sNewAction = sAction;

            let bMultiInstanceConfigurable = true;
            if (typeof oActionData.multiInstanceConfigurable !== "undefined") {
                bMultiInstanceConfigurable = oActionData.multiInstanceConfigurable;
            }

            if (oActionData.multiInstance && bMultiInstanceConfigurable) {
                let iCount = this._oMainControllerHelper.getPluginInstanceCount(sAction);
                iCount++;
                sNewAction = sAction + "." + this._createUniqueId(iCount);
            }
            return sNewAction;
        },

        _createUniqueId: function(iCount) {
            if (this._oMainControllerHelper.isRunningOpa5Test()) {
                // need to have defined id's for OPA5 tests
                return iCount;
            }
            // Math.random is unique because of its seeding algorithm.
            // Convert it to base 36 (numbers + letters), and grab the first 8 characters
            // after the decimal.
            let sRandom = Math.random().toString(36).toUpperCase();
            return sRandom.substr(2, 8);
        },

        setCloseHandler: function(oCloseHandler) {
            this._oCloseHandler = oCloseHandler;
        },

        onDialogOk: function(oEvent) {
            this._saveTransactionParameters();
            this._oCloseHandler.onDialogClose(oEvent);
        },

        setShowPopupProperties: function(bShowPopup) {
            // this flag is used to show or hide the properties column
            this.bShowPopupProperties = bShowPopup;
        },

        getShowPopupPropertiesColumn: function() {
            if (typeof this.bShowPopupProperties === "undefined") {
                this.bShowPopupProperties = true;
            }
            return this.bShowPopupProperties;
        },

        _setPluginShowPopupPropertiesOff: function(oSelectedRowContext, iSelectedRowIndex, oTable) {
            let oRowContext = this._getContextByIndex(oTable, iSelectedRowIndex);
            let oData = oRowContext.getObject();
            let sPluginId = oData.plugin;
            let oPropertyEditor;
            if (PodUtility.isNotEmpty(sPluginId)) {
                oPropertyEditor = this._oMainControllerHelper.findAssignedPluginPropertyEditor(sPluginId);
                if (oPropertyEditor) {
                    oPropertyEditor.setShowPopupProperties(this.bShowPopupProperties);
                }
            }
        },

        onShowConfiguration: function(oEvent) {

            // if side container open, clear contents
            let oDSC = this._byId(this.getSideContentControlId());
            if (oDSC.getShowSideContent()) {
                this._saveTransactionParameters();
                this._clearFormContainer();
            }

            this._selectRow(oEvent);

            // find existing Plugin Property Editor
            let oData = this._getInputDataFromEvent(oEvent);

            let oPropertyEditor = oData.propertyEditor;
            if (!oPropertyEditor && oData.actionObject && oData.actionObject.action) {
                // if not defined yet, must create it
                oPropertyEditor = this._findOrCreatePropertyEditor(oData.actionObject.action, oData.actionObject.action);
            }
            if (oPropertyEditor) {
                if (oPropertyEditor.getEqualSplit) {
                    oDSC.setEqualSplit(oPropertyEditor.getEqualSplit());
                } else if (oDSC.getEqualSplit()) {
                    oDSC.setEqualSplit(false);
                }
                let oPropertyFormContainer = this._byId(this.getSidePanelFormId());

                let bShowPopupProperties = this.bShowPopupProperties;
                if (oData.actionObject && oData.actionObject.type !== "VIEW_PLUGIN") {
                    bShowPopupProperties = false;
                }
                oPropertyEditor.setShowPopupProperties(bShowPopupProperties);
                oPropertyEditor.setMainController(this._oMainController);
                oPropertyEditor.setActionSelections(this._aActionSelections);
                oPropertyEditor.setAvailableActions(this._aAvailableActions);

                oPropertyEditor.setExecutionPropertyEditors(this._aPropertyEditors);
                oPropertyEditor.setEventPropertyEditors(this._aEventPropertyEditors);
                oPropertyEditor.setTransactionPropertyEditors(this._aTransactionPropertyEditors);
                oPropertyEditor.setProductionProcessPropertyEditors(this._aProductionProcessPropertyEditors);

                oPropertyEditor.setTabPageSelections(this._aTabPageSelections);
                oPropertyEditor.setNavigationPageSelections(this._aNavigationPageSelections);

                oPropertyEditor.addPropertyEditorContent(oPropertyFormContainer);
                let sPropertyEditorType = oPropertyEditor.getControlType();
                if (sPropertyEditorType === VIEW_PLUGIN) {
                    oPropertyEditor.setPopupPropertyEditorController(this);
                    oPropertyEditor.addPopupPropertyEditorContent(oPropertyFormContainer);
                }
            }
            this.oLastTransactionPropetyEditor = oData.propertyEditor;

            this.oCurrentPropertyEditor = oPropertyEditor;

            oDSC.setShowSideContent(true);
        },

        _selectRow: function(oEvent) {
            let oButton = oEvent.getSource();
            if (oButton) {
                let sActionId = oButton.data("actionId");
                this.selectRowForAssigned(sActionId);
            }
        },

        _findPropertyEditor: function(sPluginId, bIgnoreInstanceId) {
            return this._oMainControllerHelper.findAssignedPluginPropertyEditor(sPluginId, bIgnoreInstanceId);
        },

        _findOrCreatePropertyEditor: function(sPluginId, sPluginInstanceId, sType) {
            let bMultiInstance = false;
            if (PodUtility.isNotEmpty(sPluginInstanceId) && sPluginInstanceId.indexOf(".") > 0) {
                bMultiInstance = true;
            }
            // look for existing instance of plugin
            let oPropertyEditor = this._oMainControllerHelper.findAssignedPluginPropertyEditor(sPluginInstanceId, false);
            if (!oPropertyEditor && bMultiInstance) {
                // multi-instance plugin not found, look by ignoring instance id (Not for use by single instance plugins)
                oPropertyEditor = this._oMainControllerHelper.findAssignedPluginPropertyEditor(sPluginInstanceId, true);
            }
            if (!oPropertyEditor) {
                // not found, create it
                oPropertyEditor = this._oMainControllerHelper.createPluginPropertyEditor(sPluginId, sPluginInstanceId);
                if (oPropertyEditor && PodUtility.isNotEmpty(sType) &&
                    (sType === TRANSACTION_PLUGIN || sType === EVENT_PLUGIN || sType === PRODUCTION_PROCESS_PLUGIN)) {
                    this._oMainControllerHelper.incrementPluginInstanceCount(sType);
                }
            }
            return oPropertyEditor;
        },

        _getPluginData: function(sPluginId) {
            let oTable = this.getAssignedTable();
            let aRows = oTable.getBinding("items");
            for (let i = 0; i < aRows.aIndices.length; i++) {
                let oRowData = aRows.oList[aRows.aIndices[i]];
                if (oRowData.plugin === sPluginId) {
                    return {
                        pluginId: oRowData.plugin,
                        sequence: oRowData.sequence,
                        clearsInput: oRowData.clearsInput,
                        menuLabel: oRowData.menuLabel
                    };
                }
            }
            return null;
        },

        setPopupEnabled: function(oPluginData, bSelected) {
            if (!oPluginData) {
                return;
            }
            let oData = {
                pluginId: oPluginData.pluginId
            };
            if (PodUtility.isEmpty(oPluginData.pluginId) && oPluginData.getId()) {
                oData.pluginId = oPluginData.getId();
            }
            if (bSelected) {
                this._oMainControllerHelper.addPopupPluginAssignment(oData);
            } else {
                this._oMainControllerHelper.removePopupPluginAssignment(oData);
            }
        },

        onCloseConfiguration: function(oEvent) {
            this._saveTransactionParameters();
            this._clearFormContainer();
            let oDSC = this._byId(this.getSideContentControlId());
            oDSC.setShowSideContent(false);
        },

        refreshFormContainer: function() {
            let oDSC = this._byId(this.getSideContentControlId());
            if (oDSC.getShowSideContent() && this.oCurrentPropertyEditor) {
                let oPropertyFormContainer = this._byId(this.getSidePanelFormId());
                oPropertyFormContainer.invalidate();
            }
        },

        _refreshFormContainer: function(oPropertyEditor) {

            // if side container open, clear contents
            let oDSC = this._byId(this.getSideContentControlId());
            if (oDSC.getShowSideContent()) {
                this._clearFormContainer();
            }

            let oPropertyFormContainer = this._byId(this.getSidePanelFormId());

            oPropertyEditor.setShowPopupProperties(this.bShowPopupProperties);
            oPropertyEditor.addPropertyEditorContent(oPropertyFormContainer);
            let sPropertyEditorType = oPropertyEditor.getControlType();
            if (sPropertyEditorType === VIEW_PLUGIN) {
                oPropertyEditor.setPopupPropertyEditorController(this);
                oPropertyEditor.addPopupPropertyEditorContent(oPropertyFormContainer);
            }

            oDSC.setShowSideContent(true);
        },

        _clearFormContainer: function() {
            let oPropertyFormContainer = this._byId(this.getSidePanelFormId());
            if (oPropertyFormContainer) {
                oPropertyFormContainer.destroyContent();
            }
        }
    });

    return ActionAssignmentViewController;
});