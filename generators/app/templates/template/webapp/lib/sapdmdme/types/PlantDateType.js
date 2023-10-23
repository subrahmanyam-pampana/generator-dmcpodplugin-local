sap.ui.define([
    "sap/ui/model/SimpleType",
    "sap/dm/dme/formatter/DateTimeUtils",
    "sap/dm/dme/types/DateTypeHelper"
], function(SimpleType, DateTimeUtils, DateTypeHelper) {
    "use strict";

    return SimpleType.extend("sap.dm.dme.types.PlantDateType", {
        formatValue: function(sValue) {
            let retVal = "";
            if (sValue) {
                retVal = DateTimeUtils.dmcDateFormatterFromUTC(sValue);
            }
            return retVal;
        },

        parseValue: function(sValue, sourceType) {
            return DateTypeHelper.typeParseHelper(sValue);
        },

        validateValue: function() {
            return true;
        }
    });
});