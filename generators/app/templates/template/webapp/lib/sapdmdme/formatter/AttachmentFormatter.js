/**
 * Formats a set of attachement points for display as text in the attachements table.
 */
sap.ui.define([
    "sap/dm/dme/formatter/ObjectTypeFormatter"
], function(ObjectTypeFormatter) {
    "use strict";

    let oBundle;

    function createObjectText(oAttachmentPoint, sPropName, i18nName) {
        let sStepIdName = "stepId";
        let sValue = "";
        let sBundlePropName = i18nName || sPropName;

        if (oAttachmentPoint && oAttachmentPoint[sPropName]) {
            sValue += oBundle.getText("attachmentPoint." + sBundlePropName + ".lbl");
            sValue += ": ";
            sValue += oAttachmentPoint[sPropName];
            sValue += createObjectVersion(oAttachmentPoint);
        } else if (sPropName === "routingStep" && oAttachmentPoint) {
            sValue += oBundle.getText("attachmentPoint." + sBundlePropName + ".lbl");
            sValue += ": ";
            sValue += oAttachmentPoint[sStepIdName];
        }
        return sValue;
    }

    function createObjectVersion(oAttachmentPoint) {
        let sValue = "";
        if (oAttachmentPoint && !oAttachmentPoint.operation && oAttachmentPoint["version"]) {
            sValue += "/";
            sValue += oAttachmentPoint["version"];
        }
        return sValue;
    }

    function createFullAttachmentPointsValue(aFormattedAttachmentPoints) {
        let sFullValue = "";
        for (let i = 0; i < aFormattedAttachmentPoints.length; i++) {
            sFullValue += aFormattedAttachmentPoints[i];
            if (i < aFormattedAttachmentPoints.length - 1) {
                sFullValue += "; ";
            }
        }
        return sFullValue;
    }

    return {
        init: function(oResourceBundle) {
            oBundle = oResourceBundle;
        },

        getAttachmentPointsText: function(oAttachmentPoints) {
            if (oAttachmentPoints) {
                let aAttachmentPoints = ["material", "routing", "routingStep", "operation", "resource", "shopOrder"];
                let aFormattedAttachmentPoints = [];
                let sValue = "";
                let sPropName;
                let i;

                for (i = 0; i < aAttachmentPoints.length; i++) {
                    sPropName = aAttachmentPoints[i];

                    if (sPropName === "routing" && oAttachmentPoints[sPropName] &&
                        ObjectTypeFormatter.isRecipeType(oAttachmentPoints[sPropName].routingType)) {
                        sValue = createObjectText(oAttachmentPoints[sPropName], sPropName, "recipe");
                    } else if (sPropName === "routingStep" && oAttachmentPoints[sPropName] && oAttachmentPoints["routing"] &&
                        ObjectTypeFormatter.isRecipeType(oAttachmentPoints["routing"].routingType)) {
                        sValue = createObjectText(oAttachmentPoints[sPropName], sPropName, "recipePhase");
                    } else {
                        sValue = createObjectText(oAttachmentPoints[sPropName], sPropName);
                    }

                    sValue && aFormattedAttachmentPoints.push(sValue);
                }

                // Special handling for work center because it does not use the same identifier for the
                // attachment point json property and the work center value property
                sValue = createObjectText(oAttachmentPoints["workCenter"], "workcenter", "workCenter");
                sValue && aFormattedAttachmentPoints.push(sValue);

                return createFullAttachmentPointsValue(aFormattedAttachmentPoints);
            }
        }
    };
});