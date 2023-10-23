sap.ui.define([], function() {
    "use strict";

    var oResourceBundle;
    var sPrefix;

    function getResourceText(sBundleKey, sDefaultText) {
        return sBundleKey ? oResourceBundle.getText(sBundleKey) : sDefaultText;
    }

    return {
        init: function(oBundle, sKeyPrefix) {
            oResourceBundle = oBundle;
            sPrefix = "";
            if (sKeyPrefix) {
                sPrefix = sKeyPrefix + ".";
            }
        },

        getText: function(sValue) {
            return getResourceText(sPrefix + sValue);
        }
    };
});