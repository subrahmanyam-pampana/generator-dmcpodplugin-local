sap.ui.define([
    "sap/dm/dme/device/CrossPlatformUtilities",
    "sap/dm/dme/podfoundation/model/PodType",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(CrossPlatformUtilities, PodType, PodUtility) {
    "use strict";

    return {
        translate: function(oPodData) {
            if (!PodUtility.isValidPodData(oPodData, "13.0")) {
                // invalid Pod Data or version
                return oPodData;
            }

            // update to version 14 now
            oPodData.version = "14.0";

            // this translator only translates to add POD Type to configuration
            if (!oPodData.pages || oPodData.pages.length === 0) {
                return oPodData;
            }

            // if POD Type already defined, do nothing
            if (oPodData.pages[0].podConfig &&
                PodUtility.isNotEmpty(oPodData.pages[0].podConfig.podType)) {
                return oPodData;
            }

            var sHeaderPluginId = oPodData.pages[0].podConfig.headerPluginId;
            if (sHeaderPluginId.indexOf(".") > 0) {
                sHeaderPluginId = sHeaderPluginId.substring(0, sHeaderPluginId.indexOf("."));
            }

            // update POD Type from header plugin id
            var sPodType = PodType.Custom;
            switch (sHeaderPluginId) {
                case "operationPodSelectionPlugin":
                    sPodType = PodType.Operation;
                    break;
                case "wcPodSelectionPlugin":
                    sPodType = PodType.WorkCenter;
                    break;
                case "orderPodSelectionPlugin":
                    sPodType = PodType.Order;
                    break;
                case "oeePod":
                    sPodType = "OEE";
                    break;
                case "defaultMonitorPodSelectionPlugin":
                case "lineMonitorSelectionPlugin":
                    sPodType = PodType.Monitor;
                    break;
            }
            oPodData.pages[0].podConfig.podType = sPodType;

            return oPodData;
        }
    };
});