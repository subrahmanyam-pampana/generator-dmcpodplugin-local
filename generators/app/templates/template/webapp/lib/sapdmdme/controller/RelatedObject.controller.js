/**
 * Controller for the RelatedObject control. A related object is a one-to-one relationship
 * between two objects, such as between material and routing. The UI representation
 * of a related object is an input field for the object name and a combo box for the
 * object version. The input supports suggestions and the 'non-existent object' validation.
 * Only current versions of the objects are suggested, however all versions are available in the version field.
 * The version field is automatically populated with one or more versions according to the
 * versions defined for the object.
 *
 * RelatedObject requires a backend service for retrieving a list of objects for the input
 * field suggestions as well as retrieving all versions of an object.  If the object uses the
 * same backend API as the referring object, then no additional configuration is needed.  However,
 * if the object is not provided by the referring object's service then RelatedObject must be configured
 * with the model of the service that provides the object's entity.  The model is set with the oModel
 * configuration setting.
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/ComboBox",
    "sap/ui/layout/GridData",
    "sap/dm/dme/controller/Constants",
    "sap/dm/dme/controller/BaseObject.controller",
    "sap/ui/model/Sorter",
    "sap/ui/core/ListItem",
    "sap/dm/dme/message/ErrorHandler",
    "sap/dm/dme/service/ServiceClient"
], function(JSONModel, ComboBox, GridData, ControllerConstants, BaseObjectController, Sorter, ListItem, ErrorHandler, ServiceClient) {
    "use strict";

    let RELATED_OBJECT_ID = ControllerConstants.RELATED_OBJECT_ID;
    let RELATED_OBJECT_VERSION_ID = ControllerConstants.RELATED_OBJECT_VERSION_ID;
    let RELATED_OBJECT_MODEL_NAME = "relatedObjectModel";
    let REQUIRED_MODEL_NAME = "requiredModel";
    let I18N_GLOBAL_NAME = "i18n-global";

    return BaseObjectController.extend("sap.dm.dme.controller.RelatedObject", {

        /**
         * Define fields that need to be tracked for value changes. Only the name field is added
         * initially because the version field is optional.
         * @override
         */
        getJsonFieldsForChangeTracking: function() {
            return [RELATED_OBJECT_ID];
        },

        /***
         * Clear the Error State of the control.
         *
         * This method also takes into account if the control to be cleared contains an object version.  If it does,
         * the version control is also cleared.
         */
        clearErrorState: function() {
            let oObjectInput = this.getObjectNameControl();
            if (oObjectInput) {
                if (this._hasObjectVersion() && !this._oSettings.bHideVersion) {
                    let oObjectVersion = this._getObjectVersionControl();
                    ErrorHandler.clearErrorState(oObjectVersion);
                }
                ErrorHandler.clearErrorState(oObjectInput);
            }
        },

        /**
         * Configure the RelatedObject with application specific settings.  This should be called
         * from the parent controller's onInit method.
         *
         * @param oSettings Object containing the following settings
         *
         * sObjectPropertyName: The OData property name of the object containing the object ref, name, and version fields
         * This is the navigation property from the parent object (like material) to the target object (like routing).
         * ex. routing
         * sEntitySetName: The name of the entity set collection for the object
         * ex. Routings (OData entity set name)
         * oBrowse: The browse implementation for the object
         * ex. RoutingBrowse
         * oModel: The model for the related object. See module overview.
         * onObjectNameChanged: {Function} callback used to notify listeners that object was changed
         * onVersionChange: {Function} callback used to notify listeners that version was changed
         */
        setConfiguration: function(oSettings) {
            this._oSettings = oSettings;
            this._sObjectLabel = this.getOwnerComponent().getModel(this._oSettings.sI18NModel).getResourceBundle().getText(this._oSettings.sObjectLabelKey);
            this._sObjectVersionLabel = this.getOwnerComponent().getModel(this._oSettings.sI18NModel).getResourceBundle().getText(this._oSettings.sObjectVersionLabelKey);
            this._oSettings.sBrowseDefaultFilter = this._oSettings.sBrowseDefaultFilter || "";
            this._relativeUrl = "/" + this._oSettings.sEntitySetName;

            if (this._hasObjectVersion()) {
                this._addObjectVersionControl();
                this._getObjectVersionControl().setVisible(!this._oSettings.bHideVersion);
                this._getObjectVersionControl().setTooltip(this._oSettings.bHideVersion ? this._sObjectLabel : this._sObjectVersionLabel);
            }

            let oObjectInput = this.getObjectNameControl();
            let oObjectFormatter = this._oSettings.oAdditionalText || undefined;
            oObjectInput.setTooltip(this._sObjectLabel);
            let oTemplate = new ListItem({
                key: "ref",
                text: "{" + this._oSettings.sObjectPropertyName + "}",
                additionalText: oObjectFormatter
            });

            // If this related object's entity set is not defined in the same backend OData API
            // as that used by the parent view's model, then a separate OData model must be created
            // for this related object's suggestions and versions. This separate model must use
            // the backend service that provides the related object's entity set. For example,
            // a work instruction may be associated with attachment points such as material,
            // but the material entity set is not defined in the work instruction
            // service (workinstruciton.svc). Therefore a separate OData model must be defined
            // for material in work instruction maintenance component manifest so that it can
            // passed here and set to retrieve materials (suggestions) and versions.
            if (this._oSettings.oModel) {
                oObjectInput.setModel(this._oSettings.oModel);
                if (this._hasObjectVersion() && !this._oSettings.bHideVersion) {
                    this._getObjectVersionControl().setModel(this._oSettings.oModel);
                }
            }
            if (!this._oSettings.bNoSuggestion) {
                let sFilter = this._hasObjectVersion() ? "currentVersion" + this._oSettings.sBrowseDefaultFilter : this._oSettings.sBrowseDefaultFilter;
                sFilter = sFilter || undefined;
                oObjectInput.bindAggregation("suggestionItems", {
                    path: this._relativeUrl,
                    parameters: {
                        $filter: sFilter
                    },
                    template: oTemplate
                });
            }
            this._initJsonFieldChangeTracking(!this._oSettings.disableChangeTracking);

            if (this._oSettings.oBrowse) {
                oObjectInput.setShowValueHelp(true);
                oObjectInput.attachValueHelpRequest(this.onObjectBrowse, this);
            }

            this._initializeRequiredModel();
            let oModel = this.getModel(REQUIRED_MODEL_NAME);
            oModel.setProperty("/required", !!this._oSettings.required);
        },

        onObjectNameChanged: function(oEvent) {
            if (this._hasObjectVersion() && !this._oSettings.bHideVersion) {
                let oComboBox = this._getObjectVersionControl();
                this._clearObjectVersion();
                let sEntitySet = this._relativeUrl;
                let sPropName = this._oSettings.sObjectPropertyName;
                let oVersionBindingParams = this._getVersionBindingParams(oEvent.getSource(), oComboBox, sEntitySet, sPropName, {
                    name: oEvent.getParameter("value")
                }, this._oSettings.sBrowseDefaultFilter);
                this._bindVersionSelector(oVersionBindingParams);
            } else {
                let sObjectName = oEvent.getParameter("value").toUpperCase();
                return this._checkObjectExistence(sObjectName)
                    .then(this._objectChangeCallbackCaller.bind(this))
                    .catch(function(sError) {
                        ErrorHandler.setErrorState(this.getObjectNameControl(), sError, this._sObjectLabel);
                        throw sError;
                    }.bind(this));
            }
        },

        _versionChangeCallbackCaller: function(sVersion) {
            if (typeof this._oSettings.onVersionChanged === "function") {
                this._oSettings.onVersionChanged(sVersion);
            }
        },

        _objectChangeCallbackCaller: function(oObject) {
            if (typeof this._oSettings.onObjectNameChanged === "function") {
                this._oSettings.onObjectNameChanged(oObject);
            }
        },

        _onVersionListReceivedCallBack: function(oObject) {
            if (typeof this._oSettings.onVersionListReceived === "function") {
                this._oSettings.onVersionListReceived(oObject);
            }
        },

        onObjectBrowse: function(oEvent) {
            let sValue = oEvent.getSource().getValue();
            let sPropName = this._oSettings.sObjectPropertyName;
            let sEntitySet = this._relativeUrl;
            this._oSettings.oBrowse.open(this.getView(), sValue, function(oSelectedObject) {
                this.getObjectModel().setProperty("/name", oSelectedObject.name);
                this.getObjectModel().setProperty("/ref", oSelectedObject.ref);
                if (this._oSettings.bVersionRequired) {
                    this.getObjectModel().setProperty("/version", oSelectedObject.version);
                }
                this._objectChangeCallbackCaller(oSelectedObject);
                if (this._hasObjectVersion() && !this._oSettings.bHideVersion) {
                    this._bindVersionSelector(this._getVersionBindingParams(this.getObjectNameControl(),
                        this._getObjectVersionControl(), sEntitySet, sPropName, oSelectedObject, this._oSettings.sBrowseDefaultFilter));
                } else {
                    this._setAdditionalObjectProperties(oSelectedObject);
                }
            }.bind(this), this._oSettings.oModel, this._oSettings.oRelatedModel);
        },

        onObjectVersionChanged: function(oEvent) {
            this._onVersionComboBoxChanged(oEvent, this._oSettings.sObjectPropertyName);
        },

        /**
         * @param oDataObjectData
         */
        initializeModel: function(oDataObjectData, sTargetPropName) {
            let oModelData = {
                name: "",
                version: "",
                ref: ""
            };
            let oModel = new JSONModel(oModelData);

            let sPropName = this._oSettings.sObjectPropertyName;
            if (oDataObjectData) {
                oModelData = {
                    name: oDataObjectData[sTargetPropName || sPropName],
                    version: oDataObjectData.version,
                    ref: oDataObjectData.ref
                };
                oModel.setData(oModelData);
                this._setAdditionalObjectProperties(oDataObjectData, oModel);
            }

            this.setModel(oModel, RELATED_OBJECT_MODEL_NAME);

            if (this._hasObjectVersion() && !this._oSettings.bHideVersion) {
                let sEntitySet = this._relativeUrl;
                let oBindingParams = this._getVersionBindingParams(this.getObjectNameControl(), this._getObjectVersionControl(), sEntitySet, sPropName, oModelData, this._oSettings.sBrowseDefaultFilter);
                this._bindVersionSelector(oBindingParams);
            }
        },

        /**
         * Initializes (if not yet initialized) a new model. Model is used to set 'required' flag for the input field.
         * If Related object is required by its parent view, then it can pass {required: true} to setConfiguration
         * and SAPUI5 will add 'required=true' to HTML. This is done for accessibility (ARIA).
         * By default model is initialized with false value.
         * @private
         */
        _initializeRequiredModel: function() {
            let oRequiredModel;
            if (this.getModel(REQUIRED_MODEL_NAME) === undefined) {
                oRequiredModel = new JSONModel({
                    required: false
                });
                this.setModel(oRequiredModel, REQUIRED_MODEL_NAME);
            }
        },

        _setAdditionalObjectProperties: function(oData, oModel) {
            let oResolvedModel = oModel || this.getObjectModel();
            oResolvedModel.setProperty("/ref", oData.ref);
            if (this._oSettings.aAdditionalObjectFields) {
                let aObjectProperties = this._oSettings.aAdditionalObjectFields;
                for (let i in aObjectProperties) {
                    oResolvedModel.setProperty("/" + aObjectProperties[i], oData[aObjectProperties[i]]);
                }
            }
        },

        setSelectedVersion: function(aContexts, oVersionBindingParams) {
            let bResolved = false;
            for (let i = 0; i < aContexts.length; i++) {
                let oVersionObject = aContexts[i].getObject();

                // set given version if any
                if (oVersionBindingParams.entityData.version && oVersionObject.version === oVersionBindingParams.entityData.version) {
                    oVersionBindingParams.versionControl.setSelectedKey(oVersionObject.ref);
                    ErrorHandler.clearErrorState(oVersionBindingParams.versionControl);
                    this._setAdditionalObjectProperties(oVersionObject);
                    this._onVersionListReceivedCallBack(oVersionObject);
                    bResolved = true;
                    break;
                }

                // default to current version if not given
                if (!oVersionBindingParams.entityData.version && oVersionObject.currentVersion === true) {
                    oVersionBindingParams.versionControl.setSelectedKey(oVersionObject.ref);
                    ErrorHandler.clearErrorState(oVersionBindingParams.versionControl);
                    this._setAdditionalObjectProperties(oVersionObject);
                    this._onVersionListReceivedCallBack(oVersionObject);
                    bResolved = true;
                    break;
                }
            }

            return [oVersionBindingParams, bResolved]
        },

        getObjectModel: function() {
            return this.getModel(RELATED_OBJECT_MODEL_NAME);
        },

        getObjectModelData: function() {
            return this.getModel(RELATED_OBJECT_MODEL_NAME).getData();
        },

        setEditable: function(bEditable) {
            let oObjectNameControl = this.getObjectNameControl();
            let oObjectVersionControl = this._getObjectVersionControl();

            oObjectNameControl.setEditable(bEditable);

            if (oObjectVersionControl) {
                oObjectVersionControl.setEditable(bEditable);
            }
        },

        getEditable: function() {
            return this.getObjectNameControl().getEditable();
        },

        /**
         * Creates parameters object to be passes through revisionable fields validation methods.
         * @param oNameUI Entity name UI control.
         * @param oVersionUI Entity version UI control. Version list will be bound to this control.
         * @param sPath The relative path to entity set, e.g. '/Boms'
         * @param sPropertyName The entity property name we want to filter by, e.g. 'bom'
         * @param oEntityData Object that contains name value we want to filter by and version value to set as default.
         * @returns {object} event
         * @private
         */
        _getVersionBindingParams: function(oNameUI, oVersionUI, sPath, sPropertyName, oEntityData, sFilter) {
            return {
                inputControl: oNameUI,
                versionControl: oVersionUI,
                path: sPath,
                propertyName: sPropertyName,
                entityData: oEntityData,
                defaultFilter: sFilter
            };
        },

        /**
         * Reads the versions of given revisionable entity and populates data for Version selector
         * after populating something into the input field
         * Clears error state after removing entered data from the input field
         * @param oVersionBindingParams
         * @private
         */
        _bindVersionSelector: function(oVersionBindingParams) {
            if (oVersionBindingParams.entityData.name.trim() !== "") {
                let oBindInfo = this._createBindInfoForComboBox(oVersionBindingParams);
                oVersionBindingParams.versionControl.bindItems(oBindInfo);
            } else {
                ErrorHandler.clearErrorState(oVersionBindingParams.inputControl);
                ErrorHandler.clearErrorState(oVersionBindingParams.versionControl);
            }
        },

        /**
         * Creates the bind information from ComboBox with filtering and sorting by name.
         * @param oVersionBindingParams
         * @returns {object} Binding parameters
         * @private
         */
        _createBindInfoForComboBox: function(oVersionBindingParams) {
            return {
                path: oVersionBindingParams.path,
                parameters: {
                    $filter: oVersionBindingParams.propertyName + " eq '" + oVersionBindingParams.entityData.name + "'" + oVersionBindingParams.defaultFilter
                },
                template: new ListItem({
                    key: "{ref}",
                    text: "{version}"
                }),
                sorter: new Sorter("version"),
                events: {
                    dataReceived: function(oEvent) {
                        let oError = oEvent.getParameter("error");
                        if (oError) {
                            this._handleServiceError(oError);
                        } else {
                            this._onVersionListReceived(oEvent, oVersionBindingParams);
                        }
                    }.bind(this)
                }
            };
        },

        /**
         * Callback to the event when Version combobox receives new values from backend.
         * It selects needed value from the list. Either passed with oVersionBindingParams.entityData.version parameter
         * or by choosing current version of given entity.
         * @param oEvent
         * @param oVersionBindingParams
         * @private
         */
        _onVersionListReceived: function(oEvent, oVersionBindingParams) {
            let sObjectNotExist = this.getOwnerComponent().getModel(I18N_GLOBAL_NAME).getResourceBundle().getText("message.objectNotExist");
            let sVersionNotExist = this.getOwnerComponent().getModel(I18N_GLOBAL_NAME).getResourceBundle().getText("message.incorrectVersion");
            let aContexts = oEvent.getSource().getContexts();

            // check if returned list is not empty
            if (aContexts.length === 0 && oVersionBindingParams.inputControl.getValue()) {
                ErrorHandler.setErrorState(oVersionBindingParams.inputControl, sObjectNotExist, this._sObjectLabel);
                ErrorHandler.clearErrorState(oVersionBindingParams.versionControl);
            } else {
                ErrorHandler.clearErrorState(oVersionBindingParams.inputControl);
                ErrorHandler.clearErrorState(oVersionBindingParams.versionControl);
            }

            // set selected version either to given value or defaulted to the current version
            if (oVersionBindingParams.versionControl && aContexts.length > 0) {
                let bResolved = false;

                let versionParams = this.setSelectedVersion(aContexts, oVersionBindingParams);
                oVersionBindingParams = versionParams[0];
                bResolved = versionParams[1];

                // if version is not resolved then set error state to version control or input control depending on its visibility
                if (!bResolved) {
                    if (this._getObjectVersionControl().getVisible()) {
                        ErrorHandler.setErrorState(oVersionBindingParams.versionControl, sVersionNotExist, this._sObjectVersionLabel);
                    } else {
                        ErrorHandler.setErrorState(oVersionBindingParams.inputControl, sObjectNotExist, this._sObjectLabel);
                    }
                }
            }
        },

        /**
         * Unbind items from comboBox and select empty value.
         * @private
         */
        _clearObjectVersion: function(oComboBox) {
            oComboBox = this._getObjectVersionControl();
            oComboBox.unbindItems();
            oComboBox.setSelectedKey(null);
        },

        /**
         * Set empty value.
         * @private
         */
        _clearObjectName: function(oInputControl) {
            oInputControl = this.getObjectNameControl();
            oInputControl.setValue("");
        },

        /**
         * Handler for event triggered when user changes version combo box value either by selection from suggested values or
         * by typing into the field. It checks for the valid version. If it is not valid, error will be shown.
         * @param {change} oEvent Event of the input field to handle.
         * @param sSubtitleKey i18n key for subtitle for validation error message
         * @private
         */
        _onVersionComboBoxChanged: function(oEvent, sSubtitleKey) {
            let oVersionComboBoxControl = oEvent.getSource();
            if (!oVersionComboBoxControl.getSelectedKey()) {
                if (oVersionComboBoxControl.getItems().length || (!oVersionComboBoxControl.getItems().length && oVersionComboBoxControl.getValue())) {
                    let sVersionNotExist = this.getOwnerComponent().getModel(I18N_GLOBAL_NAME).getResourceBundle().getText("message.incorrectVersion");
                    ErrorHandler.setErrorState(oVersionComboBoxControl, sVersionNotExist, this._sObjectVersionLabel);
                    return;
                }
            }
            // call callback only when there are no errors related to new version selection
            this._versionChangeCallbackCaller(oVersionComboBoxControl.getValue());
            ErrorHandler.clearErrorState(oVersionComboBoxControl);
        },

        /**
         * Used to get access to related Input sapui5 control
         * @returns {Object} SAPUI5 input control
         */
        getObjectNameControl: function() {
            return this.byId(RELATED_OBJECT_ID);
        },

        _getObjectVersionControl: function() {
            return this.byId(RELATED_OBJECT_VERSION_ID);
        },

        /**
         * @override
         *
         * Provides the ability to disable change tracking in cases where the related object is in a view that we don't
         * want to track changes. For example, some maintenance applications have details views for editing attachments.
         * If the user makes a change to a related object field during attachments edit, then if not prevented, the change
         * will trigger publish of the change tracking event, even if the user then cancels the attachment edit. If the user
         * applies the edit, then the change tracking is triggered by the attachments table in the parent view.
         */
        _initJsonFieldChangeTracking: function(bEnable) {
            if (bEnable) {
                BaseObjectController.prototype._initJsonFieldChangeTracking.apply(this, arguments);
            }
        },

        _hasObjectVersion: function() {
            // For the case when only object should be displayed and versions are not relevant and ignored,
            // this._oSettings.sObjectVersionLabelKey must not be used as a parameter on which a decision is made about existence of versions for the object.
            // Neither label nor suggestions (includes non-current version) are correct for the object in such case.
            // For such case a decision is made on this._oSettings.bHideVersion parameter.
            return this._oSettings.bHideVersion ? this._oSettings.bHideVersion : !!this._oSettings.sObjectVersionLabelKey;
        },

        /**
         * Add the object version control to the related object form.
         */
        _addObjectVersionControl: function() {
            let oVersionCombo = new ComboBox(this.getView().createId(RELATED_OBJECT_VERSION_ID), {
                value: {
                    path: "relatedObjectModel>/version"
                },
                selectedKey: {
                    path: "relatedObjectModel>/ref"
                },
                layoutData: [new GridData({
                    span: "XL2 L2 M3 S4",
                    linebreakS: true
                })]
            });

            oVersionCombo.attachChange(this.onObjectVersionChanged, this);
            this.byId("relatedObjectForm").addContent(oVersionCombo);

            this.addControlChangeTracking([RELATED_OBJECT_VERSION_ID]);
        },

        /**
         * Gets the component of the controller's view. If there is no Component connected to the view or the view is not connected to the controller, undefined is returned.
         * @public
         * @override
         */
        getOwnerComponent: function() {
            return BaseObjectController.prototype.getOwnerComponent.apply(this) || this._oGetOwnerComponent;
        },

        /**
         * Set the component of the controller's view. Use for popups.
         * @public
         */
        setOwnerComponent: function(oOwnerComponent) {
            this._oGetOwnerComponent = oOwnerComponent;
        },

        _getAdditionalFieldsValues: function(oData) {
            let aObjectProperties = this._oSettings.aAdditionalObjectFields || [];
            let oResultReturn = null;
            if (aObjectProperties.length > 0) {
                oResultReturn = {};
                for (let i in aObjectProperties) {
                    oResultReturn[aObjectProperties[i]] = oData[aObjectProperties[i]];
                }
            }

            return oResultReturn;
        },

        /**
         *
         * @param sObjectName name of the entity to look for
         * @return {Promise} resolves with {Object} {ref, name}, rejects with {string} error message from i18n or from HTTP error
         * @private
         */
        _checkObjectExistence: function(sObjectName) {
            // clear the error state of field first
            ErrorHandler.clearErrorState(this.getObjectNameControl());
            if (sObjectName) {
                let sUrl;
                if (this._oSettings.oModel) {
                    sUrl = this._oSettings.oModel.sServiceUrl;
                } else {
                    sUrl = this.getOwnerComponent().getModel().sServiceUrl;
                }
                let sProp = this._oSettings.sObjectPropertyName;
                let that = this;

                let sFilter = "$filter=" + encodeURIComponent(sProp + " eq '" + sObjectName.toUpperCase() + "'" + this._oSettings.sBrowseDefaultFilter);
                return new ServiceClient().get(sUrl + this._oSettings.sEntitySetName, sFilter).then(
                    function(oResponse) {
                        if (oResponse.value.length === 0) {
                            let sObjectNotExist = this.getOwnerComponent().getModel(I18N_GLOBAL_NAME).getResourceBundle().getText("message.objectNotExist");
                            throw sObjectNotExist;
                        } else {
                            // here we have a guarantee that accessing first element [0] will not throw undefined exception
                            return oResponse.value.map(function(oItem) {
                                return {
                                    ref: oItem.ref,
                                    name: oItem[sProp],
                                    additional_fields: that._getAdditionalFieldsValues(oItem)
                                };
                            })[0];
                        }
                    }.bind(this)
                );
            }
        }
    });
}, true);