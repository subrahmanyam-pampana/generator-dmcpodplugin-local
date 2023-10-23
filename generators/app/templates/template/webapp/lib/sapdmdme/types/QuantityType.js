sap.ui.define([
    "sap/ui/model/CompositeType",
    "sap/ui/model/ParseException",
    "sap/dm/dme/formatter/NumberFormatter",
    "sap/ui/model/resource/ResourceModel"
], function(CompositeType, ParseException, NumberFormatter, ResourceModel) {
    "use strict";

    const oResourceModel = new ResourceModel({
        bundleName: "sap.dm.dme.i18n.status"
    });
    sap.ui.getCore().setModel(oResourceModel, "i18n");
    let bundle = sap.ui.getCore().getModel("i18n").getResourceBundle();

    return CompositeType.extend("sap.dm.dme.types.QuantityType", {
        constructor: function() {
            CompositeType.apply(this, arguments);
            this.bParseWithValues = true;
            this.bUseInternalValues = false;
            this.bUseRawValues = true;
            this.rawValue = "";
        },
        formatValue: function(sValue) {
            let retVal = "";
            if (sValue[0] !== "") {
                retVal = NumberFormatter.dmcLocaleQuantityFormatterDisplay(sValue[0], sValue[1]);
            }
            return retVal;
        },
        parseValue: function(sValue, sourceType, parts) {
            let parsedVal = '';
            if (sValue) {
                parsedVal = NumberFormatter.dmcLocaleNumberParser(sValue);
                if (typeof(parsedVal) === 'string') {
                    throw new ParseException(`'${sValue}' - ${bundle.getText("enum.status.PARSEMSG")}`);
                }
                if (parsedVal > Number.MAX_SAFE_INTEGER) {
                    throw new ParseException(`'${sValue}' - ${bundle.getText("enum.status.VALIDNUMBERMSG")}`);
                }
                if (parsedVal <= 0 || (parsedVal + "").split(".")[0].length > NumberFormatter.getMaxIntegerDigits()) {
                    throw new ParseException(`'${sValue}' - ${bundle.getText("enum.status.VALIDNUMBERMSG")}`);
                }
                if (parsedVal % 1 !== 0) {
                    //if decimal
                    if ((parsedVal + "").split(".")[1].length > NumberFormatter.getMaxFractionDigits()) {
                        throw new ParseException(`'${sValue}' - ${bundle.getText("enum.status.DECIMALLIMITMSG")} : ${NumberFormatter.getMaxFractionDigits()}`);
                    }
                }
            }
            this.rawValue = sValue;
            return [parsedVal.toString(), parts[1]];
        },
        validateValue: function(aValue) {
            const retVal = NumberFormatter.dmcLocaleQuantityFormatterDisplay(aValue[0], aValue[1]);
            if (aValue[0].length > 0 && !retVal) {
                throw new ParseException(`'${this.rawValue}' - ${bundle.getText("enum.status.FORMATMSG")}`);
            }
            return true;
        }
    });
});