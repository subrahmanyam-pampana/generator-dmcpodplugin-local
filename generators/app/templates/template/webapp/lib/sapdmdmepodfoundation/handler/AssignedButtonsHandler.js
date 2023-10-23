sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/podfoundation/control/ActionButton",
    "sap/dm/dme/podfoundation/control/NavigationButton",
    "sap/dm/dme/podfoundation/control/MenuButton",
    "sap/m/Menu",
    "sap/m/MenuItem",
    "sap/dm/dme/podfoundation/formatter/ButtonLabelFormatter"
], function(BaseObject, ActionButton, NavigationButton, MenuButton, Menu, MenuItem,
    ButtonLabelFormatter) {
    "use strict";

    /**
     * Handler for rendering buttons in a plugins container and handling the button press events.
     * @class
     * <code>sap.dm.dme.podfoundation.handler.AssignedButtonsHandler</code> provides functions
     * that are called by plugin's to render buttons defined using the
     * <code>sap.dm.dme.podfoundation.control.AddRemoveButtonControl</code>.  It also
     * handles the press events of the buttons.
     * @extends sap.ui.base.Object
     * @alias sap.dm.dme.podfoundation.handler.AssignedButtonsHandler
     */
    var AssignedButtonsHandler = BaseObject.extend("sap.dm.dme.podfoundation.handler.AssignedButtonsHandler", {
        constructor: function(oController) {
            BaseObject.apply(this, arguments);
            this._oController = oController;
        }
    });

    /**
     * Renders the buttons and assigns them to the input container
     *
     * @param {array} array of button definitions
     * @param {object} oContainer Optional container to add buttons to
     * @return {array} array of created buttons
     * @public
     */
    AssignedButtonsHandler.prototype.renderButtons = function(aButtonDefinitions, oContainer) {
        if (!aButtonDefinitions || aButtonDefinitions.length === 0) {
            return [];
        }
        var aCreatedButtons = [];
        for (var i = 0; i < aButtonDefinitions.length; i++) {
            var oButton = this._createButton(aButtonDefinitions[i], oContainer);
            if (oButton) {
                if (oContainer) {
                    this._addButtonToContainer(oContainer, oButton);
                }
                aCreatedButtons[aCreatedButtons.length] = oButton;
            }
        }

        this._registerButtonsWithPod(aButtonDefinitions);

        return aCreatedButtons;
    };

    AssignedButtonsHandler.prototype._byId = function(sId) {
        // added to support QUnit tests
        return sap.ui.getCore().byId(sId);
    };

    /*
     * Create a button
     *
     * @param {object} oButtonDefinition Button definition of button to create
     * @param {object} oContainer Optional container to add buttons to
     * @return button control
     * @private
     */
    AssignedButtonsHandler.prototype._createButton = function(oButtonDefinition, oContainer) {

        var oMetadata = this._getButtonMetadata(oButtonDefinition);
        var bControlExists = false;
        var oControl;

        var sControlId = this._oController.createId(oButtonDefinition.buttonUid);
        var oExistingControl = this._byId(sControlId);
        if (oExistingControl) {
            bControlExists = true;
        }


        if (oButtonDefinition.buttonType === "ACTION_BUTTON" && !bControlExists) {
            oControl = new ActionButton(sControlId, oMetadata);
        } else if (oButtonDefinition.buttonType === "MENU_BUTTON" && !bControlExists) {
            oControl = new MenuButton(sControlId, oMetadata);
            this._createMenu(oControl, sControlId, oButtonDefinition.actions);
        } else if (oButtonDefinition.buttonType === "NAVIGATION_BUTTON" && !bControlExists) {
            oControl = new NavigationButton(sControlId, oMetadata);
        } else if ((oButtonDefinition.buttonType === "ACTION_BUTTON" && bControlExists) ||
            (oButtonDefinition.buttonType === "MENU_BUTTON" && bControlExists) ||
            (oButtonDefinition.buttonType === "NAVIGATION_BUTTON" && bControlExists)) {
            // Control already exists, use existing.
            oControl = oExistingControl;
        } else {
            return null;
        }
        oControl.addStyleClass("sapMesPodActionButton");

        var oPodController = this._oController.getPodController();
        oControl.setPodController(oPodController);

        oButtonDefinition.button = oControl;
        oButtonDefinition.buttonId = sControlId;

        return oControl;
    };

    /*
     * Create a menu and menu items for a group button
     *
     * @param {object} oButton Group Button to create menu for
     * @param {string} sControlId Button control id
     * @param {array} aActions array of actions for menu items
     * @private
     */
    AssignedButtonsHandler.prototype._createMenu = function(oButton, sControlId, aActions) {
        if (aActions && aActions.length > 0) {
            var oMenu = new Menu();
            var sTitle;
            for (var i = 0; i < aActions.length; i++) {
                sTitle = this._translateText(aActions[i].menuLabel);
                var oMenuItem = new MenuItem(sControlId + "_menu" + i, {
                    text: sTitle
                });
                oMenu.addItem(oMenuItem);
            }

            oMenu.attachItemSelected(oButton.onMenuItemPress, oButton);
            oButton.setMenu(oMenu);
        }
    };

    /*
     * Registers the buttons with the POD after page is rendered.
     * Must be done after delay so active controller is set.
     *
     * @param {array} array of button definitions
     * @private
     */
    AssignedButtonsHandler.prototype._registerButtonsWithPod = function(aButtonDefinitions) {
        var that = this;
        setTimeout(function() {
            for (var i = 0; i < aButtonDefinitions.length; i++) {
                that._registerButtonWithPod(aButtonDefinitions[i]);
            }
        }, 500);
    };

    /*
     * Registers the button with the POD
     *
     * @param {object} oButtonDefinition Button definition of button to create
     * @private
     */
    AssignedButtonsHandler.prototype._registerButtonWithPod = function(oButtonDefinition) {
        var oPodController = this._oController.getActiveViewController();
        var oLayoutHandler = oPodController.getLayoutHandler();

        var aPlugins = this._getPlugins(oButtonDefinition.actions, oLayoutHandler);

        if (oButtonDefinition.buttonType === "MENU_BUTTON") {
            // need to assign plugin data to each menu item
            this._updateMenuItems(oButtonDefinition.button, aPlugins);
        }

        var oPodButton = {
            "id": oButtonDefinition.buttonId,
            "plugins": aPlugins,
            "selectActionPageName": oButtonDefinition.selectActionPageName,
            "parentControlId": null,
            "parentType": null,
            "buttonType": oButtonDefinition.buttonType,
            "visible": true,
            "title": oButtonDefinition.button.getText()
        };
        var oPodLayoutData = oLayoutHandler.getPodLayoutData();
        if (oPodLayoutData.buttons) {
            oPodLayoutData.buttons[oPodLayoutData.buttons.length] = oPodButton;
        }

        // return result for QUnit tests
        return oPodButton;
    };

    /*
     * Update menu items with plugin data for each item
     *
     * @param {object} oMenuButton Menu Button
     * @param {array} aPlugins Array of plugin data for each item
     * @private
     */
    AssignedButtonsHandler.prototype._updateMenuItems = function(oMenuButton, aPlugins) {
        var oMenu = oMenuButton.getMenu();
        var aItems = oMenu.getItems();
        for (var i = 0; i < aPlugins.length; i++) {
            var sPluginId = "";
            if (aPlugins[i]) {
                sPluginId = aPlugins[i].id;
            }
            aItems[i].data("PLUGIN_ID", sPluginId);
        }
    };

    /*
     * Get metadata to create button with
     *
     * @param {object} oButtonDefinition Button definition of button to create
     * @return button metadata
     * @private
     */
    AssignedButtonsHandler.prototype._getButtonMetadata = function(oButtonDefinition) {
        var oMetadata = {};
        oMetadata.text = this._translateText(oButtonDefinition.buttonName);
        oMetadata.icon = oButtonDefinition.buttonIcon;
        oMetadata.tooltip = this._translateText(oButtonDefinition.buttonTooltip);
        oMetadata.selectActionPageName = oButtonDefinition.selectActionPageName;
        return oMetadata;
    };

    /*
     * Get array of plugin's data assigned to the button
     *
     * @param {array} aActions array of actions for button
     * @return array of plugin's data
     * @private
     */
    AssignedButtonsHandler.prototype._getPlugins = function(aActions, oLayoutHandler) {
        var aPlugins = [];
        if (aActions && aActions.length > 0) {
            var aPluginsData = oLayoutHandler.getPlugins();
            for (var i = 0; i < aActions.length; i++) {
                var oData = this._getPluginData(aActions[i].pluginId, aPluginsData);
                aPlugins[aPlugins.length] = oData;
            }
        }
        return aPlugins;
    };

    /*
     * Gets the plugin data associated with the plugin id assigned to button
     *
     * @param {string} sPluginId Plugin id assigned to button
     * @param {array} Array of plugin data for all plugins assigned to page
     * @return plugin data for input id or null if not found
     * @private
     */
    AssignedButtonsHandler.prototype._getPluginData = function(sPluginId, aPluginsData) {
        var iInputIndex = sPluginId.lastIndexOf(".");

        for (var i = 0; i < aPluginsData.length; i++) {
            var sCheckPluginId = aPluginsData[i].id;

            if (iInputIndex < 0) {
                // input does not have unique id, make sure to remove uniqueness from check
                // in case this is a multi-instance plugin reference on a button
                // where the unique part of the id is not defined.
                var index = sCheckPluginId.lastIndexOf(".");
                if (index > 0) {
                    sCheckPluginId = aPluginsData[i].id.substring(0, index);
                }
            }
            if (sCheckPluginId === sPluginId) {
                return aPluginsData[i];
            }
        }
        return null;
    };

    /*
     * Assigns button to the container
     *
     * @param {object} oContainer Container to add button to
     * @param {object} Button to add
     * @private
     */
    AssignedButtonsHandler.prototype._addButtonToContainer = function(oContainer, oButton) {
        if (oContainer.addAction) {
            oContainer.addAction(oButton);

        } else if (oContainer.addItem) {
            oContainer.addItem(oButton);

        } else if (oContainer.addContent) {
            oContainer.addContent(oButton);
        }
    };

    /*
     * Translate text
     *
     * @param {string} sText to translate
     * @return translated text
     * @private
     */
    AssignedButtonsHandler.prototype._translateText = function(sText) {
        var sTranslatedLabel = sText;
        if (sText && sText.trim().length > 0) {
            if (sText.toLowerCase().indexOf("i18n[") === 0) {
                var i18nKey = sText.substring(sText.indexOf("[") + 1, sText.indexOf("]"));
                sTranslatedLabel = this._getI18nButtonText(i18nKey);
            }
        }
        return sTranslatedLabel;
    };

    /*
     * Get the button text for the input key
     *
     * @param {string} sKey to get text for
     * @return button text
     * @private
     */
    AssignedButtonsHandler.prototype._getI18nButtonText = function(sKey) {
        var sValue = ButtonLabelFormatter.getButtonText(sKey);
        if (!sValue || sValue.trim().length === 0) {
            return sKey;
        }
        return sValue;
    };

    return AssignedButtonsHandler;
});