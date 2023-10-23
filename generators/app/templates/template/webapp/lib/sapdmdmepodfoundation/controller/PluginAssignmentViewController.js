sap.ui.define([
    "sap/dm/dme/podfoundation/controller/ActionAssignmentViewController",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(ActionAssignmentViewController, PodUtility) {
    "use strict";

    return ActionAssignmentViewController.extend("sap.dm.dme.podfoundation.controller.PluginAssignmentViewController", {
        EMPTY_SELECTION: "EMPTY",

        beforeOpen: function(oEvent) {
            this._initializeAvailableActions();
            if (PodUtility.isNotEmpty(this._sAssignedPlugin)) {
                var bIgnoreInstanceId = true;
                if (this._sAssignedPlugin.indexOf(".") > 0) {
                    bIgnoreInstanceId = false;
                }
                var oPropertyEditor = this._findPropertyEditor(this._sAssignedPlugin, bIgnoreInstanceId);
                if (oPropertyEditor) {
                    this._updateDialogModel(this._sAssignedPlugin, oPropertyEditor.getTitle());
                }
                this._showConfiguration(this._sAssignedPlugin);
            }
        },

        _updateDialogModel: function(sPluginId, sTitle) {
            var oDialogModel = this.getDialogModel()
            var oDialogData = oDialogModel.getData();
            oDialogData.AssignedPlugin = sPluginId;
            oDialogData.AssignedTitle = "";
            oDialogData.Assigned = false;
            if (PodUtility.isNotEmpty(sPluginId)) {
                oDialogData.Assigned = true;
            }
            if (PodUtility.isNotEmpty(sTitle)) {
                oDialogData.AssignedTitle = sTitle;
            }
            oDialogModel.refresh();
        },

        setAssignedPlugin: function(sAssignedPlugin) {
            this._sAssignedPlugin = sAssignedPlugin;
        },

        getAssignedPlugin: function() {
            return this._sAssignedPlugin;
        },

        setNavigationPageSelections: function(aNavigationPageSelections) {
            this._aNavigationPageSelections = aNavigationPageSelections;
        },

        getNavigationPageSelections: function() {
            return this._aNavigationPageSelections;
        },

        setTabPageSelections: function(aTabPageSelections) {
            this._aTabPageSelections = aTabPageSelections;
        },

        getTabPageSelections: function() {
            return this._aTabPageSelections;
        },

        _getAvailablePlugins: function(aAvailableActions) {
            var oModelData = ActionAssignmentViewController.prototype._getAvailablePlugins.apply(this, arguments);
            var oEmptyActionData = {
                Rank: 0,
                highlight: "None",
                name: this.EMPTY_SELECTION,
                plugin: this.EMPTY_SELECTION,
                title: ""
            };
            oModelData.Plugins.splice(0, 0, oEmptyActionData);
            return oModelData;
        },

        onPluginItemSelected: function(oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            var sPluginId = oSelectedItem.data("pluginId");
            var sTitle = oSelectedItem.data("title");
            if (sPluginId === this.EMPTY_SELECTION) {
                sPluginId = null;
                sTitle = null;
            }

            this._updateDialogModel(sPluginId, sTitle);

            var sAssignedPluginId = this._assignPlugin(sPluginId);

            this.handleSinglePluginSelectionDialogClose();

            if (PodUtility.isNotEmpty(sAssignedPluginId)) {
                this._delayedShowConfiguration(sAssignedPluginId);
            } else {
                this.getActionAssignmentDialog().invalidate();
            }
        },

        _assignPlugin: function(sPluginId) {

            if (PodUtility.isNotEmpty(this._sAssignedPlugin)) {
                this.onRemoveFromAssigned(this._sAssignedPlugin);
                this._sAssignedPlugin = null;
            }

            if (PodUtility.isEmpty(sPluginId)) {
                this._clearFormContainer();
            } else {
                this.onMoveToAssigned(sPluginId);
            }

            return this._sAssignedPlugin;
        },

        onRemoveAssignedPlugin: function(oEvent) {
            var oDialogModel = this.getActionAssignmentDialog().getModel("DialogModel");
            var oDialogData = oDialogModel.getData();
            this._sAssignedPlugin = oDialogData.AssignedPlugin;
            if (PodUtility.isNotEmpty(this._sAssignedPlugin)) {
                this.onRemoveFromAssigned(this._sAssignedPlugin);
                this._sAssignedPlugin = null;
            }

            this._updateDialogModel(null, null);

            this._clearFormContainer();
        },

        onRemoveFromAssigned: function(sPluginId) {
            var oPropertyEditor = this._findOrCreatePropertyEditor(sPluginId, sPluginId);
            if (oPropertyEditor) {
                var oPluginData = {
                    pluginId: sPluginId
                };
                this.setPopupEnabled(oPluginData, false);
            }
            this._oMainControllerHelper.removeAssignedPluginPropertyEditor(sPluginId);
        },

        onMoveToAssigned: function(sPluginId) {
            var oActionData = this.findAction(sPluginId);
            if (!oActionData) {
                this._sAssignedPlugin = null;
                return;
            }
            var sAction = oActionData.action;
            var sType = oActionData.type;
            var sNewActionInstanceId = sAction;
            if (sNewActionInstanceId.indexOf(".") < 0) {
                sNewActionInstanceId = this._createUniqueInstanceId(oActionData);
            }

            // find and create Plugin Property Editor and add menu label
            var oPropertyEditor = this._findOrCreatePropertyEditor(sAction, sNewActionInstanceId, sType);
            if (oPropertyEditor) {
                if (oPropertyEditor.initializeProperties) {
                    oPropertyEditor.initializeProperties();
                }
                this._sAssignedPlugin = sNewActionInstanceId;
            }
        },

        onDialogOk: function(oEvent) {
            this._oCloseHandler.onPluginAssignmentDialogClose(oEvent);
        },

        _delayedShowConfiguration: function(sPluginId) {
            var that = this;
            setTimeout(function() {
                that._showConfiguration(sPluginId);
            }, 125);
        },

        _showConfiguration: function(sPluginId) {

            this._clearFormContainer();

            var oData = this._getInputDataForPlugin(sPluginId);

            if (oData && oData.actionObject &&
                !oData.actionObject.multiInstance && !oData.actionObject.viewPluginNotAssigned) {
                // single instance plugins assigned to layout area cannot edit configuration here
                return;
            }

            var oPropertyEditor = oData.propertyEditor;
            if (oPropertyEditor) {
                var sPropertyEditorType = oPropertyEditor.getControlType();

                var bShowPopupProperties = this.bShowPopupProperties;
                if (oData.actionObject && oData.actionObject.type !== "VIEW_PLUGIN") {
                    bShowPopupProperties = false;
                }

                var oPropertyFormContainer = this._byId("configurationSidePanelEditableForm");
                oPropertyEditor.setShowPopupProperties(bShowPopupProperties);
                oPropertyEditor.setNavigationPageSelections(this.getNavigationPageSelections());
                oPropertyEditor.setTabPageSelections(this.getTabPageSelections());
                oPropertyEditor.setMainController(this._oMainController);
                oPropertyEditor.addPropertyEditorContent(oPropertyFormContainer);
                if (sPropertyEditorType === "VIEW_PLUGIN") {
                    oPropertyEditor.setPopupPropertyEditorController(this);
                    oPropertyEditor.addPopupPropertyEditorContent(oPropertyFormContainer);
                }
            }
            this.getActionAssignmentDialog().invalidate();
        },

        _getInputDataForPlugin: function(sPluginId) {
            var sBasePluginId = sPluginId;
            if (sPluginId.indexOf(".") > 0) {
                sBasePluginId = sPluginId.substring(0, sPluginId.indexOf("."));
            }
            var oAction = this.findAction(sBasePluginId);
            var bIgnoreInstanceId = false;
            if (oAction && !oAction.showConfiguration && !oAction.multiInstance && oAction.type === "VIEW_PLUGIN") {
                bIgnoreInstanceId = true;
            }

            var oPropertyEditor = this._findPropertyEditor(sPluginId, bIgnoreInstanceId);
            if (!oPropertyEditor) {
                oPropertyEditor = this._findOrCreatePropertyEditor(sPluginId, sPluginId);
            }

            return {
                propertyEditor: oPropertyEditor,
                actionObject: oAction
            };
        },

        _clearFormContainer: function() {
            var oPropertyFormContainer = this._byId("configurationSidePanelEditableForm");
            if (oPropertyFormContainer) {
                oPropertyFormContainer.destroyContent();
            }
        },

        _findPropertyEditor: function(sPluginId, bIgnoreInstanceId) {
            return this._oMainControllerHelper.findAssignedPluginPropertyEditor(sPluginId, bIgnoreInstanceId);
        }
    });
});