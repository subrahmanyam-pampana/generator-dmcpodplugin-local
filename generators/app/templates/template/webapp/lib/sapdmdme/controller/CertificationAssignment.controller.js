sap.ui.define([
    "sap/dm/dme/controller/Base.controller",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/browse/CertificationBrowse",
    "sap/dm/dme/formatter/StatusFormatter"
], function(BaseController, JSONModel, CertificationBrowse, StatusFormatter) {
    "use strict";

    return BaseController.extend("sap.dm.dme.controller.CertificationAssignment", {
        statusFormatter: StatusFormatter,

        getCertifications: function() {
            return this.getModel("auxData").getProperty("/certifications");
        },

        setCertifications: function(aCertifications) {
            return this.getModel("auxData").setProperty("/certifications", aCertifications);
        },

        convertFromPayload: function(aPayload) {
            let aCertifications = aPayload.map(function(oItem) {
                return {
                    ref: oItem.ref,
                    name: oItem.certification,
                    description: oItem.description,
                    status: oItem.status
                };
            });
            this.setCertifications(aCertifications);
        },

        convertToPayload: function() {
            return this.getCertifications().map(function(oItem) {
                return {
                    ref: oItem.ref,
                    certification: oItem.name,
                    description: oItem.description,
                    status: oItem.status
                };
            });
        },

        onAddCertification: function() {
            CertificationBrowse.open(this.getView(), null, this.addCertification.bind(this), this.getModel("plant"));
        },

        onDeleteCertification: function(oEvent) {
            let oRow = oEvent.getParameter("listItem");
            let sRef = oRow.getBindingContext("auxData").getProperty("ref");
            this.deleteCertification(sRef);
        },

        addCertification: function(oNewItem) {
            let aCertifications = this.getCertifications();
            let aExist = aCertifications.filter(function(oItem) {
                return oItem.ref === oNewItem.ref;
            });

            if (aExist.length > 0) {
                return null;
            } // don't add item that already exists

            aCertifications.push(oNewItem);
            this.setCertifications(aCertifications);
        },

        deleteCertification: function(sRef) {
            let aCertifications = this.getCertifications();
            aCertifications = aCertifications.filter(function(oItem) {
                return oItem.ref !== sRef;
            });
            this.setCertifications(aCertifications);
        }
    });
}, true);