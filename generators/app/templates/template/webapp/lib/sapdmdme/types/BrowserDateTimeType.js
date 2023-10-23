sap.ui.define([
    "sap/ui/model/SimpleType",
    "sap/dm/dme/formatter/DateTimeUtils",
    "sap/dm/dme/types/DateTypeHelper"
], function(SimpleType, DateTimeUtils, DateTypeHelper) {
    "use strict";

    return SimpleType.extend("sap.dm.dme.types.BrowserDateTimeType", {
        formatValue: function(sValue) {
            let retVal = "";
            const browserTimezone = DateTimeUtils.getBrowserTimezone();
            if (sValue) {
                retVal = DateTimeUtils.dmcDateTimeFormatterFromUTC(sValue, browserTimezone);
            }
            return retVal;
        },

        parseValue: function(sValue, sourceType) {
            const browserTimezone = DateTimeUtils.getBrowserTimezone();
            return DateTypeHelper.typeParseHelper(sValue, browserTimezone);
        },

        validateValue: function() {
            return true;
        }
    });
});