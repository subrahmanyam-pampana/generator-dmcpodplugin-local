sap.ui.define([
    "sap/dm/dme/logging/Logging",
    "sap/dm/dme/message/ErrorHandler",
    "sap/m/GroupHeaderListItem",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/model/ClassificationClasses",
    "sap/dm/dme/controller/BaseObject.controller",
    "sap/dm/dme/model/AjaxUtil",
    "sap/dm/dme/formatter/DateTimeUtils",
    "sap/dm/dme/formatter/GeneralFormatter",
    "sap/dm/dme/formatter/ObjectTypeFormatter"
], function(Logging, ErrorHandler, GroupHeaderListItem, JSONModel, ClassificationClasses, BaseObjectController, AjaxUtil, DateTimeUtils, GeneralFormatter, ObjectTypeFormatter) {
    "use strict";

    return BaseObjectController.extend("sap.dm.dme.controller.ClassificationCharacteristics", {

        generalFormatter: GeneralFormatter,
        objectTypeFormatter: ObjectTypeFormatter,

        onInit: function() {
            this._initToggleFullScreenButton();
            this.initRoutes();
        },

        onEditCharcObjectMatched: function(oEvent) {
            this.getClassData();
            this.getCharacteristicsData();
        },

        initRoutes: function() {
            this.getRouter().getRoute("Characteristics").attachPatternMatched(this.onEditCharcObjectMatched, this);
        },

        getCharacteristicsData: function() {
            let oSelectedItemData = this.oClassModel.getData();
            let characterstics = oSelectedItemData.classCharacteristics;
            let  urlParameters  = "$filter=";
            let charactersticUrl = this.getClassificationDataSourceUri() + "Characteristics";
            if (characterstics.length !== 0) {
                for (let char in characterstics) {
                    if (characterstics[char].deletionIndicator === "false") {
                        let parameter = "charcInternalId eq '" + characterstics[char].charcInternalId + "' or ";
                        urlParameters = urlParameters + parameter;
                    }            
                }
                if (urlParameters !== "$filter=") {
                    AjaxUtil.get(charactersticUrl, urlParameters.substr(0, urlParameters.length - 4), this.successCallback.bind(this),
                        function(oError, sHttpErrorMessage) {
                            sap.m.MessageBox.error(oError.error.message || sHttpErrorMessage);
                        }.bind(this));
                } else {
                    this.noCharacteristicsData(characterstics);
                }
            } else {
                this.noCharacteristicsData(characterstics);
            }        
        },

        onCancelCharacteristic: function() {
            window.history.back();
        },

        getClassData: function() {
            this.oClassModel = this.getOwnerComponent().getModel("oClassDataModel");
            this.getView().setModel(this.oClassModel, "oClassDataModel");
        },

        getDefaultValues: function(materialName) {
            let classUrl = this.getClassificationDataSourceUri() + "AssignmentHeaders";
            let objectType = "MATERIAL";
            let classParameters = "$filter=objectType eq '" + objectType + "' and objectKey eq '" + materialName + "'";
            AjaxUtil.get(classUrl, classParameters, this.successCallbackDefaultValues.bind(this), this.errorHandler.bind(this));
        },

        checkIfUndefined: function(defaultValue) {
            if (!defaultValue || defaultValue.length === 0) {
                defaultValue = '';
            } else {
                defaultValue = defaultValue + ', ';
            }
            return defaultValue;
        },

        successCallbackDefaultValues: function(oAssignmentValue) {
            let characteristics = this.getOwnerComponent().getModel("oCharcDataModel").getData();
            let that = this;
            let materialAssignments = oAssignmentValue.value;
            materialAssignments.forEach(function(oDefaultValues) {
                let values = oDefaultValues.assignmentCharacteristicValues;
                for (let char in characteristics) {
                    for (let vCounter in values) {
                        if (values[vCounter].assignmentCharacteristicValueId.charcInternalId === characteristics[char].charcInternalId) {
                            characteristics[char].defaultValue = that.checkIfUndefined(characteristics[char].defaultValue);
                            if (characteristics[char].dataType === "DATE") {
                                let dateVal = values[vCounter].charcValue;
                                let formattedDate = DateTimeUtils.formatDate(dateVal.split("T")[0]);
                                characteristics[char].defaultValue = characteristics[char].defaultValue + formattedDate;
                            } else {
                                characteristics[char].defaultValue = characteristics[char].defaultValue + values[vCounter].charcValue;
                            }
                        }
                    }
                }
            });
            this.getOwnerComponent().getModel("oCharcDataModel").refresh();
        },

        errorHandler: function(oError, sHttpErrorMessage) {
            sap.m.MessageBox.error(oError.error.message || sHttpErrorMessage);
        },

        successCallback: function(oResponseData) {
            let oSelectedItemData = this.oClassModel.getData();
            let characterstics = oSelectedItemData.classCharacteristics;
            let value = oResponseData.value;
            let newValue = [];

            if (characterstics.length !== 0 && value.length !== 0) {
                let unsortedMap = {};
                for (let char in characterstics) {
                    value.forEach(function(oCharac) {
                        if (oCharac.charcInternalId === characterstics[char].charcInternalId) {
                            unsortedMap[characterstics[char].classCharacteristicId.itemCounter] = oCharac;
                        }
                    });
                }
                let keys = new Array();

                for (let key in unsortedMap) {
                    keys.push(key);
                }
                let sortedMap = new Map();
                keys.sort().map(function(key) {
                    sortedMap.set(key, unsortedMap[key]);
                });
                sortedMap.forEach(function(val) {
                    newValue.push(val)
                });
            }

            let locale = sap.ui.getCore().getConfiguration().getLocale().getLanguage();
            if (newValue.length !== 0) {
                newValue = this.setLocaleSpecificDescription(newValue, locale);
                newValue.count = newValue.length;
                let oCharcDataModel = new sap.ui.model.json.JSONModel(newValue);
                this.getOwnerComponent().setModel(oCharcDataModel, "oCharcDataModel");
                let materialName = oSelectedItemData.materialName;
                if (oSelectedItemData.classType === '001') {
                    this.getDefaultValues(materialName);
                }
            } else {
                this.noCharacteristicsData(value);
            }
        },

        setLocaleSpecificDescription: function(oData, locale) {
            let enModel = null;
            let vDescription = null;
            for (let vd in oData) {
                if (oData[vd].charcTexts.length !== 0) {
                    let charcTexts = oData[vd].charcTexts;
                    for (let element in charcTexts) {
                        if (charcTexts[element].characteristicValueTId.language.toUpperCase() === locale.toUpperCase()) {
                            vDescription = charcTexts[element];
                            oData[vd].localeSpecificText = vDescription.description;
                            break;
                        } else if (charcTexts[element].characteristicValueTId.language.toUpperCase() === "EN") {
                            enModel = charcTexts[element];
                        }
                    };
                    if (vDescription === null && enModel != null) {
                        vDescription = enModel;
                        oData[vd].localeSpecificText = vDescription.description;
                    }
                }
                oData[vd] = this.getValuesBasedOnDataType(oData[vd]);
            }
            return oData;
        },

        onCharacteristicsLiveChange: function(oEvent) {
            let properties = ["charcName", "localeSpecificText", "dataType", "displayAllowedValues"];
            let oValue = "";
            if (oEvent) {
                oValue = oEvent.getParameter("newValue");
            }
            let resourceList = this.byId("characteristicsTable").getBinding("items");
            this.handleSearch(oValue, properties, resourceList);
        },

        noCharacteristicsData: function(value) {
            value.count = 0;
            this.getOwnerComponent().getModel("oCharcDataModel") ? this.getOwnerComponent().getModel("oCharcDataModel").setData(value) :
                this.getOwnerComponent().setModel(value, "oCharcDataModel");
        },

        handleSearch: function(oValue, propertiesArray, oBinding) {
            let aFilters = [];
            let filter;
            let oFilterWithAllProperties;
            if (oValue && oValue.length > 0) {
                jQuery.each(propertiesArray, function(oIndex, oObj) {
                    filter = new sap.ui.model.Filter(oObj, sap.ui.model.FilterOperator.Contains, oValue);
                    aFilters.push(filter);
                });

                oFilterWithAllProperties = new sap.ui.model.Filter({
                    filters: aFilters,
                    and: false
                });
            }
            oBinding.filter(oFilterWithAllProperties);
        },

        getValuesBasedOnDataType: function(data) {
            let allowedValues = "";
            let value;
            let val;
            if (data.charcValues.length !== 0) {
                switch (data.dataType) {
                    case "CHAR":
                        for (value in data.charcValues) {
                            val = data.charcValues[value].charcValue + ", ";
                            allowedValues = allowedValues + val;
                        }
                        break;
                    case "DATE":
                        for (value in data.charcValues) {
                            let dateVal = data.charcValues[value].dateFrom;
                            let formattedDate;
                            if (dateVal !== null) {
                                formattedDate = DateTimeUtils.formatDate(dateVal.split("T")[0]);
                                val = formattedDate + ", ";
                            } else {
                                val = dateVal + ", "
                            }
                            allowedValues = allowedValues + val;
                        }
                        break;
                    case "NUM":
                        let isDecimal = data.charcDecimals;
                        for (value in data.charcValues) {
                            if (isDecimal) {
                                val = data.charcValues[value].fltpValueFrom + ", ";
                                allowedValues = allowedValues + val;
                            } else {
                                val = data.charcValues[value].decimalFrom + ", ";
                                allowedValues = allowedValues + val;
                            }
                        }
                        break;
                    case "TIME":
                        for (value in data.charcValues) {
                            let timeVal = data.charcValues[value].timeFrom;
                            let formattedTime;
                            if (timeVal !== null) {
                                formattedTime = (timeVal.split("T")[1]).substr(0, 8);
                                val = formattedTime + ", ";
                            } else {
                                val = timeVal + ", "
                            }
                            allowedValues = allowedValues + val;
                        }
                        break;
                }
                data.displayAllowedValues = allowedValues.substr(0, allowedValues.length - 2);
            } else {
                data.displayAllowedValues = "";
            }
            return data;
        }
    });
}, true);