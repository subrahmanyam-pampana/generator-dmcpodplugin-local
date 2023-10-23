sap.ui.define([
    "sap/dm/dme/podfoundation/control/ConfigurableButton",
    "sap/ui/unified/Menu",
    "sap/ui/unified/MenuItem",
    "sap/ui/core/Popup",
    "sap/m/OverflowToolbarLayoutData",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(ConfigurableButton, Menu, MenuItem, Popup, OverflowToolbarLayoutData, PodUtility) {
    "use strict";

    return ConfigurableButton.extend("sap.dm.dme.podfoundation.control.GroupButton", {
        metadata: {
            properties: {
                plugins: {
                    type: "object",
                    group: "Misc"
                }
            }
        },

        constructor: function(sId, mSettings) {
            ConfigurableButton.apply(this, arguments);
        },

        renderer: {},

        init: function() {
            if (ConfigurableButton.prototype.init) {
                ConfigurableButton.prototype.init.apply(this, arguments);
            }
            this.attachBrowserEvent("tab keyup", function(oEvent) {
                this._bKeyboard = oEvent.type === "keyup";
            }, this);

            this.attachPress(this.onPressOpenMenu, this);
        },

        setPodController: function(oPodController) {
            this._oPodController = oPodController;
        },

        getPodController: function(oPodController) {
            return this._oPodController;
        },

        _byId: function(sControlId) {
            return sap.ui.getCore().byId(sControlId);
        },

        onPressOpenMenu: function(oEvent) {
            var oButton = oEvent.getSource();

            // create menu only once
            if (!this._menu) {
                var aPlugins = this.getPlugins();
                if (!aPlugins || aPlugins.length === 0) {
                    return;
                }
                var sMenuId = oButton.getId() + "_menu";

                var oMenu = this._byId(sMenuId);
                if (oMenu) {
                    oMenu.destroy();
                }
                this._menu = this._createMenu(sMenuId, aPlugins);
            }
            var eDock = Popup.Dock;

            var bPopoverOpen = this.isPopoverOpen();
            var aAllContent = this.getPopoverContent();
            var oOpenerButton = oButton;
            if (bPopoverOpen && aAllContent && aAllContent.length > 0) {
                oOpenerButton = this._getOverflowButton();
                var oLayoutData = new OverflowToolbarLayoutData();
                oButton.setLayoutData(oLayoutData);
            }
            this._menu.open(this._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oOpenerButton);
        },

        _createMenu: function(sMenuId, aPlugins) {
            var oMenu = new Menu(sMenuId);
            oMenu.attachItemSelect(this.onMenuItemPress, this);

            var sTitle, iIndex = 0;
            for (const oPlugin of aPlugins) {
                sTitle = oPlugin.title;
                if (PodUtility.isNotEmpty(oPlugin.menuLabel)) {
                    sTitle = oPlugin.menuLabel;
                }
                var oMenuItem = new MenuItem(sMenuId + "_" + iIndex, {
                    text: sTitle
                });
                oMenuItem.data("PLUGIN_ID", oPlugin.id);
                oMenu.addItem(oMenuItem);
                iIndex++;
            }
            return oMenu;
        },

        onMenuItemPress: function(oEvent) {
            if (oEvent.getParameter("item").getSubmenu()) {
                return;
            }
            var oMenuItem = oEvent.getParameter("item");
            if (!oMenuItem || !oMenuItem.data) {
                return;
            }

            var sPluginId = oMenuItem.data("PLUGIN_ID");
            if (PodUtility.isEmpty(sPluginId)) {
                return;
            }

            var oPodController = this.getPodController();
            if (oPodController) {
                oPodController.executeGroupButton(this.getId(), sPluginId);
            }
        },

        isPopoverOpen: function() {
            var oToolbar = this._getOverflowToolbar();
            if (!oToolbar) {
                // no parent or parent is not a OverflowToolbar
                return false;
            }
            var oPopover = oToolbar._getPopover();
            if (!oPopover) {
                return false;
            }
            return oPopover.isOpen();
        },

        getPopoverContent: function() {
            var oToolbar = this._getOverflowToolbar();
            if (!oToolbar) {
                return null;
            }
            var oPopover = oToolbar._getPopover();
            if (!oPopover) {
                return null;
            }
            return oPopover._getAllContent();
        },

        _getOverflowToolbar: function() {
            var oParent = this.getParent();
            if (oParent && oParent._getPopover) {
                return oParent;
            }
            return null;
        },

        _getOverflowButton: function() {
            var oToolbar = this._getOverflowToolbar();
            if (!oToolbar) {
                return null;
            }
            return oToolbar._getOverflowButton();
        }
    });
});