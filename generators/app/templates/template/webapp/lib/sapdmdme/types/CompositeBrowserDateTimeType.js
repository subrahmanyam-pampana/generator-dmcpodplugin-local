sap.ui.define([
    "sap/ui/model/CompositeType",
    "sap/dm/dme/formatter/DateTimeUtils",
    "sap/dm/dme/types/DateTypeHelper"
], function(CompositeType, DateTimeUtils, DateTypeHelper) {
    "use strict";

    return CompositeType.extend("sap.dm.dme.types.CompositeBrowserDateTimeType", {
        constructor: function() {
            CompositeType.apply(this, arguments);
            this.bParseWithValues = true;
            this.bUseInternalValues = false;
            this.bUseRawValues = true;
        },

        formatValue: function(sValue) {
            let retVal = "";
            const browserTimezone = DateTimeUtils.getBrowserTimezone();
            if (sValue[0]) {
                retVal = DateTimeUtils.dmcDateTimeFormatterFromUTC(sValue[0], browserTimezone, sValue[1]);
            }
            return retVal;
        },

        parseValue: function(sValue, sourceType, parts) {
            const browserTimezone = DateTimeUtils.getBrowserTimezone();
            const parsedVal = DateTypeHelper.typeParseHelper(sValue, browserTimezone);
            return [parsedVal, parts[1]];
        },

        validateValue: function(aValue) {
            return true;
        }
    });
});