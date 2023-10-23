sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/ui/vk/ContentResource"
], function(BaseObject, JSONModel, ContentResource) {
    "use strict";
    const aImgMimeTypes = [
        "application/vds",
        "application/pdf",
        "image/png",
        "image/gif",
        "image/jpg",
        "image/jpeg",
        "image/jpe",
        "image/jif",
        "image/jfif",
        "image/jfi"
    ];
    const aImgFileExtensions = [
        ".VDS",
        ".PDF",
        ".PNG",
        ".GIF",
        ".JPG",
        ".JPEG",
        ".JPE",
        ".JIF",
        ".JFIF",
        ".JFI"
    ];
    const fragmentName = "sap.dm.dme.fragment.WorkInstructionElementPreview";
    const WIE_MODEL_NAME = "wieModel";
    const WI_ELEMENT_TITLE = "common.workInstructionElement.title";
    let WorkInstructionElementPreview = BaseObject.extend("sap.dm.dme.controller.WorkInstructionElementPreview", {

        constructor: function(sId, mSettings) {
            this._oParentView = mSettings.oParentView;
            this._sWiRestSource = mSettings.sWiRestSource;
            this._sLocalFileSource = mSettings.sLocalFileSource;
            this._sBaseId = mSettings.oParentView.getId() + "--" + sId;
            this._i18n = mSettings.i18n || this._oParentView.oParent.oPropagatedProperties.oModels.i18n.getResourceBundle();
            this._oDialog = sap.ui.xmlfragment(this._sBaseId, fragmentName, this);
            this._oParentView.addDependent(this._oDialog);
            this.createDialogModels(mSettings.oWieData);
            this._setDialogContent(this.getElementModel());
            // oPopup is not null when attachment viewed as a popup.
            // The check is required to eliminate focus related exceptions when attachment is viewed in a new window.
            if (this._oDialog.oPopup) {
                this._oDialog.open();
            }
        },

        /**
         * Handles the dialog close event. Fired on pressing Esc keyboard button too.
         */
        onClose: function() {
            this._oParentView.removeDependent(this._oDialog);
            this._oDialog.destroy();
            this.destroy();
        },

        /**
         * Creates all dialog models.
         */
        createDialogModels: function(oWieData) {
            this.setModel(new JSONModel(oWieData), WIE_MODEL_NAME);
            let oWieModel = this.getElementModel();
            oWieModel.setProperty("/isText", false);
            oWieModel.setProperty("/isPdf", false);
            oWieModel.setProperty("/is3D", false);
            oWieModel.setProperty("/isHeaderText", false);
            oWieModel.setProperty("/description", oWieData.description || oWieData.Description);
            oWieModel.setProperty("/mimeType", "");
        },

        setModel: function(oModel, sName) {
            this._oDialog.setModel(oModel, sName);
        },

        getElementModel: function() {
            return this._oDialog.getModel(WIE_MODEL_NAME);
        },

        /**
         * Returns dialog's control by ID.
         */
        byId: function(sId) {
            return sap.ui.getCore().byId(this._getFullId(sId));
        },

        /**
         * Constructs full ID for getting control by ID using sap.ui.core.Core.byId method.
         */
        _getFullId: function(sId) {
            return this._sBaseId + "--" + sId;
        },

        onWorkInstructionElementPreviewClose: function() {
            this.onClose();
        },

        /**
         * Temporary: For TEST: getting files from customer ENV via DS & SCC
         */
        _setDialogContent: function(oModel) {
            let oWiElementData = oModel.oData;
            switch (oWiElementData.type) {
                case "FILE":
                    this._createFilePreview(oWiElementData);
                    break;
                case "LOCAL_FILE":
                    this._createFilePreview(oWiElementData);
                    break;
                case "TEXT":
                    this._createTextPreview(oWiElementData);
                    break;
                case "HEADER_TEXT":
                    this._createHeaderTextPreview(oWiElementData);
                    break;
                case "URL":
                    window.open(oWiElementData.url, "_blank");
                    this.onClose();
                    break;
            }
        },

        _createFilePreview: function(oData) {
            let sMimeType = this._getMimeType(oData);

            if (sMimeType === "application/pdf") {
                this._createPdfViewer(oData);
            } else if (sMimeType === "application/vds") {
                this._create3DViewer(oData, true);
            } else if (aImgMimeTypes.indexOf(sMimeType) !== -1) {
                this._create3DViewer(oData, false);
            } else {
                window.open(this._getFileExternalUrl(oData.ref), "_blank");
                this.onClose();
            }
        },

        _getFileExtensions: function(oData, nValue) {
            let sFileExtension;
            if (oData.fileName) {
                sFileExtension = oData.fileName.slice(oData.fileName.length - nValue).toUpperCase();
            } else {
                sFileExtension = oData.url.slice(oData.url.length - nValue).toUpperCase();
            }
            return sFileExtension;
        },

        _getMimeType: function(oData) {
            let sMimeType;
            if (!oData.mimeType) {
                let iIndex = this._getMimeTypeIndex(oData);
                sMimeType = aImgMimeTypes[iIndex] || "";
            } else {
                sMimeType = oData.mimeType;
            }
            this.getElementModel().setProperty("/mimeType", sMimeType);
            return sMimeType;
        },

        _getMimeTypeIndex: function(oData) {
            let iIndex = aImgFileExtensions.indexOf(this._getFileExtensions(oData, 4));
            if (iIndex < 0) {
                iIndex = aImgFileExtensions.indexOf(this._getFileExtensions(oData, 5));
            }
            return iIndex;
        },

        _createPdfViewer: function(oData) {
            if (!oData.newWindow) {
                this.getElementModel().setProperty("/isPdf", true);
                this.byId("pdfPreview").setSource(this._getFileExternalUrl(oData.ref));
            } else {
                this._openFileInNewTab(oData.ref, WI_ELEMENT_TITLE);
                this.onClose();
            }
        },

        _create3DViewer: function(oData, is3DModel) {
            if (is3DModel || !oData.newWindow) {
                this._setupViewer(oData, is3DModel);
            } else {
                this._openFileInNewTab(oData.ref, "workInstructionViewer.toolbar.image");
                this.onClose();
            }
        },

        _setupViewer: function(oData, bIs3DModel) {
            let o3DViewer = this.byId("3DPreview");
            this.getElementModel().setProperty("/is3D", true);
            o3DViewer.setShowSceneTree(bIs3DModel);
            o3DViewer.setEnableToolbar(bIs3DModel);
            o3DViewer.addContentResource(new ContentResource({
                source: this._getFileExternalUrl(oData.ref),
                sourceId: "abc",
                sourceType: bIs3DModel ? "vds" : this._getImageSourceType()
            }));
        },

        _getImageSourceType: function() {
            let sMimeTipe = this.getElementModel().getProperty("/mimeType");
            let imgType = sMimeTipe.substr(6);
            // 3D viewer can open different jpeg formats (jpe, jif etc)
            // but sourceType needs to be set to jpg
            let jpegMimeTypes = ["image/jpeg", "image/jpe", "image/jif", "image/jfif", "image/jfi"];
            return (jpegMimeTypes.indexOf(sMimeTipe) !== -1) ? "jpg" : imgType;
        },

        _createTextPreview: function(oData) {
            if (!oData.newWindow) {
                let sText = oData.text;
                if (this._isHtml(sText)) {
                    this._createHtmlTextViewer(sText);
                } else {
                    this._createTextViewer(sText);
                }

            } else {
                this._openTextInNewTab(oData.text, WI_ELEMENT_TITLE);
                this.onClose();
            }
        },

        _isHtml: function(sText) {
            return sText.slice(-20).indexOf("</") > -1;
        },

        _createHtmlTextViewer: function(sText) {
            let oHtmlTextViewer = this.byId("htmlTextPreview");
            let oWieModel = this.getElementModel();
            oWieModel.setProperty("/isText", true);
            oHtmlTextViewer.setContent(sText);
        },

        _createTextViewer: function(sText) {
            let oTextViewer = this.byId("textPreview");
            let oWieModel = this.getElementModel();
            oWieModel.setProperty("/isText", true);
            oTextViewer.setText(sText);
        },

        _createHeaderTextPreview: function(oData) {
            if (!oData.newWindow) {
                let oTextViewer = this.byId("headerTextPreview");
                let oWieModel = this.getElementModel();
                oWieModel.setProperty("/isHeaderText", true);
                oTextViewer.setText(oData.text);
            } else {
                this._openTextInNewTab(oData.text, WI_ELEMENT_TITLE);
                this.onClose();
            }
        },

        _openFileInNewTab: function(sRef, sKey) {
            let oWindow = window.open(this._getFileExternalUrl(sRef));
            if (oWindow) {
                jQuery(oWindow.document).find("head").append("<title>" + this._i18n.getText(sKey) + "</title>");
            }
        },

        _openTextInNewTab: function(sText, sKey) {
            let textWindow = window.open();
            if (textWindow) {
                jQuery(textWindow.document).find("head").append("<title>" + this._i18n.getText(sKey) + "</title>");
                jQuery(textWindow.document).find("body").append(sText);
            }
        },

        _getFileExternalUrl: function(sWiElementRef) {
            let sUri;
            let oModel = this.getElementModel();
            if (oModel.getProperty("/type") === "LOCAL_FILE") {
                sUri = this.getDataSourceLocalFileUri() + oModel.getProperty("/url");
            } else {
                sUri = this.getDataSourceUri() + "fileStorage/" + sWiElementRef;
            }

            return sUri;
        },

        getDataSourceUri: function() {
            return this._sWiRestSource;
        },

        getDataSourceLocalFileUri: function() {
            return this._sLocalFileSource;
        },

        formatTitle: function(sTitle, sValue, sType) {
            return sValue ? sTitle + ": " + sValue : sTitle + ": " + this.formatWiElementText(sType);
        },

        formatWiElementText: function(sType) {
            return this._i18n.getText("enum.workInstructionElementType." + sType);
        }

    });

    return {

        /**
         * Instantiates and opens work instruction element preview.
         * @param {sap.ui.core.Element} oParentView - value help dialog will be set as dependent to it.
         */
        open: function(oParentView, oWieData, sWiRestSourcePath, sLocalFileSourcePath, oBundle) {
            return new WorkInstructionElementPreview("workInstructionElementPreview", {
                oParentView: oParentView,
                oWieData: oWieData,
                sWiRestSource: sWiRestSourcePath,
                sLocalFileSource: sLocalFileSourcePath,
                i18n: oBundle
            });
        }
    };
});