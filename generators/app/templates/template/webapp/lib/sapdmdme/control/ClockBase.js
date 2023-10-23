sap.ui.define([
    "sap/dm/dme/library",
    "sap/ui/core/Control",
    "sap/ui/core/theming/Parameters",
    "sap/ui/core/ResizeHandler",
    "sap/base/security/encodeXML"
], function(library, Control, ThemingParameters, ResizeHandler, encodeXML) {
    "use strict";

    let ClockBase = Control.extend("sap.dm.dme.control.ClockBase", {
        metadata: {
            library: "sap.dm.dme",
            properties: {
                enableResize: {
                    type: "boolean",
                    defaultValue: true
                },
                fixedWidth: {
                    type: "int",
                    defaultValue: null
                },
                fixedHeight: {
                    type: "int",
                    defaultValue: null
                },
                fontSize: {
                    type: "int",
                    defaultValue: null
                },
                borderColor: {
                    type: "string",
                    defaultValue: null
                },
                backgroundColor: {
                    type: "string",
                    defaultValue: null
                },
                boxShadow: {
                    type: "string",
                    defaultValue: null
                },
                // This defines the alternative text which is used for outputting the aria-label attribute on the DOM.
                alt: {
                    type: "string",
                    group: "Accessibility",
                    defaultValue: null
                }
            }
        },

        renderer: function(oRM, oControl) {
            let sBoxShadow = jQuery.trim(oControl.getBoxShadow()) || ThemingParameters.get("sapUiCalloutShadow");
            let sBackgroundColor = jQuery.trim(oControl.getBackgroundColor()) || ThemingParameters.get("sapUiFieldHoverHelpBackground");
            let sBorderColor = jQuery.trim(oControl.getBorderColor()) || ThemingParameters.get("sapUiGroupContentBorderColor");
            let sAltText = oControl.getAlt();

            oRM.write("<div");
            oRM.writeControlData(oControl);
            oRM.addClass("dmeClock");
            oRM.writeClasses();
            oRM.write(">");
            oRM.write("<div");
            oRM.writeAttribute("id", oControl.getId() + "-inner");
            oRM.addClass("dmeClockInner");
            oRM.writeClasses();
            oRM.addStyle("background-color", encodeXML(sBorderColor));
            oRM.writeStyles();
            oRM.write(">");
            oRM.write("<div");
            oRM.writeAttribute("id", oControl.getId() + "-text");
            oRM.addClass("dmeClockText");
            if (sAltText) {
                oRM.writeAttribute("role", "presentation");
                oRM.writeAttribute("aria-hidden", "true");
                oRM.writeAttribute("aria-label", sAltText);
            }
            oRM.addClass("sapMText");
            oRM.writeClasses();
            oRM.addStyle("background-color", encodeXML(sBackgroundColor));
            oRM.addStyle("box-shadow", encodeXML(sBoxShadow));
            oRM.writeStyles();
            oRM.write(">");
            oRM.write("</div>");
            oRM.write("</div>");
            oRM.write("</div>");
        }
    });

    /**
     * @override
     */
    ClockBase.prototype.onAfterRendering = function() {
        this._sDisplayedTime = null; // value is cleared here to rerender time text in a clock on next interval update
        if (this.getEnableResize()) {
            this._initClockResizeListener();
        }
        this._initClockIntervalUpdate();
        this._updateClockSize();
        this._updateClockDisplayText();
    };

    /**
     * @override
     */
    ClockBase.prototype.destroy = function() {
        this._clearClockIntervalUpdate();
        if (this.getEnableResize()) {
            this._clearClockResizeListener();
        }
        Control.prototype.destroy.apply(this, arguments);
    };

    /**
     * Provides the current accessibility state of the control.
     * @see {@link sap.ui.core.Control#getAccessibilityInfo}.
     *
     * @protected
     *
     * @returns {object} AccessibilityInfo of the <code>sap.m.Label</code>
     */
    ClockBase.prototype.getAccessibilityInfo = function() {
        return {
            description: this.getAlt(),
            focusable: false,
            role: "presentation"
        };
    };

    /**
     * Registers resize listener for clock's outer div.
     * @private
     */
    ClockBase.prototype._initClockResizeListener = function() {
        let oResizedDiv = this._getJQueryElement(this.getId())[0];
        if (!oResizedDiv) {
            return;
        }
        this._clearClockResizeListener();
        this._sResizeListenerId = ResizeHandler.register(oResizedDiv, this._updateClockSize.bind(this));
        this._updateClockSize();
    };

    /**
     * Deregisters resize listener for clock's outer div.
     * @private
     */
    ClockBase.prototype._clearClockResizeListener = function() {
        if (this._sResizeListenerId) {
            ResizeHandler.deregister(this._sResizeListenerId);
            this._sResizeListenerId = null;
        }
    };

    /**
     * Updates clock's time periodically.
     * @private
     */
    ClockBase.prototype._initClockIntervalUpdate = function() {
        this._clearClockIntervalUpdate();
        this._sClockIntervalId = jQuery.sap.intervalCall(200, this, this._updateClockDisplayText);
        this._updateClockDisplayText();
    };

    /**
     * Stops clock's time update.
     *
     * @return {void}
     * @private
     */
    ClockBase.prototype._clearClockIntervalUpdate = function() {
        if (this._sClockIntervalId) {
            jQuery.sap.clearIntervalCall(this._sClockIntervalId);
            this._sClockIntervalId = null;
        }
    };

    /**
     * Displays time on the clock.
     * @private
     */
    ClockBase.prototype._updateClockDisplayText = function() {
        let sTimeToDisplay = this._getTimeToDisplay();
        if (this._sDisplayedTime === sTimeToDisplay) {
            return;
        } // no changes - no need to update DOM
        this._sDisplayedTime = sTimeToDisplay;
        this._renderClockDisplayText(sTimeToDisplay);
    };

    /**
     * Updates DOM with the new time value.
     * @param {String} timeToDisplay the new time to display
     * @private
     */
    ClockBase.prototype._renderClockDisplayText = function(timeToDisplay) {
        this._getJQueryElement(this.getId() + "-text").text(timeToDisplay);
    };

    /**
     * Updates clock's size (width, height and font size).
     *
     * @return {void}
     * @private
     */
    ClockBase.prototype._updateClockSize = function() {
        let oClockDiv = this._getJQueryElement(this.getId());
        let iWidth = oClockDiv.width();
        let iHeight = oClockDiv.height();
        if (this.getFixedWidth()) {
            iWidth = this.getFixedWidth();
        }
        if (this.getFixedHeight()) {
            iHeight = this.getFixedHeight();
        }

        let oClockSize = this._calculateClockSize(iWidth, iHeight);
        let iFontSize;
        if (this.getFontSize()) {
            iFontSize = this.getFontSize();
        } else {
            iFontSize = this._calculateFontSize(oClockSize.width);
        }

        this._getJQueryElement(this.getId() + "-inner").css({
            width: oClockSize.width + "px",
            height: oClockSize.height + "px"
        });
        this._getJQueryElement(this.getId() + "-text").css({
            "font-size": iFontSize + "px",
            "line-height": (oClockSize.height - 16) + "px" // 16=2*8 where 8 is a padding in .dmeClockInner CSS class
        });
    };

    ClockBase.prototype._getJQueryElement = function(sId) {
        let oDomElement = document.getElementById(sId);
        return jQuery(oDomElement);
    };

    /**
     * Calculates font size that fits into the clock.
     * @param {int} iInnerDivWidth - width of clock's inner div in pixels.
     * @return {int} font size
     * @private
     */
    ClockBase.prototype._calculateFontSize = function(iInnerDivWidth) {
        return Math.round(iInnerDivWidth / 5) - 2;
    };

    /**
     * Calculates clock's inner div size with preserved aspect ratio.
     * @param {int} iDivWidth - width of clock's outer div in pixels.
     * @param {int} iDivHeight - height of clock's outer div in pixels.
     * @return {int} clock's inner div size
     * @private
     */
    ClockBase.prototype._calculateClockSize = function(iDivWidth, iDivHeight) {
        let iHeight = Math.round(iDivWidth / 4);
        return (iDivHeight < iHeight) ?
            {
                width: iDivHeight * 4,
                height: iDivHeight
            } :
            {
                width: iDivWidth,
                height: iHeight
            };
    };

    /**
     * Returns time that will be displayed on the clock.
     * @return {String} time
     * @abstract
     */
    ClockBase.prototype._getTimeToDisplay = function() {
        return null;
    };

    return ClockBase;
});