sap.ui.define([
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(PodUtility) {
    "use strict";

    var MES_NAMESPACE = "sap.ui.mes";
    var DME_NAMESPACE = "sap.dm.dme";

    return {

        translate: function(oPodData) {
            if (!oPodData || jQuery.isEmptyObject(oPodData)) {
                // nothing input - no changes
                return oPodData;
            }
            if (!oPodData.podConfig) {
                // already converted to configuration with version
                return oPodData;
            }

            var i, sControlName;
            if (oPodData.podConfig && oPodData.podConfig.control) {
                sControlName = oPodData.podConfig.control;
                oPodData.podConfig.control = this.updateControlName(sControlName);
            }

            // fix layout control namespace names
            if (oPodData.layout && oPodData.layout.length > 0) {
                for (i = 0; i < oPodData.layout.length; i++) {
                    if (!oPodData.layout[i].control || oPodData.layout[i].control === "") {
                        continue;
                    }
                    sControlName = oPodData.layout[i].control;
                    oPodData.layout[i].control = this.updateControlName(sControlName);
                }
            }

            // fix plugin namespace names
            if (oPodData.plugins && oPodData.plugins.length > 0) {
                for (i = 0; i < oPodData.plugins.length; i++) {
                    if (!oPodData.plugins[i].name || oPodData.plugins[i].name === "") {
                        continue;
                    }
                    sControlName = oPodData.plugins[i].name;
                    oPodData.plugins[i].name = this.updateControlName(sControlName);

                    sControlName = oPodData.plugins[i].name;
                    oPodData.plugins[i].name = this.updateExecutionPluginName(sControlName);
                }
            }
        },

        updateControlName: function(sControlName) {
            if (!sControlName) {
                return sControlName;
            }

            if (sControlName.indexOf(MES_NAMESPACE + ".controls") === 0) {
                return DME_NAMESPACE + ".control" + sControlName.substring(19);
            }

            if (sControlName.indexOf(MES_NAMESPACE) === 0) {
                return DME_NAMESPACE + sControlName.substring(10);
            }

            return sControlName;
        },

        updateExecutionPluginName: function(sControlName) {
            if (!sControlName) {
                return sControlName;
            }

            if (sControlName.indexOf("sap.dm.dme.plugins.execution.CompletePlugin") === 0) {
                return "sap.dm.dme.plugins.execution.completePlugin";
            }

            if (sControlName.indexOf("sap.dm.dme.plugins.execution.StartPlugin") === 0) {
                return "sap.dm.dme.plugins.execution.startPlugin";
            }

            if (sControlName.indexOf("sap.dm.dme.plugins.execution.SignoffPlugin") === 0) {
                return "sap.dm.dme.plugins.execution.signoffPlugin";
            }

            return sControlName;
        }
    };
});