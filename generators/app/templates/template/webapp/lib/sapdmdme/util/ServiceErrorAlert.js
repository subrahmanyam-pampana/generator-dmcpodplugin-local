sap.ui.define([
    "sap/m/MessageBox"
], function(MessageBox) {
    "use strict";

    return {
        /**
         * Processes Errors and shows them in Message.error alert box
         * @param {Object} oError Error object from response. Can be undefined.
         * @param {Object} oHttpErrorMessage Response from API call. Can be undefined.
         * @param {Number} nStatus HTTP Response code.
         * @param {string} sForbiddenErrorMessage Message to show in case of forbidden response.
         */
        showServiceErrorMessage: ({
            oError,
            oHttpErrorMessage,
            nStatus,
            sForbiddenErrorMessage
        }) => {
            let sMessage = null;
            if (oError && oError.message) {
                sMessage = Array.isArray(oError.message) ? oError.message[0] : oError.message;
            } else if (oError && oError.error && oError.error.message) {
                sMessage = oError.error.message;
            } else if (oHttpErrorMessage && oHttpErrorMessage.message) {
                sMessage = oHttpErrorMessage.message;
            } else if (typeof oError === "string" && oError !== "") {
                sMessage = oError;
            } else if (nStatus === 403 || oHttpErrorMessage === "Forbidden") {
                sMessage = sForbiddenErrorMessage;
            } else {
                sMessage = oHttpErrorMessage;
            }
            MessageBox.error(sMessage, {
                initialFocus: MessageBox.Action.CLOSE
            });
        }
    };
});