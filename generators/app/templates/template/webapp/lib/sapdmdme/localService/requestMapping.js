sap.ui.define([
    "sap/dm/dme/localService/fileAccess"
], function(FileAccess) {
    "use strict";

    let oConfig;
    let sMockDataPath;
    let oTransientResponseChanges = {};

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
        if (o1Props.length !== o2Props.length) return false;

        for (let i = 0; i < o1Props.length; i++) {
            let propName = o1Props[i];

            if (o1[propName] && typeof o1[propName] === "object") {
                if (!areObjectsEqual(o1[propName], o2[propName])) {
                    return false;
                }
            } else {
                if (o1[propName] !== o2[propName]) return false;
            }
        }
        return true;
    }

    /**
     * Iterates over associative array of requests and returns request config matched by method and URL.
     */
    function findRequestConfig(method, url, body) {
        let oRequest = iterateObjectFindValue(oConfig.requests, function(request) {
            let bDoesMatch = false;
            let fnUrlMatches = retrieveUrlMatchesFunction(request.regex);
            if (request.method === method) {
                if (request.body) {
                    let oBody = body ? typeof body === "object" ? body : JSON.parse(body) : null;
                    bDoesMatch = areObjectsEqual(oBody, request.body) && fnUrlMatches(request.url, url);
                } else {
                    bDoesMatch = fnUrlMatches(request.url, url);
                }
            }
            return bDoesMatch;
        });
        return oRequest;
    }

    function retrieveUrlMatchesFunction(bRegex) {
        if (bRegex) {
            return function(sRequestedUrl, sActualUrl) {
                let sDecodedRequestUrl = decodeURIComponent(sRequestedUrl);
                let sDecodedResourcePath = decodeURIComponent(sActualUrl);
                return new RegExp(sDecodedRequestUrl).test(sDecodedResourcePath);
            };
        } else {
            return function(sRequestedUrl, sActualUrl) {
                let sDecodedRequestUrl = decodeURIComponent(sRequestedUrl);
                let sDecodedResourcePath = decodeURIComponent(sActualUrl);

                return sDecodedRequestUrl === sDecodedResourcePath;
            };
        }
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
        if (!request) return;
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
     */
    function createFakeResponse(request, method, url) {
        let oDefaultHeaders = {
            "Content-Type": "application/json"
        };
        let aResult;

        // return fake response from corresponding file in the mockServer data folder
        if (request) {
            let response = oConfig.responses[request.response];
            if (!response) {
                let sErrorMsg = "No response found for method " + method + " and url '" + url + "' and response '" + request.response + "'";
                console.error(sErrorMsg);
                aResult = [404, oDefaultHeaders,
                    '{"error": {"message": "' + sErrorMsg + '"}}'
                ];
            } else {
                aResult = [
                    response.code || 200,
                    response.type || oDefaultHeaders
                ];

                if (response.payload) {
                    aResult.push(FileAccess.getText(sMockDataPath + response.payload));
                }
            }
        }
        return aResult;
    }

    return {
        init: function(configPath, mockDataFolder) {
            sMockDataPath = mockDataFolder;
            oConfig = FileAccess.getJson(configPath);
        },

        createFakeResponseForRequest: function(method, url, body) {
            let oRequestConfig = findRequestConfig(method, url, body);
            let aResponse = createFakeResponse(oRequestConfig, method, url);
            processResponseConfigChanges(oRequestConfig);
            return aResponse;
        },

        isRequestMapping: function(sRequestMethod, sServiceResourcePath) {
            let oRequest = iterateObjectFindValue(oConfig.requests, function(request) {
                let sDecodedRequestUrl = decodeURIComponent(request.url);
                let sDecodedResourcePath = decodeURIComponent(sServiceResourcePath);

                return (request.method === sRequestMethod && sDecodedRequestUrl === sDecodedResourcePath);
            });

            return !!oRequest;
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