sap.ui.define([
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/m/FlexJustifyContent",
    "sap/ui/core/Icon",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(HBox, VBox, Text, FlexJustifyContent, Icon, PodUtility) {
    "use strict";

    let LaborOperatorsControl = HBox.extend("sap.dm.dme.podfoundation.control.LaborOperatorsControl", {
        library: "sap.dm.dme.podfoundation",
        metadata: {
            properties: {
                laborData: {
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

    LaborOperatorsControl.prototype.onBeforeRendering = function() {
        if (HBox.prototype.onBeforeRendering) {
            HBox.prototype.onBeforeRendering.apply(this, arguments);
        }
        this.setJustifyContent(FlexJustifyContent.Center);
    };

    LaborOperatorsControl.prototype.setLaborData = function(oLaborData) {
        this.setProperty("laborData", oLaborData, true /* no rendering of control needed */ );

        let aItems = this.getItems();
        if (aItems && aItems.length > 0) {
            this._updateControl(oLaborData, aItems);
        } else {
            this._createControl(oLaborData);
        }
    };

    LaborOperatorsControl.prototype._createControl = function(oLaborData) {
        let sLaboredOperators = this._getLaboredOperatorsAsString(oLaborData);
        if (PodUtility.isEmpty(sLaboredOperators) || sLaboredOperators === "[]") {
            return;
        }

        let sFormattedOperators = this._getFormattedOperators(oLaborData);

        let oIconVBox = new VBox({
            justifyContent: FlexJustifyContent.Center
        });

        let oUserIcon = new Icon({
            src: "sap-icon://employee",
            visible: this._isCurrentUser(oLaborData)
        });
        oUserIcon.addStyleClass("sapUiSmallMarginEnd")
        oIconVBox.addItem(oUserIcon);
        let oUsersText = new Text({
            text: sFormattedOperators
        });
        this.addItem(oIconVBox);
        this.addItem(oUsersText);
    };

    LaborOperatorsControl.prototype._updateControl = function(oLaborData, aItems) {
        let sFormattedOperators = this._getFormattedOperators(oLaborData);
        let oIconVBox = aItems[0];
        let oUserIcon = oIconVBox.getItems()[0];
        oUserIcon.setVisible(this._isCurrentUser(oLaborData));
        let oUsersText = aItems[1];
        oUsersText.setText(sFormattedOperators);
    };

    LaborOperatorsControl.prototype._isCurrentUser = function(oLaborData) {
        let sUserId = oLaborData.userId;
        let sLaboredOperators = this._getLaboredOperatorsAsString(oLaborData);
        if (PodUtility.isNotEmpty(sLaboredOperators) && sLaboredOperators.includes(sUserId)) {
            return true;
        }
        return false;
    };

    LaborOperatorsControl.prototype._getFormattedOperators = function(oLaborData) {
        let sLaboredOperators = this._getLaboredOperatorsAsString(oLaborData);
        if (PodUtility.isNotEmpty(sLaboredOperators) && sLaboredOperators !== "[]") {
            let aLaboredOperatorsArray = sLaboredOperators.substring(1, sLaboredOperators.length - 1).split(", ");
            let sResultString = aLaboredOperatorsArray.join("\u000d\u000a");
            return sResultString;
        }
        return "";
    };

    LaborOperatorsControl.prototype._getLaboredOperatorsAsString = function(oLaborData) {
        let sLaboredOperators = oLaborData.laboredOperators;
        if (Array.isArray(oLaborData.laboredOperators)) {
            sLaboredOperators = JSON.stringify(oLaborData.laboredOperators);
        }
        return sLaboredOperators;
    };

    return LaborOperatorsControl;
});