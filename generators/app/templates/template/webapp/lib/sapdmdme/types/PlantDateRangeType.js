sap.ui.define([
    "sap/ui/model/CompositeType",
    "sap/dm/dme/formatter/DateTimeUtils",
    "sap/dm/dme/types/DateTypeHelper",
    "sap/ui/model/ParseException",
    "sap/ui/model/resource/ResourceModel"
], function(CompositeType, DateTimeUtils, DateTypeHelper, ParseException, ResourceModel) {
    "use strict";

    const splitString = " - ";
    const oResourceModel = new ResourceModel({
        bundleName: "sap.dm.dme.i18n.status"
    });
    sap.ui.getCore().setModel(oResourceModel, "i18nPlantDateRangeType");
    const bundle = sap.ui.getCore().getModel("i18nPlantDateRangeType").getResourceBundle();

    return CompositeType.extend("sap.dm.dme.types.PlantDateRangeType", {
        constructor: function() {
            CompositeType.apply(this, arguments);
            this.bParseWithValues = true;
            this.bUseInternalValues = false;
            this.bUseRawValues = true;
        },

        formatValue: function(sValue) {
            let retVal = "";
            if (sValue[0] && sValue[1]) {
                const startDate = DateTimeUtils.dmcTimeZoneDate(sValue[0]);
                const endDate = DateTimeUtils.dmcTimeZoneDate(sValue[1]);

                retVal = DateTimeUtils.dmcFormatDateInterval(startDate, endDate);
            }
            return retVal;
        },

        parseValue: function(sValue, sourceType, parts) {
            let parsedValFrom = "";
            let parsedValTo = "";
            if (sValue) {
                const splitValue = sValue.split(splitString);
                const startDate = DateTimeUtils.dmcParseDate(splitValue[0]);
                let endDate = DateTimeUtils.dmcParseDate(splitValue[1]);
                if (!startDate || (splitValue[1] && !endDate)) {
                    throw new ParseException(`'${splitValue[0]} - ${splitValue[1]}' - ${bundle.getText("enum.status.DATEFORMATMSG")}`);
                }
                if (!endDate) {
                    endDate = new Date(startDate);
                }
                endDate.setHours(23, 59, 59);

                parsedValFrom = DateTypeHelper.typeParseHelper(startDate);
                parsedValTo = DateTypeHelper.typeParseHelper(endDate);
            }
            return [parsedValFrom, parsedValTo];
        },

        validateValue: function(aValue) {
            return true;
        }
    });
});