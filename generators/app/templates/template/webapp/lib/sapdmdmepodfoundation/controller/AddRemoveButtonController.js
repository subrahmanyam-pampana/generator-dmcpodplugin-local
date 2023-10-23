sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/ValueState",
    "sap/base/util/uid",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/podfoundation/control/ActionAssignmentHelper",
    "sap/dm/dme/podfoundation/control/IconSelectHelper",
    "sap/dm/dme/podfoundation/formatter/ButtonLabelFormatter",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(Controller, ValueState, uid, JSONModel, ActionAssignmentHelper,
    IconSelectHelper, ButtonLabelFormatter, PodUtility) {
    "use strict";

    var oAddRemoveButtonController = Controller.extend("sap.dm.dme.podfoundation.controller.AddRemoveButtonController", {

        beforeOpen: function(oSmartListControl) {
            this._oSmartListControl = oSmartListControl;
            if (this._oPropertyEditor) {

                this.updateTableModel(true);

                var oMainController = this._oPropertyEditor.getMainController();
                var oView = oMainController.getView();
                this._loadPagesIntoViewModel(oView);

                this._updateToolbarButtonStates();
            }
        },

        updateTableModel: function(bCreateModel) {
            var oModel = null;
            if (bCreateModel) {
                oModel = new JSONModel();
            } else {
                oModel = this._oSmartListControl.getModel("ButtonsControl");
            }
            if (!this._oDefaultData) {
                this._oDefaultData = {};
            }
            if (!this._oDefaultData[this._sDataName]) {
                this._oDefaultData[this._sDataName] = [];
            }
            oModel.setData(this._oDefaultData);
            if (bCreateModel) {
                this._oSmartListControl.setModel(oModel, "ButtonsControl");
            } else {
                oModel.refresh();
            }
        },

        _loadPagesIntoViewModel: function(oView) {
            var oMainController = this._oPropertyEditor.getMainController();
            var oMainControllerHelper = oMainController.getMainControllerHelper();
            var aPages = oMainControllerHelper.getPages();
            if (!aPages) {
                aPages = [];
            } else if (aPages.length > 0) {
                for (var i = 0; i < aPages.length; i++) {
                    aPages[i].pageName = this._getPageDescriptionText(aPages[i].description);
                }
            }
            aPages.unshift({
                page: "",
                pageName: ""
            });
            var oModel = new JSONModel();
            oModel.setData(aPages);
            oView.setModel(oModel, "Pages");
        },

        setPropertyEditor: function(oPropertyEditor) {
            this._oPropertyEditor = oPropertyEditor;
        },

        setDataName: function(sDataName) {
            this._sDataName = sDataName;
        },

        setDefaultData: function(oDefaultData) {
            this._oDefaultData = oDefaultData;
        },

        _updateToolbarButtonStates: function() {

            var oAddButton = this._getAddButton();
            oAddButton.setEnabled(false);

            var oDeleteButton = this._getDeleteButton();
            oDeleteButton.setEnabled(false);

            var oModel = this._oSmartListControl.getModel("ButtonsControl");
            var oData = oModel.getData();
            var iButtonCount = oData[this._sDataName].length;

            if (iButtonCount <= 3) {
                if (iButtonCount < 3) {
                    oAddButton.setEnabled(true);
                }
                if (iButtonCount > 0) {
                    oDeleteButton.setEnabled(true);
                }
            }
        },

        onAddButtonPress: function(oEvent) {
            var oModel = this._oSmartListControl.getModel("ButtonsControl");
            var oData = oModel.getData();
            var sDefaultButtonName = this._getLocalizedText("defaultButtonName");

            var index = oData[this._sDataName].length;

            oData[this._sDataName][index] = {
                buttonName: sDefaultButtonName,
                buttonType: "ACTION_BUTTON",
                buttonIcon: "",
                buttonTooltip: "",
                buttonUid: uid()
            };
            oModel.refresh();

            if (this._oPropertyEditor.setActiveButtonIndex) {
                this._oPropertyEditor.setActiveButtonIndex(index, this._sDataName);
            }
            if (this._oPropertyEditor.setActionAssignmentButtonType) {
                this._oPropertyEditor.setActionAssignmentButtonType("ACTION_BUTTON", this._sDataName);
            }

            this._updateToolbarButtonStates();
        },

        onDeleteButtonPress: function(oEvent) {
            var oModel = this._oSmartListControl.getModel("ButtonsControl");
            var oData = oModel.getData();
            if (oData[this._sDataName].length > 0) {
                var aUpdatedButtons = [];
                var aRemoveButtons = [];
                for (var i = 0; i < oData[this._sDataName].length; i++) {
                    if (!oData[this._sDataName][i].selected) {
                        aUpdatedButtons[aUpdatedButtons.length] = oData[this._sDataName][i];
                    } else if (oData[this._sDataName][i].actions) {
                        aRemoveButtons[aRemoveButtons.length] = oData[this._sDataName][i];
                    }
                }

                var aKeepPlugins = PodUtility.getPluginsFromButtons(aUpdatedButtons);
                var aRemovePlugins = PodUtility.getPluginsFromButtons(aRemoveButtons);

                oData[this._sDataName] = aUpdatedButtons;
                oModel.setData(oData);
                oModel.refresh();

                var aRemoves = PodUtility.getStringsToRemove(aKeepPlugins, aRemovePlugins);

                if (aRemoves && aRemoves.length > 0) {
                    // remove assigned plugins from POD
                    this._removePlugins(aRemoves);
                }
            }

            this._updateToolbarButtonStates();
        },

        _removePlugins: function(aRemovePlugins) {
            if (!aRemovePlugins || aRemovePlugins.length === 0) {
                return;
            }
            var oMainController = this._oPropertyEditor.getMainController();
            var oMainControllerHelper = oMainController.getMainControllerHelper();

            var aRegisteredPlugins = [];
            var oPluginData = {
                pluginId: null
            };
            for (let sPluginId of aRemovePlugins) {
                oMainControllerHelper.loadNestedRegisteredActions(sPluginId, aRegisteredPlugins, null);
                var aReferenced = oMainControllerHelper.getWherePluginReferenced(sPluginId);
                if (aReferenced && aReferenced.length === 1) {
                    oPluginData.pluginId = sPluginId;
                    // only remove if only one reference to plugin in POD left
                    oMainControllerHelper.removePopupPluginAssignment(oPluginData);
                    oMainControllerHelper.removeAssignedPluginPropertyEditor(sPluginId);
                }
            }
            var sParentId = this._oPropertyEditor.getId();

            var sDataType = this._sDataName;
            if (sDataType === "dialogFooterButtons") {
                sDataType = "footerButtons";
            }
            oMainControllerHelper.removeAndUnregisterNestedPlugins(aRegisteredPlugins, aRemovePlugins, sParentId, sDataType);
        },

        onButtonNameSuggest: function(oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");
            var oInput = oEvent.getSource();
            this._onButtonSuggest(oInput, sTerm, "NAME_FIELD");
        },

        onButtonTooltipSuggest: function(oEvent) {
            var sTerm = oEvent.getParameter("suggestValue");
            var oInput = oEvent.getSource();
            this._onButtonSuggest(oInput, sTerm, "TOOLTIP_FIELD");
        },

        _onButtonSuggest: function(oInput, sTerm, sFieldType) {
            var sButtonUid = oInput.data("buttonUid");
            var oButtonDefinition = this._getButtonDefinition(sButtonUid);
            if (!oButtonDefinition) {
                return;
            }
            if (this._oPropertyEditor.setActiveButtonIndex) {
                this._oPropertyEditor.setActiveButtonIndex(oButtonDefinition.index, this._sDataName);
            }
            var sButtonType = oButtonDefinition.data.buttonType;
            if (this._oPropertyEditor.setActionAssignmentButtonType) {
                this._oPropertyEditor.setActionAssignmentButtonType(sButtonType, this._sDataName);
            }

            this._loadSuggestionsModel(oInput, sFieldType, sButtonType);

            oInput.setFilterFunction(function(sTerm, oItem) {
                // A case-insensitive 'string contains' style filter
                return oItem.getText().match(new RegExp(sTerm, "i"));
            });
        },

        _loadSuggestionsModel: function(oInput, sFieldType, sButtonType) {
            var oModel = oInput.getModel();
            var oData = null;
            if (oModel) {
                oData = oModel.getData();
            }

            var bResetModel = false;
            if (!this._sLastButtonType || this._sLastButtonType !== sButtonType) {
                bResetModel = true;
            }
            this._sLastButtonType = sButtonType;

            // only load new model if labels / tooltips not loaded already
            var oI18nData = null;
            if (sFieldType === "NAME_FIELD" && (bResetModel || !oData || !oData.I18nButtonLabels)) {
                oI18nData = this._oPropertyEditor.getButtonLabelList(this._sDataName);
            } else if (sFieldType === "TOOLTIP_FIELD" && (bResetModel || !oData || !oData.I18nTooltipLabels)) {
                oI18nData = this._oPropertyEditor.getButtonTooltipList(this._sDataName);
            }
            if (oI18nData) {
                oModel = new JSONModel();
                oModel.setData(oI18nData);
                oInput.setModel(oModel);
            }
        },

        onAssignActionsPress: function(oEvent) {
            var oButton = oEvent.getSource();
            var sButtonUid = oButton.data("buttonUid");

            var oButtonDefinition = this._getButtonDefinition(sButtonUid);
            if (!oButtonDefinition) {
                return;
            }
            var aActions = oButtonDefinition.data.actions;
            this._oPropertyEditor.setAssignedActions(aActions);

            if (this._oPropertyEditor.setActiveButtonIndex) {
                this._oPropertyEditor.setActiveButtonIndex(oButtonDefinition.index, this._sDataName);
            }

            var sButtonType = oButtonDefinition.data.buttonType;
            if (this._oPropertyEditor.setActionAssignmentButtonType) {
                this._oPropertyEditor.setActionAssignmentButtonType(sButtonType, this._sDataName);
            }
            if (this._oPropertyEditor.getMainController) {
                var oMainController = this._oPropertyEditor.getMainController();
            }

            var oActionAssignmentHelper = this._getActionAssignmentHelper(sButtonType, this._sDataName); // "ButtonActions");
            oActionAssignmentHelper.showAddRemoveActionAssignmentDialog();
        },

        _getActionAssignmentHelper: function(sButtonType, sDataName) {
            // added to stub in QUnit tests
            return new ActionAssignmentHelper(this._oPropertyEditor, sButtonType, sDataName);
        },

        _getButtonDefinition: function(sButtonUid) {
            var oModel = this._oSmartListControl.getModel("ButtonsControl");
            var oData = oModel.getData();

            var iIndex = this._findModelDataIndex(sButtonUid, oData[this._sDataName]);
            if (iIndex >= 0) {
                return {
                    index: iIndex,
                    data: oData[this._sDataName][iIndex]
                };
            }
            return null;
        },

        _findModelDataIndex: function(sButtonUid, aButtonList) {
            for (var i = 0; i < aButtonList.length; i++) {
                if (aButtonList[i].buttonUid === sButtonUid) {
                    return i;
                }
            }
            return -1;
        },

        onButtonTypeChange: function(oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem && oSelectedItem.getKey() === "NAVIGATION_BUTTON") {
                var oSelectButton = oEvent.getSource();
                var sButtonUid = oSelectButton.data("buttonUid");
                var oButtonDefinition = this._getButtonDefinition(sButtonUid);
                if (oButtonDefinition) {
                    oButtonDefinition.data.actions = [];
                }
            }
        },

        onIconBrowsePress: function(oEvent) {
            if (this._oPropertyEditor) {
                var oMainController = this._oPropertyEditor.getMainController();
                var oView = oMainController.getView();
                var oSelectField = oEvent.getSource();
                var oIconHelper = this._getIconSelectHelper();
                var sNoneText = this._getLocalizedText("NONE");
                oIconHelper.openIconSelectValueHelp(oSelectField, oView, sNoneText);
            }
        },

        _getAddButton: function() {
            if (!this._oAddButton) {
                this._oAddButton = this._findButtonByIconName("sap-icon://add");
            }
            return this._oAddButton;
        },

        _getDeleteButton: function() {
            if (!this._oDeleteButton) {
                this._oDeleteButton = this._findButtonByIconName("sap-icon://delete");
            }
            return this._oDeleteButton;
        },

        _findButtonByIconName: function(sIconName) {
            var oOverflowToolbar = this._findOverflowToolbar();
            if (oOverflowToolbar) {
                var aList = oOverflowToolbar.getContent();
                for (var i = 0; i < aList.length; i++) {
                    var sType = aList[i].getMetadata().getName();
                    if (sType === "sap.m.Button" && aList[i].getIcon() === sIconName) {
                        return aList[i];
                    }
                }
            }
            return null;
        },

        _findOverflowToolbar: function() {
            var aList = this._oSmartListControl.getItems();
            for (var i = 0; i < aList.length; i++) {
                var sType = aList[i].getMetadata().getName();
                if (sType === "sap.m.OverflowToolbar") {
                    return aList[i];
                }
            }
            return null;
        },

        _getIconSelectHelper: function() {
            if (!this._oIconHelper) {
                this._oIconHelper = new IconSelectHelper();
            }
            return this._oIconHelper;
        },

        _getLocalizedText: function(sKey, aArgs) {
            return this._oPropertyEditor.getLocalizedText(sKey, aArgs);
        },

        _getPageDescriptionText: function(sDescription) {
            if (jQuery.trim(sDescription) && sDescription.toLowerCase().indexOf("i18n[") === 0) {
                var i18nKey = sDescription.substring(sDescription.indexOf("[") + 1, sDescription.indexOf("]"));
                var sValue = ButtonLabelFormatter.getPageDescriptionText(i18nKey);
                if (!jQuery.trim(sValue)) {
                    return i18nKey;
                }
                return sValue;
            }
            return sDescription;
        }
    });

    return oAddRemoveButtonController;
});