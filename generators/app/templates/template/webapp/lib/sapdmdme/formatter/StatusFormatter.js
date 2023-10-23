sap.ui.define([
    "sap/ui/core/ValueState",
    "sap/ui/core/MessageType"
], function(ValueState, MessageType) {
    "use strict";

    let oResourceBundle;
    let ENUM_STATUS_PATH = "enum.status.";

    let aMaterialStatusKeys = [
        "NEW",
        "RELEASABLE",
        "OBSOLETE",
        "HOLD"
    ];
    let aResourceStatusKeys = [
        "ENABLED",
        "DISABLED",
        "PRODUCTIVE",
        "SCHEDULED_DOWN",
        "UNSCHEDULED_DOWN",
        "UNKNOWN"
    ];

    let aWorkCenterStatusKeys = [
        "ENABLED",
        "DISABLED"
    ];

    let aShopOrderStatusKeys = [
        "RELEASABLE",
        "HOLD",
        "DONE",
        "CLOSED",
        "DISCARDED"
    ];

    let aNcCodeStatusKeys = [
        "ENABLED",
        "DISABLED"
    ];

    let aSfcStatusKeys = [
        "NEW",
        "IN_QUEUE",
        "ACTIVE",
        "HOLD",
        "DONE",
        "DONE_HOLD",
        "SCRAPPED",
        "INVALID",
        "DELETED",
        "RETURNED",
        "GOLDEN_UNIT"
    ];

    let aDcGroupStatusKeys = [
        "NEW",
        "RELEASABLE",
        "OBSOLETE",
        "HOLD"
    ];

    let aDocumentStatusKeys = [
        "ENABLED",
        "DISABLED"
    ];

    let aPrinterStatusKeys = [
        "ENABLED",
        "DISABLED"
    ];

    let aBasicStatusKeys = [
        "ENABLED",
        "DISABLED"
    ];

    let aToolStatusKeys = [
        "DISABLED",
        "ENABLED",
        "ENGINEERING",
        "PRODUCTIVE"
    ];

    function getResourceText(sBundleKey, sDefaultText) {
        return sBundleKey ? oResourceBundle.getText(sBundleKey) : sDefaultText;
    }

    function createTranslatedItemList(aKeys, bSkipAll) {
        let aResultKeys = bSkipAll ? aKeys : ["ALL"].concat(aKeys);
        return aResultKeys.map(function(sKey) {
            return {
                key: sKey,
                text: getResourceText(ENUM_STATUS_PATH + sKey)
            };
        });
    }

    return {
        init: function(oBundle) {
            oResourceBundle = oBundle;
        },

        getStatusText: function(sValue) {
            return getResourceText(ENUM_STATUS_PATH + sValue);
        },

        getStatusEnumText: function(sValue) {
            let sStatus = sValue;
            if (sValue) {
                sStatus = sValue.toUpperCase();
            }
            return getResourceText(ENUM_STATUS_PATH + sStatus);
        },

        /**
         * Return an array of status keys with translated values and with All option at the beginning.
         * Used in Select control in a filter bar as selection items.
         */
        getStatusList: function() {
            return createTranslatedItemList(aMaterialStatusKeys);
        },

        getResourceStatusList: function() {
            return createTranslatedItemList(aResourceStatusKeys);
        },

        getWorkCenterStatusList: function() {
            return createTranslatedItemList(aWorkCenterStatusKeys);
        },

        getShopOrderStatusList: function() {
            return createTranslatedItemList(aShopOrderStatusKeys);
        },

        getNcCodeStatusList: function() {
            return createTranslatedItemList(aNcCodeStatusKeys);
        },

        getSfcStatusList: function() {
            return createTranslatedItemList(aSfcStatusKeys);
        },

        getDcGroupStatusList: function() {
            return createTranslatedItemList(aDcGroupStatusKeys);
        },

        getDocumentStatusList: function() {
            return createTranslatedItemList(aDocumentStatusKeys, false);
        },
        getDocumentStatusListForSelection: function() {
            return createTranslatedItemList(aDocumentStatusKeys, true);
        },

        getPrinterStatusList: function() {
            return createTranslatedItemList(aPrinterStatusKeys, false);
        },
        getPrinterStatusListForSelection: function() {
            return createTranslatedItemList(aPrinterStatusKeys, true);
        },

        getBasicStatusList: function() {
            return createTranslatedItemList(aBasicStatusKeys, false);
        },
        getBasicStatusListForSelection: function() {
            return createTranslatedItemList(aBasicStatusKeys, true);
        },

        getToolStatusList: function() {
            return createTranslatedItemList(aToolStatusKeys, false);
        },
        getToolStatusListForSelection: function() {
            return createTranslatedItemList(aToolStatusKeys, true);
        },

        /**
         * Return the appropriate ValueState for the given status. If no status is matched
         * then ValueState.None is returned.
         */
        getStatusState: function(sStatusValue) {
            switch (sStatusValue) {
                case "RELEASABLE":
                    return ValueState.Success;
                case "HOLD":
                    return ValueState.Error;
                case "OBSOLETE":
                    return ValueState.Warning;
                case "ENABLED":
                    return ValueState.Success;
                case "ENGINEERING":
                    return ValueState.Warning;
                case "DISABLED":
                    return ValueState.Error;
                case "PRODUCTIVE":
                    return ValueState.Success;
                case "SCHEDULED_DOWN":
                    return ValueState.Error;
                case "UNSCHEDULED_DOWN":
                    return ValueState.Error;
                case "UNKNOWN":
                    return ValueState.Warning;
                case "OPEN":
                    return ValueState.Success;
                case "CLOSED":
                    return ValueState.Warning;
            }
            return ValueState.None;
        },

        getStatusHighlight: function(sStatusValue) {
            switch (sStatusValue) {
                case "NEW":
                    return MessageType.Information;
                case "RELEASABLE":
                    return ValueState.Success;
                case "HOLD":
                    return ValueState.Error;
                case "OBSOLETE":
                    return ValueState.Warning;
                case "COMPLETED":
                    return MessageType.Success;
                case "FAILED":
                    return MessageType.Error;
                case "PASS":
                    return MessageType.Information;
                case "ENABLED":
                    return MessageType.Success;
                case "ENGINEERING":
                    return MessageType.Warning;
                case "DISABLED":
                    return MessageType.Error;
                case "PRODUCTIVE":
                    return ValueState.Success;
                case "SCHEDULED_DOWN":
                    return ValueState.Error;
                case "UNSCHEDULED_DOWN":
                    return ValueState.Error;
                case "UNKNOWN":
                    return ValueState.Warning;
                case "OPEN":
                    return ValueState.Success;
                case "CLOSED":
                    return ValueState.Warning;
            }
            return MessageType.None;
        }
    };
});