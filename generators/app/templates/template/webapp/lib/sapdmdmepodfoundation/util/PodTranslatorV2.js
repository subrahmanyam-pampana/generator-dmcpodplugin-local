sap.ui.define([
    "sap/dm/dme/controller/Constants",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(Constants, PodUtility) {
    "use strict";

    return {

        translate: function(oPodData) {
            if (!PodUtility.isValidPodData(oPodData, "2.0")) {
                // invalid Pod Data or version
                return oPodData;
            }
            if (!oPodData.pages || oPodData.pages.length === 0) {
                // no pages defined
                return oPodData;
            }

            for (var i = 0; i < oPodData.pages.length; i++) {
                if (oPodData.pages[i].page === Constants.POD_MAIN_PAGE) {
                    var oPodConfig = oPodData.pages[i].podConfig;
                    oPodData.pages[i].podConfig = {
                        "id": oPodConfig.id,
                        "headerPluginId": oPodConfig.headerPluginId,
                        "control": oPodConfig.control,
                        "notifications": oPodConfig.notifications
                    };
                    break;
                }
            }
            oPodData.version = "3.0";

            return oPodData;
        }
    };
});