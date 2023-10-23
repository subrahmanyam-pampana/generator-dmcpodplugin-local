sap.ui.define([
    "sap/dm/dme/localService/fileAccess",
    "sap/dm/dme/logging/Logging"
], function(FileAccess, Logging) {
    "use strict";
    let logger = Logging.getLogger("sap.dm.dme.localService.DmeRequestProcessor");

    let oConfig;
    let sMockDataPath;
    let oTransientResponseChanges = {};
    let DEFAULT_RESPONSE_HEADER = {
        "Content-Type": "application/json",
        "OData-Version": "4.0"
    };
    let oMetadataUriMap = {
        production: "sap/dm/dme/test/integration/requestMappings/mockData/production/productionMetadata.xml",
        product: "sap/dm/dme/test/integration/requestMappings/mockData/product/productMetadata.xml",
        plant: "sap/dm/dme/test/integration/requestMappings/mockData/plant/plantMetadata.xml",
        workinstruction: "sap/dm/dme/test/integration/requestMappings/mockData/workInstruction/workInstructionMetadata.xml",
        demand: "sap/dm/dme/test/integration/requestMappings/mockData/demand/demandMetadata.xml",
        automation: "sap/dm/dme/test/integration/requestMappings/mockData/automation/automationMetadata.xml",
        datacollection: "sap/dm/dme/test/integration/requestMappings/mockData/datacollection/datacollectionMetadata.xml",
        document: "sap/dm/dme/test/integration/requestMappings/mockData/document/documentMetadata.xml",
        nonconformance: "sap/dm/dme/test/integration/requestMappings/mockData/nonconformance/nonconformanceMetadata.xml",
        overlay: "sap/dm/dme/test/integration/requestMappings/mockData/overlay/overlayMetadata.xml",
        packing: "sap/dm/dme/test/integration/requestMappings/mockData/packing/packingMetadata.xml",
        serviceregistry: "sap/dm/dme/test/integration/requestMappings/mockData/serviceregistry/serviceregistryMetadata.xml",
        podfoundation: "sap/dm/dme/test/integration/requestMappings/mockData/podfoundation/podfoundationMetadata.xml",
        tool: "sap/dm/dme/test/integration/requestMappings/mockData/tool/toolMetadata.xml"
    };

    /**
     * Iterates over object properties and calls callback function with object's property value and name.
     * If callback function returns true then iteration stopped and current property value returned.
     */
    function iterateObjectFindValue(oObject, fnCallback) {
        if (oObject) {
            for (let sProperty in oObject) {
                if (oObject.hasOwnProperty(sProperty) && fnCallback(oObject[sProperty], sProperty)) {
                    return oObject[sProperty];
                }
            }
        }

        return null;
    }

    /**
     * Equals two objects
     */
    function areObjectsEqual(o1, o2) {
        if (!o1 || !o2) {
            return false;
        }
        let o1Props = Object.getOwnPropertyNames(o1);
        let o2Props = Object.getOwnPropertyNames(o2);
        if (o1Props.length !== o2Props.length) {
            return false;
        }

        for (let i = 0; i < o1Props.length; i++) {
            let propName = o1Props[i];

            if (o1[propName] && typeof o1[propName] === "object") {
                if (!areObjectsEqual(o1[propName], o2[propName])) {
                    return false;
                }
            } else if (typeof o2[propName] === "string" && o2[propName].toUpperCase() === "@DO_NOT_MATCH@") {
                // added to ignore certain parts of mock body (useful to ignore dates/time)
                continue;
            } else if (o1[propName] !== o2[propName]) {
                return false;
            }
        }
        return true;
    }

    /**
     * @param method The request method
     * @param url The request url
     * @param request The mock request config
     * @param body The request body (optional)
     * @returns true if the given method, URL and request body matches a mock request from the request mapping config
     */
    function matchRequest(method, url, body, request) {
        let bMatches = (request.method === method) && matchUrl(request.url, url, request.regex);

        // skip matching by payload body if request already doesn't match by method and URL
        if (bMatches && request.body) {
            let oBody = body ? typeof body === "object" ? body : JSON.parse(body) : null;
            bMatches = bMatches && areObjectsEqual(oBody, request.body);
        }

        return bMatches;
    }

    /**
     * @param {string} requestedUrl url from the mock request config
     * @param {string} actualUrl actual url mock server is called with
     * @param {boolean} regex whether requestedUrl parameter is an regular expression or urls should match strictly
     * @returns true if actualUrl matches requestedUrl
     */
    function matchUrl(requestedUrl, actualUrl, regex) {
        let sDecodedRequestUrl = decodeURIComponent(requestedUrl);
        let sDecodedActualUrl = decodeURIComponent(actualUrl);

        return regex ? new RegExp(sDecodedRequestUrl).test(sDecodedActualUrl) :
            (sDecodedRequestUrl === sDecodedActualUrl);
    }

    /**
     * Iterates over associative array of requests and returns request config matched by method, URL and request body.
     */
    function findRequestConfig(method, url, body) {
        return iterateObjectFindValue(oConfig.requests, function(request) {
            return matchRequest(method, url, body, request);
        });
    }

    /**
     * Changes a response that should be returned by other requests when specified request received as it's
     * specified in request mapping. It allows to emulate update/delete functionality. For example when delete request
     * is received then get list request should return another response without deleted entity.
     *
     * The mapping may be specified as a pair of strings (request mapped to new response), or as a string/object, where
     * the object is a response configuration containing the name of the response and flag indicating if the mapping
     * should be permanent, or cleared when the application is started.
     *
     * ex.
     *   "responseChanges": {
     *       "masterList_allMaterials": {
     *           "response": "create_newMaterialList",
     *           "transient": true
     *       }
     *   }
     */
    function processResponseConfigChanges(request) {
        iterateObjectFindValue(request.responseChanges, function(vChangedResponse, requestName) {
            // The remapped request name may be an object as well as a string.  If it is an object
            // and the object has the 'transient' property set to true, then store the original
            // mapping so that it can be restored at some later time (using restoreTransientChangedResponses)
            if (typeof vChangedResponse === "object") {
                if (vChangedResponse.transient) {
                    oTransientResponseChanges[requestName] = oConfig.requests[requestName].response;
                }
                oConfig.requests[requestName].response = vChangedResponse.response;
            } else {
                oConfig.requests[requestName].response = vChangedResponse;
            }
        });
    }

    /**
     * Creates a fake response for specified request as defined in request mapping.
     * Returns a fake response from corresponding file in the mockServer data folder.
     */
    function createFakeResponse(request, method, url) {
        let aResult;
        let response = oConfig.responses[request.response];

        if (response) {
            aResult = [
                response.code || 200,
                response.type || DEFAULT_RESPONSE_HEADER
            ];

            if (response.payload) {
                // Leading '/' means an absolute path is specified, so don't use sMockDataPath
                let sPath = (response.payload.indexOf("/") === 0) ? response.payload.slice(1) : sMockDataPath + response.payload;
                aResult.push(FileAccess.getText(sPath));
            }
        } else {
            aResult = createErrorResponse("No response found for method " + method + " and url '" + url + "' and response '" + request.response + "'");
        }

        return aResult;
    }

    /**
     * Creates a fake error response if no requests defined in request mapping matched.
     */
    function createErrorResponseForNotFoundRequest(method, url, body) {
        let sErrorMsg = "No request mapping found for method " + method + " and url '" + url + "'";
        if (method === "POST" || method === "PATCH") {
            sErrorMsg += " and body " + body;
        }
        return createErrorResponse(sErrorMsg);
    }

    /**
     * Creates a fake error response with a specified error message.
     */
    function createErrorResponse(errorMessage) {
        logger.error(errorMessage);
        return [
            404,
            DEFAULT_RESPONSE_HEADER,
            JSON.stringify({
                error: {
                    message: errorMessage
                }
            })
        ];
    }

    /**
     * Merges request and response objects from oMappingToAdd into oTargetMapping.
     * If a request or response name in oMappingToAdd is found in oTargetMapping then
     * the request/response in oTargetMapping is preserved.
     *
     */
    function addRequestMappingConfig(oTargetMapping, oMappingToAdd) {
        jQuery.extend(oTargetMapping.requests, oMappingToAdd.requests);
        jQuery.extend(oTargetMapping.responses, oMappingToAdd.responses);
    }

    return {
        init: function(vRequestMappingConfig, mockDataFolder) {
            sMockDataPath = mockDataFolder;

            if (typeof vRequestMappingConfig === "string") {
                oConfig = FileAccess.getJson(vRequestMappingConfig);
            } else {
                oConfig = FileAccess.getJson(vRequestMappingConfig["appMappingConfig"]);
                if (vRequestMappingConfig["supplementalConfigs"]) {
                    let aMergeConfigs = vRequestMappingConfig["supplementalConfigs"];
                    let oAdditionalMapping;
                    for (let i = 0; i < aMergeConfigs.length; i++) {
                        try {
                            oAdditionalMapping = FileAccess.getJson(aMergeConfigs[i]);
                        } catch (err) {
                            logger.error("Failed to load Request Mapping file: " + aMergeConfigs[i] + ". Error = " + err.message);
                            continue;
                        }
                        if (!oAdditionalMapping) {
                            logger.error("Failed to load Request Mapping file: " + aMergeConfigs[i]);
                            continue;
                        }
                        addRequestMappingConfig(oConfig, oAdditionalMapping);
                    }
                }
            }
        },

        createFakeResponseForRequest: function(method, url, body) {
            let oRequestConfig = findRequestConfig(method, url, body);
            let aResponse;

            if (oRequestConfig) {
                aResponse = createFakeResponse(oRequestConfig, method, url);
                processResponseConfigChanges(oRequestConfig);
            } else {
                aResponse = createErrorResponseForNotFoundRequest(method, url, body);
            }

            return aResponse;
        },

        isRequestMapping: function(method, url, body) {
            return !!findRequestConfig(method, url, body);
        },

        /**
         * Restore response changes that were marked as transient. After restoration the original response
         * is mapped to the request.
         */
        restoreTransientChangedResponses: function() {
            for (let requestName in oTransientResponseChanges) {
                oConfig.requests[requestName].response = oTransientResponseChanges[requestName];
            }
            oTransientResponseChanges = {};
        },

        /**
         * Respond with the mock metadata for the service specified
         * as part of the given URL.
         *
         * @param sUrl The request URL for the service metadata, such as /product.svc/$metadata
         */
        createMetadataResponse: function(sUrl) {
            let aResponse = [200, {
                "Content-Type": "application/xml",
                "OData-Version": "4.0"
            }];

            let sMetadataUri;
            let fileNameMatch = sUrl.match(/\/[a-z]+\/([a-z]+)\.[a-z]+\//);
            if (fileNameMatch && oMetadataUriMap[fileNameMatch[1]]) {
                sMetadataUri = oMetadataUriMap[fileNameMatch[1]];
            } else {
                sMetadataUri = sMockDataPath + "metadata.xml";
            }

            aResponse.push(FileAccess.getText(sMetadataUri));
            return aResponse;
        }
    };
});

/*
Request Mapping structure

{
  "requests": {                                 // associative array of requests
    "master": {                                 // request name
      "method": "GET",                          // method of a received request being mocked
      "url": "Materials?$skip=0&$top=100",      // URL being mocked
      "response": "master",                     // name of a fake response that should be generated for this request
      "responseChanges": {                      // associative array specifies requests that should be changed after this request
        "master": "filter2"                     // request name : response name that should be changed
      }
    }
  },
  "responses": {                                      // associative array of responses
    "master": {                                       // response name
      "code": 200,                                    // fake response code, default is 200
      "type": {"Content-Type": "application/json"},   // fake response headers, default is "Content-Type": "application/json"
      "payload": "materials.json"                     // file name from a local folder which contains fake response payload, optional
    }
  }
}

*/