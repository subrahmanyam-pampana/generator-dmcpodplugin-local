/* global moment:true */
sap.ui.define([
    "sap/dm/dme/library",
    "sap/dm/dme/control/ClockBase",
    "sap/dm/dme/thirdparty/moment-min",
    "sap/dm/dme/thirdparty/moment-with-locales-min",
    "sap/dm/dme/thirdparty/moment-timezone-with-data-min"
], function(library, ClockBase, momentjs, momenttzjs) {
    "use strict";

    let ClockFormat = library.ClockFormat;

    let Clock = ClockBase.extend("sap.dm.dme.control.Clock", {
        metadata: {
            properties: {
                timezone: {
                    type: "string",
                    defaultValue: "UTC"
                },
                format: {
                    type: "sap.dm.dme.ClockFormat",
                    defaultValue: ClockFormat.H24
                }
            }
        },

        renderer: function(oRM, oControl) {
            sap.dm.dme.control.ClockBaseRenderer.render(oRM, oControl);
        }
    });

    /**
     * Determines whether the clock displays time in 12 or 24 hours format.
     *
     * @return {boolean} true if clock displays time in 12 hours format
     * @public
     */
    Clock.prototype.is12hFormat = function() {
        return (this.getFormat() === ClockFormat.H12);
    };

    /**
     * @override
     */
    Clock.prototype._calculateFontSize = function(iInnerDivWidth) {
        return Math.round(this.is12hFormat() ? iInnerDivWidth / 7 : iInnerDivWidth / 5) - 2;
    };

    /**
     * @override
     */
    Clock.prototype._getTimeToDisplay = function() {
        let sTimeFormat = this.is12hFormat() ? "hh:mm:ss A" : "HH:mm:ss";
        return moment().tz(this.getTimezone()).format(sTimeFormat);
    };

    return Clock;
});