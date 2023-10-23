sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/syncStyleClass",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/podfoundation/controller/ActionAssignmentViewController",
    "sap/dm/dme/podfoundation/controller/PluginAssignmentViewController"
], function(BaseObject, syncStyleClass, JSONModel, ActionAssignmentViewController, PluginAssignmentViewController) {
    "use strict";

    /**
     * Constructor for class that will display a dialog for assigning actions from a
     * <code>sap.dm.dme.podfoundation.control.PropertyEditor</code>.  When the dialog
     * closes, the <code>sap.dm.dme.podfoundation.control.PropertyEditor#updateAssignedActions</code>
     * function will be called passing the assigned actions and assignment ID that was passed to the
     * constructor.
     * @class
     * <code>sap.dm.dme.podfoundation.control.ActionAssignmentHelper</code> will display a dialog to
     * display Action Assignments
     *
     * @extends sap.ui.base.Object
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.control.ActionAssignmentHelper
     *
     * @param {object} [oPropertyEditor] Property Editor launching the Action Assignment dialog
     * @param {string} [sButtonType] Type of button ("ACTION_BUTTON" or "MENU_BUTTON")
     * @param {string} [sAssignmentIId] Identifier for this assignment
     *
     */
    var ActionAssignmentHelper = BaseObject.extend("sap.dm.dme.podfoundation.control.ActionAssignmentHelper", {
        constructor: function(oPropertyEditor, sButtonType, sAssignmentIId) {
            BaseObject.apply(this, arguments);
            this._oPropertyEditor = oPropertyEditor;
            this._sButtonType = sButtonType;
            this._sAssignmentIId = sAssignmentIId;
        }
    });

    ActionAssignmentHelper.prototype._getAddRemoveActionAssignmentDialog = function(oController, oView) {
        // added to support QUnit tests
        var oDialog = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.AddRemoveActionAssignmentDialog", oController);
        oView.addDependent(oDialog);
        syncStyleClass("sapUiSizeCompact", oView, oDialog);
        return oDialog;
    };

    ActionAssignmentHelper.prototype._getActionAssignmentDialog = function(oController, oView) {
        // added to support QUnit tests
        var oDialog = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.ActionAssignmentDialog", oController);
        oView.addDependent(oDialog);
        syncStyleClass("sapUiSizeCompact", oView, oDialog);
        return oDialog;
    };

    ActionAssignmentHelper.prototype._getPluginAssignmentDialog = function(oController, oView) {
        // added to support QUnit tests
        var oDialog = sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.PluginAssignmentDialog", oController);
        oView.addDependent(oDialog);
        syncStyleClass("sapUiSizeCompact", oView, oDialog);
        return oDialog;
    };

    ActionAssignmentHelper.prototype.onDialogClose = function(oEvent) {
        this._actionsDialog.close();

        var aAssignedActions = this._actionDialogController.getAssignedActions();

        this._updateAssignedActions(aAssignedActions);

        if (!this._isPodDesignerPropertyEditor()) {
            this._registerActions();
        }

        this._actionsDialog.detachBeforeOpen(this._actionDialogController.beforeOpen, this._actionDialogController);
        this._actionsDialog.detachAfterOpen(this._actionDialogController.afterOpen, this._actionDialogController);
        this._actionsDialog.destroy();
        this._actionsDialog = null;

        // pop current controller off stack
        this._popActionAssignmentController();

        // check for previous controller and refresh form if found
        var oLastController = this._peekActionAssignmentController();
        if (oLastController) {
            oLastController.refreshFormContainer();
        }
    };

    ActionAssignmentHelper.prototype.onPluginAssignmentDialogClose = function(oEvent) {
        this._actionsDialog.close();

        var sAssignedPlugin = this._actionDialogController.getAssignedPlugin();

        this._updateAssignedPlugin(sAssignedPlugin);

        if (!this._isPodDesignerPropertyEditor()) {
            this._registerActions();
        }

        this._actionsDialog.detachBeforeOpen(this._actionDialogController.beforeOpen, this._actionDialogController);
        this._actionsDialog.destroy();
        this._actionsDialog = null;
    };

    ActionAssignmentHelper.prototype._getMainController = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getMainController) {
            return this._oPropertyEditor.getMainController();
        }
        return null;
    };

    ActionAssignmentHelper.prototype._isPodDesignerPropertyEditor = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.isPodDesignerPropertyEditor) {
            return this._oPropertyEditor.isPodDesignerPropertyEditor();
        }
        return false;
    };

    ActionAssignmentHelper.prototype._getPropertyData = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getPropertyData) {
            return this._oPropertyEditor.getPropertyData();
        }
        return null;
    };

    ActionAssignmentHelper.prototype._updateAssignedActions = function(aAssignedActions) {
        if (this._oPropertyEditor && this._oPropertyEditor.updateAssignedActions) {
            this._oPropertyEditor.updateAssignedActions(aAssignedActions, this._sAssignmentIId);
        }
    };

    ActionAssignmentHelper.prototype._updateAssignedPlugin = function(sAssignedPlugin) {
        if (this._oPropertyEditor && this._oPropertyEditor.updateAssignedPlugin) {
            this._oPropertyEditor.updateAssignedPlugin(sAssignedPlugin, this._sAssignmentIId);
        }
    };

    ActionAssignmentHelper.prototype._registerActions = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.registerActions) {
            this._oPropertyEditor.registerActions(this._sAssignmentIId);
        }
    };

    ActionAssignmentHelper.prototype._getActionSelections = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getActionSelections) {
            return this._oPropertyEditor.getActionSelections();
        }
        return null;
    };

    ActionAssignmentHelper.prototype._getNavigationPageSelections = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getNavigationPageSelections) {
            return this._oPropertyEditor.getNavigationPageSelections();
        }
        return null;
    };

    ActionAssignmentHelper.prototype._getTabPageSelections = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getTabPageSelections) {
            return this._oPropertyEditor.getTabPageSelections();
        }
        return null;
    };

    ActionAssignmentHelper.prototype._getAssignedActions = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getAssignedActions) {
            return this._oPropertyEditor.getAssignedActions();
        }
        return null;
    };

    ActionAssignmentHelper.prototype._getAssignedPlugin = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getAssignedPlugin) {
            return this._oPropertyEditor.getAssignedPlugin();
        }
        return null;
    };

    ActionAssignmentHelper.prototype._getAvailableActions = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getAvailableActions) {
            return this._oPropertyEditor.getAvailableActions();
        }
        return null;
    };

    ActionAssignmentHelper.prototype._getExecutionPropertyEditors = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getExecutionPropertyEditors) {
            return this._oPropertyEditor.getExecutionPropertyEditors();
        }
        return null;
    };

    ActionAssignmentHelper.prototype._getProductionProcessPropertyEditors = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getProductionProcessPropertyEditors) {
            return this._oPropertyEditor.getProductionProcessPropertyEditors();
        }
        return null;
    };

    ActionAssignmentHelper.prototype._getEventPropertyEditors = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getEventPropertyEditors) {
            return this._oPropertyEditor.getEventPropertyEditors();
        }
        return null;
    };

    ActionAssignmentHelper.prototype._getTransactionPropertyEditors = function() {
        if (this._oPropertyEditor && this._oPropertyEditor.getTransactionPropertyEditors) {
            return this._oPropertyEditor.getTransactionPropertyEditors();
        }
        return null;
    };

    ActionAssignmentHelper.prototype._getMenuItemLabelList = function(sAssignmentIId) {
        if (this._oPropertyEditor && this._oPropertyEditor.getMenuItemLabelList) {
            return this._oPropertyEditor.getMenuItemLabelList(sAssignmentIId);
        }
        return null;
    };

    ActionAssignmentHelper.prototype._getActionAssignmentDialogTitle = function(sAssignmentIId) {
        if (this._oPropertyEditor && this._oPropertyEditor.getActionAssignmentDialogTitle) {
            return this._oPropertyEditor.getActionAssignmentDialogTitle(sAssignmentIId);
        }
        return null;
    };

    ActionAssignmentHelper.prototype._getPluginAssignmentDialogTitle = function(sAssignmentIId) {
        if (this._oPropertyEditor && this._oPropertyEditor.getPluginAssignmentDialogTitle) {
            return this._oPropertyEditor.getPluginAssignmentDialogTitle(sAssignmentIId);
        }
        return null;
    };

    ActionAssignmentHelper.prototype._isActionButton = function() {
        if (this._sButtonType === "ACTION_BUTTON") {
            return true;
        }
        return false;
    };

    ActionAssignmentHelper.prototype._getActionAssignmentButtonType = function() {
        if (this._isActionButton()) {
            return "ACTION_BUTTON";
        }
        return "MENU_BUTTON";
    };

    /**
     * Displays the dialog for assigning Actions to a Menu or Action button.
     * When the dialog closes, the <code>sap.dm.dme.podfoundation.control.PropertyEditor#updateAssignedActions</code>
     * function will be called passing the list of assigned actions and the assignment ID that was passed to the
     * constructor for this class.
     * <p>
     * The PropertyEditor that invokes this method can implement the following functions:
     * <pre>
     * <code>getMenuItemLabelList(sAssignmentIId)</code> should return an object containing a list of i18n names
     * to display as suggestions for menu names (Menu Button type only).  This is optional.
     *
     * <code>getActionAssignmentDialogTitle(sAssignmentIId)</code> should return the title for the dialog
     * </pre>
     * @public
     */
    ActionAssignmentHelper.prototype.showActionAssignmentDialog = function() {
        this._createAndOpenActionAssignmentDialog("ACTION_ASSIGNMENT");
    };

    /**
     * Displays the dialog for assigning Actions to a Menu or Action button.
     * When the dialog closes, the <code>sap.dm.dme.podfoundation.control.PropertyEditor#updateAssignedActions</code>
     * function will be called passing the list of assigned actions and the assignment ID that was passed to the
     * constructor for this class.
     * <p>
     * The PropertyEditor that invokes this method can implement the following functions:
     * <pre>
     * <code>getMenuItemLabelList(sAssignmentIId)</code> should return an object containing a list of i18n names
     * to display as suggestions for menu names (Menu Button type only).  This is optional.
     *
     * <code>getActionAssignmentDialogTitle(sAssignmentIId)</code> should return the title for the dialog
     * </pre>
     * @public
     */
    ActionAssignmentHelper.prototype.showAddRemoveActionAssignmentDialog = function() {
        this._createAndOpenActionAssignmentDialog("ADD_REMOVE_ACTION_ASSIGNMENT");
    };

    /*
     * Creates and open an Action Assignment dialog
     * </pre>
     * @private
     */
    ActionAssignmentHelper.prototype._createAndOpenActionAssignmentDialog = function(sType) {
        var oMainController = this._getMainController();
        if (!oMainController) {
            throw {
                message: "POD Designer controller is not defined to property editor"
            };
        }
        var oMainControllerHelper = oMainController.getMainControllerHelper();
        if (!oMainControllerHelper) {
            throw {
                message: "POD Designer helper is not defined to POD Designer controller"
            };
        }
        if (!this._actionsDialog) {
            this._actionDialogController = new ActionAssignmentViewController();
            this._actionDialogController.setMainControllerHelper(oMainControllerHelper);
            this._actionDialogController.setMainController(oMainController);
            this._actionDialogController.setAssignedKeyId("pluginId"); // key in AssignedActions[]
            this._actionDialogController.setAvailableKeyId("plugin"); // key in AvailableActions[]
            this._actionDialogController.setShowPopupProperties(true);
            this._actionsDialog = this._getActionAssignmentDialog(this._actionDialogController, oMainController.getView());
            this._actionsDialog.attachBeforeOpen(this._actionDialogController.beforeOpen, this._actionDialogController);
            this._actionsDialog.attachAfterOpen(this._actionDialogController.afterOpen, this._actionDialogController);

            var that = this;
            this._actionsDialog.setEscapeHandler(function(oPromise) {
                that.onDialogClose();
                oPromise.resolve();
            });
        }

        var aAssignedActions = this._getAssignedActions();

        this._actionDialogController.setAssignedActions(aAssignedActions);

        this._actionDialogController.setActionSelections(this._getActionSelections());
        this._actionDialogController.setTabPageSelections(this._getTabPageSelections());
        this._actionDialogController.setNavigationPageSelections(this._getNavigationPageSelections());

        this._actionDialogController.setPropertyEditors(this._getExecutionPropertyEditors());
        this._actionDialogController.setEventPropertyEditors(this._getEventPropertyEditors());
        this._actionDialogController.setTransactionPropertyEditors(this._getTransactionPropertyEditors());
        this._actionDialogController.setProductionProcessPropertyEditors(this._getProductionProcessPropertyEditors());

        this._actionDialogController.setCloseHandler(this);
        this._actionDialogController.setActionAssignmentDialog(this._actionsDialog);

        var aAvailableActions = this._getAvailableActions();
        this.filterOutParentPlugin(aAvailableActions);

        var oI18nData = this._getMenuItemLabelList(this._sAssignmentIId);
        var oDialogData = {
            dialogType: sType,
            buttonType: this._getActionAssignmentButtonType(),
            buttonTypeLabel: this._getActionAssignmentDialogTitle(this._sAssignmentIId),
            I18nButtonLabels: oI18nData.I18nButtonLabels,
            Actions: [],
            AvailableActions: aAvailableActions,
            AssignedComponents: aAssignedActions
        };
        var oDialogModel = new JSONModel();
        oDialogModel.setData(oDialogData);
        this._actionsDialog.setModel(oDialogModel, "DialogModel");

        // push dialog controller on stack for retrieval later
        this._pushActionAssignmentController(this._actionDialogController);

        // open dialog
        this._actionsDialog.open();
    };

    ActionAssignmentHelper.prototype._pushActionAssignmentController = function(oController) {
        var aStack = this._getMainController().getGlobalProperty("ACTION_ASSIGNMENT_CONTROLLERS");
        if (!aStack) {
            aStack = [];
        }
        aStack.push(oController);
        this._getMainController().setGlobalProperty("ACTION_ASSIGNMENT_CONTROLLERS", aStack);
    };

    ActionAssignmentHelper.prototype._popActionAssignmentController = function() {
        var aStack = this._getMainController().getGlobalProperty("ACTION_ASSIGNMENT_CONTROLLERS");
        if (!aStack || aStack.length === 0) {
            return null;
        }
        var oController = aStack.pop();
        this._getMainController().setGlobalProperty("ACTION_ASSIGNMENT_CONTROLLERS", aStack);
        return oController;
    };

    ActionAssignmentHelper.prototype._peekActionAssignmentController = function() {
        var aStack = this._getMainController().getGlobalProperty("ACTION_ASSIGNMENT_CONTROLLERS");
        if (!aStack || aStack.length === 0) {
            return null;
        }
        return aStack[aStack.length - 1];
    };

    /**
     * Displays the dialog for assigning a single Plugin to a Property editor.
     * When the dialog closes, the <code>sap.dm.dme.podfoundation.control.PropertyEditor#updateAssignedPlugin</code>
     * function will be called passing the assigned plugin and the assignment ID that was passed to the
     * constructor for this class.
     * <p>
     * The PropertyEditor that invokes this method can implement the following functions:
     * <pre>
     * <code>getAssignmentPlugin()</code> should return the current assigned plugin id
     * <code>getPluginAssignmentDialogTitle(sAssignmentId)</code> should return the title for the dialog
     * </pre>
     * @public
     */
    ActionAssignmentHelper.prototype.showPluginAssignmentDialog = function() {
        var oMainController = this._getMainController();
        if (!oMainController) {
            throw {
                message: "POD Designer controller is not defined to property editor"
            };
        }
        var oMainControllerHelper = oMainController.getMainControllerHelper();
        if (!oMainControllerHelper) {
            throw {
                message: "POD Designer helper is not defined to POD Designer controller"
            };
        }
        if (!this._actionsDialog) {
            this._actionDialogController = new PluginAssignmentViewController();
            this._actionDialogController.setMainControllerHelper(oMainControllerHelper);
            this._actionDialogController.setMainController(oMainController);
            this._actionDialogController.setNavigationPageSelections(this._getNavigationPageSelections());
            this._actionDialogController.setTabPageSelections(this._getTabPageSelections());

            this._actionDialogController.setAvailableKeyId("plugin"); // key in AvailableActions[]
            this._actionDialogController.setShowPopupProperties(true);
            this._actionsDialog = this._getPluginAssignmentDialog(this._actionDialogController, oMainController.getView());
            this._actionsDialog.attachBeforeOpen(this._actionDialogController.beforeOpen, this._actionDialogController);

            var that = this;
            this._actionsDialog.setEscapeHandler(function(oPromise) {
                that.onPluginAssignmentDialogClose();
                oPromise.resolve();
            });
        }

        var sAssignedPlugin = this._getAssignedPlugin();

        this._actionDialogController.setAssignedPlugin(sAssignedPlugin);

        this._actionDialogController.setPropertyEditors(this._getExecutionPropertyEditors());

        this._actionDialogController.setCloseHandler(this);
        this._actionDialogController.setActionAssignmentDialog(this._actionsDialog);

        var aAvailableActions = this._getAvailableActions();
        this.filterOutParentPlugin(aAvailableActions);

        var oDialogData = {
            buttonType: null,
            buttonTypeLabel: this._getPluginAssignmentDialogTitle(),
            I18nButtonLabels: null,
            Actions: [],
            AvailableActions: aAvailableActions,
            Assigned: false
        };
        var oDialogModel = new JSONModel();
        oDialogModel.setData(oDialogData);
        this._actionsDialog.setModel(oDialogModel, "DialogModel");

        this._actionsDialog.open();
    };

    ActionAssignmentHelper.prototype.filterOutParentPlugin = function(aAvailableActions) {
        var sPluginId = this._oPropertyEditor.getId();
        if (sPluginId.indexOf(".") > 0) {
            sPluginId = sPluginId.substring(0, sPluginId.indexOf("."));
        }
        var index = -1;
        for (var i = 0; i < aAvailableActions.length; i++) {
            if (aAvailableActions[i].id === sPluginId && !aAvailableActions[i].multiInstance) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            aAvailableActions.splice(index, 1);
        }
    };

    return ActionAssignmentHelper;
});