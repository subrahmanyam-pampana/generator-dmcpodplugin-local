/**
 * This class is responsible for getting the URI to an icon and the color of the icon
 */
sap.ui.define([
    "sap/ui/core/theming/Parameters",
    "sap/ui/core/ValueState"
], function(Parameters, ValueState) {
    "use strict";

    var StatusIconFormatter = {
        icons: function(sStatusCode, iInQueue, iInWork) {
            var aIcons = [];
            if (!jQuery.trim(sStatusCode)) {
                return aIcons;
            }
            if (sStatusCode.toLowerCase().indexOf("multiple") >= 0) {
                var iQtyInQueue = iInQueue || 0;
                var iQtyInWork = iInWork || 0;

                if (iQtyInQueue > 0) {
                    aIcons[aIcons.length] = "sap-icon://circle-task-2";
                }
                if (iQtyInWork > 0) {
                    aIcons[aIcons.length] = "sap-icon://color-fill";
                }
            } else if (sStatusCode === "401") {
                aIcons[aIcons.length] = "sap-icon://rhombus-milestone-2";
            } else if (sStatusCode === "402") {
                aIcons[aIcons.length] = "sap-icon://circle-task-2";
            } else if (sStatusCode === "403") {
                aIcons[aIcons.length] = "sap-icon://color-fill";
            } else if (sStatusCode === "404") {
                aIcons[aIcons.length] = "sap-icon://status-negative";
            }
            return aIcons;
        },

        iconColors: function(sStatusCode, iInQueue, iInWork) {
            var aIconColors = [];
            if (!sStatusCode) {
                return aIconColors;
            }
            if (sStatusCode.toLowerCase().indexOf("multiple") >= 0) {
                var iQtyInQueue = iInQueue || 0;
                var iQtyInWork = iInWork || 0;

                if (iQtyInQueue > 0) {
                    aIconColors[aIconColors.length] = Parameters.get("sapInformativeColor");
                }
                if (iQtyInWork > 0) {
                    aIconColors[aIconColors.length] = Parameters.get("sapPositiveColor");
                }
            } else if (sStatusCode === "401") {
                aIconColors[aIconColors.length] = Parameters.get("sapNeutralColor");
            } else if (sStatusCode === "402") {
                aIconColors[aIconColors.length] = Parameters.get("sapInformativeColor");
            } else if (sStatusCode === "403") {
                aIconColors[aIconColors.length] = Parameters.get("sapPositiveColor");
            } else if (sStatusCode === "404") {
                aIconColors[aIconColors.length] = Parameters.get("sapNegativeColor");
            }
            return aIconColors;
        },

        statusHighlight: function(sStatusCode) {
            if (sStatusCode === "404") {
                return ValueState.Error;
            }
            return ValueState.None;
        }
    };

    return StatusIconFormatter;

}, /* bExport= */ true);