sap.ui.define([
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(PodUtility) {
    "use strict";

    return {

        translate: function(oPodData) {
            if (!PodUtility.isValidPodData(oPodData, "4.0")) {
                // nothing input - no changes
                return oPodData;
            }

            //remove parameter, parameter description and optional qty columns from dataCollectionListPlugin
            if (oPodData.plugins && oPodData.plugins.length > 0) {
                for (var i = 0; i < oPodData.plugins.length; i++) {
                    if (oPodData.plugins[i].id === "dataCollectionListPlugin") {
                        var aColumnConfiguration = oPodData.plugins[i].configuration.columnConfiguration;
                        if (aColumnConfiguration) {
                            var iLength = aColumnConfiguration.length;
                            for (var x = iLength - 1; x >= 0; x--) {
                                if (aColumnConfiguration[x].columnId === "PARAMETER" ||
                                    aColumnConfiguration[x].columnId === "DESCRIPTION" ||
                                    aColumnConfiguration[x].columnId === "DATE_TIME" ||
                                    aColumnConfiguration[x].columnId === "QTY_REQUIRED" ||
                                    aColumnConfiguration[x].columnId === "QTY_OPTIONAL") {
                                    aColumnConfiguration.splice(x, 1);
                                }
                            }
                        }
                    }
                }
            }
            oPodData.version = "5.0";

            return oPodData;
        }
    };
});