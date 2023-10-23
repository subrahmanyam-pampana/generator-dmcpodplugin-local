sap.ui.define([
    "sap/base/util/UriParameters",
    "sap/base/util/isEmptyObject",
    "sap/ui/core/Locale",
    "sap/ui/core/ValueState",
    "sap/ui/core/format/NumberFormat",
    "sap/dm/dme/formatter/NumberFormatter",
    'sap/dm/dme/constants/DMCConstants'
], function(UriParameters, isEmptyObject, Locale, ValueState, NumberFormat, NumberFormatter, DMCConstants) {
    "use strict";

    return {
        isTestMode: function(oController) {
            let sTestMode = null;
            if (oController && oController.getOwnerComponent() &&
                oController.getOwnerComponent().getComponentData()) {
                let oStartupParams = oController.getOwnerComponent().getComponentData().startupParameters;
                if (oStartupParams.TEST_MODE) {
                    sTestMode = oStartupParams.TEST_MODE[0];
                }
            } else if (this.isRunningTests()) {
                sTestMode = "true";

            } else {
                let oUriParameters = this.getUriParameters();
                sTestMode = oUriParameters.get("TEST_MODE");
            }
            if (!sTestMode) {
                return false;
            }
            return (sTestMode.toLowerCase() === "true");
        },

        isRunningTests: function() {
            let sUrl = this.getWindowLocation();
            console.debug("PodUtility.isRunningTests: sUrl = " + sUrl);
            return !!(this.isNotEmpty(sUrl) &&
                (sUrl.indexOf("test/integration") > 0 ||
                    sUrl.indexOf("test/unit") > 0));
        },

        getWindowLocation: function() {
            // added to support unit tests
            return window.location.href;
        },

        getUriParameters: function() {
            return new UriParameters(window.location.href);
        },

        isEmpty: function(vValue) {
            if (vValue == null || vValue === "") {
                return true;
            }
            if (typeof vValue === "boolean" || typeof vValue === "number") {
                return false;
            }
            if (Array.isArray(vValue) && vValue.length === 0) {
                return true;
            }
            if (typeof vValue === "string") {
                let sTest = vValue.trim();
                return sTest.length === 0;
            }
            return isEmptyObject(vValue);
        },

        isNotEmpty: function(vValue) {
            return !this.isEmpty(vValue);
        },

        endsWith: function(sValue, sSearch, iLength) {
            if (!sValue || !sSearch) {
                return false;
            }
            if (typeof iLength === "undefined" || iLength > sValue.length) {
                iLength = sValue.length;
            }
            return sValue.substring(iLength - sSearch.length, iLength) === sSearch;
        },

        trim: function(sValue) {
            if (!sValue) {
                return sValue;
            }
            if (typeof sValue !== "string" &&
                !(sValue instanceof String)) {
                return sValue;
            }
            return sValue.trim();
        },

        isValidPodData: function(oPodData, sVersion) {
            if (!oPodData || this.isEmpty(oPodData)) {
                // nothing input - no changes
                return false;
            }
            if (typeof sVersion !== "undefined") {
                //if sVersion passed in, check version
                if (!oPodData.version || this.trim(oPodData.version) !== sVersion) {
                    // wrong version
                    return false;
                }
            }
            return true;
        },

        validateQuantityField: function(that, oPodSelectionModel, oQuantityInputField, sCurrentQuantity, sPreviousQuantity, bCallEvent) {
            let fQuantityValue;
            let bIgnoreErrorState = false;
            if (!sCurrentQuantity) {
                oQuantityInputField.setValue(undefined);
                oPodSelectionModel.setQuantity(undefined);
                oQuantityInputField.setValueState(ValueState.None);
                bIgnoreErrorState = true;
            }
            if (this.isNumeric(sCurrentQuantity)) {
                fQuantityValue = this.stringToFloat(sCurrentQuantity.toString());
            }
            if (fQuantityValue > -1) {
                oPodSelectionModel.setQuantity(fQuantityValue);
                oQuantityInputField.setValue(sCurrentQuantity);
            } else {
                oPodSelectionModel.setQuantity(undefined);
                oQuantityInputField.setValue(sCurrentQuantity);
            }
            if (fQuantityValue > 0) {
                oQuantityInputField.setValueState(ValueState.None);
                that.clearMessages();
            } else if (!bIgnoreErrorState) {
                oQuantityInputField.setValueStateText(that.getI18nText("invalidQuantityValue"));
                oQuantityInputField.setValueState(ValueState.Error);
            }
            if (bCallEvent) {
                that.publish("QuantityChangeEvent", {
                    "source": this,
                    "newValue": sCurrentQuantity,
                    "oldValue": sPreviousQuantity
                });
            }
        },

        getFormatSettings: function(oFormat) {
            const oConfiguration = sap.ui.getCore().getConfiguration();
            let oFromLocale = oConfiguration.getFormatSettings().getFormatLocale();
            let sFromLocale = oFromLocale.toString();
            let sToLocale = sFromLocale;
            if (oFormat) {
                if (this.isNotEmpty(oFormat.fromFormatLocale)) {
                    sFromLocale = oFormat.fromFormatLocale;
                }
                if (this.isNotEmpty(oFormat.toFormatLocale)) {
                    sToLocale = oFormat.toFormatLocale;
                }
            }
            return {
                fromLocale: sFromLocale,
                toLocale: sToLocale
            }
        },

        isNumeric: function(vValue, oFormat) {
            if (this.isEmpty(vValue)) {
                return false;
            }
            if (typeof vValue !== "string" && typeof vValue !== "number") {
                return false;
            }
            let fValue = vValue;
            if (typeof vValue === "string") {
                let oSettings = {
                    fromFormatLocale: null,
                    toFormatLocale: "en"
                };
                if (oFormat) {
                    const oFormatSettings = this.getFormatSettings(oFormat);
                    oSettings.fromFormatLocale = oFormatSettings.fromLocale;
                    oSettings.toFormatLocale = oFormatSettings.toLocale;
                }
                fValue = this.stringToFloat(vValue, oSettings);
            }
            return fValue.toString() !== "NaN";
        },

        countDecimals: function(fValue) {
            let sEnglishValue = this.floatToString(fValue, {
                formatLocale: "en"
            });
            if (this.isEmpty(sEnglishValue) || !this.isNumeric(sEnglishValue)) {
                return 0;
            }
            let fEnglishValue = this.stringToFloat(sEnglishValue, {
                toFormatLocale: "en"
            });
            if (Math.floor(fEnglishValue) === fEnglishValue) {
                return 0;
            }
            // need to convert to english floating number first
            let aValues = fEnglishValue.toString().split(".");
            if (!aValues || aValues.length === 1) {
                return 0;
            }
            return aValues[1].length || 0;
        },

        stringToFloat: function(sValue, oFormat) {
            if (this.isEmpty(sValue)) {
                return null;
            }
            const oFormatSettings = this.getFormatSettings(oFormat);
            let sFromLocale = oFormatSettings.fromLocale;
            let sToLocale = oFormatSettings.toLocale;
            if (sFromLocale === sToLocale) {
                // use DME NumberFormatter
                let vValue = NumberFormatter.dmcLocaleNumberParser(sValue);
                if (vValue === "") {
                    // returns empty string if not a number
                    return "NaN";
                }
                return vValue;
            }
            let oLocale = new Locale(sFromLocale);
            let oNumberFormat = NumberFormat.getFloatInstance({
                strictGroupingValidation: true
            }, oLocale);
            const sFromThousandsSeparator = oNumberFormat.oFormatOptions.groupingSeparator;
            const sFromDecimalSeparator = oNumberFormat.oFormatOptions.decimalSeparator;

            oLocale = new Locale(sToLocale);
            oNumberFormat = NumberFormat.getFloatInstance({
                strictGroupingValidation: true
            }, oLocale);
            const sToThousandsSeparator = oNumberFormat.oFormatOptions.groupingSeparator;
            const sToDecimalSeparator = oNumberFormat.oFormatOptions.decimalSeparator;

            let sConvertedValue = sValue;
            if (sFromThousandsSeparator !== sToThousandsSeparator) {
                let aCharacters = [];
                let aSplitCharacters = sValue.split("");
                for (let i = 0; i < aSplitCharacters.length; i++) {
                    if (aSplitCharacters[i] === sFromDecimalSeparator) {
                        aCharacters[aCharacters.length] = sToDecimalSeparator;
                    } else if (aSplitCharacters[i] !== sFromThousandsSeparator) {
                        aCharacters[aCharacters.length] = aSplitCharacters[i];
                    }
                }
                sConvertedValue = aCharacters.join("");
            }
            let oFloatNumberFormat = NumberFormat.getFloatInstance({
                strictGroupingValidation: true,
                parseAsString: false
            }, oLocale);
            return oFloatNumberFormat.parse(sConvertedValue.toString());
        },

        floatToString: function(fValue, oFormat) {
            if (!fValue && fValue !== 0) {
                return null;
            }
            let sFormatLocale = null;
            let iMinFractionDigits = 0;
            let iMaxFractionDigits = 6;
            if (oFormat) {
                if (this.isNotEmpty(oFormat.formatLocale)) {
                    sFormatLocale = oFormat.formatLocale;
                }
                if (typeof oFormat.minimumFractionDigits !== "undefined") {
                    iMinFractionDigits = oFormat.minimumFractionDigits;
                }
                if (typeof oFormat.maximumFractionDigits !== "undefined") {
                    iMaxFractionDigits = oFormat.maximumFractionDigits;
                }
            }
            if (!sFormatLocale) {
                return NumberFormatter.dmcLocaleFloatNumberFormatter(fValue, {
                    minFractionDigits: iMinFractionDigits,
                    maxFractionDigits: iMaxFractionDigits
                });
            }

            let oLocale = new Locale(sFormatLocale);

            let oFloatNumberFormat = NumberFormat.getFloatInstance({
                maxFractionDigits: iMaxFractionDigits,
                minFractionDigits: iMinFractionDigits,
                roundingMode: DMCConstants.roundingMode,
                style: DMCConstants.style,
                parseAsString: true
            }, oLocale);
            return oFloatNumberFormat.format(fValue.toString());
        },

        replacePluginNamespaces: function(aPlugins, aNamespaces) {
            if (aPlugins && aPlugins.length > 0 && aNamespaces && aNamespaces.length > 0) {
                for (const element of aPlugins) {
                    for (const item of aNamespaces) {
                        if (element.name === item.from) {
                            element.name = item.to;
                        }
                    }
                }
            }
        },

        hasClass: function(vElement, sClass) {
            return jQuery(vElement).hasClass(sClass);
        },

        getPluginsFromButtons: function(aButtons) {
            if (!aButtons || aButtons.length === 0) {
                return null;
            }
            let bAddAction, aPlugins = [];
            for (let oButton of aButtons) {
                if (oButton.actions && oButton.actions.length > 0) {
                    for (let oAction of oButton.actions) {
                        bAddAction = true;
                        if (aPlugins.length > 0) {
                            for (let sPlugin of aPlugins) {
                                if (sPlugin === oAction.pluginId) {
                                    bAddAction = false;
                                    break;
                                }
                            }
                        }
                        if (bAddAction) {
                            aPlugins[aPlugins.length] = oAction.pluginId
                        }
                    }
                }
            }
            return aPlugins;
        },

        getStringsToRemove: function(aKeepList, aRemoveList) {
            if (!aRemoveList || aRemoveList.length === 0) {
                return null;
            }
            let bAddId, aRemoves = [];
            for (let sRemoveId of aRemoveList) {
                bAddId = true;
                if (aKeepList && aKeepList.length > 0) {
                    for (let sKeepId of aKeepList) {
                        if (sRemoveId === sKeepId) {
                            bAddId = false;
                            break;
                        }
                    }
                }
                if (bAddId) {
                    aRemoves[aRemoves.length] = sRemoveId;
                }
            }
            return aRemoves;
        },

        /**
         * Copies text to the clipboard
         *
         * There is another method of doing this, but only supported by Chrome.  The following
         * should work in all modern browsers
         * @param {string} sTextToCopy text to be copied to the clipboard.
         */
        copyToClipboard: function(sTextToCopy) {
            if (!document.queryCommandSupported || !document.queryCommandSupported("copy")) {
                return false;
            }
            // Create the textarea control and perform the selection
            let oTextArea = document.createElement("textarea");
            oTextArea.textContent = sTextToCopy;
            oTextArea.style.position = "fixed";
            document.body.appendChild(oTextArea);
            oTextArea.select();
            try {
                // Copy the text to the clipboard
                return document.execCommand("copy");
            } catch (ex) {
                return false;
            } finally {
                document.body.removeChild(oTextArea);
            }
        },

        addMomentLibraries: function() {
            sap.ui.loader.config({
                shim: {
                    "sap/dm/dme/thirdparty/moment-min": {
                        amd: true,
                        exports: "moment"
                    },
                    "sap/dm/dme/thirdparty/moment-with-locales-min": {
                        amd: true,
                        exports: "moment-with-locales"
                    },
                    "sap/dm/dme/thirdparty/moment-timezone-with-data-min": {
                        amd: true,
                        exports: "moment-timezone-with-data"
                    }
                }
            });
        },

        /**
         * Checks if there is a match between the check string and the pattern
         * string containing wildcard characters.
         * <pre>
         * The "?" character will match any single character
         * The "*" character will match any sequence of characters
         * </pre>
         * @param {string} sPatternString String containing optional wildcard characters (? and/or *)
         * @param {string} sCheckString String to check for
         * @returns true if matching
         */
        isMatching: function(sPatternString, sCheckString) {
            if (this.isEmpty(sPatternString) && this.isEmpty(sCheckString)) {
                return true;
            }
            if (sPatternString.length > 1 && sPatternString[0] === '*' &&
                this.isEmpty(sCheckString)) {
                return false;
            }
            if ((sPatternString.length > 1 && sPatternString[0] === '?') ||
                (this.isNotEmpty(sPatternString) && this.isNotEmpty(sCheckString) &&
                    sPatternString[0] === sCheckString[0])) {
                return this.isMatching(sPatternString.substring(1), sCheckString.substring(1));
            }
            if (this.isNotEmpty(sPatternString) && sPatternString[0] === '*') {
                return this.isMatching(sPatternString.substring(1), sCheckString) ||
                    this.isMatching(sPatternString, sCheckString.substring(1));
            }
            return false;
        }
    };
});