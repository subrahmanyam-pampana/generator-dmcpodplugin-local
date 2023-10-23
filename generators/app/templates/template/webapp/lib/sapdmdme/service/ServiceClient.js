sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/model/AjaxUtil"
], function(BaseObject, AjaxUtil) {

    return BaseObject.extend("sap.dm.dme.service.ServiceClient", {
        metadata: {
            publicMethods: ["get"]
        },

        /**
         * Make a GET asynchronous call for the given URL and parameters
         *
         * @param {string} sUrl The service url
         * @param {string|object|array} vParameters Query parameters
         * @return {Promise}
         */
        get: function(sUrl, vParameters) {
            return new Promise(function(resolve, reject) {
                AjaxUtil.get(sUrl, vParameters, resolve, reject);
            });
        },

        post: function(sUrl, oPayload, timeout) {
            return new Promise(function(resolve, reject) {
                AjaxUtil.post(sUrl, oPayload, resolve, reject, timeout);
            });
        },

        patch: function(sUrl, oPayload, timeout) {
            return new Promise(function(resolve, reject) {
                AjaxUtil.patch(sUrl, oPayload, resolve, reject, timeout);
            });
        },

        put: function(sUrl, oPayload) {
            return new Promise(function(resolve, reject) {
                AjaxUtil.put(sUrl, oPayload, resolve, reject);
            });
        },

        "delete": function(sUrl, oPayload) {
            return new Promise(function(resolve, reject) {
                AjaxUtil.delete(sUrl, resolve, reject, oPayload);
            });
        }
    });
});