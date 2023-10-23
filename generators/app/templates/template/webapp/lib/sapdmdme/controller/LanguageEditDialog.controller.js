/**
 * Controller for the  LanguageEditDialog fragment. Provides methods for moving objects between
 * the available table and the assigned table. Both drag and drop and manual object
 * move is supported.
 *
 * This control only supports desktop and tablet.
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/LocaleData",
    "sap/ui/core/Locale",
    "sap/ui/model/resource/ResourceModel"
], function(BaseObject, JSONModel, LocaleData, Locale, ResourceModel) {
    "use strict";
    let DESCRIPTIONS_MODEL = "descriptionsModel";
    let LANGUAGES_MODEL = "supportLanguagesModel";
    let JSON_SOURCE_LANGUAGES_MODEL = "multiLanguageSupportModel";
    let VIEW_MODEL = "viewModel";

    let LanguageEditDialogType = BaseObject.extend("sap.dm.dme.controller.LanguageEditDialog", {

        constructor: function(sId, mSettings) {
            this.oView = mSettings.oParentView;
            this._fnCallback = mSettings.fnSaveCallback;
            this._sBaseId = mSettings.oParentView.getId() + "--" + sId;
            this._oParentDescriptionsData = mSettings.oParentDescriptionsData || [];
            this._oDialog = sap.ui.xmlfragment(this._sBaseId, "sap.dm.dme.fragment.LanguageEditDialog", this);
            this.createModel(this._convertDescriptionsModelToEdit(this._oParentDescriptionsData), DESCRIPTIONS_MODEL);
            this.createModel(this._getListOfLanguagesWithLocale(), LANGUAGES_MODEL);
            this.createModel({
                bIsChangesDetected: false,
                bIsDuplicateDetected: false,
                bIsBlankDescriptionDetected: false
            }, VIEW_MODEL);
            this.getView().addDependent(this.getDialog());
            this.getDialog().open();
        },

        getView: function() {
            return this.oView;
        },

        getDialog: function() {
            return this._oDialog;
        },

        /**
         * Creates all dialog models.
         * @param {Object} oWieData - WI element data.
         */
        createModel: function(oData, sModelName) {
            this.setModel(new JSONModel(oData), sModelName);
        },

        setModel: function(oModel, sName) {
            this.getDialog().setModel(oModel, sName);
        },

        getModel: function(sModelName) {
            return this.getDialog().getModel(sModelName);
        },

        /**
         * Returns object with translated language names. Keys are language code names
         * nand values are translated into current locale language names
         * @returns {object}
         * */
        _getTranslatedLanguageList: function() {
            let sLocaleName = sap.ui.getCore().getConfiguration().getLanguage();
            return new LocaleData(new Locale(sLocaleName)).getLanguages();
        },

        _getListOfLanguagesWithLocale: function() {
            let aTranslatedLanguageList = this._getTranslatedLanguageList();
            let aData = this.getView().getModel(JSON_SOURCE_LANGUAGES_MODEL).getData();

            let aListOfLanguagesWithLocale = aData.map(function(oLanguage) {
                // in SAPUI5, due to ABAP compatability, we have 'zf' language name instead of 'zh_Hant' for international code
                let sFixedLanguageName = oLanguage.locale === "zf" ? "zh_Hant" : oLanguage.locale;
                return {
                    "locale": oLanguage.locale,
                    "description": aTranslatedLanguageList[sFixedLanguageName]
                };
            });

            return aListOfLanguagesWithLocale;
        },

        _convertDescriptionsModelToEdit: function(aData) {
            return aData.map(function(oItem) {
                return {
                    description: oItem.description,
                    locale: oItem.locale,
                    bEditLanguage: false,
                    bEditDescription: false
                };
            });
        },

        _convertDescriptionsModelToParent: function(aData) {
            return aData.map(function(oItem) {
                return {
                    description: oItem.description,
                    locale: oItem.locale
                };
            });
        },

        /**
         * Handles the selection cancel event on pressing Cancel button
         */
        onCancelEdit: function() {
            let that = this;
            if (this._getChangesDetected()) {
                this._showUnsavedMessageBox(function(bLeave) {
                    if (bLeave) {
                        that._oDialog.close();
                    }
                });
            } else {
                this._oDialog.close();
            }
        },

        /***
         * Display the Record Changed confirmation dialog
         * @param fnCallback to call when OK is clicked
         * @returns
         */
        _showUnsavedMessageBox: function(fnCallback) {
            let oWarningMsg = this._getUnsavedWarningMessage();
            sap.m.MessageBox.warning(oWarningMsg.message, {
                styleClass: "sapUiSizeCompact",
                actions: [oWarningMsg.button, sap.m.MessageBox.Action.CANCEL],
                onClose: function(oAction) {
                    fnCallback(oAction === oWarningMsg.button);
                }
            });
        },

        /***
         * Returns the Unsaved Warning Message
         * @returns
         */
        _getUnsavedWarningMessage: function() {
            let oResourceModel = new ResourceModel({
                bundleName: "sap.dm.dme.i18n.global"
            });
            return {
                message: oResourceModel.getResourceBundle().getText("message.confirmUnsavedData"),
                button: oResourceModel.getResourceBundle().getText("common.leave.btn")
            };
        },

        /**
         * Get Description for Current Locale to show in Parent Detail
         */
        _getCurrentLocaleDescription: function() {
            let sLocaleName = sap.ui.getCore().getConfiguration().getLanguage();
            let sDescription = "";

            jQuery.each(this.getModel(DESCRIPTIONS_MODEL).getData(), function(iIndex, oItem) {
                if (oItem.locale === sLocaleName) {
                    sDescription = oItem.description;
                    return false;
                }
            });

            return sDescription;
        },

        /**
         * Handles the apply event on pressing Apply button
         */
        onApplyLanguages: function() {
            if (this._getChangesDetected()) {
                this._validateBlankValue();
                if (!this._getErrorsDetected()) {
                    this._fnCallback(this._convertDescriptionsModelToParent(this.getModel(DESCRIPTIONS_MODEL).getData()),
                        this._getCurrentLocaleDescription());
                    this._publishTrackingChange();
                    this._oDialog.close();
                }
            } else {
                this._oDialog.close();
            }
        },

        /**
         * Handles the edit event on pressing Edit button
         */
        onEditRow: function(oEvent) {
            let iRowIndex = oEvent.getSource().getParent().getBindingContextPath(DESCRIPTIONS_MODEL).split("/")[1];
            let oModel = this.getModel(DESCRIPTIONS_MODEL);
            let aData = oModel.getData();
            aData[iRowIndex].bEditDescription = true;
            oModel.checkUpdate();
        },

        /**
         * Handles the delete event on pressing Delete button
         */
        onDeleteRow: function(oEvent) {
            let iRowIndex = oEvent.getSource().getParent().getBindingContextPath(DESCRIPTIONS_MODEL).split("/")[1];
            let oModel = this.getModel(DESCRIPTIONS_MODEL);
            let aData = oModel.getData();
            aData.splice(iRowIndex, 1);
            oModel.checkUpdate();
            this._setChangesDetected(true);
        },

        /**
         * Displays the input error as a MessageBox
         * @param sMessage string containing message to display
         * @private
         */
        _showErrorMessage: function(sMessage) {
            sap.m.MessageBox.error(sMessage);
        },

        /**
         * Handles the add event on pressing Add button
         */
        onClickAddLanguage: function() {
            let oModel = this.getModel(DESCRIPTIONS_MODEL);
            let aData = oModel.getData();
            let aAddObject = {
                description: "",
                locale: "",
                bEditLanguage: true,
                bEditDescription: true
            };

            let aDistinctLanguageList = this._getListOfDistinctLanguages(aData);
            if (aDistinctLanguageList[0]) {
                aAddObject.locale = aDistinctLanguageList[0].locale;
            }

            aData.push(aAddObject);
            oModel.checkUpdate();
        },

        /***
         * Set the Error State of the control.
         * @param {object} oControl : Control
         */
        _setErrorState: function(oControl) {
            oControl.setValueStateText(this._getGlobalI18nText("message.duplicateLanguageDescrError"));
            oControl.setValueState(sap.ui.core.ValueState.Error);
        },

        /***
         * Clear the Error State of the control.
         * @param {object} oControl : Control
         */
        _clearErrorState: function(oControl) {
            if (oControl.getValueState() === sap.ui.core.ValueState.Error) {
                oControl.setValueStateText("");
                oControl.setValueState(sap.ui.core.ValueState.None);
            }
        },

        /**
         * Getter for text from the GLOBAL resource bundle.
         * @param {string} sKey : the property name
         * @param {array} aArgs : i18n arguments
         * @returns {string} i18n Text
         */
        _getGlobalI18nText: function(sKey, aArgs) {
            return this.getView().getModel("i18n-global").getResourceBundle().getText(sKey, aArgs);
        },

        /**
         * Check duplicates Language
         */
        _validateLanguageSelection: function(oItemKey) {
            let iCount = 0;
            jQuery.each(this.getModel(DESCRIPTIONS_MODEL).getData(), function(iIndex, oItem) {
                if (oItemKey === oItem.locale) {
                    iCount++;
                }
                if (iCount > 1) {
                    return false;
                }
            });

            return iCount > 1;
        },

        /**
         * Handles on change language
         */
        onChangeLanguageSelection: function(oEvent) {
            let oControl = oEvent.getSource();
            if (!(this._validateLanguageSelection(oControl.getSelectedItem().getProperty("key")))) {
                this._clearErrorState(oControl);
                this._setChangesDetected(true);
                this._setDuplicateDetected(false);
            } else {
                this._setErrorState(oControl);
                this._setChangesDetected(false);
                this._setDuplicateDetected(true);
            }
        },

        /**
         * Handles on change description
         */
        onChangeLanguageDesc: function() {
            this._setChangesDetected(true);
        },

        /**
         * Set Change Detected flag
         */
        _setChangesDetected: function(bValue) {
            let oModel = this.getModel(VIEW_MODEL);
            oModel.setProperty("/bIsChangesDetected", bValue);
            oModel.checkUpdate();
        },

        /**
         * Set Duplicate Error Detected flag
         */
        _setDuplicateDetected: function(bValue) {
            let oModel = this.getModel(VIEW_MODEL);
            oModel.setProperty("/bIsDuplicateDetected", bValue);
            oModel.checkUpdate();
        },

        /**
         * Set Duplicate Error Detected flag
         */
        _setBlankDescriptionDetected: function(bValue) {
            let oModel = this.getModel(VIEW_MODEL);
            oModel.setProperty("/bIsBlankDescriptionDetected", bValue);
            oModel.checkUpdate();
        },

        /**
         * Get Change Detected flag
         */
        _getChangesDetected: function() {
            return this.getModel(VIEW_MODEL).getProperty("/bIsChangesDetected");
        },

        /***
         * Check Blank Descriptions
         */
        _validateBlankValue: function() {
            let oModel = this.getModel(DESCRIPTIONS_MODEL);
            let aData = oModel.getData();
            let aResult = aData.filter(function(item) {
                return !item.description;
            });

            if (aResult.length) {
                this._setBlankDescriptionDetected(true);
            } else {
                this._setBlankDescriptionDetected(false);
            }
        },

        /**
         * Get Errors Detected flag
         */
        _getErrorsDetected: function() {
            if (this._getDuplicateDetected()) {
                this._showErrorMessage(this._getGlobalI18nText("message.duplicateLanguageDescrError"));
                return true;
            }
            if (this._getBlankDescriptionDetected()) {
                this._showErrorMessage(this._getGlobalI18nText("message.blankLanguageDescrError"));
                return true;
            }

            return false;
        },

        /**
         * Get Duplicate Detected flag
         */
        _getDuplicateDetected: function() {
            return this.getModel(VIEW_MODEL).getProperty("/bIsDuplicateDetected");
        },

        /**
         * Get Duplicate Detected flag
         */
        _getBlankDescriptionDetected: function() {
            return this.getModel(VIEW_MODEL).getProperty("/bIsBlankDescriptionDetected");
        },

        /***
         * Publish Tracking Change for ChangeDetected event
         */
        _publishTrackingChange: function() {
            sap.ui.getCore().getEventBus().publish("sap.dm.dme.UnsavedChangesChannel", "ChangeDetected");
        },

        /***
         * Get list of languages
         */
        _getListOfDistinctLanguages: function(aData) {
            let aDistinctLanguagesList = JSON.parse(
                JSON.stringify(
                    this._getListOfLanguagesWithLocale()
                )
            );

            if (aDistinctLanguagesList.length > 0) {
                jQuery.each(aData, function(iIndex1, oItem1) {
                    jQuery.each(aDistinctLanguagesList, function(iIndex2, oItem2) {
                        if (oItem1.locale === oItem2.locale) {
                            aDistinctLanguagesList.splice(iIndex2, 1);
                            return false;
                        }
                    });
                });
            }

            return aDistinctLanguagesList;
        },

        /**
         * Handles the dialog close event. Fired on pressing Esc keyboard button too.
         */
        onClose: function() {
            this.getView().removeDependent(this.getDialog());
            this.getDialog().destroy();
            this.destroy();
        }
    });

    return {
        /**
         * Instantiates and opens the dialog.
         * @param {sap.ui.core.Element} oView the parent view this dialog will be set as dependent.
         * @param {Object} oParentData - Data of parent control.
         * @param fnSaveCallback - callback function called when user presses save.
         */
        open: function(oView, oParentData, fnSaveCallback) {
            return new LanguageEditDialogType("languageEditDialog", {
                oParentView: oView,
                oParentDescriptionsData: oParentData,
                fnSaveCallback: fnSaveCallback
            });
        }
    };
});