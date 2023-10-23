sap.ui.define([
    "sap/ui/thirdparty/sinon-4",
    "sap/dm/dme/localService/fileAccess",
    "sap/dm/dme/localService/DmeRequestProcessor",
    "sap/dm/dme/logging/Logging"
], function(sinon, FileAccess, RequestProcessor, Logging) {
    "use strict";

    let logger = Logging.getLogger("sap.dm.dme.localService.DmeMockServer");

    /** sinon fake server instance */
    let oMockServer;

    return {
        /**
         * Initializes the mock server.
         * The local mock data in this folder is returned instead of the real data for testing.
         * @public
         */
        init: function(oPathConfig, bTransparent) {
            let vRequestMappingConfig = oPathConfig.sMockServerConfigPath || oPathConfig.oRequestMappingConfig;
            RequestProcessor.init(vRequestMappingConfig, oPathConfig.sMockDataFolderPath);

            let oBaseManifest = FileAccess.getJson("sap/dm/dme/component/base/manifest.json");
            let oManifest = FileAccess.getJson(oPathConfig.sManifestPath);
            let oTestDataSources = {};
            if (oPathConfig.sTestManifestPath) {
                // to allow adding dataSources only for tests
                let oTestManifest = FileAccess.getJson(oPathConfig.sTestManifestPath);
                oTestDataSources = oTestManifest["sap.app"].dataSources;
            }
            let aDataSources = jQuery.extend({}, oBaseManifest["sap.app"].dataSources, oManifest["sap.app"].dataSources, oTestDataSources);

            // load all datasource uri's
            this.aDataSourceUris = [];
            for (let key in aDataSources) {
                if (aDataSources[key].uri && aDataSources[key].uri !== "") {
                    this.aDataSourceUris.push(aDataSources[key].uri);
                }
            }

            if (oMockServer) {
                oMockServer.reset();
            } else {
                oMockServer = sinon.createFakeServer({
                    autoRespond: true
                });
                oMockServer.xhr.useFilters = true;

                // If any datasource URI (e.g. /product.svc/) that is configured in the application's manifest
                // is found in any part of the request URL, and if bTransparent is falsey, then the sinon mockserver
                // will attempt to mock the request. In addition, when bTransparent is falsey then the call
                // to RequestProcessor.isRequestMapping is never reached, making this check of no consequence. If
                // the logic is changed from '||' to '&&' and there is no mapping found for the request, then the
                // mockserver does not handle the request and the result is a 502 Bad Gateway (assuming the service
                // is not reachable).
                oMockServer.xhr.addFilter(function(method, url) {
                    for (let i = 0; i < this.aDataSourceUris.length; i++) {
                        if (url.indexOf(this.aDataSourceUris[i]) >= 0) {
                            const oRegEx = this._getDataSourceUriRegEx(this.aDataSourceUris[i]);
                            const aRegExMatch = url.match(oRegEx);

                            if (aRegExMatch) {
                                const sServiceResourcePath = aRegExMatch[1];

                                if (!bTransparent || RequestProcessor.isRequestMapping(method, sServiceResourcePath)) {
                                    return false; // If the filter returns false, the request will be faked
                                }
                            }
                        }
                    }

                    return true; // If the filter returns true, the request will _not_ be faked
                }.bind(this));
            }

            for (let i = 0; i < this.aDataSourceUris.length; i++) {
                let oRegEx = this._getDataSourceUriRegEx(this.aDataSourceUris[i]);
                oMockServer.respondWith(oRegEx, this._sendResponseForRequest);
            }

            logger.info("Running the app with mock data");
        },

        /**
         * Send an XHR response for the given service resource path. An error response is returned
         * if no request mapping is found for the service resource path.
         *
         * @param xhr XML Http request object
         * @param sServiceResourcePath The path of a resource such as "Materials('ItemBO:SAP,DECK_GHOST,A')"
         */
        _sendResponseForRequest: function(xhr, sServiceResourcePath) {
            logger.info("DmeMockServer servicing URL: " + sServiceResourcePath, xhr.method);

            let aResponse = (sServiceResourcePath.indexOf("$metadata") >= 0) ?
                RequestProcessor.createMetadataResponse(xhr.url) :
                RequestProcessor.createFakeResponseForRequest(xhr.method, sServiceResourcePath, xhr.requestBody);

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
            return new RegExp(`^.*${sServiceDataSourceUri}(.+)`);
        }
    };
});