sap.ui.define([
    "sap/m/HBox",
    "sap/m/FlexJustifyContent",
    "sap/ui/core/Icon"
], function(HBox, FlexJustifyContent, Icon) {
    "use strict";

    var StatusIconControl = HBox.extend("sap.dm.dme.podfoundation.control.StatusIconControl", {
        library: "sap.dm.dme.podfoundation",
        metadata: {
            properties: {
                iconData: {
                    type: "any",
                    group: "Misc",
                    defaultValue: null
                }
            }
        },

        constructor: function(sId, mSettings) {
            HBox.apply(this, arguments);
        },

        renderer: {}
    });

    StatusIconControl.prototype.onBeforeRendering = function() {
        if (HBox.prototype.onBeforeRendering) {
            HBox.prototype.onBeforeRendering.apply(this, arguments);
        }
        this.setJustifyContent(FlexJustifyContent.Center);
    };

    StatusIconControl.prototype.setIconData = function(oIconData) {
        this.setProperty("iconData", oIconData, true /* no rendering of control needed */ );

        var aIcons = this.getItems();
        if (oIconData.iconSources.length === aIcons.length) {
            // same number of icons, just update them
            this._updateIcons(oIconData);
        } else {
            // icons added or removed, just re-create from scratch
            this.removeAllItems();
            this._createIcons();
        }
    };

    StatusIconControl.prototype._createIcons = function() {
        var oIconData = this.getIconData();
        var oImageStyle = oIconData.imageStyle;
        var aSources = oIconData.iconSources;
        var aTooltips = oIconData.iconTooltips;
        var aColors = oIconData.iconColors;
        var bAddPadding = false;
        var oIcon;
        for (var i = 0; i < aSources.length; i++) {
            if (i > 0) {
                bAddPadding = true;
            }
            oIcon = this._createIcon(oImageStyle, aSources[i], aTooltips[i], aColors[i], bAddPadding);
            this.addItem(oIcon);
        }
    };

    StatusIconControl.prototype._createIcon = function(oImageStyle, sSource, sTooltip, sColor, bAddPadding) {
        var oIcon = new Icon({
            size: oImageStyle.imageSize,
            tooltip: sTooltip,
            src: sSource,
            color: sColor
        });
        oIcon.addStyleClass(oImageStyle.imageStyle);
        if (bAddPadding) {
            oIcon.addStyleClass("sapMesTableCellMultipleIconPadding");
        }
        return oIcon;
    };

    StatusIconControl.prototype._updateIcons = function(oIconData) {
        var aSources = oIconData.iconSources;
        var aTooltips = oIconData.iconTooltips;
        var aColors = oIconData.iconColors;
        var aIcons = this.getItems();
        for (var i = 0; i < aIcons.length; i++) {
            aIcons[i].setSrc(aSources[i]);
            aIcons[i].setTooltip(aTooltips[i]);
            aIcons[i].setColor(aColors[i]);
        }
    };

    return StatusIconControl;
});