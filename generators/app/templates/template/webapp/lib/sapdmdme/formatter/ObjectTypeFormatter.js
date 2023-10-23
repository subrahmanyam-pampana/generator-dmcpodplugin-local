sap.ui.define([
    "sap/ui/core/ValueState",
    "sap/ui/core/MessageType"
], function(ValueState, MessageType) {
    "use strict";

    let oResourceBundle;

    let aProcurementTypeKeys = [
        "MANUFACTURED",
        "PURCHASED",
        "MANUFACTURED_PURCHASED"
    ];

    let aMaterialTypeKeys = [
        "CONFIGURABLE",
        "FINISHED",
        "GENERAL",
        "NONSTOCK",
        "NONVALUATED",
        "OPERATING_SUPPLIES",
        "PACKAGING",
        "RETURNABLE_PACKAGING",
        "SEMIFINISHED_PRODUCT",
        "SERVICE",
        "SERVICES",
        "SOFTWARE_NONVALUATED",
        "SPARE_PARTS",
        "TRADING_GOODS",
        "RAW",
        "CUSTOM",
        "PRT",
        "PIPELINE"
    ];

    let aRoutingTypeKeys = [
        "PRODUCTION",
        "SHOPORDER_SPECIFIC",
        "NC",
        "DISPOSITION_FUNCTION",
        "SPECIAL"
    ];

    let aRecipeTypeKeys = [
        "PRODUCTION_RECIPE",
        "SHOPORDER_SPECIFIC_RECIPE"
    ];

    let aBomTypeKeys = [
        "USERBOM",
        "SHOPORDERBOM",
        "SFCBOM",
        "CONFIGURABLEBOM"
    ];

    let aShopOrderTypeKeys = [
        "PRODUCTION",
        "REPETITIVE"
    ];

    let aToolTypeKeys = [
        "EQUIPMENT_PRT",
        "MATERIAL_PRT",
        // key for 'SIMPLE' and other types
        "MISCELLANEOUS"
    ]

    function getResourceText(sBundleKey, sDefaultText) {
        return sBundleKey ? oResourceBundle.getText(sBundleKey) : sDefaultText;
    }

    function createTranslatedItemList(sEntity, aKeys) {
        let aKeysWithAll = ["ALL"].concat(aKeys);

        let aItemList = aKeysWithAll.map(function(sKey) {
            return {
                key: sKey,
                text: getResourceText("enum." + sEntity + "." + sKey)
            };
        });

        return aItemList;
    }

    return {
        init: function(oBundle) {
            oResourceBundle = oBundle;
        },

        /**
         * Check if Routing Type is Recipe
         * @param {string} sKey is Routing Type
         * @returns {boolean} true if Routing Type is Recipe Type
         */
        isRecipeType: function(sKey) {
            return aRecipeTypeKeys.some(
                function(aValue) {
                    return sKey === aValue;
                });
        },

        getProcurementTypeText: function(sValue) {
            return getResourceText("enum.procurementType." + sValue);
        },

        getMaterialTypeText: function(sValue) {
            return sValue ? getResourceText("enum.materialType." + sValue) : "";
        },


        getRoutingTypeText: function(sValue) {
            return getResourceText("enum.routingType." + sValue);
        },

        getRecipeTypeText: function(sValue) {
            return getResourceText("enum.routingType." + sValue);
        },

        /**
         * Returns a translated value for a BOM Type key.
         */
        getBomTypeText: function(sValue) {
            return getResourceText("enum.bomType." + sValue);
        },

        getShopOrderTypeText: function(sValue) {
            return getResourceText("enum.orderType." + sValue);
        },

        /**
         * Returns a translated value for a Tool Type key.
         * Fallback translation value for undefined types is "MISCELLANEOUS"
         */
        getToolTypeText: function(sValue) {
            switch (sValue) {
                case "EQUIPMENT_PRT":
                case "MATERIAL_PRT":
                    return getResourceText("enum.toolType." + sValue);
                case "SIMPLE":
                default:
                    return getResourceText("enum.toolType.MISCELLANEOUS");
            }
        },

        /**
         * Return an array of Procurement Type keys with translated values and with All option at the beginning.
         * Used in Select control in a filter bar as selection items.
         */
        getProcurementTypeList: function() {
            return createTranslatedItemList("procurementType", aProcurementTypeKeys);
        },

        /**
         * Return an array of Procurement Type keys with translated values and with All option at the beginning.
         * Used in Select control in a filter bar as selection items.
         */
        getMaterialTypeList: function() {
            return createTranslatedItemList("materialType", aMaterialTypeKeys);
        },

        /**
         * Return an array of BOM Type keys with translated values and with All option at the beginning.
         * Used in Select control in a filter bar as selection items.
         */
        getBomTypeList: function() {
            return createTranslatedItemList("bomType", aBomTypeKeys);
        },

        /**
         * Return an array of routing type keys with translated values and with All option at the beginning.
         * Used in Select control in a filter bar as selection items.
         */
        getRoutingTypeList: function() {
            return createTranslatedItemList("routingType", aRoutingTypeKeys);
        },

        /**
         * Return an array of routing type keys with translated values and with All option at the beginning.
         * Used in Select control in a filter bar as selection items.
         */
        getRecipeTypeList: function() {
            return createTranslatedItemList("routingType", aRecipeTypeKeys);
        },


        /**
         * Return an array of Shop Order type keys with translated values and with All option at the beginning.
         * Used in Select control in a filter bar as selection items.
         */
        getShopOrderTypeList: function() {
            return createTranslatedItemList("orderType", aShopOrderTypeKeys);
        },

        /**
         * Return an array of Tool type keys with translated values and with All option at the beginning.
         * Used in Select control in a filter bar as selection items.
         */
        getToolTypeList: function() {
            return createTranslatedItemList("toolType", aToolTypeKeys);
        },

        /**
         * Creates entity title combining name and revision values
         * @param {string} sName entity's name
         * @param {string} sVersion entity's version
         * @param {string} sDefaultTitle default title if name and revision is not specified (when new entity is created)
         */
        getRevisionableTitle: function(sName, sVersion, sDefaultTitle) {
            let aResult = [];

            if (sName) {
                aResult.push(sName.toUpperCase());
            }
            if (sVersion) {
                aResult.push(sVersion.toUpperCase());
            }

            return aResult.length > 0 ? aResult.join(" / ") : sDefaultTitle;
        },

        getBooleanTypeText: function(sBooleanText) {
            if (sBooleanText && sBooleanText.toUpperCase() === "TRUE") {
                return getResourceText("YES");
            } else if (sBooleanText && sBooleanText.toUpperCase() === "FALSE") {
                return getResourceText("NO");
            } else {
                return "";
            }
        }
    };
});