sap.ui.define([
    "sap/dm/dme/device/CrossPlatformUtilities",
    "sap/dm/dme/podfoundation/model/PodType",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(CrossPlatformUtilities, PodType, PodUtility) {
    "use strict";

    return {
        translate: function(oPodData) {
            if (!PodUtility.isValidPodData(oPodData, "14.0")) {
                // invalid Pod Data or version
                return oPodData;
            }

            // update to version 15 now
            oPodData.version = "15.0";

            // this translator is used to fix POD Type settings
            // for Monitor POD Types where last upgrade
            // changed the POD Type from MONITOR to OTHER.
            if (!oPodData.pages || oPodData.pages.length === 0) {
                return oPodData;
            }

            // if POD Type is not defined as custom, configuration is OK
            if (oPodData.pages[0].podConfig.podType !== PodType.Custom) {
                return oPodData;
            }

            // get header plugin id without unique id
            var sHeaderPluginId = oPodData.pages[0].podConfig.headerPluginId;
            if (sHeaderPluginId.indexOf(".") > 0) {
                sHeaderPluginId = sHeaderPluginId.substring(0, sHeaderPluginId.indexOf("."));
            }

            // get header plugin id without unique id
            if (sHeaderPluginId === "defaultMonitorPodSelectionPlugin" ||
                sHeaderPluginId === "lineMonitorSelectionPlugin") {
                oPodData.pages[0].podConfig.podType = PodType.Monitor;
            }

            return oPodData;
        }
    };
});