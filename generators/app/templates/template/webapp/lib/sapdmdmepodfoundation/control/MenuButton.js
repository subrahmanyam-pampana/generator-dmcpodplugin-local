sap.ui.define([
    "sap/m/MenuButton",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(MenuButton, PodUtility) {
    "use strict";

    var oMenuButton = MenuButton.extend("sap.dm.dme.podfoundation.control.MenuButton", {
        metadata: {
            properties: {
                plugins: {
                    type: "object",
                    group: "Misc"
                }
            }
        },

        constructor: function(sId, mSettings) {
            MenuButton.apply(this, arguments);
        },

        renderer: {},

        init: function() {
            if (MenuButton.prototype.init) {
                MenuButton.prototype.init.apply(this, arguments);
            }
        },

        setPodController: function(oPodController) {
            this._oPodController = oPodController;
        },

        getPodController: function(oPodController) {
            return this._oPodController;
        },

        onMenuItemPress: function(oEvent) {
            var oMenuItem = oEvent.getParameter("item");
            var sPluginId = oMenuItem.data("PLUGIN_ID");
            if (PodUtility.isEmpty(sPluginId)) {
                return;
            }

            var oPodController = this.getPodController();
            if (oPodController) {
                oPodController.executeGroupButton(this.getId(), sPluginId);
            }
        }
    });

    return oMenuButton;
});