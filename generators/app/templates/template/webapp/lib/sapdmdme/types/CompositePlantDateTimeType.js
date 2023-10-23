sap.ui.define([
    "sap/ui/model/CompositeType",
    "sap/dm/dme/formatter/DateTimeUtils",
    "sap/dm/dme/types/DateTypeHelper"
], function(CompositeType, DateTimeUtils, DateTypeHelper) {
    "use strict";

    return CompositeType.extend("sap.dm.dme.types.CompositePlantDateTimeType", {
        constructor: function() {
            CompositeType.apply(this, arguments);
            this.bParseWithValues = true;
            this.bUseInternalValues = false;
            this.bUseRawValues = true;
        },

        formatValue: function(sValue) {
            let retVal = "";
            if (sValue[0]) {
                retVal = DateTimeUtils.dmcDateTimeFormatterFromUTC(sValue[0], null, sValue[1]);
            }
            return retVal;
        },

        parseValue: function(sValue, sourceType, parts) {
            const parsedVal = DateTypeHelper.typeParseHelper(sValue);
            return [parsedVal, parts[1]];
        },

        validateValue: function(aValue) {
            return true;
        }
    });
});