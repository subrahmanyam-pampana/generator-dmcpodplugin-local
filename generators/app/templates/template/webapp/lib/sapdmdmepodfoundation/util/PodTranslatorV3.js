sap.ui.define([
    "sap/dm/dme/i18n/i18nBundles",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(Bundles, PodUtility) {
    "use strict";

    var DME_WC_POD_SELECTION_NAME = "wcPodSelectionPlugin";
    // Trailing "." is expected
    var DME_PLUGINS_ROOT = "sap.dm.dme.plugins.";

    return {

        translate: function(oPodData) {
            if (!PodUtility.isValidPodData(oPodData, "3.0")) {
                // invalid Pod Data or version
                return oPodData;
            }
            if (!oPodData.pages || oPodData.pages.length === 0) {
                // no pages defined
                return oPodData;
            }

            for (var i = 0; i < oPodData.pages.length; i++) {
                if (oPodData.pages[i].podConfig && oPodData.pages[i].podConfig.headerPluginId === "podSelectionPlugin") {
                    var oPodConfig = oPodData.pages[i].podConfig;
                    oPodData.pages[i].podConfig = {
                        "id": oPodConfig.id,
                        "headerPluginId": DME_WC_POD_SELECTION_NAME,
                        "control": oPodConfig.control,
                        "notifications": oPodData.pages[i].podConfig.notifications
                    };
                    break;
                }
            }

            // fix podSelectionPlugin to wcPodSelectionPlugin
            if (oPodData.plugins && oPodData.plugins.length > 0) {
                for (i = 0; i < oPodData.plugins.length; i++) {
                    if (!oPodData.plugins[i].name || oPodData.plugins[i].name === "") {
                        continue;
                    }

                    if (oPodData.plugins[i].id === "podSelectionPlugin") {
                        oPodData.plugins[i].id = DME_WC_POD_SELECTION_NAME;
                        oPodData.plugins[i].name = DME_PLUGINS_ROOT + DME_WC_POD_SELECTION_NAME;
                        oPodData.plugins[i].title = Bundles.getPluginPropertiesText(DME_WC_POD_SELECTION_NAME, "title");
                    }
                }
            }
            oPodData.version = "4.0";

            return oPodData;
        }
    };
});