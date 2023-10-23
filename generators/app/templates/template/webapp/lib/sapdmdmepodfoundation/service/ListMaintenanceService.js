sap.ui.define([
    "sap/ui/base/Object",
    "sap/base/security/encodeURL",
    "sap/dm/dme/logging/Logging",
    "sap/dm/dme/message/ErrorHandler",
    "sap/dm/dme/service/ServiceClient",
    "sap/dm/dme/podfoundation/util/PodUtility",
    "sap/dm/dme/model/AjaxUtil"
], function(BaseObject, encodeURL, Logging, ErrorHandler, ServiceClient, PodUtility, AjaxUtil) {
    "use strict";

    var oLogger = Logging.getLogger("sap.dm.dme.podfoundation.service.ListMaintenanceService");
    var sLastModifiedDateTime;

    /**
     * Class used by POD and POD Designer to retrieve / create / update
     * List Maintenance information
     */
    return BaseObject.extend("sap.dm.dme.podfoundation.service.ListMaintenanceService", {

        /**
         * Creates the ListMaintenanceService class
         * 
         * @param sProductionDatasourceUri Rest Datasource URI to the Production MS
         * @param sPlantDatasourceUri OData Datasource URI to the Plant MS
         */
        constructor: function(sProductionDatasourceUri, sPlantDatasourceUri) {
            BaseObject.call(this);
            this._sProductionDatasourceUri = sProductionDatasourceUri;
            this._sPlantDatasourceUri = sPlantDatasourceUri;
        },

        /**
         * Returns Promise to get all list names for the input list type
         *
         * @param {string} sListType List type to get names for
         * @return Promise
         * @public
         */
        getListNamesByType: function(sListType) {
            var that = this;
            var oPromise = new Promise(function(resolve, reject) {
                var sUrl = that._sProductionDatasourceUri + "listConfigurations/" + sListType;
                var oServiceClient = that._getServiceClient();
                oServiceClient.get(sUrl)
                    .then(function(oData) {
                        resolve(oData);
                        return;
                    }.bind(that))
                    .catch(function(oError, sHttpErrorMessage) {
                        var err = oError || sHttpErrorMessage;
                        oLogger.error("getListNames: Error retrieving list names for " + sListType);
                        reject(err);
                    }.bind(that));
            });
            return oPromise;
        },

        /**
         * Returns Promise to get the list configuration for the input list type and name
         *
         * @param {string} List type to get list for
         * @param {string} List name to get list for
         * @return Promise
         * @public
         */
        getListConfiguration: function(sListType, sListName) {
            var that = this;
            var oPromise = new Promise(function(resolve, reject) {
                var sUrl = that._sProductionDatasourceUri + "listConfigurations/" + sListType + "/" + sListName;
                var oServiceClient = that._getServiceClient();
                oServiceClient.get(sUrl)
                    .then(function(oListConfigData) {
                        this._getModifiedDataTime(oListConfigData);
                        resolve(oListConfigData);
                    }.bind(that))
                    .catch(function(oError, sHttpErrorMessage) {
                        var err = oError || sHttpErrorMessage;
                        oLogger.error("getListConfiguration: Error getting list configuration for " + sListType + "/" + sListName);
                        reject(err);
                    }.bind(that));
            });
            return oPromise;
        },

        /**
         * Returns promise to return custom data column information
         * 
         * @param {array} aCustomDataTypes Names of custom data types to get columns for
         * @return Promise
         * @public
         */
        getCustomColumns: function(aCustomDataTypes) {
            var that = this;
            var oPromise = new Promise(function(resolve) {
                if (!aCustomDataTypes || aCustomDataTypes.length === 0) {
                    resolve([]);
                    return;
                }
                that.getCustomDataColumns(aCustomDataTypes)
                    .then(function(oResultData) {
                        var aCustomColumns = [];
                        this._addCustomColumns(oResultData, aCustomColumns);
                        resolve(aCustomColumns);
                    }.bind(that))
                    .catch(function(oError, sHttpErrorMessage) {
                        oLogger.error("getCustomColumns: Error getting custom data columns");
                        resolve([]);
                    }.bind(that));
            });
            return oPromise;
        },

        /*
         * loads input array with custom data column information
         *
         * @param {object} oResultData OData result data
         * @param {array} aCustomColumns array to add column information to
         * @private
         */
        _addCustomColumns: function(oResultData, aCustomColumns) {
            if (!oResultData || !oResultData.value || oResultData.value.length === 0) {
                return aCustomColumns;
            }
            for (var i = 0; i < oResultData.value.length; i++) {
                aCustomColumns[aCustomColumns.length] = {
                    "columnId": oResultData.value[i].tableName + "." + oResultData.value[i].fieldName,
                    "columnLabel": oResultData.value[i].fieldLabel,
                    "tableName": oResultData.value[i].tableName
                };
            }
        },

        /**
         * Returns Promise to get the custom data column names for the input type
         *
         * @param {string} sCustomDataType Custom Data type to get
         * @return Promise
         * @public
         */
        getCustomDataColumns: function(aCustomDataType) {
            var that = this;
            var oPromise = new Promise(function(resolve) {
                var sFilter = "";
                for (var i = 0; i < aCustomDataType.length; i++) {
                    if (i > 0) {
                        sFilter = sFilter + " or ";
                    }
                    sFilter = sFilter + "tableName eq '" + aCustomDataType[i] + "'";
                }
                var sUrl = that._sPlantDatasourceUri + "CustomFieldDefinitions";
                if (sFilter !== "") {
                    sUrl = sUrl + "?$filter=" + encodeURL(sFilter);
                }
                // sUrl = sUrl + "&$orderby=sequence";
                var oServiceClient = that._getServiceClient();
                oServiceClient.get(sUrl)
                    .then(function(oData) {
                        resolve(oData);
                    }.bind(that))
                    .catch(function(oError, sHttpErrorMessage) {
                        oLogger.error("getCustomDataColumns: Error getting custom data columns");
                        resolve(null);
                    }.bind(that));
            });
            return oPromise;
        },

        /**
         * Creates a new list in the DB
         *
         * @param {string} sListNameList name to create
         * @param {object} oAssignedData Assigned data
         * @return Promise
         * @public
         */
        createNewList: function(sListName, oAssignedData) {
            return new Promise(function(resolve, reject) {
                var sUrl = this._sProductionDatasourceUri + "listConfigurations";
                AjaxUtil.post(sUrl, oAssignedData, resolve, function(oResponseJson, sHttpErrorMessage, nHttpStatus) {
                    let oError = {
                        oResponse: oResponseJson,
                        message: sHttpErrorMessage,
                        nHttpStatus: nHttpStatus
                    };
                    reject(oError);
                });
            }.bind(this));
        },

        /**
         * Updates an existing list in the DB
         *
         * @param {string} sListNameList name to update
         * @param {object} oAssignedData Assigned data
         * @return Promise
         * @public
         */
        updateExistingList: function(sListName, oAssignedData) {
            return new Promise(function(resolve, reject) {
                var sUrl = this._sProductionDatasourceUri + "listConfigurations";
                this._appendModifiedDateTime(oAssignedData);
                AjaxUtil.put(sUrl, oAssignedData, resolve, function(oResponseJson, sHttpErrorMessage, nHttpStatus) {
                    let oError = {
                        oResponse: oResponseJson,
                        message: sHttpErrorMessage,
                        nHttpStatus: nHttpStatus
                    };
                    reject(oError);
                });
            }.bind(this));
        },

        /**
         * Retrieves the modifiedDateTime from the response object
         *
         * @param {object} oListConfigData list configuration data
         * @private
         */
        _getModifiedDataTime: function(oListConfigData) {
            if (oListConfigData && oListConfigData.modifiedDateTime) {
                sLastModifiedDateTime = oListConfigData.modifiedDateTime;
            } else {
                sLastModifiedDateTime = undefined;
            }
        },

        /**
         * Appends the modifiedDateTime to the List configuration
         * @param {object} oListConfigData list configuration data
         * @private
         */
        _appendModifiedDateTime: function(oListConfigData) {
            if (sLastModifiedDateTime) {
                oListConfigData.modifiedDateTime = sLastModifiedDateTime;
            }

            return oListConfigData;
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