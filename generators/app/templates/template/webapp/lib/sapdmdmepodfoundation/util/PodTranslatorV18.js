sap.ui.define(
    ["sap/dm/dme/podfoundation/util/PodUtility"],
    function(PodUtility) {
        "use strict";

        return {
            translate: function(oPodData) {
                if (!PodUtility.isValidPodData(oPodData, "15.0")) {
                    if (!PodUtility.isValidPodData(oPodData, "16.0")) {
                        if (!PodUtility.isValidPodData(oPodData, "17.0")) {
                            if (!PodUtility.isValidPodData(oPodData, "18.0")) {
                                // nothing input - no changes

                                //Explanation for multiple versions:

                                //Version 15 would have been the ideal version as it was the next in sequence.  However
                                // when DEFAULT_LM_POD was built in the backend it was hardcoded to version 18.0 so it necessary
                                // to check for both and update all PODS to version 19.0 to fix the bump in the sequence.
                                return oPodData;
                            }
                        }
                    }
                }

                if (oPodData.pages && oPodData.pages.length > 0) {
                    for (const element of oPodData.pages) {
                        let oPageConfig = element.layoutConfig;
                        if (oPageConfig) this.checkPageConfig(oPageConfig);
                    }
                }
                oPodData.version = "19.0";

                return oPodData;
            },

            checkPageConfig: function(oPageConfig) {
                if (oPageConfig.length > 0 && oPageConfig[0].components) {
                    for (const element of oPageConfig) {
                        if (element.components && element.components.length > 0) {
                            for (let l = element.components.length - 1; l >= 0; l--) {
                                if (
                                    element.components[l].pluginId.includes(
                                        "lineAndResourceAvailabilityStrip"
                                    ) ||
                                    element.components[l].pluginId.includes(
                                        "indicatorChartCardPlugin"
                                    )
                                ) {
                                    element.components.splice(l, 1);
                                }
                            }
                        }
                    }
                }
            },
        };
    }
);