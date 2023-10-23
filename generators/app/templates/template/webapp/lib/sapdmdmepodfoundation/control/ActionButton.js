sap.ui.define([
    "sap/dm/dme/podfoundation/control/ConfigurableButton"
], function(ConfigurableButton) {
    "use strict";

    var oActionButton = ConfigurableButton.extend("sap.dm.dme.podfoundation.control.ActionButton", {
        metadata: {
            properties: {
                plugins: {
                    type: "array",
                    group: "Misc",
                    defaultValue: null
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
            var oPodController = this.getPodController();
            if (oPodController) {
                var aPlugins = this.getPlugins();
                if (!aPlugins) {
                    oPodController.executeActionButton(this.getId());
                } else if (aPlugins && aPlugins.length > 0) {
                    oPodController.executePlugins(aPlugins);
                }
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

    return oActionButton;
});