sap.ui.define([
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(PodUtility) {

    return {
        translate: function(oPodData, sFromVersion, sToVersion, aNamespaces) {
            if (!PodUtility.isValidPodData(oPodData, sFromVersion)) {
                // invalid Pod Data or version
                return oPodData;
            }
            PodUtility.replacePluginNamespaces(oPodData.plugins, aNamespaces);

            oPodData.version = sToVersion;

            return oPodData;
        }
    };
});