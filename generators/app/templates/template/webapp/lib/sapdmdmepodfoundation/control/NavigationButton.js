sap.ui.define([
    "sap/dm/dme/podfoundation/control/ConfigurableButton"
], function(ConfigurableButton) {
    "use strict";

    var oNavigationButton = ConfigurableButton.extend("sap.dm.dme.podfoundation.control.NavigationButton", {
        metadata: {
            properties: {
                selectActionPageName: {
                    type: "string",
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
            this.attachPress(this.onButtonPress, this);
        },

        setPodController: function(oPodController) {
            this._oPodController = oPodController;
        },

        getPodController: function(oPodController) {
            return this._oPodController;
        },

        onButtonPress: function(oEvent) {
            var sSelectActionButtonName = this.getSelectActionPageName();
            var oPodController = this.getPodController();
            if (oPodController) {
                oPodController.navigateToPage(sSelectActionButtonName);
            }
        },

        // gets EventBus for unit tests
        _getEventBus: function() {
            var oPodController = this.getPodController();
            if (oPodController && oPodController.getEventBus) {
                return oPodController.getEventBus();
            }
            return null;
        }
    });

    return oNavigationButton;
});