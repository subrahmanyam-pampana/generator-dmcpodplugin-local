sap.ui.define([
    "sap/ui/core/format/DateFormat",
    "sap/dm/dme/constants/DMCConstants",
    "sap/dm/dme/util/PlantSettings",
    "sap/dm/dme/thirdparty/moment-min",
    "sap/dm/dme/thirdparty/moment-with-locales-min",
    "sap/dm/dme/thirdparty/moment-timezone-with-data-min"
], function(DateFormat, DMCConstants, PlantSettings) {

    let oLocale = new sap.ui.core.Locale(sap.ui.getCore().getConfiguration().getLocale().toLocaleString());
    let oDateSetting = {
        format: "yMMMd"
    };
    let oDateTimeSetting = {
        format: "yMMMdHms"
    };
    let oDateIntervalSetting = {
        format: "yMMMd",
        interval: true
    };
    let oTimeSetting = {
        format: "hms"
    };

    let regDate = /^(\d{4}-\d{2}-\d{2})(\s(\d\d):(\d\d):(\d\d))?$/i;
    let regISODate = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i;

    let oDateInstance = DateFormat.getDateInstance(oDateSetting, oLocale);
    let oDateTimeInstance = DateFormat.getDateTimeInstance(oDateTimeSetting, oLocale);
    let oDateIntervalInstance = DateFormat.getDateInstance(oDateIntervalSetting, oLocale);
    let oTimeInstance = DateFormat.getTimeInstance(oTimeSetting, oLocale);

    function _internalParseDate(vDate, dateInstance) {
        let dDate = null;
        if (!vDate) {
            // empty value should return null
        } else if (dateInstance.parse(vDate)) {
            dDate = dateInstance.parse(vDate);
        } else if (regDate.test(vDate)) {
            // YYYY-MM-DD || YYYY-MM-DD hh:mm:ss
            // Safari do not support this type of date format “YYYY-MM-DD”, need to transform to “YYYY/MM/DD”
            // new Date("2015-03-25") The computed date will be relative to your time zone.Depending on your time zone, the result above will vary between March 24 and March 25.
            let regString = /^\d{4}-\d{2}-\d{2}$/i;
            if (regString.test(vDate)) {
                vDate = vDate + " 00:00:00";
            }
            vDate = vDate.replace(/-/g, "/");
            dDate = new Date(vDate);
        } else if (regISODate.test(vDate)) {
            dDate = new Date(vDate);
        } else if (!isNaN(new Date(vDate).getTime())) {
            dDate = new Date(vDate);
        }
        return dDate;
    }

    function _internalParseDateTime(vDateTime, dateTimeInstance) {
        let dDate = null;
        if (!vDateTime) {
            // empty value should return null
        } else if (regISODate.test(vDateTime)) {
            dDate = new Date(vDateTime);
        } else if (dateTimeInstance.parse(vDateTime)) {
            dDate = dateTimeInstance.parse(vDateTime);
        } else if (!isNaN(new Date(vDateTime).getTime())) {
            dDate = new Date(vDateTime);
        }
        return dDate;
    }

    //deprecated
    function parseDate(vDate) {
        return _internalParseDate(vDate, oDateInstance);
    }
    //deprecated
    function parseDateTime(vDateTime) {
        return _internalParseDateTime(vDateTime, oDateTimeInstance);
    }

    function parseTime(vTime) {
        let dTime = null;
        if (!vTime) {
            // empty value should return null
        } else if (oTimeInstance.parse(vTime)) {
            dTime = oTimeInstance.parse(vTime);
        }
        return dTime;
    }

    //New functions locale compatible.

    function _returnCurrentLocale() {
        return new sap.ui.core.Locale(sap.ui.getCore().getConfiguration().getLocale().toLocaleString());
    }

    function _getTimeZone() {
        const timezone = PlantSettings.getTimeZone();
        if (!timezone) {
            throw Error("Plant is not selected");
        }
        return timezone;
    }

    function _validateStyleEnum(customStyle) {
        const styleOptions = DMCConstants.customStyleOptions;
        if (customStyle) {
            const objKey = Object.keys(styleOptions).find(key => styleOptions[key] === customStyle);
            if (!objKey) {
                throw Error("Style is not supported");
            }
            return true;
        }
        return false;
    }

    function _getFormatOptions(customStyle) {
        let oFormatOptions = null;
        if (_validateStyleEnum(customStyle)) {
            oFormatOptions = {
                style: customStyle
            }
        }
        return oFormatOptions;
    }

    function _dmcParseDate(vDate, customStyle) {
        const oLocaleInternal = _returnCurrentLocale();
        const oFormatOptionsInternal = _getFormatOptions(customStyle);
        const odmcDateInstance = DateFormat.getDateInstance(oFormatOptionsInternal, oLocaleInternal);
        return _internalParseDate(vDate, odmcDateInstance);
    }

    function _dmcParseDateTime(vDateTime, customStyle) {
        const oLocaleInternal = _returnCurrentLocale();
        const oFormatOptionsInternal = _getFormatOptions(customStyle);
        const oDTInstance = DateFormat.getDateTimeInstance(oFormatOptionsInternal, oLocaleInternal);
        return _internalParseDateTime(vDateTime, oDTInstance);
    }

    function _dmcFormatDateTime(vDateTime, oFormatOptions) {
        const oLocaleInternal = _returnCurrentLocale();
        const oDTInstance = DateFormat.getDateTimeInstance(oFormatOptions, oLocaleInternal);
        return vDateTime ? oDTInstance.format(vDateTime) : "";
    }

    function _dmcFormatDate(vDateTime, oFormatOptions) {
        const oLocaleInternal = _returnCurrentLocale();
        const odmcDateInstance = DateFormat.getDateInstance(oFormatOptions, oLocaleInternal);
        return vDateTime ? odmcDateInstance.format(vDateTime) : "";
    }

    function _dmcTimeZoneDate(date, timezone) {
        const timezoneInternal = timezone || _getTimeZone();
        //getting date object with timezone correction
        return moment(moment(date).tz(timezoneInternal).format('YYYY-MM-DDTHH:mm:ss')).toDate();
    }

    function _dmcDateFormatterFromUTC(date, timezone, customStyle) {
        let result = "";
        const oFormatOptionsInternal = _getFormatOptions(customStyle);
        if (date) {
            //getting date object with timezone correction
            const dDate = _dmcTimeZoneDate(date, timezone);
            //getting date object formatted for display purpose
            result = _dmcFormatDate(dDate, oFormatOptionsInternal);
        }
        return result;
    }

    return {
        /**
         * @deprecated dmcDateFormatterFromUTC method should be used
         */
        formatDate: function(vDate) {
            let dDate = parseDate(vDate);
            return dDate ? oDateInstance.format(dDate) : "";
        },

        /**
         * @deprecated dmcDateTimeFormatterFromUTC method should be used
         */
        formatDateTime: function(vDateTime) {
            let dDate = parseDateTime(vDateTime);
            return dDate ? oDateTimeInstance.format(dDate) : "";
        },

        /**
         * @deprecated dmcFormatDateIntervalFromUTC method should be used
         */
        formatDateInterval: function(vDateStart, vDateEnd) {
            let dDateStart = parseDate(vDateStart);
            let dDateEnd = parseDate(vDateEnd);
            return (dDateStart && dDateEnd && dDateStart <= dDateEnd) ? oDateIntervalInstance.format([dDateStart, dDateEnd]) : "";
        },

        formatTime: function(vTime) {
            let dDate = parseTime(vTime);
            return dDate ? oTimeInstance.format(dDate) : "";
        },

        /**
         * Returns Value format from DMC Constats file, which should be binded with "valueFormat" property of DateTime Picker
         * @returns {string} Returns Value format from DMC Constats file
         */
        dmcDateValueFormat: function() {
            return DMCConstants.dateValueFormat;
        },

        /**
         * Converts UTC/ISO input string into JS Date Object based on Timezone
         * @param {string} date In UTC/ISO format. eg. UTC: "2020-10-23T05:13:45Z", ISO: "2020-10-23T05:13:45.000Z"
         * @param {string} timezone {optional} Conversion Timezone eg. "US/Central"
         * @returns {object} Timezone Corrected JS Date Object
         */
        dmcTimeZoneDate: function(date, timezone) {
            return _dmcTimeZoneDate(date, timezone);
        },

        /**
         * Converts UTC/ISO input string into timezone corrected, local based formatted DateTime string
         * @param {string} date In UTC/ISO format. eg. UTC: "2020-10-23T05:13:45Z", ISO: "2020-10-23T05:13:45.000Z"
         * @param {string} timezone {optional} Conversion Timezone eg. "US/Central"
         * @param {string} customStyle {optional} Style options eg. "medium/short", "short", "long"
         * @returns {string} Timezone corrected, Locale based formatted DateTime string
         */
        dmcDateTimeFormatterFromUTC: function(date, timezone, customStyle) {
            let result = "";
            const oFormatOptionsInternal = _getFormatOptions(customStyle);
            if (date) {
                //getting date object with timezone correction
                const dDate = _dmcTimeZoneDate(date, timezone);
                //getting date object formatted for display purpose
                result = _dmcFormatDateTime(dDate, oFormatOptionsInternal);
            }
            return result;
        },

        /**
         * Converts the DateTime/Date into UTC/ISO format
         * @param {object} date Date can be JS Date Object
         * @param {string} timezone {optional} Conversion Timezone eg. "US/Central"
         * @returns {string} UTC/ISO formatted string based on timezone
         */
        dmcDateToUTCFormat: function(date, timezone) {
            let result = "";
            const timezoneInternal = timezone || _getTimeZone();
            const sFormattedDate = moment(date).locale("en").format("yyyy-MM-DD HH:mm:ss");
            const oDate = moment.tz(sFormattedDate, timezoneInternal);
            result = oDate.utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
            return result;
        },

        /**
         * Adds the amount of time mentioned, to the Date specified based on UOT and return Locale based formatted string
         * @param {string} date Locale based formatted string/JS Date Object
         * @param {integer} addTime Amount of time that needs to be added
         * @param {string} uot Unit of Time
         * @returns {string} Locale based formatted string
         */
        dmcDateAddTime: function(date, addTime, uot) {
            const dDate = _dmcParseDateTime(date);
            //https://momentjscom.readthedocs.io/en/latest/moment/03-manipulating/01-add/
            //Use the above mentioned url to find more information on uot(exp: seconds-s,weeks-w,months-M,years-y)
            //related Key and Shorthand which is used to add time in below method
            const result = moment(dDate).add(addTime, uot).toDate();
            return _dmcFormatDateTime(result);
        },

        /**
         * Subtracts the amount of time mentioned, to the Date specified based on UOT and return Locale based formatted string
         * @param {string} date Locale based formatted string/JS Date Object
         * @param {integer} subtractTime Amount of time that needs to be subtract
         * @param {string} uot Unit of Time
         * @returns {string} Locale based formatted string
         */
        dmcDateSubtractTime: function(date, subtractTime, uot) {
            const dDate = _dmcParseDateTime(date);
            //https://momentjscom.readthedocs.io/en/latest/moment/03-manipulating/01-add/
            //Use the above mentioned url to find more information on uot(exp: seconds-s,weeks-w,months-M,years-y)
            //related Key and Shorthand which is used to add time in below method
            const result = moment(dDate).subtract(subtractTime, uot).toDate();
            return _dmcFormatDateTime(result);
        },

        /**
         * Converts UTC/ISO input string into timezone corrected, local based formatted Date string
         * @param {string} date In UTC/ISO format. eg. UTC: "2020-10-23T05:13:45Z", ISO: "2020-10-23T05:13:45.000Z"
         * @param {string} timezone {optional} Conversion Timezone eg. "US/Central"
         * @param {string} customStyle {optional} Style options eg. "medium/short", "short", "long"
         * @returns {string} Timezone corrected, Locale based formatted Date string
         */
        dmcDateFormatterFromUTC: function(date, timezone, customStyle) {

            return _dmcDateFormatterFromUTC(date, timezone, customStyle);
        },

        /**
         * Calculates the Date Range and returns Date Interval as string
         * @param {String|Object} sDateStart Date can be a string or JS Date Object
         * @param {String|Object} sDateEnd Date can be a string or JS Date Object
         * @returns {String} Date Interval as string
         */
        dmcFormatDateInterval: function(sDateStart, sDateEnd) {
            let dDateStart = sDateStart;
            let dDateEnd = sDateEnd;
            if (typeof(sDateStart) == 'string') {
                dDateStart = _dmcParseDate(sDateStart);
            }
            if (typeof(sDateEnd) == 'string') {
                dDateEnd = _dmcParseDate(sDateEnd);
            }
            const oLocaleInternal = _returnCurrentLocale();
            const odmcDateIntervalInstance = DateFormat.getDateInstance({
                interval: true
            }, oLocaleInternal);
            return (dDateStart && dDateEnd && dDateStart <= dDateEnd) ? odmcDateIntervalInstance.format([dDateStart, dDateEnd]) : "";
        },

        /**
         * Calculates the Date Range and returns Date Interval as string
         * @param {String} sDateStart In UTC/ISO format. eg. UTC: "2020-10-23T05:13:45Z", ISO: "2020-10-23T05:13:45.000Z"
         * @param {String} sDateEnd In UTC/ISO format. eg. UTC: "2020-10-23T05:13:45Z", ISO: "2020-10-23T05:13:45.000Z"
         * @returns {String} Date Interval as string
         */
        dmcFormatDateIntervalFromUTC: function(sDateStart, sDateEnd, timezone) {
            const sFormattedDateStart = _dmcDateFormatterFromUTC(sDateStart, timezone);
            const sFormattedDateEnd = _dmcDateFormatterFromUTC(sDateEnd, timezone);
            if (sFormattedDateStart && sFormattedDateEnd && (sFormattedDateStart === sFormattedDateEnd)) {
                return `${sFormattedDateStart} – ${sFormattedDateEnd}`;
            }
            const dDateStart = _dmcParseDate(sFormattedDateStart);
            const dDateEnd = _dmcParseDate(sFormattedDateEnd);
            const oLocaleInternal = _returnCurrentLocale();
            const odmcDateIntervalInstance = DateFormat.getDateInstance({
                interval: true
            }, oLocaleInternal);
            return (dDateStart && dDateEnd && dDateStart <= dDateEnd) ? odmcDateIntervalInstance.format([dDateStart, dDateEnd]) : "";
        },

        /**
         * Returns browser timezone
         * @returns {string} Returns browser timezone
         */
        getBrowserTimezone: function() {
            return moment.tz.guess();
        },

        /**
         * Converts the Locale based Formatted Date string into JS Date Object
         * @param {string} formattedDate Locaes based formatted Date
         * @param {string} customStyle {optional} Style options eg. "medium/short", "short", "long"
         * @returns {object} JS Date Object
         */
        dmcParseDate: function(formattedDate, customStyle) {
            return _dmcParseDate(formattedDate, customStyle);
        },

        /**
         * Converts the Locale based Formatted DateTime string into JS Date Object
         * @param {string} formattedDate Locaes based formatted DateTime
         * @param {string} customStyle {optional} Style options eg. "medium/short", "short", "long"
         * @returns {object} JS Date Object
         */
        dmcParseDateTime: function(formattedDate, customStyle) {
            return _dmcParseDateTime(formattedDate, customStyle);
        },

        /**
         * Finds and returns Start of Day, Week, Month, etc based on UOT
         * @param {object} date JS Date Object
         * @param {string} uot Unit of Time eg. week, month, year
         * @returns {object} JS Date Object
         */
        dmcDateTimeStartOf: function(date, uot) {
            //https://momentjscom.readthedocs.io/en/latest/moment/03-manipulating/03-start-of/
            //Use the above mentioned url to find more information on uot(exp:week,month,year)
            //related Key which is used to set time accordingly in below method
            return moment(date).startOf(uot).toDate();
        },

        /**
         * Finds and returns End of Day, Week, Month, etc based on UOT
         * @param {object} date JS Date Object
         * @param {string} uot Unit of Time eg. week, month, year
         * @returns {object} JS Date Object
         */
        dmcDateTimeEndOf: function(date, uot) {
            //"UOT" similar to "dmcDateTimeStartOf" method applies here as well
            return moment(date).endOf(uot).toDate();
        }
    };
});