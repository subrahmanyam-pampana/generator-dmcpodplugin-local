sap.ui.define([
    "sap/dm/dme/util/PlantSettings",
    "sap/dm/dme/featureflag/FeatureFlagSettings"
], function(PlantSettings, FeatureFlagSettings) {
    "use strict";

    /**
     * Returns request header parameter - which language is preferred on a client.
     * @returns {object} plain object with additional request header parameters.
     */
    let X_CSRF_TOKEN = "X-CSRF-Token";
    let APPLICATION_JSON = "application/json";

    function getHeaders(sToken) {
        FeatureFlagSettings.init();
        let features = sessionStorage.getItem("features");
        let oHeaders = {
            "Accept-Language": sap.ui.getCore().getConfiguration().getLanguageTag(),
            "x-dme-plant": PlantSettings.getCurrentPlant(),
            "x-dme-industry-type": PlantSettings.getIndustryType()
        };
        if (sToken) {
            oHeaders[X_CSRF_TOKEN] = sToken;
        }
        if (features) {
            oHeaders["x-features"] = features;
        }
        return oHeaders;
    }

    /**
     * Adds callback handlers to the processed Ajax request call
     */
    function processRequest(oRequest, fnSuccess, fnFailure) {
        oRequest
            .done(fnSuccess)
            .fail(function(oXhr, sStatus, sErrorMessage) {
                fnFailure(oXhr.responseJSON, sErrorMessage, oXhr.status);
            });
    }

    /**
     * Extracts a part of a backend call URL that will be used to fetch CSRF token.
     * For example /sapdmdmecertification/~280320223224+0000~/dme/plant.svc/Certifications
     * converted into /sapdmdmecertification/
     */
    function getTokenUrlFromRequestUrl(sUrl) {
        return sUrl.substring(0, sUrl.indexOf("/", sUrl.indexOf("/") + 1) + 1);
    }

    return {
        mTokenDeferred: null,

        fetchCsrfToken: function(sRequestUrl) {
            if (!this.mTokenDeferred) {
                this.mTokenDeferred = jQuery.ajax({
                    url: getTokenUrlFromRequestUrl(sRequestUrl),
                    method: "head",
                    headers: {
                        "X-CSRF-Token": "Fetch"
                    }
                }).then(function(oData, sStatus, oXhr) {
                    return oXhr.getResponseHeader(X_CSRF_TOKEN);
                }, function(oXhr) {
                    return oXhr.getResponseHeader(X_CSRF_TOKEN);
                });
            }
            return this.mTokenDeferred;
        },

        get: function(sRequestContext, vParameters, fnSuccess, fnFailure) {
            let oSettings = {
                method: "get",
                url: sRequestContext,
                contentType: APPLICATION_JSON,
                data: vParameters,
                headers: getHeaders(this.mTokenDeferred ? null : "Fetch")
            };

            let fnExtractTokenWrapper = function(oData, sStatus, oXhr) {
                let sToken = oXhr.getResponseHeader(X_CSRF_TOKEN);
                if (sToken) {
                    this.mTokenDeferred = jQuery.Deferred().resolve(sToken);
                }
                fnSuccess(oData);
            }.bind(this);
            let that = this;
            processRequest(jQuery.ajax(oSettings), that.mTokenDeferred ? fnSuccess : fnExtractTokenWrapper, fnFailure);
        },

        post: function(sRequestContext, oPayload, fnSuccess, fnFailure, iTimeout) {
            let oSettings = {
                method: "post",
                url: sRequestContext,
                contentType: APPLICATION_JSON,
                data: JSON.stringify(oPayload),
                timeout: iTimeout
            };
            this._processModificationRequest(oSettings, fnSuccess, fnFailure);
        },

        patch: function(sRequestContext, oPayload, fnSuccess, fnFailure, iTimeout) {
            let oSettings = {
                method: "patch",
                url: sRequestContext,
                contentType: APPLICATION_JSON,
                data: JSON.stringify(oPayload),
                timeout: iTimeout
            };
            this._processModificationRequest(oSettings, fnSuccess, fnFailure);
        },

        put: function(sRequestContext, oPayload, fnSuccess, fnFailure) {
            let oSettings = {
                method: "put",
                url: sRequestContext,
                contentType: APPLICATION_JSON,
                data: JSON.stringify(oPayload)
            };
            this._processModificationRequest(oSettings, fnSuccess, fnFailure);
        },

        delete: function(sRequestContext, fnSuccess, fnFailure, oPayload) {
            let oSettings = {
                method: "delete",
                url: sRequestContext,
                contentType: APPLICATION_JSON
            };
            if (oPayload) {
                oSettings.data = JSON.stringify(oPayload);
            }
            this._processModificationRequest(oSettings, fnSuccess, fnFailure);
        },

        /*
         * CSV Upload - Post for Multipart form-data Input
         */
        postMultipart: function(sRequestContext, oFormData, fnSuccess, fnFailure) {
            let oSettings = {
                method: "post",
                url: sRequestContext,
                contentType: false,
                processData: false,
                data: oFormData
            };
            this._processModificationRequest(oSettings, fnSuccess, fnFailure);
        },

        /**
         * Fetches CSRF token, adds header parameters to the request settings and executes Ajax call
         * with given settings and success and failure callback methods.
         * @private
         */
        _processModificationRequest: function(oSettings, fnSuccess, fnFailure) {
            this.fetchCsrfToken(oSettings.url).always(function(sToken) {
                oSettings.headers = getHeaders(sToken);
                processRequest(jQuery.ajax(oSettings), fnSuccess, fnFailure);
            });

        },

        /***
         * Helper method for qUnit testing.  Returns the header information.
         */
        _getHeaders: function(sToken) {
            return getHeaders(sToken);
        }
    };
});