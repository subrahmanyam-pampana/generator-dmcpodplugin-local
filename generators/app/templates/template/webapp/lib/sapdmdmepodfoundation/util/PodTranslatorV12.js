sap.ui.define([
    "sap/dm/dme/device/CrossPlatformUtilities",
    "sap/dm/dme/podfoundation/model/PodType",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(CrossPlatformUtilities, PodType, PodUtility) {
    "use strict";

    return {
        translate: function(oPodData) {
            if (!PodUtility.isValidPodData(oPodData, "12.0")) {
                // invalid Pod Data or version
                return oPodData;
            }

            // update to version 13 now
            oPodData.version = "13.0";

            // this translator only translates to add POD Type to configuration
            if (!oPodData.pages || oPodData.pages.length === 0) {
                return oPodData;
            }

            // update POD Type from header plugin id
            var sPodType = PodType.Custom;
            switch (oPodData.pages[0].podConfig.headerPluginId) {
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
            }
            oPodData.pages[0].podConfig.podType = sPodType;

            return oPodData;
        }
    };
});