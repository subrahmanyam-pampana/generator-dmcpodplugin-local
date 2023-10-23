sap.ui.define([
    "sap/dm/dme/formatter/DateTimeUtils",
    "sap/ui/model/ParseException",
    "sap/ui/model/resource/ResourceModel"
], function(DateTimeUtils, ParseException, ResourceModel) {
    "use strict";

    const oResourceModel = new ResourceModel({
        bundleName: "sap.dm.dme.i18n.status"
    });
    sap.ui.getCore().setModel(oResourceModel, "i18nDateTimeType");
    const bundle = sap.ui.getCore().getModel("i18nDateTimeType").getResourceBundle();

    function typeParseHelper(sValue, timeZone) {
        let parsedVal = "";
        if (sValue) {
            parsedVal = DateTimeUtils.dmcDateToUTCFormat(sValue, timeZone);
            if (parsedVal === "Invalid date") {
                throw new ParseException(`'${sValue}' - ${bundle.getText("enum.status.DATEFORMATMSG")}`);
            }
        }

        return parsedVal;
    }

    return {
        typeParseHelper: typeParseHelper
    }
});