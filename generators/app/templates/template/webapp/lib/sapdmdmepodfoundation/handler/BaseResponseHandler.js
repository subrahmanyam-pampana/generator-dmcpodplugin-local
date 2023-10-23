sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    /**
     * Interface for Response Handlers used to handle responses from a Production Process.
     * @class
     * <code>sap.dm.dme.podfoundation.handler.BaseResponseHandler</code> provides functions
     * called when a production process finishes successfully.
     * @extends sap.ui.base.Object
     * @alias sap.dm.dme.podfoundation.handler.BaseResponseHandler
     */
    var BaseResponseHandler = BaseObject.extend("sap.dm.dme.podfoundation.handler.BaseResponseHandler", {
        constructor: function() {
            BaseObject.apply(this, arguments);
        }
    });

    /**
     * Returns the type of response to process
     *
     * @return {string} Type of response to process (i.e.; "COMPLETE", "START", etc)
     * @protected
     */
    BaseResponseHandler.prototype.getResponseType = function(oResponseData) {
        // to be implemented by sub-class
        return null;
    };

    /**
     * Returns the ResourceBundle to use to get message text
     * @return {ResourceBundle} Resource Bundle to use to get text using getI18nText()
     * @protected
     */
    BaseResponseHandler.prototype.getResourceBundle = function() {
        // to be implemented by sub-class
        return null;
    };

    /**
     * Function called when a successful call was made to a Production Process
     *
     * @param {object} oResponseData Response from Production Process
     *
     * @protected
     */
    BaseResponseHandler.prototype.handleResponse = function(oResponseData) {
        // to be implemented by sub-class
    };

    /**
     * Function called when a successful call was made to a Production Process
     * to allow a message to be returned for display to the user
     *
     * @param {object} oResponseData Response from Production Process
     * @return {string} Text message to display to user or null
     * @protected
     */
    BaseResponseHandler.prototype.getMessage = function(oResponseData) {
        // to be implemented by sub-class
        return null
    };

    /**
     * Returns i18n text using the supplied ResourceBundle
     *
     * @param {string} sKey Key in ResourceBundle to get text for
     * @param {string} aArgs Optional array of arguments
     * @return {string} Translated text
     * @protected
     */
    BaseResponseHandler.prototype.getI18nText = function(sKey, aArgs) {
        var oResourceBundle = this.getResourceBundle();
        if (!oResourceBundle) {
            return sKey;
        }
        return oResourceBundle.getText(sKey, aArgs);
    };

    /**
     * Checks the Response Data to verify if the Response Data
     * is valid for the Response Type passed to the constructor.
     * <p>
     * The Response Type defined in the constructor is checked
     * against the value in oResponseData.responseType and returns
     * true if a match is found.
     *
     * @param {object} oResponseData.responseType (i.e. "COMPLETE" or "COMPLETE,ASSEMBLE")
     * @return {boolean} true if match found, else false
     * @protected
     */
    BaseResponseHandler.prototype.isValidResponse = function(oResponseData) {
        var sResponseType = this.getResponseType();

        if (!oResponseData || !jQuery.trim(oResponseData.responseType) ||
            !jQuery.trim(sResponseType)) {
            return false;
        }
        sResponseType = sResponseType.trim().toLowerCase();

        var aResponseTypes = [];
        if (oResponseData.responseType.indexOf(",") >= 0) {
            aResponseTypes = oResponseData.responseType.split(",");
        } else {
            aResponseTypes[0] = oResponseData.responseType;
        }
        for (var i = 0; i < aResponseTypes.length; i++) {
            if (jQuery.trim(aResponseTypes[i]) &&
                aResponseTypes[i].trim().toLowerCase() === sResponseType) {
                return true;
            }
        }
        return false;
    };

    return BaseResponseHandler;
});