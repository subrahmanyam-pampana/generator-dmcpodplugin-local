sap.ui.define([
    "sap/m/Button",
    "sap/m/ButtonRenderer",
    "sap/ui/Device",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(Button, ButtonRenderer, Device, PodUtility) {
    "use strict";

    var BACKGROUND_COLOR = "background-color";
    var BORDER_COLOR = "border-color";
    var MOUSE_EVENTS = "mouseleave mouseup touchend";

    var ConfigurableButton = Button.extend("sap.dm.dme.podfoundation.control.ConfigurableButton", {
        library: "sap.dm.dme.podfoundation",
        metadata: {
            properties: {
                /**
                 * Enables the <code>ConfigurableButton</code> properties.
                 */
                configurable: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: true
                },
                /**
                 * Defines the <code>ConfigurableButton</code> height.
                 */
                height: {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> icon font size.
                 */
                iconFontSize: {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> icon font color.
                 */
                iconColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> icon color on hover.
                 */
                iconHoverColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> icon color on button press.
                 */
                iconPressColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> icon container area width.
                 * @deprecated - no longer used
                 */
                iconContainerWidth: {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> border width.
                 */
                borderWidth: {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> border color.
                 */
                borderColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> border hover color.
                 */
                borderHoverColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> border press color.
                 */
                borderPressColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> background color.
                 */
                backgroundColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> background color on hover.
                 */
                backgroundHoverColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> background color on button press.
                 */
                backgroundPressColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> text font color.
                 */
                fontColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> text font color on hover.
                 */
                fontHoverColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> text font color on button press.
                 */
                fontPressColor: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> text font size.
                 */
                fontSize: {
                    type: "sap.ui.core.CSSSize",
                    group: "Misc",
                    defaultValue: null
                },
                /**
                 * Defines the <code>ConfigurableButton</code> text font weight.
                 */
                fontWeight: {
                    type: "string",
                    group: "Misc",
                    defaultValue: "normal"
                },
                /**
                 * Defines the <code>ConfigurableButton</code> text font family.
                 */
                fontFamily: {
                    type: "string",
                    group: "Misc",
                    defaultValue: null
                }
            }
        },

        constructor: function(sId, mSettings) {
            Button.apply(this, arguments);
        },

        renderer: {}

    });

    ConfigurableButton.prototype.onBeforeRendering = function() {
        if (Button.prototype.onBeforeRendering) {
            Button.prototype.onBeforeRendering.apply(this, arguments);
        }
        var bConfigurable = this.getConfigurable();
        if (!bConfigurable) {
            return;
        }
        this.addStyleClass("sapDmeConfigurableButton");
    };

    ConfigurableButton.prototype.onAfterRendering = function() {
        if (Button.prototype.onAfterRendering) {
            Button.prototype.onAfterRendering.apply(this, arguments);
        }
        var bConfigurable = this.getConfigurable();
        if (!bConfigurable) {
            return;
        }

        this._updateConfigurableButton();
        if (this.isEventHandlingEnabled()) {
            this._removeMouseEventHandlers();
            this._addMouseEventHandlers();
        }

    };

    ConfigurableButton.prototype.onExit = function() {
        var bConfigurable = this.getConfigurable();
        if (!bConfigurable) {
            return;
        }

        if (this.isEventHandlingEnabled()) {
            this._removeMouseEventHandlers();
        }
    };

    /**
     * Defines whether or not to enable mouse event handling
     *
     * When rendering the button in POD Designer, event handling
     * is not enabled since POD Designer must handle these events
     * as part of the editing process. This function is only
     * overridden by the extended BaseButton class in POD Designer.
     *
     * @return true to enable handling, else false
     */
    ConfigurableButton.prototype.isEventHandlingEnabled = function() {
        return true;
    };

    ConfigurableButton.prototype._updateConfigurableButton = function() {
        var oButton = this._getButton();
        var oButtonInner = this._getButtonInner();

        var sHeight = this.getHeight();
        if (PodUtility.isNotEmpty(sHeight) && sHeight.toLowerCase() === "auto") {
            sHeight = null;
        }

        this._setBaseProperties(oButton, oButtonInner, sHeight);

        this._setIconButton(oButtonInner, sHeight);

        if (PodUtility.isNotEmpty(sHeight)) {
            this._getButtonContent().css("line-height", sHeight);
        }
    };

    ConfigurableButton.prototype._setBaseProperties = function(oButton, oButtonInner, sHeight) {
        if (PodUtility.isNotEmpty(sHeight)) {
            oButton.css("height", sHeight);
            oButtonInner.css("height", sHeight);
        }
        var sBackground = this.getBackgroundColor();
        if (PodUtility.isNotEmpty(sBackground)) {
            oButtonInner.css(BACKGROUND_COLOR, sBackground);
        }
        var sBorderWidth = this.getBorderWidth();
        if (PodUtility.isNotEmpty(sBorderWidth)) {
            oButtonInner.css("border-width", sBorderWidth);
        }
        var sBorderColor = this.getBorderColor();
        if (PodUtility.isNotEmpty(sBorderColor)) {
            oButtonInner.css(BORDER_COLOR, sBorderColor);
        }
        var sFontColor = this.getFontColor();
        if (PodUtility.isNotEmpty(sFontColor)) {
            oButtonInner.css("color", sFontColor);
        }
        var sFontSize = this.getFontSize();
        if (PodUtility.isNotEmpty(sFontSize)) {
            oButtonInner.css("font-size", sFontSize);
        }
        var sFontWeight = this.getFontWeight();
        if (PodUtility.isNotEmpty(sFontWeight)) {
            oButtonInner.css("font-weight", sFontWeight);
        }
        var sFontFamily = this.getFontFamily();
        if (PodUtility.isNotEmpty(sFontFamily)) {
            oButtonInner.css("font-family", sFontFamily);
        }
    };

    ConfigurableButton.prototype._setIconButton = function(oButtonInner, sHeight) {
        if (!this.getIcon()) {
            return;
        }

        var sIconFontSize = this.getIconFontSize();
        var oButtonIcon = this._getButtonIcon();

        if (PodUtility.isNotEmpty(sHeight)) {
            oButtonIcon.css("line-height", sHeight);
            oButtonIcon.css("max-height", sHeight);
        }
        if (this._isImageType()) {
            // icon is an image. need to center in container area
            var sImageHeight = oButtonIcon.css("height");

            if (PodUtility.isNotEmpty(sIconFontSize)) {
                sImageHeight = sIconFontSize;
            }
            oButtonIcon.css("top", "calc(" + sHeight + " / 2 - " + sImageHeight + " / 2)");
            oButtonIcon.css("position", "absolute");
        }

        var sText = this.getText();

        if (PodUtility.isNotEmpty(sIconFontSize)) {
            this._setFontSizedIconButton(oButtonIcon, oButtonInner, sIconFontSize, sText);

        } else if (this._isImageType() && PodUtility.isEmpty(sText)) {
            var sImageWidth = oButtonIcon.css("width");
            var sButtonWidth = this.getWidth();
            // icon is an image type & font size not defined and no text on button, center image
            oButtonIcon.css("left", "calc(" + sButtonWidth + " / 2 - " + sImageWidth + " / 2)");

        } else if (this._isImageType() && PodUtility.isNotEmpty(sText)) {
            oButtonInner.css("justify-content", "left");
            this._getButtonContent().css("padding-left", "calc(" + this._getImageWidth() + " + 6px)");
        }

        var sIconColor = this.getIconColor();
        if (PodUtility.isNotEmpty(sIconColor)) {
            oButtonIcon.css("color", sIconColor);
        }
    };

    ConfigurableButton.prototype._setFontSizedIconButton = function(oButtonIcon, oButtonInner, sIconFontSize, sText) {

        // icon font size input, need to use this value for icon / image width
        oButtonIcon.css("font-size", sIconFontSize);
        if (this._isImageType()) {
            // not an icon, handle image
            oButtonIcon.css("height", sIconFontSize);
            oButtonIcon.css("max-width", "none");
            if (PodUtility.isEmpty(sText)) {
                // rendering image without text.  center image in button
                var sButtonWidth = this.getWidth();
                if (PodUtility.isEmpty(sButtonWidth)) {
                    // if no button width is defined & no text, make width same as image width
                    sButtonWidth = sIconFontSize;
                }
                oButtonInner.css("width", sButtonWidth);
                oButtonIcon.css("left", "calc(" + sButtonWidth + " / 2 - " + sIconFontSize + " / 2)");
            } else {
                oButtonInner.css("justify-content", "left");
                this._getButtonContent().css("padding-left", "calc(" + sIconFontSize + " + 6px)");
            }
        }
        if (PodUtility.isNotEmpty(sText)) {
            // rendering text with icon or image, add space to push text to right of image
            oButtonIcon.css("padding-right", "calc(" + sIconFontSize + " * .8)");
        }
    };

    ConfigurableButton.prototype._removeMouseEventHandlers = function() {
        this._getButton().off("mouseenter mouseleave mousedown mouseup touchstart touchend");
        this._getButtonIcon().off(MOUSE_EVENTS);
    };

    ConfigurableButton.prototype._addMouseEventHandlers = function() {

        // add handler to set active color on button press
        var that = this;
        this._getButton().on("mousedown touchstart", function() {
            that._handleMouseDownEvent();
        });

        // add handler to reset color after leaving button
        this._getButton().on(MOUSE_EVENTS, function(oEvent) {
            that._handleButtonMouseLeaveEvent(oEvent);
        });

        // add handler to reset icon color after leaving button
        this._getButtonIcon().on(MOUSE_EVENTS, function() {
            that._handleButtonIconMouseLeaveEvent();
        });

        // add handler to set colors when entering button
        this._bMouseEnter = false;
        this._getButton().on("mouseenter", function() {
            that._handleMouseEnterHandler();
        });
    };

    ConfigurableButton.prototype._handleMouseDownEvent = function() {
        var sBackgroundPressColor = this.getBackgroundPressColor();
        if (PodUtility.isNotEmpty(sBackgroundPressColor)) {
            this._getButtonInner().css(BACKGROUND_COLOR, sBackgroundPressColor);
        }
        var sBorderPressColor = this.getBorderPressColor();
        if (PodUtility.isNotEmpty(sBorderPressColor)) {
            this._getButtonInner().css(BORDER_COLOR, sBorderPressColor);
        }
        var sFontPressColor = this.getFontPressColor();
        if (PodUtility.isNotEmpty(sFontPressColor)) {
            this._getButtonInner().css("color", sFontPressColor);
        }
        var sIconPressColor = this.getIconPressColor();
        if (PodUtility.isNotEmpty(sIconPressColor)) {
            this._setIconColor(sIconPressColor);
        }
    };

    ConfigurableButton.prototype._handleButtonMouseLeaveEvent = function(oEvent) {
        var sBackgroundColor = this.getBackgroundColor();
        var sBorderColor = this.getBorderColor();
        var sFontColor = this.getFontColor();
        var sIconColor = this.getIconColor();
        if (oEvent.type === "mouseup" && this._bMouseEnter) {
            sBackgroundColor = this.getBackgroundHoverColor();
            sBorderColor = this.getBorderHoverColor();
            sFontColor = this.getFontHoverColor();
            sIconColor = this.getIconHoverColor();
        }

        if (PodUtility.isNotEmpty(sBackgroundColor)) {
            this._getButtonInner().css(BACKGROUND_COLOR, sBackgroundColor);
        }
        if (PodUtility.isNotEmpty(sBorderColor)) {
            this._getButtonInner().css(BORDER_COLOR, sBorderColor);
        }
        if (PodUtility.isNotEmpty(sFontColor)) {
            this._getButtonInner().css("color", sFontColor);
        }
        if (PodUtility.isNotEmpty(sIconColor)) {
            this._setIconColor(sIconColor);
        }

        if (oEvent.type === "mouseleave") {
            this._bMouseEnter = false;
        }
    };

    ConfigurableButton.prototype._handleButtonIconMouseLeaveEvent = function() {
        var sIconHoverColor = this.getIconHoverColor();
        if (PodUtility.isNotEmpty(sIconHoverColor)) {
            this._setIconColor(sIconHoverColor);
        }
    };

    ConfigurableButton.prototype._handleMouseEnterHandler = function() {
        var sBackgroundHoverColor = this.getBackgroundHoverColor();
        if (PodUtility.isNotEmpty(sBackgroundHoverColor)) {
            this._getButtonInner().css(BACKGROUND_COLOR, sBackgroundHoverColor);
        }
        var sBorderHoverColor = this.getBorderHoverColor();
        if (PodUtility.isNotEmpty(sBorderHoverColor)) {
            this._getButtonInner().css(BORDER_COLOR, sBorderHoverColor);
        }
        var sFontHoverColor = this.getFontHoverColor();
        if (PodUtility.isNotEmpty(sFontHoverColor)) {
            this._getButtonInner().css("color", sFontHoverColor);
        }
        var sIconHoverColor = this.getIconHoverColor();
        if (PodUtility.isNotEmpty(sIconHoverColor)) {
            this._setIconColor(sIconHoverColor);
        }

        this._bMouseEnter = true;
    };

    ConfigurableButton.prototype._setIconColor = function(sIconColor) {
        var that = this;
        setTimeout(function() {
            that._getButtonIcon().css("color", sIconColor);
        }, 10);
    };

    ConfigurableButton.prototype._getButton = function() {
        return this._getJQueryObject("#" + this.getId());
    };

    ConfigurableButton.prototype._getButtonInner = function() {
        return this._getJQueryObject("#" + this.getId() + " > .sapMBtnInner");
    };

    ConfigurableButton.prototype._getButtonIcon = function() {
        return this._getJQueryObject("#" + this.getId() + " > .sapMBtnInner > .sapMBtnIcon");
    };

    ConfigurableButton.prototype._isImageType = function() {
        var oImageElement = this._getJQueryObject("#" + this.getId() + " > .sapMBtnInner > .sapMImg");
        if (oImageElement.length > 0) {
            return true;
        }
        return false;
    };

    ConfigurableButton.prototype._getImageWidth = function() {
        if (Device.system.tablet && !Device.system.desktop) {
            return "24px";
        } else if (Device.system.tablet && Device.system.desktop) {
            return "40px";
        }
        return "14px";
    };

    ConfigurableButton.prototype._getButtonContent = function() {
        return this._getJQueryObject("#" + this.getId() + " > .sapMBtnInner > .sapMBtnContent");
    };

    ConfigurableButton.prototype._getJQueryObject = function(sSelector) {
        // added for QUnit testing
        return jQuery(sSelector);
    };

    return ConfigurableButton;
});