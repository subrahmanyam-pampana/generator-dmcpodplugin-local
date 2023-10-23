sap.ui.define([
    "../images/ImagePool"
], function(ImagePool) {
    "use strict";

    var oResourceBundle;
    var sIconSize;

    function getInfoIcon(sIconName) {
        return ImagePool.getImageURI(sIconName, sIconSize);
    }

    function getResourceText(sBundleKey) {
        return oResourceBundle.getText(sBundleKey);
    }

    return {
        init: function(oBundle, sSize) {
            oResourceBundle = oBundle;
            sIconSize = sSize;
            if (!jQuery.trim(sIconSize)) {
                sIconSize = "medium";
            }
        },

        /**
         * Returns the tooltip for the Information icon
         * @param {string} Information Icon Type
         * @param {object} oInfo
         */
        getIconTooltip: function(sInfoIconType, oInfo) {
            if (!sInfoIconType) {
                return "";
            }
            if (sInfoIconType === "BUYOFF") {
                return this.getBuyoffIconTooltip(oInfo);
            } else if (sInfoIconType === "DATA_COLLECTION") {
                return this.getDcIconTooltip(oInfo);
            } else if (sInfoIconType === "COMPONENT_LIST") {
                return this.getClIconTooltip(oInfo);
            } else if (sInfoIconType === "PARENT_SERIAL_NUMBER") {
                return this.getPsnIconTooltip(oInfo);
            } else if (sInfoIconType === "TOOL_LIST") {
                return this.getTlIconTooltip(oInfo);
            } else if (sInfoIconType === "WORK_INSTRUCTION") {
                return this.getWiIconTooltip(oInfo);
            } else if (sInfoIconType === "CHANGE_ALERT") {
                return this.getCaIconTooltip(oInfo);
            }
            return "";
        },

        /**
         * Returns the visibility for the Information icon
         * @param {string} Information Icon Type
         * @param {object} oInfo
         */
        isIconVisible: function(sInfoIconType, oInfo) {
            if (!sInfoIconType) {
                return false;
            }
            if (sInfoIconType === "BUYOFF") {
                return this.getBuyoffIconVisible(oInfo);
            } else if (sInfoIconType === "DATA_COLLECTION") {
                return this.getDcIconVisible(oInfo);
            } else if (sInfoIconType === "COMPONENT_LIST") {
                return this.getClIconVisible(oInfo);
            } else if (sInfoIconType === "PARENT_SERIAL_NUMBER") {
                return this.getPsnIconVisible(oInfo);
            } else if (sInfoIconType === "TOOL_LIST") {
                return this.getTlIconVisible(oInfo);
            } else if (sInfoIconType === "WORK_INSTRUCTION") {
                return this.getWiIconVisible(oInfo);
            } else if (sInfoIconType === "CHANGE_ALERT") {
                return this.getCaIconVisible(oInfo);
            }

            return false;
        },

        /**
         * Returns the icon for the Information icon
         * @param {string} Information Icon Type
         * @param {object} oInfo
         */
        getIcon: function(sInfoIconType, oInfo) {
            if (!sInfoIconType) {
                return "";
            }
            if (sInfoIconType === "BUYOFF") {
                return this.getBuyoffIcon(oInfo);
            } else if (sInfoIconType === "DATA_COLLECTION") {
                return this.getDcIcon(oInfo);
            } else if (sInfoIconType === "COMPONENT_LIST") {
                return this.getClIcon(oInfo);
            } else if (sInfoIconType === "PARENT_SERIAL_NUMBER") {
                return this.getPsnIcon(oInfo);
            } else if (sInfoIconType === "TOOL_LIST") {
                return this.getTlIcon(oInfo);
            } else if (sInfoIconType === "WORK_INSTRUCTION") {
                return this.getWiIcon(oInfo);
            } else if (sInfoIconType === "CHANGE_ALERT") {
                return this.getCaIcon(oInfo);
            }
            return "";
        },

        /**
         * Returns the tooltip for the Buyoff Information icon
         * @param {object} oInfo
         */
        getBuyoffIconTooltip: function(oInfo) {
            if (!oInfo || (!oInfo.buyoffOpenIcon && !oInfo.buyoffClosedIcon)) {
                return "";
            }
            if (oInfo.buyoffClosedIcon) {
                return getResourceText("buyoffIconFullfilledTooltip");
            }
            return getResourceText("buyoffIconTooltip");
        },

        /**
         * Returns the visibility for the Buyoff Information icon
         * @param {object} oInfo
         */
        getBuyoffIconVisible: function(oInfo) {
            if (oInfo && (oInfo.buyoffOpenIcon || oInfo.buyoffClosedIcon)) {
                return true;
            }
            return false;
        },

        /**
         * Returns the Buyoff Information icon
         * @param {object} oInfo
         */
        getBuyoffIcon: function(oInfo) {
            if (!oInfo || (!oInfo.buyoffOpenIcon && !oInfo.buyoffClosedIcon)) {
                return "";
            }
            if (oInfo.buyoffClosedIcon) {
                return getInfoIcon("buyoff_fulfil");
            }
            return getInfoIcon("buyoff");
        },

        /**
         * Returns the tooltip for the Data Collection Information icon
         * @param {object} oInfo
         */
        getDcIconTooltip: function(oInfo) {
            if (!oInfo || (!oInfo.dcOpenIcon && !oInfo.dcClosedIcon)) {
                return "";
            }
            if (oInfo.dcClosedIcon) {
                return getResourceText("dataCollectionFullfilledIconTooltip");
            }
            return getResourceText("dataCollectionIconTooltip");
        },

        /**
         * Returns the visibility for the Data Collection Information icon
         * @param {object} oInfo
         */
        getDcIconVisible: function(oInfo) {
            if (oInfo && (oInfo.dcOpenIcon || oInfo.dcClosedIcon)) {
                return true;
            }
            return false;
        },

        /**
         * Returns the Data Collection Information icon
         * @param {object} oInfo
         */
        getDcIcon: function(oInfo) {
            if (!oInfo || (!oInfo.dcOpenIcon && !oInfo.dcClosedIcon)) {
                return "";
            }
            if (oInfo.dcClosedIcon) {
                return getInfoIcon("data_col_fulfil");
            }
            return getInfoIcon("data_col");
        },

        /**
         * Returns the tooltip for the Component List Information icon
         * @param {object} oInfo
         */
        getClIconTooltip: function(oInfo) {
            if (!oInfo || (!oInfo.compListOpenIcon && !oInfo.compListClosedIcon)) {
                return "";
            }
            if (oInfo.compListClosedIcon) {
                return getResourceText("assembleFullfilledIconTooltip");
            }
            return getResourceText("assembleIconTooltip");
        },

        /**
         * Returns the visibility for the Component List Information icon
         * @param {object} oInfo
         */
        getClIconVisible: function(oInfo) {
            if (oInfo && (oInfo.compListOpenIcon || oInfo.compListClosedIcon)) {
                return true;
            }
            return false;
        },

        /**
         * Returns the Component List Information icon
         * @param {object} oInfo
         */
        getClIcon: function(oInfo) {
            if (!oInfo || (!oInfo.compListOpenIcon && !oInfo.compListClosedIcon)) {
                return "";
            }
            if (oInfo.compListClosedIcon) {
                return getInfoIcon("assemble_fulfil");
            }
            return getInfoIcon("assemble");
        },

        /**
         * Returns the tooltip for the Parent Serial Number Information icon
         * @param {object} oInfo
         */
        getPsnIconTooltip: function(oInfo) {
            if (!oInfo || (!oInfo.collectPSNOpenIcon && !oInfo.collectPSNClosedIcon)) {
                return "";
            }
            if (oInfo.collectPSNClosedIcon) {
                return getResourceText("collectPSNFullfilledIconTooltip");
            }
            return getResourceText("collectPSNIconTooltip");
        },

        /**
         * Returns the visibility for the Part Serial Number Information icon
         * @param {object} oInfo
         */
        getPsnIconVisible: function(oInfo) {
            if (oInfo && (oInfo.collectPSNOpenIcon || oInfo.collectPSNClosedIcon)) {
                return true;
            }
            return false;
        },

        /**
         * Returns the Part Serial Number Information icon
         * @param {object} oInfo
         */
        getPsnIcon: function(oInfo) {
            if (!oInfo || (!oInfo.collectPSNOpenIcon && !oInfo.collectPSNClosedIcon)) {
                return "";
            }
            if (oInfo.collectPSNClosedIcon) {
                return getInfoIcon("collect_parent_serial_fulfil");
            }
            return getInfoIcon("collect_parent_serial");
        },

        /**
         * Returns the tooltip for the Tool List Information icon
         * @param {object} oInfo
         */
        getTlIconTooltip: function(oInfo) {
            if (!oInfo || (!oInfo.toolListOpenIcon && !oInfo.toolListClosedIcon)) {
                return "";
            }
            if (oInfo.toolListClosedIcon) {
                return getResourceText("logToolFullfilledIconTooltip");
            }
            return getResourceText("logToolIconTooltip");
        },

        /**
         * Returns the visibility for the Tool List Information icon
         * @param {object} oInfo
         */
        getTlIconVisible: function(oInfo) {
            if (oInfo && (oInfo.toolListOpenIcon || oInfo.toolListClosedIcon)) {
                return true;
            }
            return false;
        },

        /**
         * Returns the Tool List Information icon
         * @param {object} oInfo
         */
        getTlIcon: function(oInfo) {
            if (!oInfo || (!oInfo.toolListOpenIcon && !oInfo.toolListClosedIcon)) {
                return "";
            }
            if (oInfo.toolListClosedIcon) {
                return getInfoIcon("log_tool_fulfil");
            }
            return getInfoIcon("log_tool");
        },

        /**
         * Returns the tooltip for the Work Instruction Information icon
         * @param {object} oInfo
         */
        getWiIconTooltip: function(oInfo) {
            return getResourceText("workInstructionIconTooltip");
        },

        /**
         * Returns the visibility for the Work Instruction Information icon
         * @param {object} oInfo
         */
        getWiIconVisible: function(oInfo) {
            if (oInfo && oInfo.wiIcon) {
                return true;
            }
            return false;
        },

        /**
         * Returns the Work Instruction Information icon
         * @param {object} oInfo
         */
        getWiIcon: function(oInfo) {
            if (!oInfo || !oInfo.wiIcon) {
                return "";
            }
            return getInfoIcon("workinst");
        },

        /**
         * Returns the tooltip for the Change Alert Information icon
         * @param {object} oInfo
         */
        getCaIconTooltip: function(oInfo) {
            return getResourceText("changeAlertIconTooltip");
        },

        /**
         * Returns the visibility for the Change Alert Information icon
         * @param {object} oInfo
         */
        getCaIconVisible: function(oInfo) {
            if (oInfo && oInfo.wiChangeAlertIcon) {
                return true;
            }
            return false;
        },

        /**
         * Returns the Change Alert Information icon
         * @param {object} oInfo
         */
        getCaIcon: function(oInfo) {
            if (!oInfo || !oInfo.wiChangeAlertIcon) {
                return "";
            }
            return getInfoIcon("change_alert");
        }
    };
});