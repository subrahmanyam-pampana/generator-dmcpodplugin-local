sap.ui.define([
    "sap/m/MessageBox",
    "sap/ui/model/resource/ResourceModel"
], function(MessageBox, ResourceModel) {
    "use strict";

    // Identifies if any changes have been detected
    let bHasChanged = false;
    let sCustomWarningMessage = "";

    let _oPopoverWrapper = {
        _oPopover: null,

        init: function(fnDiscardCallback) {
            if (!this._oPopover) {
                this._oPopover = sap.ui.xmlfragment("sap.dm.dme.fragment.DiscardChangesPopover");
                this._oPopover.getContent()[1].attachPress(fnDiscardCallback);
            }
        },

        openBy: function(oControl) {
            this._oPopover.openBy(oControl);
        },

        close: function() {
            this._oPopover.close();
        }
    };

    let unsavedChangesCheck = {

        /***
         * Display the Record Changed confirmation dialog
         * @param fnCallback to call when OK is clicked
         * @returns
         */
        _showMessageBox: function(fnCallback) {
            let oWarningMsg = this._getUnsavedWarningMessage();
            MessageBox.warning(oWarningMsg.message, {
                styleClass: "sapUiSizeCompact",
                actions: [oWarningMsg.button, MessageBox.Action.CANCEL],
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
            let sWarningMsg = this._getCustomUnsavedWarningMessage();
            let oResourceModel = new ResourceModel({
                bundleName: "sap.dm.dme.i18n.global"
            });
            if (!sWarningMsg) {
                sWarningMsg = oResourceModel.getResourceBundle().getText("message.confirmUnsavedData");
            }
            //Reset Custom Warning Message
            this._setCustomUnsavedWarningMessage("");

            return {
                message: sWarningMsg,
                button: oResourceModel.getResourceBundle().getText("common.leave.btn")
            };
        },

        /***
         * Returns the Custom Unsaved Warning Message
         * @returns
         */
        _getCustomUnsavedWarningMessage: function() {
            return sCustomWarningMessage;
        },

        /***
         * Ser the Custom Unsaved Warning Message
         * @returns
         */
        _setCustomUnsavedWarningMessage: function(sMessage) {
            sCustomWarningMessage = sMessage;
        },

        /***
         * Resets the unsaved changes (for AJAX populated fields)
         *  - resets the oData model changes (for those fields that are oData-only
         *  - Sets the hasChanged flag to false
         * @param oModel model to be reset
         */
        _resetTracking: function(oModel) {
            if (oModel && oModel.resetChanges) {
                oModel.resetChanges();
            }
            bHasChanged = false;
        },

        /**
         * If changes are detected, handle displaying a message box and reset the model changes
         * @param oModel is the provided model
         * @param fnProceed the function to invoke if the user selects to discard changes and proceed with page leave
         * @param fnCancel the function to invoke if the user selects cancel and stays on the page; optional parameter
         */
        confirmPageLeave: function(oModel, fnProceed, fnCancel) {
            let that = this;

            if ((oModel.hasPendingChanges && oModel.hasPendingChanges()) || this.isChangeDetected()) {
                this._showMessageBox(function(bLeave) {
                    if (bLeave) {
                        that._resetTracking(oModel);
                        fnProceed();
                    } else if (fnCancel) {
                        fnCancel();
                    }
                });
            } else {
                fnProceed();
            }
        },

        /**
         * If changes are detected, handle displaying a message popover and reset the model changes
         * @param oModel is the provided model
         * @param oControl is the control the message popover will be connected to
         * @param fnDiscard the function to invoke if the user selects to discard changes; optional parameter
         * @param oCustomPopover the custom popover object usually passed in unit tests; optional parameter
         */
        discardChanges: function(oModel, oControl, fnDiscard, oCustomPopover) {
            let that = this;

            if (!oModel.hasPendingChanges() && !this.isChangeDetected()) {
                return;
            }

            let oPopover = oCustomPopover || _oPopoverWrapper;

            oPopover.init(function() {
                that._resetTracking(oModel);
                if (fnDiscard) {
                    fnDiscard();
                }
                oPopover.close();
            });

            oPopover.openBy(oControl);
        },

        /***
         * If changes are detected, handle displaying a message and reset the List index
         * @param oModel is the provided model
         * @param fnProceed the function to invoke if the user selects ok
         * @param fnCancel the function to invoke if the user selects cancel
         * @deprecated duplicates confirmPageLeave method extended with cancel callback
         */
        confirmPageLeaveSelectionRestore: function(oModel, fnProceed, fnCancel) {
            let that = this;
            if (oModel.hasPendingChanges() || this.isChangeDetected()) {
                this._showMessageBox(function(bLeave) {
                    if (bLeave) {
                        that._resetTracking(oModel);
                        fnProceed();
                    } else {
                        fnCancel();
                    }
                });
            } else {
                fnProceed();
            }
        },

        /***
         * Return if a change has been detected
         */
        isChangeDetected: function() {
            return bHasChanged;
        },

        /***
         * Set that a change was detected from the event bus
         */
        _setChangeDetected: function() {
            bHasChanged = true;
        },

        /***
         * Reset the bHasChanged flag
         */
        _resetChange: function() {
            bHasChanged = false;
        }

    };

    sap.ui.getCore().getEventBus().subscribe("sap.dm.dme.UnsavedChangesChannel", "ChangeDetected", unsavedChangesCheck._setChangeDetected, unsavedChangesCheck);
    sap.ui.getCore().getEventBus().subscribe("sap.dm.dme.UnsavedChangesChannel", "ResetChange", unsavedChangesCheck._resetChange, unsavedChangesCheck);

    return unsavedChangesCheck;
});