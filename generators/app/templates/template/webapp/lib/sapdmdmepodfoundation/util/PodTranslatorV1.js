sap.ui.define([
    "sap/dm/dme/i18n/i18nBundles",
    "sap/dm/dme/controller/Constants",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(Bundles, Constants, PodUtility) {
    "use strict";

    return {

        translate: function(oPodData) {
            if (!oPodData || PodUtility.isEmpty(oPodData)) {
                // nothing input - no changes
                return oPodData;
            }
            var sVersion = PodUtility.trim(oPodData.version);
            if (sVersion === "2.0") {
                // already converted to version 2.0
                return oPodData;
            }
            if (!oPodData.podConfig) {
                // already converted to configuration with version
                return oPodData;
            }

            var oPage = {
                "page": Constants.POD_MAIN_PAGE,
                "description": Bundles.getGlobalText("mainPageDescription"),
                "podConfig": oPodData.podConfig,
                "layout": oPodData.layout,
                "layoutConfig": oPodData.layoutConfig
            };
            var aPages = [oPage];

            return {
                "version": "2.0",
                "pages": aPages,
                "plugins": oPodData.plugins
            };
        }
    };
});