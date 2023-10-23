sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/model/AjaxUtil",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel"
], function(BaseObject, AjaxUtil, JSONModel, ResourceModel) {
    "use strict";
    let CLASS_DATA_MODEL = "classificationClassData";
    let CLASS_DESCRIPTION = "classDescription";
    return BaseObject.extend("sap.dm.dme.model.ClassificationClasses", {

        getClassDetails: function(sServiceUrl, oView, objectType, objectKey) {
            this.view = oView;
            this.oClassDataTable = oView.byId("classificationClassTable");
            this.url = sServiceUrl;
            if (this.oClassDataTable) {
                let classUrl = sServiceUrl + "AssignmentHeaders";
                let classParameters = "$filter=objectType eq '" + objectType + "' and objectKey eq '" + objectKey + "'";
                this.oClassDataTable.setModel(new JSONModel(), CLASS_DATA_MODEL);
                oView.byId("classDescription").setModel(new JSONModel(), CLASS_DESCRIPTION);
                this.oClassDataTable.setBusy(true);

                AjaxUtil.get(classUrl, classParameters, this.successCallback.bind(this), this.errorHandler.bind(this));
            }
        },

        errorHandler: function(oError, sHttpErrorMessage) {
            this.oClassDataTable.setBusy(false);
            sap.m.MessageBox.error(oError.error.message || sHttpErrorMessage);
        },

        setDataToTable: function(oData) {
            let oResourceModel = new ResourceModel({
                bundleName: "sap.dm.dme.i18n.global"
            });
            for (let elem of oData) {
                elem.isExternalClass = elem.localClass ? oResourceModel.getResourceBundle().getText("YES") : oResourceModel.getResourceBundle().getText("NO");
            }
            this.oClassDataTable.getModel(CLASS_DATA_MODEL).setData(oData);
            this.oClassDataTable.setBusy(false);
        },

        getLocaleFromElement: function(oClassTexts, oElement) {
            return oClassTexts[oElement].classHeaderTId.language.toUpperCase();
        },

        setLocaleData: function(oClassTexts, oData, vd, locale) {
            let enModel = null;
            let vDescription = null;
            for (let element in oClassTexts) {
                if (this.getLocaleFromElement(oClassTexts, element) === locale.toUpperCase()) {
                    vDescription = oClassTexts[element];
                    oData[vd].localeSpecificText = vDescription.description;
                    break;
                } else {
                    if (this.getLocaleFromElement(oClassTexts, element) === "EN") {
                        enModel = oClassTexts[element];
                    }
                }
            }
            return [oData, vDescription, enModel];
        },

        setLocaleSpecificDescription: function(oData, locale) {
            let enModel = null;
            let vDescription = null;
            let classTexts;
            for (let vd in oData) {
                classTexts = oData[vd].classTexts;
                if (classTexts.length !== 0) {
                    let processed = this.setLocaleData(classTexts, oData, vd, locale, vDescription, enModel);
                    oData = processed[0];
                    vDescription = processed[1];
                    enModel = processed[2];
                }
                if (vDescription === null && enModel !== null) {
                    vDescription = enModel;
                    oData[vd].localeSpecificText = vDescription.description;
                }
            }
            return oData;
        },

        successCallback: function(oData) {
            let data = oData.value;
            let charactersticUrl = this.url + "ClassHeaders";
            let charactersticParameters = "$filter=";
            if (data.length !== 0) {
                for (let element in data) {
                    let parameter = "classInternalId eq " + "'" + data[element].classInternalId + "'" + " or ";
                    charactersticParameters = charactersticParameters + parameter;
                }

                AjaxUtil.get(charactersticUrl, charactersticParameters.substr(0, charactersticParameters.length - 4), function(oData) {
                    let vData = oData.value;
                    let locale = sap.ui.getCore().getConfiguration().getLocale().getLanguage();
                    vData = this.setLocaleSpecificDescription(vData, locale);
                    this.setDataToTable(vData);
                }.bind(this), this.errorHandler.bind(this));
            } else {
                this.setDataToTable(data);
            }
        },

        retriggerClassReplication: function(userId, plant, objectType, objectKey, classTypes, sUrl) {
            let oPayload = {
                "userId": userId,
                "plant": plant,
                "objectKey": objectKey,
                "objectType": objectType,
                "classTypes": classTypes
            };
            let url = sUrl + "replication";
            AjaxUtil.post(url, oPayload, function() {
                let oResourceModel = new ResourceModel({
                    bundleName: "sap.dm.dme.i18n.global"
                });
                sap.m.MessageToast.show(oResourceModel.getResourceBundle().getText("message.refreshSuccessful") +
                    "\n" + oResourceModel.getResourceBundle().getText("message.checkLog"));
            }, function(oError, sHttpErrorMessage) {
                sap.m.MessageBox.error(oError.error.message || sHttpErrorMessage);
            });
        }
    });
}, true);