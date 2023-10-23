/**
 * DEPRECATED: Use DmeMockServer instead
 */
sap.ui.define([
    "sap/ui/thirdparty/sinon",
    "sap/dm/dme/localService/fileAccess",
    "sap/dm/dme/localService/requestMapping"
], function(sinon, FileAccess, RequestMapping) {
    "use strict";

    /** sinon fake server instance */
    let oMockServer;

    return {
        /**
         * Initializes the mock server.
         * The local mock data in this folder is returned instead of the real data for testing.
         * @public
         */
        init: function(oPathConfig, bTransparent) {
            RequestMapping.init(oPathConfig.sMockServerConfigPath, oPathConfig.sMockDataFolderPath);
            let oManifest = FileAccess.getJson(oPathConfig.sManifestPath);

            let aDataSources = oManifest["sap.app"].dataSources;
            // load all datasource uri's
            let rootUris = [];
            for (let key in aDataSources) {
                if (aDataSources[key].uri && aDataSources[key].uri !== "") {
                    rootUris.push(aDataSources[key].uri);
                }
            }

            oMockServer = sinon.fakeServer.create();
            oMockServer.xhr.useFilters = true;
            oMockServer.autoRespond = true;

            // If any datasource URI (e.g. /product.svc/) that is configured in the application's manifest
            // is found in any part of the request URL, and if bTransparent is falsey, then the sinon mockserver
            // will attempt to mock the request. In addition, when bTransparent is falsey then the call
            // to RequestMapping.isRequestMapping is never reached, making this check of no consequence. If
            // the logic is changed from '||' to '&&' and there is no mapping found for the request, then the
            // mockserver does not handle the request and the result is a 502 Bad Gateway (assuming the service
            // is not reachable).
            oMockServer.xhr.addFilter(function(method, url) {
                for (let i = 0; i < rootUris.length; i++) {
                    if (url.indexOf(rootUris[i]) === 0) {
                        let oRegEx = this._getDataSourceUriRegEx(rootUris[i]);
                        let sServiceResourcePath = url.match(oRegEx)[1];

                        if (!bTransparent || RequestMapping.isRequestMapping(method, sServiceResourcePath)) {
                            // If the filter returns truthy, the request will not be faked
                            return false;
                        }
                    }
                }
                return true;
            }.bind(this));

            for (let i = 0; i < rootUris.length; i++) {
                let oRegEx = this._getDataSourceUriRegEx(rootUris[i]);
                oMockServer.respondWith(oRegEx, this._sendResponseForRequest);
            }

            jQuery.sap.log.info("Running the app with mock data");
        },

        /**
         * Send an XHR response for the given service resource path. An error response is returned
         * if no request mapping is found for the service resource path.
         *
         * @param xhr XML Http request object
         * @param sServiceResourcePath The path of a resource such as "Materials('ItemBO:SAP,DECK_GHOST,A')"
         */
        _sendResponseForRequest: function(xhr, sServiceResourcePath) {
            let oDefaultHeaders = {
                "Content-Type": "application/json"
            };
            let aResponse;
            if (RequestMapping.isRequestMapping(xhr.method, sServiceResourcePath)) {
                aResponse = RequestMapping.createFakeResponseForRequest(xhr.method, sServiceResourcePath, xhr.requestBody);
            } else {
                let sErrorMsg = "No request mapping found for method " + xhr.method + " and url '" + sServiceResourcePath + "'";
                aResponse = [404, oDefaultHeaders,
                    '{"error": {"message": "' + sErrorMsg + '"}}'
                ];
            }
            xhr.respond.apply(xhr, aResponse);
            return aResponse;
        },

        /**
         * @public returns the mockserver of the app, should be used in integration tests
         * @returns {sap.ui.core.util.MockServer} the mockserver instance
         */
        getMockServer: function() {
            return oMockServer;
        },

        _getDataSourceUriRegEx: function(sServiceDataSourceUri) {
            return new RegExp("^" + sServiceDataSourceUri + "(.+)");
        }
    };
});