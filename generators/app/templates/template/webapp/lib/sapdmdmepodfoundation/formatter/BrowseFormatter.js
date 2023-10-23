sap.ui.define([], function() {
    "use strict";

    var oResourceBundle;

    var oStatusKeys = {
        "ENABLED": "status.enabled",
        "DISABLED": "status.disabled"
    };

    var oResourceStatusKeys = {
        "ENABLED": "resourceStatus.enabled",
        "DISABLED": "resourceStatus.disabled",
        "HOLD": "resourceStatus.hold",
        "UNKNOWN": "resourceStatus.unknown",
        "PRODUCTIVE": "resourceStatus.productive",
        "STANDBY": "resourceStatus.standby",
        "ENGINEERING": "resourceStatus.engineering",
        "SCHEDULED_DOWN": "resourceStatus.scheduledDown",
        "UNSCHEDULED_DOWN": "resourceStatus.unscheduledDown",
        "NON_SCHEDULED": "resourceStatus.nonScheduled"
    };

    function getResourceText(sBundleKey, sDefaultText) {
        return sBundleKey ? oResourceBundle.getText(sBundleKey) : sDefaultText;
    }

    function createTranslatedItemList(oKeys) {
        var aList = [];

        aList.push({
            "key": "ALL",
            "text": getResourceText("all")
        });

        for (var sType in oKeys) {
            if (oKeys.hasOwnProperty(sType)) {
                aList.push({
                    "key": sType,
                    "text": getResourceText(oKeys[sType])
                });
            }
        }

        return aList;
    }

    return {
        init: function(oBundle) {
            oResourceBundle = oBundle;
        },

        getStatusText: function(sValue) {
            return getResourceText(oStatusKeys[sValue], sValue);
        },

        getResourceStatusText: function(sValue) {
            return getResourceText(oResourceStatusKeys[sValue], sValue);
        },

        getStatusEnumText: function(sValue) {
            var sStatus = sValue;
            if (sValue) {
                sStatus = sValue.toUpperCase();
            }
            return getResourceText("enum.status." + sStatus);
        },

        /**
         * Return an array of status keys with translated values and with All option at the beginning.
         * Used in Select control in a filter bar as selection items.
         */
        getResourceStatusList: function() {
            return createTranslatedItemList(oResourceStatusKeys);
        }
    };

});