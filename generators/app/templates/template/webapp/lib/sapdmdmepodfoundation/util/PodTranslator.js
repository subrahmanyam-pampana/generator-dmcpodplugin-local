sap.ui.define([
    "sap/dm/dme/i18n/i18nBundles",
    "sap/dm/dme/controller/Constants",
    "sap/dm/dme/podfoundation/util/PodTranslatorV0",
    "sap/dm/dme/podfoundation/util/PodTranslatorV1",
    "sap/dm/dme/podfoundation/util/PodTranslatorV2",
    "sap/dm/dme/podfoundation/util/PodTranslatorV3",
    "sap/dm/dme/podfoundation/util/PodTranslatorV4",
    "sap/dm/dme/podfoundation/util/PodTranslatorV5",
    "sap/dm/dme/podfoundation/util/PodTranslatorV6",
    "sap/dm/dme/podfoundation/util/PodTranslatorV7",
    "sap/dm/dme/podfoundation/util/PodTranslatorV8",
    "sap/dm/dme/podfoundation/util/PodTranslatorV9",
    "sap/dm/dme/podfoundation/util/PodTranslatorV10",
    "sap/dm/dme/podfoundation/util/PodTranslatorV11",
    "sap/dm/dme/podfoundation/util/PodTranslatorV12",
    "sap/dm/dme/podfoundation/util/PodTranslatorV13",
    "sap/dm/dme/podfoundation/util/PodTranslatorV14",
    "sap/dm/dme/podfoundation/util/PodTranslatorV18"
], function(Bundles, Constants, PodTranslatorV0, PodTranslatorV1, PodTranslatorV2, PodTranslatorV3,
    PodTranslatorV4, PodTranslatorV5, PodTranslatorV6, PodTranslatorV7, PodTranslatorV8, PodTranslatorV9,
    PodTranslatorV10, PodTranslatorV11, PodTranslatorV12, PodTranslatorV13, PodTranslatorV14, PodTranslatorV18) {
    "use strict";

    var LATEST_POD_VERSION = "19.0";

    return {

        getLatestPodVersion: function() {
            return LATEST_POD_VERSION;
        },

        translate: function(oPodData) {
            PodTranslatorV0.translate(oPodData);

            var oV2Data = PodTranslatorV1.translate(oPodData);
            var oV3Data = PodTranslatorV2.translate(oV2Data);
            var oV4Data = PodTranslatorV3.translate(oV3Data);
            var oV5Data = PodTranslatorV4.translate(oV4Data);
            var oV6Data = PodTranslatorV5.translate(oV5Data);
            var oV7Data = PodTranslatorV6.translate(oV6Data);
            var oV8Data = PodTranslatorV7.translate(oV7Data);
            var oV9Data = PodTranslatorV8.translate(oV8Data);
            var oV10Data = PodTranslatorV9.translate(oV9Data);
            var oV11Data = PodTranslatorV10.translate(oV10Data);
            var oV12Data = PodTranslatorV11.translate(oV11Data);
            var oV13Data = PodTranslatorV12.translate(oV12Data);
            var oV14Data = PodTranslatorV13.translate(oV13Data);
            var oV18Data = PodTranslatorV14.translate(oV14Data);
            return PodTranslatorV18.translate(oV18Data);
        }
    };
});