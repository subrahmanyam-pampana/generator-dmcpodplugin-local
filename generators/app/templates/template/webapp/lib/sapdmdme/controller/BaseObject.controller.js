sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/dm/dme/controller/Base.controller",
    "sap/m/MessageItem",
    "sap/m/MessageBox",
    "sap/m/MessagePopover",
    "sap/m/ButtonType",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/message/ErrorHandler",
    "sap/dm/dme/model/AjaxUtil",
    "sap/dm/dme/controller/UnsavedChangesCheck",
    "sap/dm/dme/i18n/i18nBundles",
    "sap/dm/dme/model/CustomData",
    "sap/dm/dme/controller/ListManipulator",
    "sap/dm/dme/util/ServiceErrorAlert"
], function(Controller, BaseController, MessageItem, MessageBox, MessagePopover, ButtonType, JSONModel,
    ErrorHandler, AjaxUtil, UnsavedChangesCheck, Bundles, CustomData, ListManipulator, ServiceErrorAlert) {
    "use strict";

    let VIEW_MODEL_NAME = "viewModel";
    let logger = jQuery.sap.log.getLogger("dm.dme.BaseObject", jQuery.sap.log.Level.DEBUG);
    let LIST_MANIPULATOR_PREFIX = "attachment";
    let ATTACHMENTS_PATH = "/attachments";
    let ATTACHMENTS_COUNT_PATH = "/attachmentsCount";

    return BaseController.extend("sap.dm.dme.controller.BaseObject.controller", {
        _oAppLayout: null,
        _oPreviousLayoutType: null,
        _oAttachmentListManipulator: null,

        AUX_DATA_MODEL_NAME: "auxData",

        constructor: function() {
            this._aChangeTrackingControls = {};
            Controller.call(this);
        },

        onInit: function() {
            this._initRoutingForObjectCreate();
            this._initRoutingForObjectEdit();

            this.createViewModel();
            if (this._initMessagePopoverButton()) {
                this.oMessagePopover = this._initMessagePopover();
            }
            this._initToggleFullScreenButton();
            this.createAuxModel();
            this._initJsonFieldChangeTracking();
            this._initCustomData();
        },

        _initRoutingForObjectCreate: function() {
            // Only attach create handlers for 'create' type controller subclasses of BaseObject.controller
            if (this.onCreateObjectMatched) {
                let oRoute = this.getRoute("create");
                oRoute.attachPatternMatched(this.onCreateObjectMatched, this);
                oRoute.attachPatternMatched(this._prepareForCreate, this);
            }
        },

        _initRoutingForObjectEdit: function() {
            // Only attach create handlers for 'edit' type controller subclasses of BaseObject.controller
            if (this.onEditObjectMatched) {
                this.getRouter().getRoute("object").attachPatternMatched(this.onEditObjectMatched, this);
            }
        },

        validateFormFields: function(fnSuccessCallback) {
            ErrorHandler.validateFormFields(this.getView());

            if (ErrorHandler.hasErrors()) {
                this.setFocusTo("messagePopoverButton");
            } else {
                fnSuccessCallback();
            }
        },

        onExit: function() {
            this._oCustomData && this._oCustomData.destroy();
        },

        onCopy: function() {
            UnsavedChangesCheck.confirmPageLeave(this.getModel(), function() {
                this.setGlobalProperty("copiedData", this.getView().getBindingContext().getObject());

                if (this._oCustomData) {
                    this.setGlobalProperty("customValues", this._oCustomData.getCustomValues());
                }

                let aAttachments = this.getAuxModel().getProperty(ATTACHMENTS_PATH);
                aAttachments && this.setGlobalProperty("attachments", aAttachments);
                this.getOwnerComponent().getRouter().navTo("create", {}, false);
            }.bind(this));
        },

        onCreate: function() {
            this.validateFormFields(this._performCreate.bind(this));
        },

        onEdit: function() {
            this.validateFormFields(this._performEdit.bind(this));
        },

        _performEdit: function() {
            this.getView().setBusy(true);

            let oNewObject = this._createPayloadForCreateOrUpdate();
            let sEntitySetName = this.getOwnerComponent().getMasterEntitySetName();

            let sUrl = this.getModel().sServiceUrl + sEntitySetName + "('" + oNewObject.ref + "')";

            AjaxUtil.patch(sUrl, oNewObject,
                // success handler
                this._onEditSuccessHandler.bind(this),
                // error handler
                // TODO: re-think default server error handling; goal: -avoid 2 method parameters; -externalize to utils
                this._onEditErrorHandler.bind(this)
            );
        },

        _onEditSuccessHandler: function() {
            this.showMessageToast("message.updateSuccess");
            this.resetModelChanges();

            // Load the modified object from the backend by refreshing the binding. This will also
            // cause the master list to be refreshed so that it also displays the updated values.
            // How? Refreshing the binding causes _onDataReceived to be called, which publishes the
            // "RefreshAndSelect" event to the master list.
            this.getView().getBindingContext().getBinding().refresh();
        },

        /**
         * Validate value of related object. Use this in child to check blank value.
         * @param {string} sRelatedObjectId - Id of related object fragment.
         * @param {string} sRequiredMessage - Pop-up Required Message.
         */
        validateRelatedObjectBlankValue: function(sRelatedObjectId, sRequiredMessage) {
            let oResource = this.byId(sRelatedObjectId).getController().getObjectNameControl();
            if (oResource.getValue() === "") {
                oResource.fireValidationError({
                    element: oResource,
                    property: "value",
                    message: this.getLocalizedText(sRequiredMessage)
                });
            }
        },

        _createOrDeleteObjectErrorHandler: function(oError, sHttpErrorMessage, nStatus) {
            this.modifyDataErrorHandler(oError, sHttpErrorMessage, nStatus);
        },

        _onEditErrorHandler: function(oError, sHttpErrorMessage, nStatus) {
            this.modifyDataErrorHandler(oError, sHttpErrorMessage, nStatus);
        },

        modifyDataErrorHandler: function(oError, oHttpErrorMessage, nStatus) {
            this.getView().setBusy(false);
            const oBundleGlobal = this.getOwnerComponent().getModel("i18n-global").getResourceBundle();
            const sForbiddenErrorMessage = oBundleGlobal.getText("message.errorNoAccessToModifyData", this.getResourceBundle().getText("appTitle"));
            ServiceErrorAlert.showServiceErrorMessage({
                oError,
                oHttpErrorMessage,
                nStatus,
                sForbiddenErrorMessage
            });
        },

        onDelete: function() {
            let bCurrentVersion = this.getView().getBindingContext() ? this.getView().getBindingContext().getProperty("currentVersion") : this._getCurrentVersionWithoutOData();
            this._confirmDeletion(this._deleteObject.bind(this), bCurrentVersion);
        },

        _getCurrentVersionWithoutOData: function() {
            return null;
        },

        onCancelCreate: function(oEvent) {
            UnsavedChangesCheck.confirmPageLeave(this.getModel(), function() {
                this._setKeyFieldsBusyIndicator(false);
                this.setGlobalProperty("creationInProgress", false);
                this.navigateToPreviousObject("masterList");
            }.bind(this));
        },

        onCancelEdit: function(oEvent) {
            UnsavedChangesCheck.confirmPageLeave(this.getModel(), function() {
                this.getRouter().navTo("masterList", {}, true);
            }.bind(this));
        },

        onFullScreenToggle: function(oEvent) {
            let oLayoutToggleButton = oEvent.getSource();
            let oAppLayout = this._getAppLayout();
            let oLayoutType = oAppLayout.getLayout();
            if (oLayoutType === "ThreeColumnsEndExpanded" || oLayoutType === "EndColumnFullScreen") {
                if (oLayoutType === "EndColumnFullScreen") {
                    // Exit full screen
                    this.exitFullScreen(oLayoutToggleButton, oAppLayout);
                } else {
                    // Go to full screen
                    this._setPreviousAppLayoutType(oLayoutType);
                    oAppLayout.setLayout("EndColumnFullScreen");
                    this.changeToggleButton(oLayoutToggleButton);
                }
            } else {
                if (oLayoutType === "MidColumnFullScreen") {
                    // Exit full screen
                    this.exitFullScreen(oLayoutToggleButton, oAppLayout);
                } else {
                    // Go to full screen
                    this._setPreviousAppLayoutType(oLayoutType);
                    oAppLayout.setLayout("MidColumnFullScreen");
                    this.changeToggleButton(oLayoutToggleButton);
                }
            }
        },

        exitFullScreen: function(oLayoutToggleButton, oAppLayout) {
            oAppLayout.setLayout(this._getPreviousAppLayoutType());
            oLayoutToggleButton.setIcon("sap-icon://full-screen");
            oLayoutToggleButton.setTooltip(Bundles.getGlobalText("common.actions.enterFullScreen.tooltip"));
        },

        changeToggleButton: function(oLayoutToggleButton) {
            oLayoutToggleButton.setIcon("sap-icon://exit-full-screen");
            oLayoutToggleButton.setTooltip(Bundles.getGlobalText("common.actions.exitFullScreen.tooltip"));
        },
        /**
         * Handler for the attachment points table Add action
         */
        onAddAttachment: function() {
            this._changeKeyFieldsErrorState(false);
            this.setGlobalProperty("attachmentEdit", true);
            this.setGlobalProperty("allAttachments", this.getAuxModelData().attachments);
            this.getRouter().navTo("attachmentEdit", {}, false);
        },

        /**
         * Handler for the attachment points table Delete action.
         */
        onDeleteAttachment: function(oEvent) {
            let attachments = this.getAuxModel().getProperty(ATTACHMENTS_PATH);
            attachments.splice(oEvent.getSource().getItemNavigation().getFocusedIndex() - 1, 1);
            this.getAuxModel().setProperty(ATTACHMENTS_PATH, attachments);
            this.getAuxModel().setProperty(ATTACHMENTS_COUNT_PATH, attachments.length);
        },

        onAttachmentSelectChanges: function() {
            this._oAttachmentListManipulator.updateState();
        },

        /**
         * Handler for attachment points table details press
         */
        onAttachmentDetailPress: function(oEvent) {
            this.sEditingAttachmentPointPath = oEvent.getSource().getBindingContextPath();
            let oAttachmentPoints = oEvent.getSource().getModel("auxData").getObject(this.sEditingAttachmentPointPath);

            this.setGlobalProperty("attachmentEdit", true);
            this.setGlobalProperty("attachmentPoints", oAttachmentPoints);
            this.setGlobalProperty("allAttachments", this.getAuxModelData().attachments);
            this.getRouter().navTo("attachmentEdit", {}, false);
        },

        initAttachments: function() {
            this._oAttachmentListManipulator = new ListManipulator(this.getAuxModel(), ATTACHMENTS_PATH, function() {
                return null;
            });
            this._oAttachmentListManipulator.initOrderingButtons(this.getView(), LIST_MANIPULATOR_PREFIX);
            this.attachmentFormatter.init(this.getOwnerComponent().getModel("i18n-attachment").getResourceBundle());
        },

        /**
         * Create a new JSON view model for storing view modification flags and properties,
         * like button's enablement
         */
        createViewModel: function() {
            this.setModel(new JSONModel({
                messageQuantity: 0,
                messagePopoverVisible: false
            }), VIEW_MODEL_NAME);
        },

        /**
         * @returns The JSON view model - model that stores view modification flags and properties,
         * like button's enablement
         */
        getViewModel: function() {
            return this.getModel(VIEW_MODEL_NAME);
        },

        /**
         * @returns The auxiliary JSON model
         */
        getAuxModel: function() {
            return this.getModel(this.AUX_DATA_MODEL_NAME);
        },

        /**
         * @returns The auxiliary JSON model data
         */
        getAuxModelData: function() {
            return this.getModel(this.AUX_DATA_MODEL_NAME).getData();
        },

        /**
         * Create a new JSON model for storing auxiliary data. Auxiliary data
         * is data required for creating or updating an object, but does not
         * reside in the entity data (OData).
         */
        createAuxModel: function() {
            this.setModel(new JSONModel(), this.AUX_DATA_MODEL_NAME);
        },

        navigateToMasterList: function() {
            this.getRouter().navTo("masterList", {}, true);
            this.getEventBus().publish("MasterListChannel", "RefreshAndSelect", {
                objectId: null
            });
        },

        /***
         * Subclasses override if they have input fields that should be included
         * in 'unsaved changes' handling.
         *
         * @return Array of field IDs for fields that are bound to a Json
         * model and must be included when determining if any input field values
         * have changed, such as to prompt the user of unsaved changes when
         * navigating away from the object.
         */
        getJsonFieldsForChangeTracking: function() {
            return [];
        },

        /***
         * Set Control Change Tracking
         *
         * @deprecated Use getJsonFieldsForTracking
         *
         * Purpose:
         * Enables change tracking for a control that is bound to a JSONModel.  When the control's value
         * is changed, a change event is published through the EventBus to notify listeners.
         *
         * This is used by other controllers to detect the unsaved changes made to the controls associated
         * with this controller's view.
         *
         * @param aChangeControlsIds - array of control id's from the corresponding view
         *
         */
        addControlChangeTracking: function(aChangeControlsIds) {
            let i, oControl, key, sControlType;

            for (i = 0; i < aChangeControlsIds.length; ++i) {
                oControl = this.byId(aChangeControlsIds[i]);
                key = oControl.getId();

                // Control tracking has not been defined, determine the type of control
                // and add the appropriate event detection.
                sControlType = oControl.getMetadata().getName();

                if (this._aChangeTrackingControls[key]) {
                    // Key + change event already registered
                    throw new Error("'" + key + "' may be defined only once");
                }
                // Handle Selection Change event for ComboBoxes
                if (sControlType === "sap.m.ComboBox") {
                    this._attachSelectionChangeEvent(key, oControl);
                } else if (sControlType === "sap.m.Table" ||
                    sControlType === "sap.m.List") {
                    this._attachTableChangeEvent(key, oControl);
                } else if (sControlType === "sap.m.Switch" ||
                    sControlType === "sap.m.Input" ||
                    sControlType === "sap.m.Select" ||
                    sControlType === "sap.m.TextArea") {
                    this._attachChangeEvent(key, oControl);
                } else {
                    throw new Error(sControlType + " not supported");
                }
            }
        },

        /***
         * Publish the reset of the ChangeDetected flag in UnsavedChangesCheck
         */
        publishTrackingChangeReset: function() {
            sap.ui.getCore().getEventBus().publish("sap.dm.dme.UnsavedChangesChannel", "ResetChange");
        },

        /**
         * Handle for validation event on tab out from field groups.
         * If Key Fields group has triggered the event validate key fields.
         * @param oEvent Field group validation event
         */
        validateOnFieldGroupTabOut: function(oEvent) {
            let aTriggerGroups = oEvent.getParameter("fieldGroupIds");
            if (aTriggerGroups.indexOf(ErrorHandler.FIELD_GROUP.KEY) >= 0) {
                this.validateKeyFields();
            }
        },

        /**
         * Validates key field constraints. Currently checks that the record with given name and version is unique
         * and doesn't exist in DB.
         * @param fnSuccess Callback function on successful validation
         */
        validateKeyFields: function(fnSuccess) {
            if (!this.getView().getBindingContext()) {
                // TODO: happens in OPA tests. investigate
                logger.error("Validation occurs with no model yet bound.");
                return;
            }

            let oEntityData = this.getView().getBindingContext().getObject();
            if (this._keyFieldsHaveValues(oEntityData)) {
                let oEntitySetName = this.getOwnerComponent().getMasterEntitySetName();
                this._setKeyFieldsBusyIndicator(true);

                // send ajax
                AjaxUtil.get(this.getModel().sServiceUrl + oEntitySetName,
                    "$select=ref&$filter=" + this._createKeyFieldsFilter(oEntityData),
                    function(oResponse) {
                        this._setKeyFieldsBusyIndicator(false);
                        if (oResponse.value.length === 0) {
                            // green status
                            // TODO: MECLOUD-1379 Highlight in green
                            if (fnSuccess) {
                                fnSuccess();
                            }
                            this._changeKeyFieldsErrorState(false);
                        } else {
                            this._changeKeyFieldsErrorState(true);
                        }
                    }.bind(this),
                    function() {
                        // We don't tell the user about an error when trying to see if a material exists
                        // because it is not critical. The backend will report an error if they try to save.
                        this._setKeyFieldsBusyIndicator(false);
                        if (fnSuccess) {
                            fnSuccess();
                        }
                    }.bind(this)
                );
            }
        },

        onValidateInputFieldWithSuggestions: function(oEvent) {
            let oInput = oEvent.getSource();

            if (oInput.getSuggestionItems) {
                let sValue = oEvent.getParameter("value").toUpperCase();
                oInput.getSuggestionItems().some(function(oItem) {
                    if (oItem.getText() === sValue && oItem.getKey() !== oInput.getSelectedKey()) {
                        oInput.setSelectedItem(oItem);
                        return true;
                    }
                });
            }

            if (oInput.getValue() && !oInput.getSelectedKey()) {
                let sErrorMessage = this.getLocalizedText("message.objectNotExist");
                ErrorHandler.setErrorState(oInput, sErrorMessage, null, "selectedKey");
            } else {
                ErrorHandler.clearErrorState(oInput, "selectedKey");
            }
        },

        _keyFieldsHaveValues: function(oEntityData) {
            let oKeyFieldsConfig = this.getOwnerComponent().getKeyFieldsConfig();
            return Object.keys(oKeyFieldsConfig).every(function(sConfigProp) {
                // getting values from fields because in case cleared fields the oEntityData contains previous values
                return this.byId(oKeyFieldsConfig[sConfigProp]).getValue();
            }.bind(this));
        },

        _createKeyFieldsFilter: function(oEntityData) {
            let oKeyFieldsConfig = this.getOwnerComponent().getKeyFieldsConfig();
            let aConfigKeys = Object.keys(oKeyFieldsConfig);

            if (aConfigKeys.length === 0) {
                throw new Error("Key fields must be configured in the application component's manifest");
            }

            let sFilter = "";
            aConfigKeys.forEach(function(sConfigProp, index) {
                if (!oEntityData[sConfigProp]) {
                    throw new Error("Key field value not found in the entity data");
                }
                if (index > 0) {
                    sFilter += " and ";
                }
                sFilter += sConfigProp + " eq '" + oEntityData[sConfigProp] + "'";
            });

            return sFilter;
        },

        /**
         * Changes key field error state.
         * @param bError true if field state should be set to error.
         */
        _changeKeyFieldsErrorState: function(bError) {
            let oKeyFieldsConfig = this.getOwnerComponent().getKeyFieldsConfig();
            let aConfigKeys = Object.keys(oKeyFieldsConfig);
            aConfigKeys.forEach(function(sConfigProp) {
                let oField = this.byId(oKeyFieldsConfig[sConfigProp]);
                if (!oKeyFieldsConfig[sConfigProp]) {
                    throw new Error("Key field ID is not defined in the manifest key field configuration");
                }
                if (bError) {
                    ErrorHandler.setErrorState(oField, this.getResourceBundle().getText("message.creationDuplicate"));
                } else {
                    if (oField) {
                        ErrorHandler.clearErrorState(oField);
                    }
                }
            }.bind(this));
        },

        /**
         * Creates a new entity by calling the backend
         */
        _performCreate: function() {
            let sEntitySetName = this.getOwnerComponent().getMasterEntitySetName();
            let sUrl = this.getModel().sServiceUrl + sEntitySetName;
            let oNewEntity = this._createPayloadForCreateOrUpdate();

            this._setKeyFieldsBusyIndicator(false);
            this.getView().setBusy(true);

            AjaxUtil.post(sUrl, oNewEntity,
                // success handler
                this._performCreateSuccessHandler.bind(this),
                // error handler
                // TODO: re-think default server error handling; goal: -avoid 2 method parameters; -externalize to utils
                this._createOrDeleteObjectErrorHandler.bind(this));
        },

        _performCreateSuccessHandler: function(oResponseData) {
            this.setGlobalProperty("creationInProgress", false);

            let sRefId = (oResponseData || {}).ref;

            this.getView().setBusy(false);
            this.resetModelChanges();
            this.showMessageToast("message.creationSuccess");

            // workaround
            setTimeout(function() {
                sap.ui.getCore().getEventBus().publish("MasterListChannel", "RefreshAndSelect", {
                    fromView: "Create",
                    objectId: sRefId
                });
            }, 10);

            this.getRouter().navTo("object", {
                objectId: sRefId
            }, true);
        },

        /**
         * Validates form fields
         * @return true if there is at least one invalid field
         */
        _hasFormFieldErrors: function() {
            ErrorHandler.validateFormFields(this.getView());
            return ErrorHandler.hasErrors();
        },

        /***
         * Detach the Control Change Tracking
         *
         * Detach all change detection events based on the control type.  Then, clear
         * the map which contains the currently tracked controls.
         */
        _detachChangeTrackingHandler: function() {
            for (let key in this._aChangeTrackingControls) {
                let oControl = this._aChangeTrackingControls[key];
                let sControlType = oControl.getMetadata().getName();

                if (sControlType === "sap.m.ComboBox" ||
                    sControlType === "sap.m.Table") {
                    oControl.detachSelectionChange(this._publishTrackingChange, oControl);
                } else if (sControlType === "sap.m.Switch" ||
                    sControlType === "sap.m.Input" ||
                    sControlType === "sap.m.Select" ||
                    sControlType === "sap.m.TextArea") {
                    oControl.detachChange(this._publishTrackingChange, oControl);
                }
            }
            this._aChangeTrackingControls = {};
        },

        /***
         * Publish Tracking Change for ChangeDetected event
         */
        _publishTrackingChange: function(oEvent) {
            let oSource = oEvent.getSource();
            let sObjectType = oSource.getMetadata().getName();
            if (sObjectType === "sap.ui.model.json.JSONModel") {
                let sPath = oEvent.getParameter("path");
                if (sPath === "selectedRow") {
                    return;
                }
            }
            sap.ui.getCore().getEventBus().publish("sap.dm.dme.UnsavedChangesChannel", "ChangeDetected");
        },

        /***
         * Return registered controls
         * @returns map of controls being tracked
         */
        _getRegisteredControls: function() {
            return this._aChangeTrackingControls;
        },

        /***
         * Attach the Selection Change Event to the control
         * *Note - Not needed for those controls bound to an oData model.
         *
         * @param key for the map lookup
         * @param oControl the control which receives the change event
         */
        _attachSelectionChangeEvent: function(key, oControl) {
            oControl.attachSelectionChange(this._publishTrackingChange, oControl);
            this._aChangeTrackingControls[key] = oControl;
        },

        /**
         * Attach the property change event to the model of the specified table.
         */
        _attachTableChangeEvent: function(key, oTable) {
            this.getAuxModel().attachPropertyChange(this._publishTrackingChange);
            this._aChangeTrackingControls[key] = oTable;
        },

        /***
         * Attach Change Event to the control
         * *Note - Not needed for those controls bound to an oData model.
         *
         * @param key for the map lookup
         * @param oControl the control which receives the change event
         */
        _attachChangeEvent: function(key, oControl) {
            oControl.attachChange(this._publishTrackingChange, oControl);
            this._aChangeTrackingControls[key] = oControl;
        },

        /**
         * Returns main application layout. Used by toggle fullscreen functionality
         * for master-detail applications.
         * @returns Application layout. Expected to be a flexible column one.
         * @private
         */
        _getAppLayout: function() {
            if (!this._oAppLayout) {
                let oComponent = this.getOwnerComponent();
                let oRootControl = oComponent.getAggregation("rootControl", null);
                let oRootView = oComponent.byId(oRootControl.sId);
                this._oAppLayout = oRootView.byId("appLayout");
            }

            return this._oAppLayout;
        },

        _getPreviousAppLayoutType: function() {
            return this._oPreviousLayoutType;
        },

        _setPreviousAppLayoutType: function(oLayoutType) {
            this._oPreviousLayoutType = oLayoutType;
        },

        /**
         * Initializes Toggle Full Screen button.
         * Views only need set the button with "fullScreenToggleButton" id and
         * localized tooltips:
         * common.actions.enterFullScreen.tooltip
         * common.actions.exitFullScreen.tooltip
         */
        _initToggleFullScreenButton: function() {
            let oButton = this.getView().byId("fullScreenToggleButton");
            if (oButton) {
                oButton.setIcon("sap-icon://full-screen");
                oButton.setType(ButtonType.Transparent);
                oButton.setTooltip(Bundles.getGlobalText("common.actions.enterFullScreen.tooltip"));
                oButton.attachPress(this.onFullScreenToggle, this);
            }
            return oButton;
        },

        /**
         * @deprecated Use _createTransientEntityContext
         */
        _prepareNewEntityCreation: function() {
            return this._createTransientEntityContext();
        },

        /**
         * The new entity context (not yet persisted) is created and bound to a view.
         * If there is a copied entity then its data is set as the initial values otherwise default values are used.
         * If there is a copied custom data then custom data controller is initialized with these values.
         * All error messages removed.
         * The new entity is selected in the master list.
         * @returns {Context} The context object for the created entity.
         */
        _createTransientEntityContext: function() {
            this.setGlobalProperty("creationInProgress", true);

            let oBinding = this.getListSelector().getMasterListBinding();
            let oEntityData = this.removeGlobalProperty("copiedData") || this._createNewEntityInitialValues();
            let oContext = oBinding.create(oEntityData);
            oContext.created().catch(function() {
                // new entity transient context always destroyed after entity creation with ajax call
                // ODataModel rejects promise in this case and it should be handled
            });
            this.getView().setBindingContext(oContext);

            if (this._oCustomData) {
                this._oCustomData.setCustomValues(this.removeGlobalProperty("customValues"));
            }

            let oAttachments = this.removeGlobalProperty("attachments");
            if (oAttachments) {
                this.getAuxModel().setProperty(ATTACHMENTS_PATH, oAttachments);
            }

            sap.ui.getCore().getMessageManager().removeAllMessages();
            this.getListSelector().selectFirstListItem();

            return oContext;
        },

        _createNewEntityInitialValues: function() {
            return {};
        },

        /**
         * Show/hide the message popover when the user presses the popover button
         */
        _handleMessagePopoverPress: function(oEvent) {
            this.oMessagePopover.toggle(oEvent.getSource());
        },

        /**
         * Initialize the message popover button with standard properties.  Views only need set the button id.
         */
        _initMessagePopoverButton: function() {
            let oButton = this.getView().byId("messagePopoverButton");
            if (oButton) {
                oButton.setIcon("sap-icon://message-popup");
                oButton.setType(ButtonType.Emphasized);
                oButton.setTooltip(Bundles.getGlobalText("common.showMessages.tooltip"));
                oButton.attachPress(this._handleMessagePopoverPress, this);

                oButton.bindProperty("text", {
                    path: VIEW_MODEL_NAME + ">/messageQuantity"
                });
                oButton.bindProperty("visible", {
                    path: VIEW_MODEL_NAME + ">/messagePopoverVisible"
                });
            }
            return oButton;
        },

        /**
         * Initialize the MessagePopover so that it is ready to display messages
         */
        _initMessagePopover: function(oButton) {
            let oMessageTemplate = new MessageItem({
                type: "{type}",
                title: "{message}",
                subtitle: "{additionalText}"
            });

            let oMessagePopover = new MessagePopover(this.createId("messagePopover"), {
                items: {
                    path: "/",
                    template: oMessageTemplate,
                    events: {
                        change: this._onMessageItemsChange.bind(this)
                    }
                }
            });

            let oMessageModel = sap.ui.getCore().getMessageManager().getMessageModel();
            oMessagePopover.setModel(oMessageModel);

            return oMessagePopover;
        },

        _onMessageItemsChange: function(oEvent) {
            let iMessageQty = oEvent.getSource().getLength();
            let oViewModel = this.getViewModel();
            if (iMessageQty === 0 && this.oMessagePopover) {
                this.oMessagePopover.close();
            }
            oViewModel.setProperty("/messageQuantity", iMessageQty);
            oViewModel.setProperty("/messagePopoverVisible", !!iMessageQty);
        },

        _confirmDeletion: function(fnCallback, bCurrentRevision, sMessage) {
            let sMessageKey = this.getDeleteMessageKey(bCurrentRevision, sMessage);
            MessageBox.show(this.getResourceBundle().getText(sMessageKey), {
                icon: MessageBox.Icon.WARNING,
                title: Bundles.getGlobalText("confirm.delete.title"),
                actions: [
                    MessageBox.Action.DELETE,
                    MessageBox.Action.CANCEL
                ],
                initialFocus: MessageBox.Action.CANCEL,
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.DELETE) {
                        fnCallback();
                    }
                }
            });
        },

        /**
         * Return Delete Message Key. User is able to override this message.
         */
        getDeleteMessageKey: function(bCurrentVersion, sMessage) {
            let sMessageKey;
            if (sMessage) {
                sMessageKey = sMessage;
            } else {
                sMessageKey = bCurrentVersion ? "message.deleteCurrentVersion" : "message.delete";
            }

            return sMessageKey;
        },

        _deleteObject: function(sItemPosition) {
            let sEntityRef = this.getView().getBindingContext() ? this.getView().getBindingContext().getProperty("ref") : this._getEntityRefWithoutOData(sItemPosition);
            this.getView().setBusy(true);
            AjaxUtil.delete(
                this._getODataEndpointUrl(sEntityRef),
                this._deleteObjectSuccessHandler.bind(this),
                this._createOrDeleteObjectErrorHandler.bind(this));
        },

        _getEntityRefWithoutOData: function() {
            return null;
        },

        _deleteObjectSuccessHandler: function() {
            this.getView().unbindElement();
            // todo: should we allow to delete entity with unsaved changes?
            this.resetModelChanges();
            this.getListSelector().refreshListModel();
            this.getView().setBusy(false);

            this.navigateToMasterList();
            this.showMessageToast(this.getDeleteSucessMessageKey());
        },

        /**
         * OData endpoint url is constructed from odata model
         * Depending on sEntityRef value, constructed url is concatenated with Object Ref, in case of Edit and Delete scenarios
         * @param {string} sEntityRef The context object Ref of the maintained entity.
         * @returns {string} sODataEndpointUrl Constructed endpoint url for backend request.
         */
        _getODataEndpointUrl: function(sEntityRef) {
            let sUrl = this.getModel().sServiceUrl;
            let sEntitySetName = this.getDeletionEntityName();
            let sODataEndpointUrl = sUrl + sEntitySetName;

            if (sEntityRef) {
                sODataEndpointUrl += "('" + jQuery.sap.encodeURL(sEntityRef) + "')";
            }
            return sODataEndpointUrl;
        },

        /**
         * Shows a {sap.m.MessageBox} when a service call has failed.
         * Only the first error message will be displayed.
         * @param {object} oError a technical error to be displayed on request (A parameter returned from a DataReceived oEvent )
         * @private
         */
        _handleServiceError: function(oError) {
            if (this._bMessageOpen) {
                return;
            }

            if (oError.status && oError.status === 404) {
                this.getRouter().getTargets().display("objectNotFound");
                this.getListSelector().removeSelection();
                return;
            }

            this._bMessageOpen = true;
            MessageBox.error(oError.message, {
                icon: MessageBox.Icon.ERROR,
                title: Bundles.getGlobalText("errorDialogTitle"),
                id: this.createId("serviceErrorMessageBox"),
                details: oError,
                actions: [MessageBox.Action.CLOSE],
                onClose: function() {
                    this.getRouter().getTargets().display("masterList");
                    this.getListSelector().removeSelection();
                    this._bMessageOpen = false;
                }.bind(this)
            });
        },

        /**
         * Initialize value tracking for input fields bound to a Json model.
         * Subclasses implement getJsonFieldsForChangeTracking() to
         * return the view IDs of Json fields. No override of getJsonFieldsForChangeTracking
         * is needed if there are no fields to track.
         */
        _initJsonFieldChangeTracking: function() {
            let aControlIds = this.getJsonFieldsForChangeTracking();
            this.addControlChangeTracking(aControlIds);
        },

        /**
         * Create a custom data handler if the app is configured (via manifest) for custom data.
         */
        _initCustomData: function() {
            let oComponent = this.getOwnerComponent();
            if (oComponent && oComponent.getCustomDataConfig && this.getDataSourceUri) {
                let oCustomDataCfg = oComponent.getCustomDataConfig();
                if (oCustomDataCfg) {
                    this._oCustomData = new CustomData(this.getDataSourceUri(), oCustomDataCfg.type, this.getView(), this.modifyDataErrorHandler.bind(this));
                }
            }
        },

        /**
         * Use the OData client model to read the object having the specified
         * object ID and bind the result to the view.
         *
         * @param sObjectId The object's ID
         * @param oParameters OData parameters, such as $select and $expand
         * @param fnDataReceived Optional method called after the data is returned.
         * Subclasses can use to do additional processing. Function is passed the read object.
         */
        _readObject: function(sObjectId, oParameters, fnDataReceived) {
            this.setGlobalProperty("creationInProgress", false);
            let sEntitySetName = "/" + this.getOwnerComponent().getMasterEntitySetName();

            this.getView().bindElement({
                path: sEntitySetName + "('" + jQuery.sap.encodeURL(sObjectId) + "')",
                parameters: oParameters,
                events: {
                    dataRequested: function() {
                        this.getView().setBusy(true);
                    }.bind(this),
                    dataReceived: function(oEvent) {
                        let oError = oEvent.getParameter("error");
                        if (oError) {
                            this._handleServiceError(oError);
                            this.resetModelChanges();
                            this.getView().setBusy(false);
                        } else {
                            // BCP 1880470219: fix for "Error: Must not change a property before it has been read"
                            jQuery.sap.delayedCall(125, this, this._onDataReceived, [sObjectId, fnDataReceived]);
                        }
                    }.bind(this)
                }
            });
        },

        _onDataReceived: function(sObjectId, fnDataReceived) {
            this.getEventBus().publish("MasterListChannel", "RefreshAndSelect", {
                objectId: sObjectId
            });
            sap.ui.getCore().getMessageManager().removeAllMessages();
            let oReadData = this.getView().getBindingContext().getObject();
            fnDataReceived && fnDataReceived(oReadData);
            this._oCustomData && this._oCustomData.setCustomValues(oReadData.customValues);

            this.resetModelChanges();
            this.getView().setBusy(false);
        },

        _getAttachmentsPayload: function() {
            let aAttachmentsPayload = [];
            let aAttachments = this.getAuxModel().getData().attachments;
            if (aAttachments) {
                for (let i = 0; i < aAttachments.length; i++) {
                    let oAttachmentPoints = aAttachments[i].attachmentPoints;
                    for (let propName in oAttachmentPoints) {
                        if (propName.charAt(0) === "@" && propName.charAt(1) === "$") {
                            delete oAttachmentPoints[propName];
                            delete oAttachmentPoints["createdDateTime"];
                        }
                    }
                    aAttachmentsPayload.push(oAttachmentPoints);
                }
            }

            return aAttachmentsPayload;
        },

        /**
         * Set the specified attachments into the attachments model.
         * @param aAttachments Array of attachments from OData
         */
        _setAttachments: function(aAttachments) {
            let aModelAttachments = [];
            let oAttachmentPoints;
            if (aAttachments) {
                for (let i = 0; i < aAttachments.length; i++) {
                    this._filterAttachmentPointsProperties(aAttachments[i]);
                    oAttachmentPoints = {
                        attachmentPoints: aAttachments[i]
                    };
                    aModelAttachments.push(oAttachmentPoints);
                }
            }

            this.getAuxModel().setProperty(ATTACHMENTS_PATH, aModelAttachments);
            this.getAuxModel().setProperty(ATTACHMENTS_COUNT_PATH, aModelAttachments.length);
        },

        /**
         * Update the attachment points at the given binding path
         */
        _updateAttachmentPoints: function() {
            this._doneEditingAttachmentPoints();
            let oAttachmentPoints = this._retrieveAttachmentPoints();
            if (oAttachmentPoints.attachmentPoints) {
                let oAuxData = this._updateAttachmentPointsData(oAttachmentPoints, this.sEditingAttachmentPointPath);
                this._updateAttachmentsModel(oAuxData);
            }
            this.sEditingAttachmentPointPath = undefined;
        },

        _isNavigatingFromAttachmentPointsEdit: function() {
            return this.getGlobalProperty("attachmentEdit");
        },

        _retrieveAttachmentPoints: function() {
            let oAttachmentPoints = this.removeGlobalProperty("attachmentPoints");
            let oAttachmentPointsContainer = {
                attachmentPoints: oAttachmentPoints
            };
            return oAttachmentPointsContainer;
        },

        _doneEditingAttachmentPoints: function() {
            this.setGlobalProperty("onAttachmentEdit", false);
            this.removeGlobalProperty("attachmentEdit");
        },

        _updateAttachmentPointsData: function(oAttachmentPoints, sAttachmentPointsPath) {
            let oAuxData = this.getAuxModelData();
            if (!oAuxData.attachments) {
                oAuxData.attachments = [];
            }

            if (sAttachmentPointsPath) {
                this.getAuxModel().setProperty(sAttachmentPointsPath, oAttachmentPoints);
                this.getAuxModel().firePropertyChange(); // setProperty should fire, but it doesn't
            } else {
                oAuxData.attachments.push(oAttachmentPoints);
            }
            return oAuxData;
        },

        _updateAttachmentsModel: function(oAuxData) {
            this.getAuxModel().setData(oAuxData);
            this.getAuxModel().setProperty(ATTACHMENTS_COUNT_PATH, this.getAuxModel().getProperty(ATTACHMENTS_PATH).length);
        },

        /**
         * Remove attachment point properties included by the OData read that are not needed
         * by the UI.  Furthermore, if included then some of these properties would result
         * in an error if included when the attachment point is updated.
         */
        _filterAttachmentPointsProperties: function(oAttachmentPoints) {
            delete oAttachmentPoints["createdDateTime"];
            delete oAttachmentPoints["modifiedDateTime"];
            delete oAttachmentPoints["@$ui5.predicate"];

            // TODO: remove this work around once API has been changed to not include these properties, or
            // if it does, is changed to return a boolean instead of '{}' for currentVersion
            if (oAttachmentPoints["routing"]) {
                let oRoutingAttachmentPoint = oAttachmentPoints["routing"];
                delete oRoutingAttachmentPoint["currentVersion"];
                delete oRoutingAttachmentPoint["status"];
                delete oRoutingAttachmentPoint["routingSteps"];
            }
        },

        _prepareForCreate: function() {
            this._setKeyFieldsBusyIndicator(false);
            this.setFocusToTheFirstKeyFieldControl();
        },

        _setKeyFieldsBusyIndicator: function(bBusy) {
            let sKeyFieldsFormId = "keyFieldsForm";
            let formControl = this.byId(sKeyFieldsFormId);
            if (!formControl) {
                let sMsg = "Key fields form not found. Key fields busy indicator will not be set";
                let sDetails = "No form control found with id='" + sKeyFieldsFormId + "'. Busy indicator will not be set to " + bBusy;
                this._logDebugMessage(sMsg, sDetails);
            } else {
                formControl.setBusy(bBusy);
            }
        },

        _logDebugMessage: function(sMsg, sDetails) {
            // added to support QUnit tests
            logger.debug(sMsg, sDetails);
        },

        setFocusToTheFirstKeyFieldControl: function() {
            let sFirstKeyFieldId = this.getFirstKeyFieldId();
            if (sFirstKeyFieldId) {
                setTimeout(function() {
                    let oKeyField = this.byId(sFirstKeyFieldId);
                    if (oKeyField) {
                        oKeyField.focus();
                    }
                }.bind(this), 500);
            }
        },

        getFirstKeyFieldId: function() {
            let oKeyFieldsConfig = this.getOwnerComponent().getKeyFieldsConfig();
            let sFirstKey = oKeyFieldsConfig ? Object.keys(oKeyFieldsConfig)[0] : null;
            return sFirstKey ? oKeyFieldsConfig[sFirstKey] : null;
        },

        /**
         * Reset pending changes on the OData model
         */
        resetODataModelChanges: function() {
            this.getModel().resetChanges();
        },

        /**
         * Reset pending changes to the the OData model and all JSONModel bound controls that are registered
         * for change tracking.
         */
        resetModelChanges: function() {
            this.publishTrackingChangeReset();
            this.resetODataModelChanges();
        },

        getClassificationDataSourceUri: function() {
            return this.getOwnerComponent().getModel("classification").sServiceUrl;
        },

        getBrowserLanguage: function() {
            return sap.ui.getCore().getConfiguration().getLanguage();
        },

        addLocalizedDescriptionFild: function(sLanguage, oList) {
            return oList.map(function(item) {
                let isLocalization = item.standardValueTexts.some(function(localeItem) {
                    if (localeItem.locale === sLanguage) {
                        item.description = localeItem.description;
                        return true;
                    }
                });
                if (!isLocalization) {
                    item.description = this._getEnDescription(item.standardValueTexts);
                }
                return item;
            }.bind(this));
        },

        _getEnDescription: function(oList) {
            let oEnLocale = oList.filter(function(oItem) {
                return oItem.locale === "EN";
            })[0];
            return oEnLocale ? oEnLocale.description : "";
        },

        /***
         * Sets focus to a control based on an expired number of milliseconds
         *
         * @param sControlId the control id from the view
         * @param iMilliseconds the number of milliseconds to wait until focus is set (default 500ms)
         * Example Usage:
         *
         * this.setFocusTo("description", 500);
         */
        setFocusTo: function(sControlId, iMilliseconds) {
            let iTimeout = 500;
            if (iMilliseconds) {
                iTimeout = iMilliseconds;
            }
            let oControl = this.byId(sControlId);
            if (oControl) {
                let fSetFocus = function(oFocusControl) {
                    // Intentionally not checking for a valid control being returned.
                    // Developers need to see the exception if the control is defined incorrectly.
                    oFocusControl.focus();
                };

                // Set focus
                setTimeout(function() {
                    fSetFocus(oControl);
                }, iTimeout);
            }
        },

        /**
         * Returns Entity Name. User is able to override this fuction in child(Routing/Recipe APP for example).
         */
        getDeletionEntityName: function() {
            return this.getOwnerComponent().getMasterEntitySetName();
        },

        /**
         * Returns Message Key. User is able to override this message.
         */
        getDeleteSucessMessageKey: function() {
            return "message.deleteSuccess";
        }

    });
}, true);