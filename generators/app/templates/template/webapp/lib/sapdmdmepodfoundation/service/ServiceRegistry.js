sap.ui.define([
    "sap/ui/base/Object",
    "sap/base/security/encodeURL",
    "sap/dm/dme/logging/Logging",
    "sap/dm/dme/message/ErrorHandler",
    "sap/dm/dme/service/ServiceClient",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(BaseObject, encodeURL, Logging, ErrorHandler, ServiceClient, PodUtility) {
    "use strict";

    var oLogger = Logging.getLogger("sap.dm.dme.podfoundation.service.ServiceRegistry");

    /**
     * Class used by POD and POD Designer to register customer/partner
     * defined plugins that are defined to the Service Registry
     */
    return BaseObject.extend("sap.dm.dme.podfoundation.service.ServiceRegistry", {

        /**
         * Creates the ServiceRegistry class
         * 
         * @param dataSourceUri Datasource URI to the Service Registry
         */
        constructor: function(dataSourceUri) {
            BaseObject.call(this);
            this._dataSourceUri = dataSourceUri;
        },

        /**
         * Function will retrieve all UI Extension service definitions from the Service Registry.
         * It will call the Promise (fnRegisterPromise) to perform the actual registration for 
         * every service found. This Promise is  resolved when all service registration is complete.
         * 
         * @param fnRegisterPromise promise defined to perform the registration for each service definition
         * @param oFnContext Context for the fnRegisterPromise
         * @param oFnData Optional data to be passed to the fnRegisterPromise
         */
        registerExtensionPlugins: function(fnRegisterPromise, oFnContext, oFnData) {
            if (!fnRegisterPromise) {
                throw error("fnRegisterPromise is a required input");
            }
            var that = this;
            var oPromise = new Promise(function(resolve) {

                // Get all UI Extension service definitions
                that.getUiExtensionServices()
                    .then(function(aJsonData) {
                        if (!aJsonData || aJsonData.length === 0) {
                            // nothing found, exit
                            resolve();
                        }

                        // call the registration function for each service
                        var index = 0;
                        for (var i = 0; i < aJsonData.length; i++) {

                            // need to store index so can be used in scope of promise below
                            var oServiceData = {
                                "endpoint": aJsonData[i].url,
                                "pluginsUri": aJsonData[i].path,
                                "pluginsUrn": aJsonData[i].namespace,
                                "componentsUri": aJsonData[i].path + "/designer/components.json"
                            };

                            // call function to perform registration of service
                            fnRegisterPromise.call(oFnContext, oServiceData, oFnData)
                                .then(function() {
                                    if (index === aJsonData.length - 1) {
                                        // all services have been processed
                                        resolve();
                                    }
                                    index++;
                                }.bind(that))
                                .catch(function(oError, oHttpErrorMessage) {

                                    // just log any errors and continue
                                    var sDetailedMessage = ErrorHandler.getErrorMessage(oError);
                                    oLogger.error("registerExtensionPlugins: error occured registering " + oServiceData.endpoint, sDetailedMessage);

                                    if (index === aJsonData.length - 1) {
                                        // all services have been processed
                                        resolve();
                                    }
                                    index++;
                                }.bind(that));
                        }
                    }.bind(that))
                    .catch(function(oError, oHttpErrorMessage) {

                        // just log any errors and continue
                        var sDetailedMessage = ErrorHandler.getErrorMessage(oError);
                        oLogger.error("registerExtensionPlugins: cannot find UI Extension services", sDetailedMessage);

                        // resolve instead of reject since this should not cause POD or POD Designer to fail
                        resolve();
                    }.bind(that));
            });
            return oPromise;
        },

        /**
         * Returns all production processes from service registry
         *
         * @return JSON array of service definitions
         */
        getProductionProcesses: function() {
            var that = this;
            var oPromise = new Promise(function(resolve, reject) {
                var sUrl = that._dataSourceUri + "api/svc/productionProcesses";
                var oServiceClient = that._getServiceClient();
                oServiceClient.get(sUrl)
                    .then(function(oData) {
                        resolve(oData);
                        return;
                    }.bind(that))
                    .catch(function(oError, sHttpErrorMessage) {
                        oLogger.error("getProductionProcesses: Error retrieving production processes");
                        reject(oError, sHttpErrorMessage);
                    }.bind(that));
            });
            return oPromise;
        },

        /**
         * Returns all service definitions for the input Group ID
         *
         * @param sGroupId String group id to return the services for
         * @return JSON array of service definitions
         */
        getServicesByGroupId: function(sGroupId) {
            var that = this;
            var oPromise = new Promise(function(resolve, reject) {
                var sUrl = that._dataSourceUri + "api/svc/groups/" + sGroupId;
                var oServiceClient = that._getServiceClient();
                oServiceClient.get(sUrl)
                    .then(function(oData) {
                        resolve(oData);
                        return;
                    }.bind(that))
                    .catch(function(oError, sHttpErrorMessage) {
                        oLogger.error("getServicesByGroup: Groups for '" + sGroupId + "' not found");
                        reject(oError, sHttpErrorMessage);
                    }.bind(that));
            });
            return oPromise;
        },

        /**
         * Returns the input service definitions for the input Service ID
         *
         * @param sServiceId String service id to return the service data for
         * @return service definition
         */
        getServiceByServiceId: function(sServiceId) {
            var that = this;
            var oPromise = new Promise(function(resolve, reject) {
                var sUrl = that._dataSourceUri + "api/svc/services/" + sServiceId;
                var oServiceClient = that._getServiceClient();
                oServiceClient.get(sUrl)
                    .then(function(oData) {
                        resolve(oData);
                        return;
                    }.bind(that))
                    .catch(function(oError, sHttpErrorMessage) {
                        oLogger.error("getServiceByServiceId: Service for '" + sServiceId + "' not found");
                        reject(oError, sHttpErrorMessage);
                    }.bind(that));
            });
            return oPromise;
        },

        /**
         * Returns all enabled UI Extensions service definitions
         * 
         * @return JSON array of service definitions
         */
        getUiExtensionServices: function() {
            var that = this;
            var oPromise = new Promise(function(resolve, reject) {
                var sUrl = that._dataSourceUri + "api/uiExtensions";
                var oServiceClient = that._getServiceClient();
                oServiceClient.get(sUrl)
                    .then(function(aData) {
                        var aServiceMetaData = [];
                        if (aData && aData.length > 0) {
                            try {
                                aServiceMetaData = this._extractServiceMetadata(aData);
                            } catch (oError) {
                                reject(oError);
                                return;
                            }
                        }
                        resolve(aServiceMetaData);
                    }.bind(that))
                    .catch(function(oError, sHttpErrorMessage) {
                        oLogger.error("getUiExtensionServices: services not found");
                        reject(oError, sHttpErrorMessage);
                    }.bind(that));
            });
            return oPromise;
        },

        /*
         * returns JSON Data from odata response
         */
        _extractServiceMetadata: function(aResponseData) {
            var aServiceData = [];
            for (var i = 0; i < aResponseData.length; i++) {
                if (this._isEnabled(aResponseData[i])) {
                    try {

                        this._validateServiceData(aResponseData[i], aServiceData);

                        aServiceData[aServiceData.length] = aResponseData[i];

                    } catch (oError) {
                        var sDetailedMessage = ErrorHandler.getErrorMessage(oError);
                        oLogger.error("_extractServiceMetadata: JSON data error", sDetailedMessage);
                    }
                }
            }
            return aServiceData;
        },

        /*
         * Temporary check to only process enabled services
         * that are not performance test data.  This will be
         * removed when the Database is cleaned up to remove
         * the hundreds of dummy services.
         */
        _isEnabled: function(oServiceData) {
            if (oServiceData.url === "url" &&
                oServiceData.path === "path" &&
                oServiceData.namespace === "namespace") {
                return false;
            }
            return oServiceData.enabled;
        },

        /*
         * validates the service data
         */
        _validateServiceData: function(oServiceData, aServiceData) {
            if (!oServiceData) {
                throw "Service data is not defined";
            }
            if (PodUtility.isEmpty(oServiceData.url)) {
                throw "Service url is not defined";
            }
            if (PodUtility.isEmpty(oServiceData.path)) {
                throw "Service path is not defined";
            }
            if (PodUtility.isEmpty(oServiceData.namespace)) {
                throw "Service namespace is not defined";
            }
            if (oServiceData.namespace.indexOf(".") >= 0) {
                var urn = oServiceData.namespace.split(".").join("/");
                oServiceData.namespace = urn;
            }
            if (oServiceData.namespace.indexOf("sap/dm/dme") >= 0) {
                throw "Service is using a reserved namespace (i.e.; 'sap/dm/dme')";
            }
            if (aServiceData.length > 0) {
                for (var i = 0; i < aServiceData.length; i++) {
                    if (oServiceData.namespace === aServiceData[i].namespace) {
                        var sMessage = "Namespace '" + oServiceData.namespace;
                        sMessage = sMessage + "' assigned to '" + oServiceData.url;
                        sMessage = sMessage + "' is already assigned to " + aServiceData[i].url;
                        throw sMessage;
                    }
                }
            }
        },

        /*
         * returns instance of ServiceClient class
         */
        _getServiceClient: function() {
            if (!this._oServiceClient) {
                this._oServiceClient = new ServiceClient();
            }
            return this._oServiceClient;
        }
    });
});