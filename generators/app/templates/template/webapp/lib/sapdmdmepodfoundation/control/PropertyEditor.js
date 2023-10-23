sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/ui/core/Item",
    "sap/ui/core/library",
    "sap/ui/core/syncStyleClass",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/json/JSONModel",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/PlacementType",
    "sap/m/Switch",
    "sap/m/Select",
    "sap/m/MultiComboBox",
    "sap/m/MessageBox",
    "sap/m/TimePicker",
    "sap/dm/dme/device/CrossPlatformUtilities",
    "sap/dm/dme/logging/Logging",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/ValueState",
    "sap/ui/core/TextAlign",
    "sap/ui/core/VerticalAlign",
    "sap/dm/dme/i18n/i18nBundles",
    "sap/dm/dme/message/ErrorHandler",
    "sap/dm/dme/podfoundation/control/TableFactory",
    "sap/dm/dme/podfoundation/controller/ColumnPropertyEditorController",
    "sap/dm/dme/podfoundation/controller/PrintLabelPropertyEditorController",
    "sap/dm/dme/podfoundation/controller/ListNameSearchController",
    "sap/dm/dme/podfoundation/controller/InputParameterTableController",
    "sap/dm/dme/podfoundation/control/ActionAssignmentHelper",
    "sap/dm/dme/podfoundation/control/AddRemoveButtonControl",
    "sap/dm/dme/podfoundation/control/PropertyEditorExtensionLoader",
    "sap/dm/dme/podfoundation/service/ListMaintenanceService",
    "sap/dm/dme/podfoundation/util/PodUtility",
    "sap/dm/dme/podfoundation/formatter/ButtonLabelFormatter"
], function(ManagedObject, Item, coreLibrary, syncStyleClass, ResourceModel, JSONModel, Button, Label,
    Input, PlacementType, Switch, Select, MultiComboBox, MessageBox, TimePicker, CrossPlatformUtilities,
    Logging, NumberFormat, ValueState, TextAlign, VerticalAlign, Bundles, ErrorHandler, TableFactory,
    ColumnPropertyEditorController, PrintLabelPropertyEditorController, ListNameSearchController,
    InputParameterTableController, ActionAssignmentHelper, AddRemoveButtonControl, PropertyEditorExtensionLoader,
    ListMaintenanceService, PodUtility, ButtonLabelFormatter) {
    "use strict";

    let oLogger = Logging.getLogger("sap.dm.dme.podfoundation.control.PropertyEditor");

    let aPopupProperties = ["popup", "popupWidth", "popupHeight", "popupTop", "popupLeft", "popupResizable", "popupDraggable", "popupStretch", "popupTitle",
        "popoverTitle", "popupModal", "popupPlacement", "popupShowClose", "dialogShowClose", "dialogFooterButtons", "popoverFooterButtons"
    ];

    let I18N_POD_DESIGNER_BUNDLE = "sap.dm.dme.podbuilder.i18n.i18n";
    let I18N_PROPERTY_BUNDLE = "sap.dm.dme.i18n.propertyEditor";
    let I18N_GLOBAL_BUNDLE = "sap.dm.dme.i18n.global";
    let I18N_GLOBAL_MODEL = "i18n-global";

    /**
     * Constructor for a new Property Editor
     *
     * @param {string} [sId] Id for the new ManagedObject, generated automatically if no id is given
     * @param {object} [mSettings] Initial settings for the new ManagedObject
     *
     * @class
     * <code>sap.dm.dme.podfoundation.control.PropertyEditor</code> control provides a set of functions
     * used to display and set a plugins properties in POD Designer.
     *
     * @extends sap.ui.base.ManagedObject
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.control.PropertyEditor
     */
    let PropertyEditor = ManagedObject.extend("sap.dm.dme.podfoundation.control.PropertyEditor", {
        metadata: {
            properties: {
                /**
                 * Defines the name of the plugin
                 */
                name: {
                    type: "string",
                    group: "Misc"
                },
                /**
                 * Defines the type of the plugin (i.e.; "view" or "execution")
                 */
                controlType: {
                    type: "string",
                    group: "Misc"
                },
                /**
                 * true if this plugin is only available to be used for popus
                 */
                popupsOnly: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                /*
                 * Defines whether to show the popup properties
                 * @private
                 */
                showPopupProperties: {
                    type: "boolean",
                    group: "Misc",
                    defaultValue: false
                },
                /**
                 * Defines the name of the resource bundle to use for the i18n text
                 */
                resourceBundleName: {
                    type: "string",
                    group: "Misc"
                },
                /**
                 * Defines the name of the plugins resource bundle to use for the i18n text
                 */
                pluginResourceBundleName: {
                    type: "string",
                    group: "Misc"
                },
                /**
                 * Defines the prefix to prepend to the keys for the resource test
                 */
                i18nKeyPrefix: {
                    type: "string",
                    group: "Misc",
                    defaultValue: ""
                },
                /*
                 * Defines the header plugin id
                 * @private
                 */
                headerPluginId: {
                    type: "string",
                    group: "Misc",
                    defaultValue: ""
                }
            },

            publicMethods: [
                "addPropertyEditorContent",
                "setPropertyData",
                "getPropertyData",
                "getTitle"
            ]
        },

        constructor: function(sId, mSettings) {
            ManagedObject.apply(this, arguments);
        },

        POPUP_MODAL: "popup_modal",
        POPUP_MODELESS: "popup_modeless",
        POPOVER: "popover",
        NEW_TAB: "new_tab"
    });

    /**
     * Returns whether this is for the WORK Center POD.
     *
     * @returns true if Work Center POD, else false.
     * @protected
     */
    PropertyEditor.prototype.isWorkCenterPod = function() {
        return this.getHeaderPluginId() && this.getHeaderPluginId() === "wcPodSelectionPlugin";
    };

    /**
     * Returns whether this is for the Operation POD.
     *
     * @returns true if Operation POD, else false.
     * @protected
     */
    PropertyEditor.prototype.isOperationActivityPod = function() {
        return this.getHeaderPluginId() && this.getHeaderPluginId() === "operationPodSelectionPlugin";
    };

    /**
     * Returns a title for current editor.
     *
     * @returns {string} i18n title.
     * @public
     */
    PropertyEditor.prototype.getTitle = function() {
        if (!this._sTitle) {
            let sResourceBundleName = this.getResourceBundleName();
            if (PodUtility.isEmpty(sResourceBundleName)) {
                this._sTitle = "resourceBundleName not defined";
                return this._sTitle;
            }
            if (this.hasProcessIndustryTitle()) {
                this._sTitle = Bundles.getPropertiesText(sResourceBundleName, "title");
            } else {
                this._sTitle = Bundles.getNonEnhancedPropertiesText(sResourceBundleName, "title");
            }
        }
        return this._sTitle;
    };

    /**
     * Returns whether or not the property editor has a
     * Process Industry Title or not.
     *
     * @returns {boolean} default is false.
     * @public
     */
    PropertyEditor.prototype.hasProcessIndustryTitle = function() {
        return false;
    };

    /**
     * returns whether or not this property editor has configuration properties
     *
     * @return {boolean} true if configuration properties exist (default), else none
     * @public
     */
    PropertyEditor.prototype.hasConfigurationProperties = function() {
        return true;
    };

    /**
     * Add controls to property editor
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @public
     */
    PropertyEditor.prototype.addPropertyEditorContent = function(oPropertyFormContainer) {
        // to be implemented by sub-class
    };

    /*
     * Add controller for popup property editing
     *
     * @param {sap.ui.core.mvc.Controller} oPopupPropertyEditorController controller to handle popup property
     * @private
     */
    PropertyEditor.prototype.setPopupPropertyEditorController = function(oPopupPropertyEditorController) {
        this._oPopupPropertyEditorController = oPopupPropertyEditorController;
    };

    /*
     * Get controller for popup property editing
     *
     * @returns sap.ui.core.mvc.Controller to handle popup property
     * @private
     */
    PropertyEditor.prototype.getPopupPropertyEditorController = function() {
        return this._oPopupPropertyEditorController;
    };

    /**
     * Add a control to the PropertyEditor's SimpleForm
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer
     * @param {sap.ui.core.Control} oControl UI5 control to add
     * @public
     */
    PropertyEditor.prototype.addFormContent = function(oPropertyFormContainer, oControl) {
        if (oControl.setFieldGroupIds) {
            oControl.setFieldGroupIds(["PROPERTY_EDITOR_GROUP"]);
        }
        oPropertyFormContainer.addContent(oControl);
    };

    /*
     * Add popup property controls to property editor
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @private
     */
    PropertyEditor.prototype.addPopupPropertyEditorContent = function(oPropertyFormContainer) {
        if (!this.getShowPopupProperties()) {
            return;
        }
        this._oPopupPropertyFormContainer = oPropertyFormContainer;

        let oData = this.getPopupPropertyData();

        // add the Select control
        this.addPopupTypeSelectionControl(oPropertyFormContainer, oData);

        // add the Select control
        this.addPopupPropertyControls(oPropertyFormContainer, oData);

    };

    /**
     * Add's the popup Select control to the property editor
     * <p>
     * Calls getPopupSelectValidData() to return the types to display
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {object} oData Current property data
     * @protected
     */
    PropertyEditor.prototype.addPopupTypeSelectionControl = function(oPropertyFormContainer, oData) {
        let oPopupValidData = this.getPopupSelectValidData();
        this.addSelect(oPropertyFormContainer, "popup", oData, oPopupValidData.validValues, oPopupValidData.validTexts, false);
    };

    /**
     * Add the popup property controls to property editor
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {object} oData Current property data
     * @protected
     */
    PropertyEditor.prototype.addPopupPropertyControls = function(oPropertyFormContainer, oData) {
        let oMetaData = {
            type: "Number"
        };
        this._aPopupControls = [];
        this._aModelessControls = [];
        this._aModalControls = [];
        this._aPopoverControls = [];

        this._aModalControls[this._aModalControls.length] = this.addInputField(oPropertyFormContainer, "popupTitle", oData);

        this._aPopoverControls[this._aPopoverControls.length] = this.addInputField(oPropertyFormContainer, "popoverTitle", oData);

        // *NOTE: dialogShowClose was used here rather than popupShowClose.  The reason, the control is already defined for the _aPopoverControls[]
        // which results in a duplicate id in the array if the same name(id) is used.
        this._aModalControls[this._aModalControls.length] = this.addSwitch(oPropertyFormContainer, "dialogShowClose", oData);
        this._aModalControls[this._aModalControls.length] = this.addSwitch(oPropertyFormContainer, "popupStretch", oData);
        this._aModalControls[this._aModalControls.length] = this.addSwitch(oPropertyFormContainer, "popupDraggable", oData);
        this._aModalControls[this._aModalControls.length] = this.addSwitch(oPropertyFormContainer, "popupResizable", oData);

        this._aModelessControls[this._aModelessControls.length] = this.addInputField(oPropertyFormContainer, "popupTop", oData, oMetaData);
        this._aModelessControls[this._aModelessControls.length] = this.addInputField(oPropertyFormContainer, "popupLeft", oData, oMetaData);

        this._aPopupControls[this._aPopupControls.length] = this.addInputField(oPropertyFormContainer, "popupWidth", oData, oMetaData);
        this._aPopupControls[this._aPopupControls.length] = this.addInputField(oPropertyFormContainer, "popupHeight", oData, oMetaData);

        let oPlacementData = this.getPlacementValidData();
        this._aPopoverControls[this._aPopoverControls.length] = this.addSelect(oPropertyFormContainer, "popupPlacement", oData,
            oPlacementData.validValues, oPlacementData.validTexts, true);

        this._aPopoverControls[this._aPopoverControls.length] = this.addSwitch(oPropertyFormContainer, "popupShowClose", oData);
        this._aPopoverControls[this._aPopoverControls.length] = this.addSwitch(oPropertyFormContainer, "popupModal", oData);


        this._oAddRemoveFooterButtonControl = this.addAddRemoveButtonControl(oPropertyFormContainer, "dialogFooterButtons", oData);
        this._aModalControls[this._aModalControls.length] = this._oAddRemoveFooterButtonControl;

        this._oAddRemovePopoverFooterButtonControl = this.addAddRemoveButtonControl(oPropertyFormContainer, "popoverFooterButtons", oData);
        this._aPopoverControls[this._aPopoverControls.length] = this._oAddRemovePopoverFooterButtonControl;

        this._setPopupControlsVisibility(oData["popup"]);
    };

    /**
     * Returns valid values for Popup/Popover type selection
     *
     * @returns {object} holds array of keys and values
     * @private
     */
    PropertyEditor.prototype.isMultiInstance = function() {
        let sId = this.getId();
        let oHelper = this.getMainControllerHelper();
        if (oHelper) {
            // check comonents.json file for setting
            return oHelper.isMultipleInstancesAllowed(sId)
        } else if (sId.indexOf(".") > 0) {
            // assume multi-instance if instance id defined
            return true;
        }
        return false;
    };

    /**
     * Returns valid values for Popup/Popover type selection
     *
     * @returns {object} holds array of keys and values
     * @protected
     */
    PropertyEditor.prototype.getPopupSelectValidData = function() {
        let aValidValues = [];
        let aValidTexts = [];
        aValidValues[aValidValues.length] = this.POPUP_MODAL;
        aValidValues[aValidValues.length] = this.POPUP_MODELESS;
        aValidValues[aValidValues.length] = this.POPOVER;
        return {
            validValues: aValidValues,
            validTexts: aValidTexts
        };
    };

    /*
     * Returns valid values for Popup/Popover type selection
     *
     * @returns {object} holds array of keys and values
     * @private
     */
    PropertyEditor.prototype.getPlacementValidData = function() {
        let aValidValues = [];
        aValidValues[aValidValues.length] = PlacementType.Auto;
        aValidValues[aValidValues.length] = PlacementType.HorizontalPreferredLeft;
        aValidValues[aValidValues.length] = PlacementType.HorizontalPreferredRight;
        aValidValues[aValidValues.length] = PlacementType.VerticalPreferredBottom;
        aValidValues[aValidValues.length] = PlacementType.VerticalPreferredTop;
        let aValidTexts = [];
        aValidTexts[aValidTexts.length] = "placement.type.auto";
        aValidTexts[aValidTexts.length] = "placement.type.horizontalPreferredLeft";
        aValidTexts[aValidTexts.length] = "placement.type.horizontalPreferredRight";
        aValidTexts[aValidTexts.length] = "placement.type.verticalPreferredBottom";
        aValidTexts[aValidTexts.length] = "placement.type.verticalPreferredTop";

        return {
            validValues: aValidValues,
            validTexts: aValidTexts
        };
    };

    /*
     * Sets Popup controls visibility
     *
     * @returns sPopupType type of popup selected
     * @private
     */
    PropertyEditor.prototype._setPopupControlsVisibility = function(sPopupType) {
        let oControl;

        for (oControl of this._aModelessControls) {
            this._setPopupControlVisible(oControl, false);
        }
        for (oControl of this._aModalControls) {
            this._setPopupControlVisible(oControl, false);
        }
        for (oControl of this._aPopupControls) {
            this._setPopupControlVisible(oControl, false);
        }
        for (oControl of this._aPopoverControls) {
            this._setPopupControlVisible(oControl, false);
        }

        if (PodUtility.isNotEmpty(sPopupType)) {
            this._setDelayedPopupControlVisible(sPopupType);
        }
    };

    /*
     * Sets Popup controls visibility in a delay
     *
     * @returns sPopupType type of popup selected
     * @private
     */
    PropertyEditor.prototype._setDelayedPopupControlVisible = function(sPopupType) {
        let that = this;
        setTimeout(function() {
            let oControl;
            if (sPopupType === that.POPUP_MODELESS) {
                for (oControl of that._aModelessControls) {
                    that._setPopupControlVisible(oControl, true);
                }
            } else if (sPopupType === that.POPOVER) {
                for (oControl of that._aPopoverControls) {
                    that._setPopupControlVisible(oControl, true);
                }
            } else if (sPopupType === that.POPUP_MODAL) {
                for (oControl of that._aModalControls) {
                    that._setPopupControlVisible(oControl, true);
                }
            }
            if (sPopupType !== that.NEW_TAB) {
                for (oControl of that._aPopupControls) {
                    that._setPopupControlVisible(oControl, true);
                }
            }
        }, 50);
    };

    /*
     * Sets the visibility of a Popup controls
     *
     * @param {object} oPopupControl Popup control to set visibility for
     * @param {boolean} boolean true to set visible, else false
     * @private
     */
    PropertyEditor.prototype._setPopupControlVisible = function(oPopupControl, bVisible) {
        let aContent = this._oPopupPropertyFormContainer.getContent();
        let iIndex = this._oPopupPropertyFormContainer.indexOfContent(oPopupControl);
        let oPopupControlLabel = aContent[iIndex - 1];
        oPopupControl.setVisible(bVisible);
        oPopupControlLabel.setVisible(bVisible);
    };

    /**
     * Creates a new TimePicker and Label and assigns to the SimpleForm
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {string} sDataFieldName name of data property
     * @param {object} oDefaultData Data object holding default values
     * @param {object} oMetaData Meta data for TimePicker control
     * @returns sap.m.TimePicker control
     * @public
     */
    PropertyEditor.prototype.addTimePickerField = function(oPropertyFormContainer, sDataFieldName, oDefaultData, oMetaData) {
        let sLabelId = oPropertyFormContainer.getId() + "-" + sDataFieldName + "Label";
        let sInputId = oPropertyFormContainer.getId() + "-" + sDataFieldName + "Input";

        let oLabel = new Label(sLabelId, {
            text: this.getLocalizedText(sDataFieldName),
            labelFor: sInputId
        });
        this.addFormContent(oPropertyFormContainer, oLabel);

        let oSettings = oMetaData || {};
        oSettings.value = oDefaultData[sDataFieldName];
        oSettings.valueFormat = oSettings.valueFormat || "HH:mm:ss";
        oSettings.displayFormat = oSettings.displayFormat || "HH:mm:ss";
        oSettings.change = function(oEvent) {
            let sValue = oEvent.getSource().getValue();
            if (this.isPopupProperty(sDataFieldName)) {
                this.handlePopupInputChange(oEvent.getSource(), sDataFieldName, sValue);
            } else {
                this.handleInputChange(sDataFieldName, sValue);
            }
        }.bind(this);

        let oInputControl = new TimePicker(sInputId, oSettings);
        this.addFormContent(oPropertyFormContainer, oInputControl);
        return oInputControl;
    };

    /**
     * Creates a new Input control and Label and assigns to the SimpleForm
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {string} sDataFieldName name of data property
     * @param {object} oDefaultData Data object holding default values
     * @param {object} oMetaData Meta data for Input control
     * @returns sap.m.Input control
     * @public
     */
    PropertyEditor.prototype.addInputField = function(oPropertyFormContainer, sDataFieldName, oDefaultData, oMetaData) {
        let sPropertyFormContainerId = oPropertyFormContainer.getId();
        let sDefaultValue = oDefaultData[sDataFieldName];
        let sLabelId = sPropertyFormContainerId + "-" + sDataFieldName + "Label";
        let sInputId = sPropertyFormContainerId + "-" + sDataFieldName + "Input";
        let sText = this.getLocalizedText(sDataFieldName);

        let oLabel = new Label(sLabelId, {
            text: sText,
            labelFor: sInputId
        });
        this.addFormContent(oPropertyFormContainer, oLabel);

        let that = this;

        let oInputMetaData;
        if (typeof oMetaData === "undefined") {
            oInputMetaData = {
                value: sDefaultValue,
                change: function(oEvent) {
                    let sValue = oEvent.getSource().getValue();
                    if (that.isPopupProperty(sDataFieldName)) {
                        that.handlePopupInputChange(oEvent.getSource(), sDataFieldName, sValue);
                    } else if (that.isMaxLengthProperty(sDataFieldName)) {
                        that.handleIntegerInputChange(oEvent.getSource(), sDataFieldName, sValue);
                    } else {
                        if (!that.validateWidthOrHeightValues(oEvent.getSource(), sValue, sDataFieldName)) {
                            return;
                        }
                        that.handleInputChange(sDataFieldName, sValue, oEvent.getSource());
                    }
                }
            };
        } else {
            oInputMetaData = CrossPlatformUtilities.cloneObject(oMetaData);
            if (!oInputMetaData.value) {
                oInputMetaData.value = sDefaultValue;
            }
            oInputMetaData.change = function(oEvent) {
                let sValue = oEvent.getSource().getValue();
                if (that.isPopupProperty(sDataFieldName)) {
                    that.handlePopupInputChange(oEvent.getSource(), sDataFieldName, sValue);
                } else if (that.isMaxLengthProperty(sDataFieldName)) {
                    that.handleIntegerInputChange(oEvent.getSource(), sDataFieldName, sValue);
                } else {
                    if (!that.validateWidthOrHeightValues(oEvent.getSource(), sValue, sDataFieldName)) {
                        return;
                    }
                    that.handleInputChange(sDataFieldName, sValue, oEvent.getSource());
                }
            };
        }

        let oInputField = new Input(sInputId, oInputMetaData);
        this.addFormContent(oPropertyFormContainer, oInputField);
        return oInputField;
    };

    /**
     * Handles Input control change event for integer data
     *
     * @param {sap.m.Input} oInput SimpleForm to add controls to
     * @param {string} sDataFieldName name of data property
     * @param {string} integer value
     * @protected
     */
    PropertyEditor.prototype.handleIntegerInputChange = function(oInput, sDataFieldName, sValue) {
        let oData = this.getPropertyData();

        let oIntFormatter = NumberFormat.getIntegerInstance({
            strictGroupingValidation: true
        });
        let iQuantity = oIntFormatter.parse(sValue);

        if (Number.isNaN(iQuantity)) {
            oInput.setValueState(ValueState.Error);
            let sMessage = this._getBaseI18nText("message.invalidMaxLengthValueInput");
            oInput.setValueStateText(sMessage);
        } else {
            oInput.setValueState(ValueState.None);
            oData[sDataFieldName] = iQuantity;
        }
    };

    /**
     * Handles Input control change event for string data
     *
     * @param {sap.m.Input} oInput SimpleForm to add controls to
     * @param {string} sDataFieldName name of data property
     * @param {string} string value
     * @protected
     */
    PropertyEditor.prototype.handleInputChange = function(sDataFieldName, sValue, oSource) {
        let oData = this.getPropertyData();
        oData[sDataFieldName] = sValue;
    };

    /**
     * Handles Popup properties Input control change event for string data
     *
     * @param {sap.m.Input} oInput SimpleForm to add controls to
     * @param {string} sDataFieldName name of data property
     * @param {string} string value
     * @protected
     */
    PropertyEditor.prototype.handlePopupInputChange = function(oInput, sDataFieldName, sValue) {
        let aPopupNumericProperties = ["popupWidth", "popupHeight", "popupTop", "popupLeft"];
        let oData = this.getPopupPropertyData();
        let pos = aPopupNumericProperties.indexOf(sDataFieldName)
        if (pos > -1 && isNaN(sValue)) {

            oInput.setValueState(ValueState.Error);
            let sMessage;
            if (pos == 0) {
                sMessage = this._getBaseI18nText("message.invalidWidthValueInput");
            } else if (pos == 1) {
                sMessage = this._getBaseI18nText("message.invalidHeightValueInput");
            } else if (pos == 2) {
                sMessage = this._getBaseI18nText("message.invalidTopValueInput");
            } else {
                sMessage = this._getBaseI18nText("message.invalidLeftValueInput");
            }
            oInput.setValueStateText(sMessage);
        } else {
            oData[sDataFieldName] = sValue;
        }
    };

    /**
     * Creates a new Switch control and Label and assigns to the SimpleForm
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {string} sDataFieldName name of data property
     * @param {object} oDefaultData Data object holding default values
     * @param {string} sTextOn Optional text to display for on
     * @param {string} sTextOff Optional text to display for off
     * @returns sap.m.Switch control
     * @public
     */
    PropertyEditor.prototype.addSwitch = function(oPropertyFormContainer, sDataFieldName, oDefaultData, sTextOn, sTextOff) {
        let sPropertyFormContainerId = oPropertyFormContainer.getId();
        let bDefaultValue = oDefaultData[sDataFieldName];
        let sLabelId = sPropertyFormContainerId + "-" + sDataFieldName + "Label";
        let sSwitchId = sPropertyFormContainerId + "-" + sDataFieldName + "Switch";
        let sText = this.getLocalizedText(sDataFieldName);

        let oLabel = new Label(sLabelId, {
            text: sText,
            labelFor: sSwitchId
        });
        this.addFormContent(oPropertyFormContainer, oLabel);

        let that = this;

        let oSwitch = new Switch(sSwitchId, {
            state: bDefaultValue,
            change: function(oEvent) {
                let bSelected = oEvent.getSource().getState();
                if (that.isPopupProperty(sDataFieldName)) {
                    that.handlePopupSwitchChange(sDataFieldName, bSelected);
                } else {
                    that.handleSwitchChange(sDataFieldName, bSelected);
                }
            }
        });

        if (sTextOn) {
            oSwitch.setCustomTextOn(sTextOn);
        }

        if (sTextOff) {
            oSwitch.setCustomTextOff(sTextOff);
        }

        this.addFormContent(oPropertyFormContainer, oSwitch);
        return oSwitch;
    };

    /**
     * Handles Switch control change event for string data
     *
     * @param {string} sDataFieldName name of data property
     * @param {boolean} selected value
     * @protected
     */
    PropertyEditor.prototype.handleSwitchChange = function(sDataFieldName, bSelected) {
        let oData = this.getPropertyData();
        oData[sDataFieldName] = bSelected;
    };

    /**
     * Handles Popup properties Switch control change event for string data
     *
     * @param {string} sDataFieldName name of data property
     * @param {boolean} selected value
     * @protected
     */
    PropertyEditor.prototype.handlePopupSwitchChange = function(sDataFieldName, bSelected) {
        let oData = this.getPopupPropertyData();
        oData[sDataFieldName] = bSelected;
    };

    /**
     * Creates a new Select control and Label and assigns to the SimpleForm
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {string} sDataFieldName name of data property
     * @param {object} oDefaultData Data object holding default values
     * @param {string} aValidValues Values that are assigned to texts and stored in data
     * @param {string} aValidTexts Texts that are displayed in Select control
     * @param {boolean} bTranslateValidTexts true to translate text (default), else false
     * @returns sap.m.Select control
     * @public
     */
    PropertyEditor.prototype.addSelect = function(oPropertyFormContainer, sDataFieldName, oDefaultData, aValidValues, aValidTexts, bTranslateValidTexts) {
        let sPropertyFormContainerId = oPropertyFormContainer.getId();
        let sDefaultValue = oDefaultData[sDataFieldName];
        let sLabelId = sPropertyFormContainerId + "-" + sDataFieldName + "Label";
        let sSelectId = sPropertyFormContainerId + "-" + sDataFieldName + "Select";
        let sText = this.getLocalizedText(sDataFieldName);

        let oLabel = new Label(sLabelId, {
            text: sText,
            labelFor: sSelectId
        });
        this.addFormContent(oPropertyFormContainer, oLabel);

        let that = this;

        let oSelect = new Select(sSelectId, {
            change: function(oEvent) {
                let sValue = oEvent.getSource().getSelectedKey();
                if (sValue && sValue === "EMPTY") {
                    sValue = "";
                }
                if (that.isPopupProperty(sDataFieldName)) {
                    that.handlePopupSelectChange(sDataFieldName, sValue);
                } else {
                    that.handleSelectChange(sDataFieldName, sValue);
                }
            }
        });

        let bDoTranslateText = true;
        if (arguments.length === 6 && typeof bTranslateValidTexts != "undefined") {
            if (!bTranslateValidTexts) {
                bDoTranslateText = false;
            }
        }

        if (aValidValues && aValidValues.length > 0) {
            let sSelectItemId, oItem;
            for (let i = 0; i < aValidValues.length; i++) {
                sSelectItemId = sSelectId + "-item" + i;
                if (this.isPopupProperty(sDataFieldName)) {
                    if (!bDoTranslateText) {
                        sText = this.getLocalizedText(aValidValues[i]);
                    } else if (aValidTexts && aValidTexts[i]) {
                        sText = this.getLocalizedText(aValidTexts[i]);
                    }
                } else if (aValidTexts && aValidTexts[i]) {
                    if (bDoTranslateText) {
                        sText = this.getLocalizedText(aValidTexts[i]);
                    } else {
                        sText = aValidTexts[i];
                    }
                } else {
                    sText = this.getLocalizedText(aValidValues[i]);
                }

                oItem = new Item(sSelectItemId, {
                    key: aValidValues[i],
                    text: sText
                });
                oSelect.addItem(oItem);
            }
        }

        oSelect.setSelectedKey(sDefaultValue);

        this.addFormContent(oPropertyFormContainer, oSelect);
        return oSelect;
    };

    /**
     * Handles Select control change event
     *
     * @param {string} sDataFieldName name of data property
     * @param {string} selection value
     * @protected
     */
    PropertyEditor.prototype.handleSelectChange = function(sDataFieldName, sSelectionValue) {
        let oData = this.getPropertyData();
        oData[sDataFieldName] = sSelectionValue;

        if (sDataFieldName === "selectActionPageName" && this._oActionButtonSelect) {
            oData["selectActionButtonId"] = "";
            this._oActionButtonSelect.setSelectedKey("EMPTY");
        } else if (sDataFieldName === "selectActionButtonId" && this._oActionPageSelect) {
            oData["selectActionPageName"] = "";
            this._oActionPageSelect.setSelectedKey("EMPTY");
        }
    };

    /**
     * Creates a new MultiComboBox control and Label and assigns to the SimpleForm
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {string} sDataFieldName name of data property
     * @param {object} oDefaultData Data object holding default values
     * @param {Array.<{key: Object, value: bool}>} aValidValues Values that are assigned to texts and stored in data. Use value boolean key to set certain items selected
     * @param {Array.<string>} aValidTexts Texts that are displayed in Select control
     * @param {boolean} bTranslateValidTexts true to translate text (default), else false
     * @returns {sap.m.MultiComboBox} control
     * @public
     */
    PropertyEditor.prototype.addMultiComboBox = function(oPropertyFormContainer, sDataFieldName, oDefaultData, aValidValues, aValidTexts, bTranslateValidTexts) {
        bTranslateValidTexts = !!bTranslateValidTexts;
        let sPropertyFormContainerId = oPropertyFormContainer.getId();
        let aDefaultValues = oDefaultData[sDataFieldName];
        let sLabelId = sPropertyFormContainerId + "-" + sDataFieldName + "Label";
        let sSelectId = sPropertyFormContainerId + "-" + sDataFieldName + "Select";
        let sText = this.getLocalizedText(sDataFieldName);

        let oLabel = new Label(sLabelId, {
            text: sText,
            labelFor: sSelectId
        });
        this.addFormContent(oPropertyFormContainer, oLabel);

        let that = this;

        let oMultiComboBox = new MultiComboBox(sSelectId, {
            selectionFinish: function(oEvent) {
                let aKeys = oEvent.getSource().getSelectedKeys();
                that.handleMultiComboBoxChange(sDataFieldName, aKeys);
            }
        });

        const aValidKeys = aValidValues.map((oItem) => oItem.key);
        if (aValidKeys) {
            for (let i = 0; i < aValidKeys.length; i++) {
                let sSelectItemId = sSelectId + "-item" + i;
                if (aValidTexts && aValidTexts[i]) {
                    if (bTranslateValidTexts) {
                        sText = this.getLocalizedText(aValidTexts[i]);
                    } else {
                        sText = aValidTexts[i];
                    }
                } else {
                    sText = this.getLocalizedText(aValidValues[i].key);
                }

                let oItem = new Item(sSelectItemId, {
                    key: aValidKeys[i],
                    text: sText
                });
                oMultiComboBox.addItem(oItem);
            }
        }

        // search for selected keys in the plugin save data
        const aSelectedKeys = aDefaultValues.filter(oItem => oItem.value).map((oItem) => oItem.key);
        oMultiComboBox.setSelectedKeys(aSelectedKeys);

        this.addFormContent(oPropertyFormContainer, oMultiComboBox);
        return oMultiComboBox;
    };

    /**
     * Handles MultiComboBox control change event
     * Update the appropriate property with new true/false 'value' properties.
     * @param {string} sDataFieldName name of data property
     * @param {Array.<{key: Object, value: bool}>} aSelectionValues selection value
     * @protected
     */
    PropertyEditor.prototype.handleMultiComboBoxChange = function(sDataFieldName, aSelectionValues) {
        aSelectionValues = aSelectionValues || [];
        let oData = this.getPropertyData();
        // use default property data in case when the POD was never saved with this new property.
        const aExisting = oData[sDataFieldName] || this.getDefaultPropertyData()[sDataFieldName];
        const aUpdatedValues = aExisting.map((oItem) => {
            oItem.value = aSelectionValues.includes(oItem.key);
            return oItem;
        });
        oData[sDataFieldName] = aUpdatedValues;
    };

    /**
     * Handles Popup properties Select control change event
     *
     * @param {string} sDataFieldName name of data property
     * @param {string} selection value
     * @protected
     */
    PropertyEditor.prototype.handlePopupSelectChange = function(sDataFieldName, sSelectionValue) {
        let oData = this.getPopupPropertyData();
        let sOldDataFieldValue = oData[sDataFieldName];
        oData[sDataFieldName] = sSelectionValue;
        if (sDataFieldName === "popup") {
            if ((sOldDataFieldValue === this.POPUP_MODAL && oData["popup"] !== this.POPUP_MODAL) ||
                (sOldDataFieldValue === this.POPOVER && oData["popup"] !== this.POPOVER)) {
                if (sOldDataFieldValue === this.POPUP_MODAL) {
                    // remove any registered dialog footer actions
                    oData["dialogFooterButtons"] = [];
                    this.setRegisteredFooterActions(null);
                    if (this._oAddRemoveFooterButtonControl) {
                        this._oAddRemoveFooterButtonControl.refreshTableModel(oData);
                    }
                } else if (sOldDataFieldValue === this.POPOVER) {
                    // remove any registered popover footer actions
                    oData["popoverFooterButtons"] = [];
                    this.setRegisteredFooterActions(null);
                    if (this._oAddRemovePopoverFooterButtonControl) {
                        this._oAddRemovePopoverFooterButtonControl.refreshTableModel(oData);
                    }
                }
            }
            this._setPopupControlsVisibility(oData["popup"]);
            if (this._oPopupPropertyEditorController) {
                if (oData["popup"] === this.POPUP_MODELESS || oData["popup"] === this.POPUP_MODAL || oData["popup"] === this.POPOVER) {
                    this._oPopupPropertyEditorController.setPopupEnabled(this, true);
                } else {
                    this._oPopupPropertyEditorController.setPopupEnabled(this, false);
                }
            }
        }
    };

    /**
     * Creates a new Button and assigns to the SimpleForm
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {string} sDataFieldName name of data property
     * @param {object} oDefaultData Data object holding default values
     * @param {function} fnButtonPressHandler function to call when button is pressed
     * @param {object} object containing fnButtonPressHandler
     * @returns sap.m.Button control
     * @public
     */
    PropertyEditor.prototype.addButton = function(oPropertyFormContainer, sDataFieldName, oDefaultData, fnButtonPressHandler, fnHandlerContext) {
        let sPropertyFormContainerId = oPropertyFormContainer.getId();
        let sButtonId = sPropertyFormContainerId + "-" + sDataFieldName + "Button";

        let sText = this.getLocalizedText(sDataFieldName);
        let sTooltipKey = sDataFieldName + "Tooltip";
        let sTooltip = this.getLocalizedText(sTooltipKey);
        if (sTooltip === sTooltipKey) {
            sTooltip = sText;
        }
        let oButton = new Button(sButtonId, {
            text: this.getLocalizedText(sDataFieldName),
            tooltip: sTooltip,
            press: function(oEvent) {
                fnButtonPressHandler.call(fnHandlerContext, oPropertyFormContainer, sDataFieldName, oDefaultData);
            }
        });
        this.addFormContent(oPropertyFormContainer, oButton);
    };

    /**
     * Creates a new sap.m.Table control and assigns to the SimpleForm
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {object} oMetaData Metadata for Table control
     * <pre>
     *     {
     *         id: sId,
     *         bindingPath: vBindingPath
     *         listConfiguration: oListConfiguration,
     *         listColumnData: aListColumnData,
     *         tableMetadata: oTableMetadata,
     *         columnListItemMetadata: oColumnListItemMetadata,
     *         resourceBundleName: sResourceBundleName
     *     }
     *
     *     where:
     *        id: ID for table
     *        bindingPath: binding path in model (i.e; "/data" or {path: "/data", ...} )
     *        listConfiguration: object contains list configuration.
     *        listColumnData: (optional) Array of column data overrides
     *        tableMetadata: Metadata for Table
     *        columnListItemMetadata: Metadata for ColumnListItem
     *        resourceBundleName: (optional) Resource Bundle name to get text. if not defined will use default
     *        showControlLabel: (optional) true to show label for table, else false
     * </pre>
     * @returns sap.m.Table control
     * @public
     */
    PropertyEditor.prototype.addTable = function(oPropertyFormContainer, oMetadata) {
        let oListConfiguration = oMetadata.listConfiguration;
        if (PodUtility.isEmpty(oListConfiguration.tableType)) {
            oListConfiguration.tableType = "mobile";
        }
        let aListColumnData = oMetadata.listColumnData;
        let oResourceBundle = this.getResourceBundle(oMetadata.resourceBundleName);

        let oTableFactory = this._getTableFactory(oListConfiguration, aListColumnData, oResourceBundle);

        let oTableMetadata = oMetadata.tableMetadata;
        let oColumnListItemMetadata = oMetadata.columnListItemMetadata;

        let sPropertyFormContainerId = oPropertyFormContainer.getId();
        let sLabelId = sPropertyFormContainerId + "-" + oMetadata.id + "Label";
        let sTableId = sPropertyFormContainerId + "-" + oMetadata.id + "Select";

        let sText = this._getTableLabel(oMetadata);
        let oLabel = new Label(sLabelId, {
            text: sText,
            labelFor: sTableId
        });
        this.addFormContent(oPropertyFormContainer, oLabel);

        let oTable = oTableFactory.createTable(sTableId, oMetadata.bindingPath, oTableMetadata, oColumnListItemMetadata);

        this.addFormContent(oPropertyFormContainer, oTable);

        return oTable;
    };

    /*
     * Returns the label for the table control
     * @returns text for label
     * @private
     */
    PropertyEditor.prototype._getTableLabel = function(oMetadata) {
        let sText = "";
        let bShowLabel = true;
        if (typeof oMetadata.showControlLabel !== "undefined") {
            bShowLabel = oMetadata.showControlLabel;
        }
        if (bShowLabel) {
            sText = this.getLocalizedText(oMetadata.id);
        }
        return sText;
    };

    /*
     * Creates a new TableFactory
     *
     * @param {object} oListConfiguration Object contains list configuration.
     * @param {object} aListColumnData Array of column data overrides
     * @param {object} oResourceBundle ResourceBundle to get text
     * @returns TableFactory
     * @private
     */
    PropertyEditor.prototype._getTableFactory = function(oListConfiguration, aListColumnData, oResourceBundle) {
        return new TableFactory(oListConfiguration, aListColumnData, oResourceBundle);
    };

    /*
     * Creates a new Column property editor Button and assigns to the SimpleForm.
     * This is only to be used by POD Designer framework
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {string} sDataFieldName name of data property
     * @param {object} oDefaultData Data object holding default values
     * @private
     */
    PropertyEditor.prototype.addColumnPropertyEditor = function(oPropertyFormContainer, sDataFieldName, oDefaultData) {
        this._sortColumnConfigurationData(oDefaultData);
        this.addButton(oPropertyFormContainer, sDataFieldName, oDefaultData, this._columnConfigurationPressHandler, this);

        let aCustomTypes = null;
        if (PodUtility.isNotEmpty(oDefaultData.listCategory) &&
            oDefaultData.listCategory === "POD_WORKLIST") {
            aCustomTypes = ["ITEM", "SHOP_ORDER"];
        }
        if (!aCustomTypes) {
            return;
        }
        let that = this;
        setTimeout(function() {
            that._updateDefaultColumnPropertyData(oPropertyFormContainer, oDefaultData, aCustomTypes);
        }, 0);
    };

    PropertyEditor.prototype._updateDefaultColumnPropertyData = function(oPropertyFormContainer, oDefaultData, aCustomTypes) {
        let oMainView = this._getMainView(oPropertyFormContainer);
        let oService = this._getListMaintenanceService(oMainView);
        return oService.getCustomColumns(aCustomTypes)
            .then(function(aCustomColumns) {
                this._addCustomDataColumns(oDefaultData, aCustomColumns);
                this._removeObsoleteCustomColumn(oDefaultData, aCustomColumns);
                this._sortColumnConfigurationData(oDefaultData);
            }.bind(this));
    };

    /*
     * This is only to be used by POD Designer framework
     * @private
     */
    PropertyEditor.prototype._addCustomDataColumns = function(oDefaultData, aCustomColumns) {
        if (!aCustomColumns || aCustomColumns.length === 0) {
            return;
        }
        if (!oDefaultData.columnConfiguration) {
            oDefaultData.columnConfiguration = [];
        }
        for (let oCustomColumn of aCustomColumns) {
            let iIndex = -1;
            for (let j = 0; j < oDefaultData.columnConfiguration.length; j++) {
                if (oDefaultData.columnConfiguration[j].columnId === oCustomColumn.columnId) {
                    iIndex = j;
                    break;
                }
            }

            let sDescriptionPrefix = this._getBaseI18nText("customDataFieldLabelPrefix_" + oCustomColumn.tableName);

            if (iIndex >= 0) {
                // already added in configuration - need to update label
                oDefaultData.columnConfiguration[iIndex].description = sDescriptionPrefix + oCustomColumn.columnLabel;
                continue;
            }

            oDefaultData.columnConfiguration[oDefaultData.columnConfiguration.length] = {
                columnId: oCustomColumn.columnId,
                description: sDescriptionPrefix + oCustomColumn.columnLabel,
                wrapping: false,
                hAlign: "Begin",
                vAlign: "Middle"
            };
        }
    };

    /*
     * This will remove obsolete custom columns
     * @private
     */
    PropertyEditor.prototype._removeObsoleteCustomColumn = function(oDefaultData, aCustomColumns) {
        let aColumns = [];
        for (let oColumnConfig of oDefaultData.columnConfiguration) {
            let sColumnId = oColumnConfig.columnId
            if (sColumnId.indexOf(".") > 0) {
                // custom field, check if it still exists
                if (!this._findCustomColumn(sColumnId, aCustomColumns)) {
                    // do not load this custom column - no longer defined
                    continue;
                }
            }
            aColumns[aColumns.length] = oColumnConfig;
        }
        oDefaultData.columnConfiguration = aColumns;
    };

    PropertyEditor.prototype._findCustomColumn = function(sColumnId, aCustomColumns) {
        if (aCustomColumns && aCustomColumns.length > 0) {
            for (let oCustomColumn of aCustomColumns) {
                if (sColumnId === oCustomColumn.columnId) {
                    return true;
                }
            }
        }
        return false;
    };

    /*
     * This is only to be used by POD Designer framework
     * @private
     */
    PropertyEditor.prototype._sortColumnConfigurationData = function(oDefaultData) {
        let aColumnConfiguration = oDefaultData.columnConfiguration;
        if (aColumnConfiguration && aColumnConfiguration.length > 1) {
            aColumnConfiguration.sort(function(a, b) {
                if (a.description > b.description) {
                    return 1;
                } else if (b.description > a.description) {
                    return -1;
                }
                return 0;
            });
        }
    };

    /*
     * This is only to be used by POD Designer framework
     * @private
     */
    PropertyEditor.prototype._columnConfigurationPressHandler = function(oPropertyFormContainer, sDataFieldName, oDefaultData) {
        let oMainView = this._getMainView(oPropertyFormContainer);
        if (!oMainView) {
            this._logMessage("Cannot open column property editor.  Cannot find main view");
            return;
        }

        let aVAligns = [{
                Name: this._getBaseI18nText("valign_top"),
                Key: VerticalAlign.Top
            },
            {
                Name: this._getBaseI18nText("valign_middle"),
                Key: VerticalAlign.Middle
            },
            {
                Name: this._getBaseI18nText("valign_inherit"),
                Key: VerticalAlign.Inherit
            },
            {
                Name: this._getBaseI18nText("valign_bottom"),
                Key: VerticalAlign.Bottom
            }
        ];
        let aHAligns = [{
                Name: this._getBaseI18nText("halign_right"),
                Key: TextAlign.Right
            },
            {
                Name: this._getBaseI18nText("halign_left"),
                Key: TextAlign.Left
            },
            {
                Name: this._getBaseI18nText("halign_initial"),
                Key: TextAlign.Initial
            },
            {
                Name: this._getBaseI18nText("halign_end"),
                Key: TextAlign.End
            },
            {
                Name: this._getBaseI18nText("halign_center"),
                Key: TextAlign.Center
            },
            {
                Name: this._getBaseI18nText("halign_begin"),
                Key: TextAlign.Begin
            }
        ];

        let oClonedData = CrossPlatformUtilities.cloneObject(oDefaultData[sDataFieldName]);

        let oModelData = {
            ColumnConfiguration: oClonedData,
            HAlign: aHAligns,
            VAlign: aVAligns
        };

        this._sColumnPropertyDataName = sDataFieldName;
        this._oColumnPropertyData = oDefaultData;

        this._oCpeDialogController = new ColumnPropertyEditorController();
        this._oCpeModel = new JSONModel();
        this._oCpeModel.setData(oModelData);
        this._oCpeDialogController.setTableModel(this._oCpeModel);
        this._oCpeDialogController.setCloseHandler(this._handleColumnPropertyEditorClose, this);
        this._oCpeDialog = this._getColumnPropertyEditorDialogFragment(this._oCpeDialogController);

        let oResourceModel = new ResourceModel({
            bundleName: I18N_PROPERTY_BUNDLE
        });
        this._oCpeDialog.setModel(oResourceModel, "cpeI18n");
        let oGlobalResourceModel = new ResourceModel({
            bundleName: I18N_GLOBAL_BUNDLE
        });
        this._oCpeDialog.setModel(oGlobalResourceModel, I18N_GLOBAL_MODEL);

        this._oCpeDialog.attachBeforeOpen(this._oCpeDialogController.beforeOpen, this._oCpeDialogController);

        let that = this;
        this._oCpeDialog.setEscapeHandler(function(oPromise) {
            that._oCpeDialogController._handleColumnPropertyEditorDialogClose({
                escPressed: true
            });
            oPromise.resolve();
        });

        oMainView.addDependent(this._oCpeDialog);

        this._openColumnPropertyEditorDialog(this._oCpeDialog, oMainView);
    };

    PropertyEditor.prototype._getColumnPropertyEditorDialogFragment = function(oDialogController) {
        // added to support QUnit tests
        return sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.ColumnPropertyEditorDialog", oDialogController);
    };

    PropertyEditor.prototype._openColumnPropertyEditorDialog = function(oDialog, oMainView) {
        // added to support QUnit tests
        syncStyleClass("sapUiSizeCompact", oMainView, oDialog);
        oDialog.open();
    };

    /*
     * This is only to be used by POD Designer framework
     * @private
     */
    PropertyEditor.prototype._handleColumnPropertyEditorClose = function(oData, bSaveData) {
        this._oCpeDialog.close();
        if (bSaveData) {
            this._oColumnPropertyData[this._sColumnPropertyDataName] = oData["ColumnConfiguration"];
        }
        this._oCpeModel.destroy();
        this._oCpeDialog.detachBeforeOpen(this._oCpeDialogController.beforeOpen, this._oCpeDialogController);
        this._oCpeDialog.destroy();
        this._oCpeDialog = null;
    };

    /*
     * Creates a new Label Print property editor Button and assigns to the SimpleForm.
     * This is only to be used by POD Designer framework
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {string} sDataFieldName name of data property
     * @param {object} oDefaultData Data object holding default values
     * @private
     */
    PropertyEditor.prototype.addPrintLabelPropertyEditor = function(oPropertyFormContainer, sDataFieldName, oDefaultData) {
        this._sortCustomFieldConfigurationData(oDefaultData);
        this.addButton(oPropertyFormContainer, sDataFieldName, oDefaultData, this._printLabelConfigurationPressHandler, this);
    };

    /*
     * This is only to be used by POD Designer framework
     * @private
     */
    PropertyEditor.prototype._sortCustomFieldConfigurationData = function(oDefaultData) {
        if (!oDefaultData.printLabelConfiguration) {
            oDefaultData['printLabelConfiguration'] = this.getPrintLabelConfigurationList();
        } else if (oDefaultData.printLabelConfiguration.isGR === undefined) {
            let config = this.getPrintLabelConfigurationList();
            oDefaultData['printLabelConfiguration'].isGR = config.isGR;
        }
        let aColumnConfiguration = oDefaultData.printLabelConfiguration.customFields;
        if (aColumnConfiguration && aColumnConfiguration.length > 1) {
            aColumnConfiguration.sort(function(a, b) {
                if (a.columnId > b.columnId) {
                    return 1;
                } else if (b.columnId > a.columnId) {
                    return -1;
                }
                return 0;
            });
        }
    };

    /*
     * This is only to be used by POD Designer framework
     * @private
     */
    PropertyEditor.prototype._printLabelConfigurationPressHandler = function(oPropertyFormContainer, sDataFieldName, oDefaultData) {
        let oMainView = this._getMainView(oPropertyFormContainer);
        if (!oMainView) {
            this._logMessage("Cannot open print label property editor.  Cannot find main view");
            return;
        }

        let oModelData = CrossPlatformUtilities.cloneObject(oDefaultData[sDataFieldName]);

        this._sPrintLabelPropertyDataName = sDataFieldName;
        this._oPrintLabelPropertyData = oDefaultData;

        this._oLprDialogController = new PrintLabelPropertyEditorController();
        this._oLprModel = new JSONModel();
        this._oLprModel.setData(oModelData);
        this._oLprDialogController.setTableModel(this._oLprModel);
        this._oLprDialogController.setCloseHandler(this._handlePrintLabelPropertyEditorClose, this);
        this._oLprDialog = this._getPrintLabelPropertyEditorDialogFragment(this._oLprDialogController);

        let oResourceModel = new ResourceModel({
            bundleName: I18N_PROPERTY_BUNDLE
        });
        this._oLprDialog.setModel(oResourceModel, "lprI18n");
        let oGlobalResourceModel = new ResourceModel({
            bundleName: I18N_GLOBAL_BUNDLE
        });
        this._oLprDialog.setModel(oGlobalResourceModel, I18N_GLOBAL_MODEL);

        this._oLprDialog.attachBeforeOpen(this._oLprDialogController.beforeOpen, this._oLprDialogController);

        let that = this;
        this._oLprDialog.setEscapeHandler(function(oPromise) {
            that._oLprDialogController._handlePrintLabelPropertyEditorDialogClose({
                escPressed: true
            });
            oPromise.resolve();
        });

        oMainView.addDependent(this._oLprDialog);

        this._openPrintLabelEditorDialog(this._oLprDialog, oMainView);
    };

    PropertyEditor.prototype._getPrintLabelPropertyEditorDialogFragment = function(oDialogController) {
        // added to support QUnit tests
        return sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.PrintLabelPropertyEditorDialog", oDialogController);
    };

    PropertyEditor.prototype._openPrintLabelEditorDialog = function(oDialog, oMainView) {
        // added to support QUnit tests
        syncStyleClass("sapUiSizeCompact", oMainView, oDialog);
        oDialog.open();
    };

    /*
     * This is only to be used by POD Designer framework
     * @private
     */
    PropertyEditor.prototype._handlePrintLabelPropertyEditorClose = function(oData) {
        this._oLprDialog.close();
        this._oPrintLabelPropertyData[this._sPrintLabelPropertyDataName] = oData;
        this._oLprModel.destroy();
        this._oLprDialog.detachBeforeOpen(this._oLprDialogController.beforeOpen, this._oLprDialogController);
        this._oLprDialog.destroy();
        this._oLprDialog = null;
    };

    /*
     * Creates a new Label Print property editor Button and assigns to the SimpleForm.
     * This is only to be used by POD Designer framework
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {string} sDataFieldName name of data property
     * @param {object} oDefaultData Data object holding default values
     * @private
     */
    PropertyEditor.prototype.addInputParameterTable = function(oPropertyFormContainer, sDataFieldName, oDefaultData) {
        let sPropertyFormContainerId = oPropertyFormContainer.getId();
        let sLabelId = sPropertyFormContainerId + "-" + sDataFieldName + "Label";
        this._sInputParameterTablePropertyDataName = sDataFieldName;
        this._oInputParameterTablePropertyData = oDefaultData;
        let oModelData = CrossPlatformUtilities.cloneObject(oDefaultData[sDataFieldName]);
        this._oIptTableController = new InputParameterTableController();
        this._oIptTableModel = new JSONModel();
        this._oIptTableModel.setData({
            parameters: oModelData
        });
        this._oIptTable = this._getInputParameterTableFragment(this._oIptTableController);
        this._oIptTable.setModel(this._oIptTableModel, "oTableModel");
        let oResourceModel = new ResourceModel({
            bundleName: I18N_PROPERTY_BUNDLE
        });
        this._oIptTable.setModel(oResourceModel, "iptI18n");
        let oGlobalResourceModel = new ResourceModel({
            bundleName: I18N_GLOBAL_BUNDLE
        });
        this._oIptTable.setModel(oGlobalResourceModel, I18N_GLOBAL_MODEL);
        this._oIptTableController.setModels(this._oIptTableModel, oResourceModel);
        let oLabel = new Label(sLabelId, {
            labelFor: this._oIptTable
        });
        this.addFormContent(oPropertyFormContainer, oLabel);
        this.addFormContent(oPropertyFormContainer, this._oIptTable);
    };

    PropertyEditor.prototype._getInputParameterTableFragment = function(oDialogController) {
        // added to support QUnit tests
        return sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.InputParameterTable", oDialogController);
    };

    /*
     * This is only to be used by POD Designer framework
     * @private
     */
    PropertyEditor.prototype.addListNameBrowse = function(oPropertyFormContainer, sListCategory, sListName, oDefaultData, oColumnEditorDetails) {
        let oMainView = this._getMainView(oPropertyFormContainer);
        if (!oMainView) {
            this._logMessage("Cannot open list name browse.  Cannot find main view");
            return;
        }

        let oInputControl = this.addInputField(oPropertyFormContainer, sListName, oDefaultData, {
            showValueHelp: true
        });

        let sListType = oDefaultData[sListCategory];

        let oData = {
            mainView: oMainView,
            inputFieldId: oInputControl.getId(),
            listType: sListType,
            columnEditorDetails: oColumnEditorDetails
        };

        oInputControl.attachValueHelpRequest(oData, this.handleListNameSearchPress, this);

        return oInputControl;
    };

    /*
     * This is only to be used by POD Designer framework
     * @private
     */
    PropertyEditor.prototype.handleListNameSearchPress = function(oEvent, oData) {
        let oMainView = oData.mainView;
        if (!oMainView) {
            this._logMessage("Cannot open list name browse.  Cannot find main view");
            return;
        }

        let sListType = oData.listType;
        if (PodUtility.isEmpty(sListType)) {
            this.showErrorMessage(this.getI18nText("message.listTypeRequiredMessage"));
            return;
        }
        let sInputFieldId = oData.inputFieldId;
        if (PodUtility.isEmpty(sInputFieldId)) {
            this._logMessage("list name browse control 'sInputFieldId' is not defined.");
            return;
        }
        let oColumnEditorDetails = oData.columnEditorDetails;
        if (!oColumnEditorDetails || oColumnEditorDetails.length === 0) {
            this._logMessage("list name browse control 'tableColumns' is not defined.");
            return;
        }

        let oService = this._getListMaintenanceService(oMainView);

        return oService.getListNamesByType(sListType)
            .then(function(oResponseData) {
                this.showListNameSearchDialog(oResponseData, oMainView, sListType, sInputFieldId, oColumnEditorDetails);
            }.bind(this))
            .catch(function(oError) {
                let sMessage = this.getI18nText("message.listSearchUnknownError");
                this._showAjaxErrorMessage(sMessage, oError);
            }.bind(this));
    };

    /*
     * returns instance of ListMaintenanceService class
     */
    PropertyEditor.prototype._getListMaintenanceService = function(oMainView) {
        if (!this._oListMaintenanceService) {
            let oMainController = oMainView.getController();
            let sPodFoundationUri = this.getPodFoundationDataSourceUri(oMainController);
            let sPlantUri = this.getPlantODataSourceUri(oMainController);
            this._oListMaintenanceService = new ListMaintenanceService(sPodFoundationUri, sPlantUri);
        }
        return this._oListMaintenanceService;
    };

    /*
     * This is only to be used by POD Designer framework
     * @private
     */
    PropertyEditor.prototype.showListNameSearchDialog = function(oResponseData, oMainView, sListType, sInputFieldId, oColumnEditorDetails) {

        let oListNames = this._getSortedListNamesFromResponse(oResponseData);

        this._sInputFieldId = sInputFieldId;
        let oInputField = this._byId(this._sInputFieldId);
        let sCurrentListName = null;
        if (oInputField) {
            sCurrentListName = oInputField.getValue();
        }

        this._oLnsDialogController = new ListNameSearchController();
        this._oLnsModel = new JSONModel();
        this._oLnsModel.setData(oListNames);
        this._oLnsDialogController.setMainView(oMainView);
        this._oLnsDialogController.setListType(sListType);
        this._oLnsDialogController.setCurrentListName(sCurrentListName);
        this._oLnsDialogController.setColumnEditorDetails(oColumnEditorDetails);
        this._oLnsDialogController.setTableModel(this._oLnsModel);
        this._oLnsDialogController.setConfirmHandler(this.handleListNameSearchConfirm, this);
        this._oLnsDialogController.setCancelHandler(this.handleListNameSearchCancel, this);
        this._oLnsDialog = this._getListNameSearchDialogFragment(this._oLnsDialogController);
        let oResourceModel = new ResourceModel({
            bundleName: I18N_PROPERTY_BUNDLE
        });
        this._oLnsDialog.setModel(oResourceModel, "lnsI18n");

        let oGlobalResourceModel = new ResourceModel({
            bundleName: I18N_GLOBAL_BUNDLE
        });
        this._oLnsDialog.setModel(oGlobalResourceModel, I18N_GLOBAL_MODEL);

        let that = this;
        this._oLnsDialog.setEscapeHandler(function(oPromise) {
            that.handleListNameSearchCancel();
            oPromise.resolve();
        });

        this._oLnsDialog.attachBeforeOpen(this._oLnsDialogController.beforeOpen, this._oLnsDialogController);

        oMainView.addDependent(this._oLnsDialog);

        this._openListNameSearchDialog(this._oLnsDialog, oMainView);
    };

    PropertyEditor.prototype._getListNameSearchDialogFragment = function(oDialogController) {
        // added to support QUnit tests
        return sap.ui.xmlfragment("sap.dm.dme.podfoundation.fragment.ListNameSearchDialog", oDialogController);
    };

    PropertyEditor.prototype._openListNameSearchDialog = function(oDialog, oMainView) {
        // added to support QUnit tests
        syncStyleClass("sapUiSizeCompact", oMainView, oDialog);
        oDialog.open();
    };

    /*
     * This is only to be used by POD Designer framework
     * @private
     */
    PropertyEditor.prototype._getSortedListNamesFromResponse = function(oResponseData) {
        let aListNames = [];
        if (oResponseData && oResponseData.length > 0) {
            for (let oResponse of oResponseData) {
                if (oResponse.listName.indexOf("SAP$INVISIBLE") === 0) {
                    continue;
                }
                let sDescription = oResponse.description;
                if (sDescription && sDescription.indexOf("I18N[") === 0) {
                    let sKey = sDescription.substring(sDescription.indexOf("[") + 1, sDescription.indexOf("]"));
                    oResponse.description = this._getListMaintenanceI18nText(sKey);
                }
                aListNames[aListNames.length] = oResponse;
            }
        }
        let oListNames = {
            ListNames: aListNames
        };

        oListNames.ListNames.sort(function(a, b) {
            if (a.listName > b.listName) {
                return 1;
            } else if (b.listName > a.listName) {
                return -1;
            }
            return 0;
        });

        return oListNames;
    };

    /*
     * This is only to be used by POD Designer framework
     * @private
     */
    PropertyEditor.prototype.handleListNameSearchConfirm = function(sListName) {
        let oInputField = this._byId(this._sInputFieldId);
        if (oInputField) {
            oInputField.setValue(sListName);
            oInputField.fireChangeEvent(sListName);
        }
        this.handleListNameSearchCancel();
    };

    /*
     * This is only to be used by POD Designer framework
     * @private
     */
    PropertyEditor.prototype.handleListNameSearchCancel = function() {
        this._oLnsDialog.close();
        this._oLnsModel.destroy();
        this._oLnsDialog.detachBeforeOpen(this._oLnsDialogController.beforeOpen, this._oLnsDialogController);
        this._oLnsDialog.destroy();
        this._oLnsDialog = null;
    };

    /**
     * Creates a new Add/Remove Button Control and Label and assigns to the SimpleForm
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {string} sDataFieldName name of data property
     * @param {object} oDefaultData Data object holding default values
     * @returns sap.dm.dme.podfoundation.controller.AddRemoveActionControl control
     * @public
     */
    PropertyEditor.prototype.addAddRemoveButtonControl = function(oPropertyFormContainer, sDataFieldName, oDefaultData) {
        let sPropertyFormContainerId = oPropertyFormContainer.getId();
        let sLabelId = sPropertyFormContainerId + "-" + sDataFieldName + "Label";
        let sControlId = sPropertyFormContainerId + "-" + sDataFieldName + "AddRemoveControl";

        let oLabel = new Label(sLabelId, {
            text: "",
            labelFor: sControlId
        });
        this.addFormContent(oPropertyFormContainer, oLabel);

        let oControl = new AddRemoveButtonControl(sControlId, {
            propertyEditor: this,
            dataName: sDataFieldName,
            defaultData: oDefaultData
        });
        this.addFormContent(oPropertyFormContainer, oControl);
        return oControl;
    };

    /**
     * Returns alternate title for the Add/Remove button control title
     *
     * @returns {string} title
     * @public
     */
    PropertyEditor.prototype.getAddRemoveButtonControlTitle = function(sDataName) {
        if (sDataName === "dialogFooterButtons" || sDataName === "popoverFooterButtons") {
            return this.getPodDesignerI18nText("footerButtonAssignmentTitle");
        }
        return this.getPodDesignerI18nText("buttonAssignmentTitle");
    };

    /*
     * This is only to be used internally
     * @private
     */
    PropertyEditor.prototype._getMainView = function(oPropertyFormContainer) {
        let oMainView = null;
        let oControl = oPropertyFormContainer;
        while (oControl && oControl.getParent) {
            oControl = oControl.getParent();
            if (oControl instanceof sap.ui.core.mvc.View) {
                oMainView = oControl;
                break;
            }
        }
        return oMainView;
    };

    /**
     * sets plugin properties from JSON data
     *
     * @param {object} oData JSON data holding property information
     * @public
     */
    PropertyEditor.prototype.setPropertyData = function(oData) {
        this._oPropertyData = oData;
        if (this._oPropertyData && this._oPropertyData.printLabelConfiguration) {
            let oDefPrintLabelConfiguration = this.getPrintLabelConfigurationList();
            this._oPropertyData.printLabelConfiguration.labelDocName.description = oDefPrintLabelConfiguration.labelDocName.description;
            this._oPropertyData.printLabelConfiguration.labelDocVersion.description = oDefPrintLabelConfiguration.labelDocVersion.description;
        }

        if (this._oPropertyData && this._oPropertyData.columnConfiguration) {
            // update the column configuration data if it exists
            // (this allows updating of available columns if columns added or removed)
            this._updateColumnConfiguration(this._oPropertyData.columnConfiguration);
        }

        if (this._oPropertyData && this._oPropertyData.registeredActions) {
            // update the registered actions list
            this.setRegisteredActions(this._oPropertyData.registeredActions);
        }

        if (this._oPropertyData && this._oPropertyData.registeredFooterActions) {
            // update the registered footer actions list
            this.setRegisteredFooterActions(this._oPropertyData.registeredFooterActions);
        }

        let oCustomExtension = this.getCustomExtension();
        if (oCustomExtension) {
            this._oPropertyData = oCustomExtension.setPropertyData(this._oPropertyData);
        }
    };

    /*
     * private function to update column configuration properties
     * @private
     */
    PropertyEditor.prototype._updateColumnConfiguration = function(aSavedColumns) {
        if (!aSavedColumns || aSavedColumns.length === 0) {
            return;
        }
        // get list of core properties
        let aColumnInformation = this.getColumnConfigurationList();
        if (!aColumnInformation) {
            // plugin column configuration property editor not implemented
            return;
        }

        // load updated list of columns
        //let aColumnConfiguration = [];
        for (let oSavedColumn of aSavedColumns) {
            if (oSavedColumn.columnId.indexOf(".") > 0) {
                // Add all custom data columns (denoted with "." separator)
                this._updateColumnToConfiguration(aColumnInformation, oSavedColumn, -1);

            } else if (aColumnInformation && aColumnInformation.length > 0) {
                // Add all saved columns that are still defined in core
                for (let j = 0; j < aColumnInformation.length; j++) {
                    if (oSavedColumn.columnId === aColumnInformation[j].columnId) {
                        this._updateColumnToConfiguration(aColumnInformation, oSavedColumn, j);
                        break;
                    }
                }
            }
        }
        this._oPropertyData.columnConfiguration = aColumnInformation;
    };

    /*
     * private function to load column information onto input array
     * @private
     */
    PropertyEditor.prototype._updateColumnToConfiguration = function(aColumnInformation, oColumn, iIndex) {
        if (iIndex < 0) {
            aColumnInformation[aColumnInformation.length] = {
                columnId: oColumn.columnId,
                description: oColumn.description,
                wrapping: oColumn.wrapping,
                hAlign: oColumn.hAlign,
                vAlign: oColumn.vAlign,
                minScreenWidth: oColumn.minScreenWidth,
                demandPopin: oColumn.demandPopin,
                label: oColumn.label,
                width: oColumn.width
            };
        } else {
            aColumnInformation[iIndex].wrapping = oColumn.wrapping;
            aColumnInformation[iIndex].hAlign = oColumn.hAlign;
            aColumnInformation[iIndex].vAlign = oColumn.vAlign;
            aColumnInformation[iIndex].minScreenWidth = oColumn.minScreenWidth;
            aColumnInformation[iIndex].demandPopin = oColumn.demandPopin;
            aColumnInformation[iIndex].label = oColumn.label;
            aColumnInformation[iIndex].width = oColumn.width;
        }
    };

    /*
     * returns the default column configuration data for the column property editor
     * This is only used internally by POD Designer framework
     *
     * @returns JSON data array holding default column properties
     * @private
     */
    PropertyEditor.prototype.getColumnConfigurationList = function() {
        // to be implemented by sub-class
        return null;
    };

    /**
     * gets plugin properties as JSON
     *
     * @returns JSON data holding property information
     * @public
     */
    PropertyEditor.prototype.getPropertyData = function() {
        if (!this._oPropertyData) {
            this._oPropertyData = this.getDefaultPropertyData();
        }
        if (this.getShowPopupProperties()) {
            if (!this._oPopupPropertyData) {
                this._oPopupPropertyData = this.getDefaultPopupPropertyData();
            }
        }
        let oCustomExtension = this.getCustomExtension();
        if (oCustomExtension) {
            this._oPropertyData = oCustomExtension.getPropertyData(this._oPropertyData);
        }
        return this._oPropertyData;
    };

    /**
     * sets popup properties from JSON data
     *
     * @param {object} oData JSON data holding popup property information
     * @public
     */
    PropertyEditor.prototype.setPopupPropertyData = function(oData) {
        this._oPopupPropertyData = oData;
        if (PodUtility.isEmpty(this._oPopupPropertyData.popup) &&
            this.getShowPopupProperties()) {
            // set to default type if not defined
            this._oPopupPropertyData.popup = this.POPUP_MODAL;
        }
    };

    /**
     * gets popup properties as JSON
     *
     * @returns JSON data holding popup property information
     * @public
     */
    PropertyEditor.prototype.getPopupPropertyData = function() {
        if (!this._oPopupPropertyData) {
            this._oPopupPropertyData = this.getDefaultPopupPropertyData();
        }
        if (PodUtility.isEmpty(this._oPopupPropertyData.popup) &&
            this.getShowPopupProperties()) {
            // set to default type if not defined
            this._oPopupPropertyData.popup = this.POPUP_MODAL;
        }
        if (!this._oPopupPropertyData.dialogFooterButtons) {
            // initialize dialog footer button array if not defined
            this._oPopupPropertyData.dialogFooterButtons = [];
        }
        if (!this._oPopupPropertyData.popoverFooterButtons) {
            // initialize popover footer button array if not defined
            this._oPopupPropertyData.popoverFooterButtons = [];
        }
        return this._oPopupPropertyData;
    };

    /**
     * Registers assigned actions to this property editor's configuration
     *
     * @param {object} aRegisteredActions Array of action ID's to register
     * @public
     */
    PropertyEditor.prototype.setRegisteredActions = function(aRegisteredActions) {
        this._aRegisteredActions = aRegisteredActions;
        let oData = this.getPropertyData();
        if (!oData) {
            oData = {};
        }
        if (aRegisteredActions && aRegisteredActions.length > 0) {
            oData["registeredActions"] = aRegisteredActions;
        } else if (oData.registeredActions) {
            delete oData.registeredActions;
        }
    };

    /**
     * Gets actions registered to this property editor's configuration
     *
     * @returns Array of action id's registered to this configuration
     * @public
     */
    PropertyEditor.prototype.getRegisteredActions = function() {
        return this._aRegisteredActions;
    };

    /**
     * Registers assigned actions to this property editor's dialog footer
     *
     * @param {object} aRegisteredFooterActions Array of action ID's to register
     * @public
     */
    PropertyEditor.prototype.setRegisteredFooterActions = function(aRegisteredFooterActions) {
        this._aRegisteredFooterActions = aRegisteredFooterActions;
        let oData = this.getPropertyData();
        if (!oData) {
            oData = {};
        }
        if (aRegisteredFooterActions && aRegisteredFooterActions.length > 0) {
            oData["registeredFooterActions"] = aRegisteredFooterActions;
        } else if (oData.registeredFooterActions) {
            delete oData.registeredFooterActions;
        }
    };

    /**
     * Gets actions registered to this property editor's dialog footer
     *
     * @returns Array of action id's registered to this dialog footer
     * @public
     */
    PropertyEditor.prototype.getRegisteredFooterActions = function() {
        return this._aRegisteredFooterActions;
    };

    /**
     * sets action button selection information
     *
     * @param {Array} aActionSelections Action button info {id: actionButtonId, text: actionButtonTitle}
     * @public
     */
    PropertyEditor.prototype.setActionSelections = function(aActionSelections) {
        this._aActionSelections = aActionSelections;
    };

    /**
     * gets action button selection information
     *
     * @returns {Array} action button info {id: actionButtonId, text: actionButtonTitle}
     * @public
     */
    PropertyEditor.prototype.getActionSelections = function() {
        return this._aActionSelections;
    };

    /**
     * gets navigation page selection information
     *
     * @returns {Array} navigation pages info {id: navigationButtonId, text: navigationButtonTitle}
     * @public
     */
    PropertyEditor.prototype.getNavigationPageSelections = function() {
        return this._aNavigationPageSelections;
    };

    /**
     * sets navigation page selection information
     *
     * @param {Array} aNavigationPageSelections Navigation pages info {page: pageName, description: pageDesc}
     * @public
     */
    PropertyEditor.prototype.setNavigationPageSelections = function(aNavigationPageSelections) {
        this._aNavigationPageSelections = aNavigationPageSelections;
    };

    /**
     * gets tab page selection information
     *
     * @returns {Array} tab pages info {id: tabButtonId, text: tabButtonTitle}
     * @public
     */
    PropertyEditor.prototype.getTabPageSelections = function() {
        return this._aTabPageSelections;
    };

    /**
     * sets tab page selection information
     *
     * @param {Array} aTabPageSelections Tab pages info {page: pageName, description: pageDesc}
     * @public
     */
    PropertyEditor.prototype.setTabPageSelections = function(aTabPageSelections) {
        this._aTabPageSelections = aTabPageSelections;
    };

    /**
     * returns the default properties for the editor
     *
     * @returns JSON data holding default property information
     * @public
     */
    PropertyEditor.prototype.getDefaultPropertyData = function() {
        // to be implemented by sub-class
        return null;
    };

    /**
     * returns the default popup properties for the editor
     *
     * @returns JSON data holding default popup property information
     * @public
     */
    PropertyEditor.prototype.getDefaultPopupPropertyData = function() {
        let sPopupType = "";
        if (this.getShowPopupProperties()) {
            sPopupType = this.POPUP_MODAL;
        }
        return {
            popup: sPopupType,
            popupWidth: 500,
            popupHeight: 600,
            popupTop: 30,
            popupLeft: 30,
            popupResizable: true,
            popupDraggable: true,
            popupStretch: false,
            popupTitle: "",
            popoverTitle: "",
            popupShowClose: false,
            dialogShowClose: false,
            popupModal: false,
            popupPlacement: PlacementType.HorizontalPreferredRight,
            dialogFooterButtons: [],
            popoverFooterButtons: []
        };
    };

    /**
     * validates input "width" or "height" values for proper CSS style syntax
     *
     * @param {sap.m.Input} oInput Input field being validated
     * @param {string} sValue Input field value
     * @param {string} sProperty must be "width" or "height".
     * @returns true if valid CSS, else false
     * @public
     */
    PropertyEditor.prototype.validateWidthOrHeightValues = function(oInput, sValue, sProperty) {
        let sCssProperty = this.getWidthOrHeightProperty(sProperty);
        if (PodUtility.isEmpty(sCssProperty)) {
            return true;
        }
        if (PodUtility.isNotEmpty(sValue) && !this.isValidCSS(sCssProperty, sValue)) {
            oInput.setValueState(ValueState.Error);
            let sMessage;
            if (sCssProperty === "width") {
                sMessage = this._getBaseI18nText("message.invalidWidthValueInput");
            } else {
                sMessage = this._getBaseI18nText("message.invalidHeightValueInput");
            }
            oInput.setValueStateText(sMessage);
            oInput.focus();
            return false;
        }
        oInput.setValueState(ValueState.None);
        oInput.setValueStateText(null);
        return true;
    };

    /**
     * Returns if input property is a "width" or "height" property
     *
     * @param {string} sProperty must be "width" or "height".
     * @returns "width" or "height" or null
     * @public
     */
    PropertyEditor.prototype.getWidthOrHeightProperty = function(sProperty) {
        if (PodUtility.isNotEmpty(sProperty) && (sProperty === "width" || sProperty === "height")) {
            return sProperty;
        }
        return null;
    };

    /**
     * verifies if CSS value is a valid 'width' or 'height' type of value
     *
     * @param {string} sProperty string property to test (i.e.; "width")
     * @param {string} sCSS string value for CSS (i.e.; "100%")
     * @returns true if valid CSS, else false
     * @public
     */
    PropertyEditor.prototype.isValidCSS = function(sProperty, sCSS) {
        if (this.isNumber(sCSS)) {
            return false;
        }
        return coreLibrary.CSSSize.isValid(sCSS);
    };

    /**
     * checks if input value is a numeric value
     *
     * @param {string} sText string value verifies if nemeric value
     * @returns true if number, else false
     * @public
     */
    PropertyEditor.prototype.isNumber = function(sText) {
        if (PodUtility.isEmpty(sText)) {
            return false;
        }
        if (typeof sText === "number" || !isNaN(sText)) {
            return true;
        }
        return false;
    };

    /**
     * Checks whether or not this is a popup property.
     *
     * @param {string} sDataFieldName a field name to check.
     * @returns true if popup property.
     * @public
     */
    PropertyEditor.prototype.isPopupProperty = function(sDataFieldName) {
        return aPopupProperties.indexOf(sDataFieldName) > -1;
    };

    /**
     * Returns whether or not the data filed name is a max length property.
     *
     * @param {string} sDataFieldName a field name to check.
     * @returns true if it is a max length property, else false.
     * @protected
     */
    PropertyEditor.prototype.isMaxLengthProperty = function(sDataFieldName) {
        return false;
    };

    /**
     * Gets the Production REST micro-service URI.
     *
     * @param {sap.ui.core.mvc.Controller} oMainController Main POD Controller
     * @returns URI to Production REST MS
     * @protected
     */
    PropertyEditor.prototype.getProductionDataSourceUri = function(oMainController) {
        return oMainController.getOwnerComponent().getDataSourceUriByName("production-RestSource");
    };

    /**
     * Gets the PodFoundation REST micro-service URI.
     *
     * @param {sap.ui.core.mvc.Controller} oMainController Main POD Controller
     * @returns URI to PodFoundation REST MS
     * @protected
     */
    PropertyEditor.prototype.getPodFoundationDataSourceUri = function(oMainController) {
        return oMainController.getOwnerComponent().getDataSourceUriByName("podFoundation-RestSource");
    };

    /**
     * Gets the Plant OData datasource URI.
     *
     * @param {sap.ui.core.mvc.Controller} oMainController Main POD Controller
     * @returns URI to Plant OData datasource
     * @protected
     */
    PropertyEditor.prototype.getPlantODataSourceUri = function(oMainController) {
        return oMainController.getOwnerComponent().getDataSourceUriByName("plant-oDataSource");
    };

    /**
     * Gets resource bundle (Used for table creation)
     *
     * @param {string} sResourceBundleName If undefined it will use Property Editor default bundle name.
     * @returns ResourceModel.
     * @public
     */
    PropertyEditor.prototype.getResourceBundle = function(sResourceBundleName) {
        let sBundleName = sResourceBundleName;
        if (PodUtility.isEmpty(sBundleName)) {
            sBundleName = this.getResourceBundleName();
        }
        let oBundle = new ResourceModel({
            bundleName: sBundleName
        }).getResourceBundle();
        if (oBundle.aPropertyFiles.length === 0) {
            oLogger.error("Bundle '" + sBundleName + "' not found");
        }
        return oBundle;
    };

    /**
     * Gets i18n text for key.
     *
     * @param {string} sKey to get text for.
     * @param {Array} aArgs optional arguments for text.
     * @returns internationalized text.
     * @public
     * @deprecated Use getLocalizedText(sKey, aArgs) instead.
     */
    PropertyEditor.prototype.getI18nText = function(sKey, aArgs) {
        let sResourceBundleName = this.getResourceBundleName();
        if (PodUtility.isEmpty(sResourceBundleName)) {
            return sKey;
        }
        return Bundles.getPropertiesText(sResourceBundleName, sKey, aArgs);
    };

    /**
     * Gets i18n text for key from POD Designer i18n bundle.
     *
     * @param {string} sKey to get text for.
     * @param {Array} aArgs optional arguments for text.
     * @returns internationalized text.
     * @public
     */
    PropertyEditor.prototype.getPodDesignerI18nText = function(sKey, aArgs) {
        return Bundles.getPropertiesText(I18N_POD_DESIGNER_BUNDLE, sKey, aArgs);
    };

    /**
     * get i18n text for key from plugin's resource bundle
     *
     * @param {string} sKey to get text for
     * @param {Array} aArgs optional arguments for text
     * @returns internationalized text
     * @public
     */
    PropertyEditor.prototype.getPluginI18nText = function(sKey, aArgs) {
        let sResourceBundleName = this.getPluginResourceBundleName();
        if (PodUtility.isEmpty(sResourceBundleName)) {
            return sKey;
        }
        return Bundles.getPropertiesText(sResourceBundleName, sKey, aArgs);
    };

    /*
     * Used internally to get i18n text
     *
     * @private
     */
    PropertyEditor.prototype._getBaseI18nText = function(sKey, aArgs) {
        return Bundles.getPropertyEditorText(sKey, aArgs);
    };

    /*
     * Used internally to get i18n text
     *
     * @private
     */
    PropertyEditor.prototype._getListMaintenanceI18nText = function(sKey, aArgs) {
        return Bundles.getPropertiesText("sap.dm.dme.i18n.listMaintenance", sKey, aArgs);
    };

    /*
     * Used internally to get i18n text
     *
     * @private
     */
    PropertyEditor.prototype._getGlobalI18nText = function(sKey, aArgs) {
        return Bundles.getGlobalBundle().getText(sKey, aArgs);
    };

    /**
     * Returns localized text searching it for a key first in plugin's property file and if not found
     * it will look in propertyEditor.properties and if not found it will look in global.properties.
     * @param {string} sKey to get text for.
     * @param {Array} aArgs optional arguments for text.
     * @returns internationalized text.
     * @public
     */
    PropertyEditor.prototype.getLocalizedText = function(sKey, aArgs) {
        let sI18nKeyPrefix = this.getI18nKeyPrefix();
        let sI18nKey = sI18nKeyPrefix + sKey;
        let localizedText = this.getI18nText(sI18nKey, aArgs);
        if (localizedText === sI18nKey) {
            localizedText = this._getBaseI18nText(sKey, aArgs);
            if (localizedText === sKey) {
                localizedText = this._getGlobalI18nText(sKey, aArgs);
            }
        }
        return localizedText;
    };

    /*--------------  start code to support Action Assignments Dialog  -----------*/

    /**
     * Adds button that will display the Action Assignments Dialog.
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {string} sDataName name of data property
     * @returns sap.m.Button control
     * @public
     */
    PropertyEditor.prototype.addActionAssignmentButton = function(oPropertyFormContainer, sDataName) {
        this._addAssignmentButton(oPropertyFormContainer, sDataName, this._handleActionAssignmentButtonPress, this);
    };

    /*
     * Displays the Action Assignment Dialog
     *
     * @param {object} oEvent event from button press
     * @param {string} sDataName name of data property holding actions
     * @private
     */
    PropertyEditor.prototype._handleActionAssignmentButtonPress = function(oEvent, sDataName) {
        let oData = this.getPropertyData();
        this.setAssignedActions(oData[sDataName]);
        let oActionAssignmentHelper = this._getActionAssignmentHelper(sDataName);
        oActionAssignmentHelper.showActionAssignmentDialog();
    };
    /**
     * Adds button that will display the Plugin Assignment Dialog.
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer SimpleForm to add controls to
     * @param {string} sDataName name of data property
     * @returns sap.m.Button control
     * @public
     */
    PropertyEditor.prototype.addPluginAssignmentButton = function(oPropertyFormContainer, sDataName) {
        this._addAssignmentButton(oPropertyFormContainer, sDataName, this._handlePluginAssignmentButtonPress, this);
    };

    /*
     * Displays the Plugin Assignment Dialog
     *
     * @param {object} oEvent event from button press
     * @param {string} sDataName name of data property holding actions
     * @private
     */
    PropertyEditor.prototype._handlePluginAssignmentButtonPress = function(oEvent, sDataName) {
        let oData = this.getPropertyData();
        this.setAssignedPlugin(oData[sDataName]);
        let oActionAssignmentHelper = this._getActionAssignmentHelper(sDataName);
        oActionAssignmentHelper.showPluginAssignmentDialog();
    };

    /*
     * private function to add the assignmnet button
     */
    PropertyEditor.prototype._addAssignmentButton = function(oPropertyFormContainer, sDataName, fnCallback, fnContext) {

        let sPropertyFormContainerId = oPropertyFormContainer.getId();

        let sLabelId = sPropertyFormContainerId + "-" + sDataName + "Label";
        let sButtonId = sPropertyFormContainerId + "-" + sDataName + "Button";

        let oLabel = new Label(sLabelId, {
            text: this.getLocalizedText(sDataName),
            labelFor: sButtonId
        });
        this.addFormContent(oPropertyFormContainer, oLabel);

        let oButton = new Button(sButtonId, {
            text: this.getLocalizedText(sDataName),
            tooltip: this.getLocalizedText(sDataName),
            press: function(oEvent) {
                fnCallback.call(fnContext, oEvent, sDataName);
            }
        });
        this.addFormContent(oPropertyFormContainer, oButton);
    };

    /*
     * Returns the ActionAssignmentHelper
     *
     * @return {sap.dm.dme.podfoundation.control.ActionAssignmentHelper}
     * @private
     */
    PropertyEditor.prototype._getActionAssignmentHelper = function(sDataName) {
        let sButtonType = this.getActionAssignmentButtonType(sDataName);
        return new ActionAssignmentHelper(this, sButtonType, sDataName);
    };

    /**
     * Function called by the Action Assignments dialog to
     * provide a list of i18n labels as suggestions.  This
     * must be implemented by property editor
     * @param {string} sDataName name of data property
     * @protected
     */
    PropertyEditor.prototype.getMenuItemLabelList = function(sDataName) {
        let sButtonType = this.getActionAssignmentButtonType(sDataName);
        let aLabelList = [];
        if (sButtonType === "ACTION_BUTTON") {
            aLabelList = ButtonLabelFormatter.getActionButtonLabelList();
        } else {
            aLabelList = ButtonLabelFormatter.getGroupButtonLabelList();
        }
        return {
            I18nButtonLabels: aLabelList
        };
    };

    /**
     * Called by AddRemoveButtonController to get core i18n labels for action / menu buttons
     *
     * @param {string} sDataName name of data property
     */
    PropertyEditor.prototype.getButtonLabelList = function(sDataName) {
        let sButtonType = this.getActionAssignmentButtonType(sDataName);
        let aLabelList = [];
        if (sButtonType === "ACTION_BUTTON") {
            aLabelList = ButtonLabelFormatter.getActionButtonLabelList();
        } else if (sButtonType === "MENU_BUTTON") {
            aLabelList = ButtonLabelFormatter.getGroupButtonLabelList();
        } else if (sButtonType === "NAVIGATION_BUTTON") {
            aLabelList = ButtonLabelFormatter.getNavigationButtonLabelList();
        }
        return {
            I18nButtonLabels: aLabelList
        };
    };

    /**
     * Called by AddRemoveButtonController to get core i18n tooltips for action / menu buttons
     *
     * @param {string} sDataName name of data property
     */
    PropertyEditor.prototype.getButtonTooltipList = function(sDataName) {
        let sButtonType = this.getActionAssignmentButtonType(sDataName);
        let aTooltipList = [];
        if (sButtonType === "ACTION_BUTTON") {
            aTooltipList = ButtonLabelFormatter.getActionButtonTooltipList();
        } else if (sButtonType === "MENU_BUTTON") {
            aTooltipList = ButtonLabelFormatter.getGroupButtonTooltipList();
        } else if (sButtonType === "NAVIGATION_BUTTON") {
            aTooltipList = ButtonLabelFormatter.getNavigationButtonTooltipList();
        }
        return {
            I18nTooltipLabels: aTooltipList
        };
    };

    /**
     * Function called by the Action Assignments dialog to
     * get the dialog title.
     * @param {string} sDataName name of data property
     * @return {string} Title for dialog
     * @protected
     */
    PropertyEditor.prototype.getActionAssignmentDialogTitle = function(sDataName) {
        let sButtonType = this.getActionAssignmentButtonType(sDataName);
        let sButtonText = ""
        if (sButtonType === "ACTION_BUTTON") {
            sButtonText = this.getLocalizedText("actionButtonTitle");
        } else if (sButtonType === "MENU_BUTTON") {
            sButtonText = this.getLocalizedText("menuButtonTitle");
        }
        return this.getLocalizedText("actionAssignmentDialogTitle", [sButtonText]);
    };

    /**
     * Returns whether or not this is a POD Designer internal
     * control property editor class. Must return false plugin
     * property editor.
     *
     * @return {boolean} Title for dialog
     * @protected
     */
    PropertyEditor.prototype.isPodDesignerPropertyEditor = function() {
        return false;
    };

    /**
     * Called by Action Assignments dialog to set the action button type
     */
    PropertyEditor.prototype.setActionAssignmentButtonType = function(sButtonType, sDataName) {
        if (sDataName === "dialogFooterButtons" || sDataName === "popoverFooterButtons") {
            this._sFooterButtonType = sButtonType;
        }
    };

    /**
     * Function called by the Action Assignments dialog to
     * get the button type.
     * @param {string} sDataName name of data property
     * @return {string} "ACTION_BUTTON" or "MENU_BUTTON"
     * @protected
     */
    PropertyEditor.prototype.getActionAssignmentButtonType = function(sDataName) {
        if (sDataName === "dialogFooterButtons" || sDataName === "popoverFooterButtons") {
            return this._sFooterButtonType;
        }
        return null;
    };

    /**
     * Sets the active button index being set
     *
     * @param {int} iButtonIndex active button index
     * @protected
     */
    PropertyEditor.prototype.setActiveButtonIndex = function(iButtonIndex, sDataName) {
        this._iButtonIndex = iButtonIndex;
    };

    /**
     * Gets the active button index
     *
     * @return {int} active button index
     * @protected
     */
    PropertyEditor.prototype.getActiveButtonIndex = function(sDataName) {
        return this._iButtonIndex;
    };

    /**
     * Function called when Action Assignments dialog closes.  It
     * will store the assigned actions to the data configuration
     *
     * @param {array} aAssignedActions Array of assigned actions
     * @param {string} sDataName name of data property
     * @protected
     */
    PropertyEditor.prototype.updateAssignedActions = function(aAssignedActions, sDataName) {
        this.setAssignedActions(aAssignedActions);
        let oData;
        if (sDataName === "dialogFooterButtons" || sDataName === "popoverFooterButtons") {
            oData = this.getPopupPropertyData();
            let aButtons;
            if (sDataName === "dialogFooterButtons") {
                aButtons = oData.dialogFooterButtons;
            } else {
                aButtons = oData.popoverFooterButtons;
            }
            aButtons[this.getActiveButtonIndex(sDataName)].actions = aAssignedActions;
            return;
        }
        oData = this.getPropertyData();
        oData[sDataName] = aAssignedActions;
    };

    /**
     * Function called when Plugin Assignment dialog closes.  It
     * will store the assigned plugin to the data configuration
     *
     * @param {string} sAssignedPlugin Plugin Id
     * @param {string} sDataName name of data property
     * @protected
     */
    PropertyEditor.prototype.updateAssignedPlugin = function(sAssignedPlugin, sDataName) {
        let oData = this.getPropertyData();
        oData[sDataName] = sAssignedPlugin;
    };

    /**
     * Called by Action Assignment dialog when dialog closes.
     * Registers assigned actions for the plugin.
     * @protected
     */
    PropertyEditor.prototype.registerActions = function(sDataName) {
        if (sDataName === "dialogFooterButtons" || sDataName === "popoverFooterButtons") {
            this._registerFooterActions(sDataName);
        }
    };

    /**
     * registers any assigned actions for the footer buttons.
     * @private
     */
    PropertyEditor.prototype._registerFooterActions = function(sDataName) {
        let oData = this.getPopupPropertyData();
        let aButtons = oData[sDataName];
        if (!aButtons || aButtons.length === 0) {
            return;
        }
        let aRegisteredFooterActions = [];
        for (let oButton of aButtons) {
            if (oButton.actions && oButton.actions.length > 0) {
                for (let oAction of oButton.actions) {
                    aRegisteredFooterActions[aRegisteredFooterActions.length] = oAction.pluginId;
                }
            }
        }
        if (aRegisteredFooterActions.length > 0) {
            this.setRegisteredFooterActions(aRegisteredFooterActions);
        }
    };

    /**
     * Called to allow action property editor to initialize itself
     * @protected
     */
    PropertyEditor.prototype.initializeProperties = function() {
        // to be implemented by sub-class
    };

    /**
     * Setter for the POD Designer Main edit controller.
     * This is required to support Action Assignment dialog
     *
     * @param {sap.dm.dme.podbuilder.controller.DesignerObject} oMainController
     * @protected
     */
    PropertyEditor.prototype.setMainController = function(oMainController) {
        this._oMainController = oMainController;
    };

    /**
     * Getter for the POD Designer Main edit controller.
     * This is required to support Action Assignment dialog
     *
     * @return {sap.dm.dme.podbuilder.controller.DesignerObject}
     * @protected
     */
    PropertyEditor.prototype.getMainController = function() {
        return this._oMainController;
    };

    /**
     * Getter for the POD Designer Main edit controller.
     * This is required to support Action Assignment dialog
     *
     * @return {sap.dm.dme.podbuilder.controller.DesignerObject}
     * @protected
     */
    PropertyEditor.prototype.getMainControllerHelper = function() {
        let oMainController = this.getMainController();
        if (oMainController) {
            return oMainController.getMainControllerHelper();
        }
        return null;
    };

    /**
     * Sets the available actions for the Action Assignment dialog.
     *
     * @param {array} List of available actions
     * @protected
     */
    PropertyEditor.prototype.setAvailableActions = function(aAvailableActions) {
        this._aAvailableActions = aAvailableActions;
    };

    /**
     * Returns the available actions for the Action Assignment dialog.
     *
     * @return {array} List of available actions
     * @protected
     */
    PropertyEditor.prototype.getAvailableActions = function() {
        return this._aAvailableActions;
    };

    /**
     * Sets the assigned actions for the Action Assignment dialog.
     *
     * @param {array} List of assigned actions
     * @protected
     */
    PropertyEditor.prototype.setAssignedActions = function(aAssignedActions) {
        this._aAssignedActions = aAssignedActions;
    };

    /**
     * Returns the assigned actions for the Action Assignment dialog.
     *
     * @return {array} List of assigned actions
     * @protected
     */
    PropertyEditor.prototype.getAssignedActions = function() {
        return this._aAssignedActions;
    };

    /**
     * Sets the assigned Plugin for the Plugin Assignment dialog.
     *
     * @param {string} Assigned Plugin ID
     * @protected
     */
    PropertyEditor.prototype.setAssignedPlugin = function(sAssignedPlugin) {
        this._sAssignedPlugin = sAssignedPlugin;
    };

    /**
     * Returns the assigned Plugin for the Plugin Assignment dialog.
     *
     * @return {string} Assigned Plugin ID
     * @protected
     */
    PropertyEditor.prototype.getAssignedPlugin = function() {
        return this._sAssignedPlugin;
    };

    /**
     * Returns the assigned tab pages
     *
     * @return {array} List of assigned tab pages
     * @protected
     */
    PropertyEditor.prototype.getAssignedTabPages = function() {
        let oHelper = this.getMainControllerHelper();
        if (oHelper) {
            return oHelper.getAssignedTabPages();
        }
        return null;
    };

    /**
     * Sets the list of execution property editors.
     *
     * @param {array} List of execution property editors
     * @protected
     */
    PropertyEditor.prototype.setExecutionPropertyEditors = function(aExecutionPropertyEditors) {
        this._aExecutionPropertyEditors = aExecutionPropertyEditors;
    };

    /**
     * Returns the list of execution property editors.
     *
     * @return {array} List of execution actions
     * @protected
     */
    PropertyEditor.prototype.getExecutionPropertyEditors = function() {
        return this._aExecutionPropertyEditors;
    };

    /**
     * Sets the list of event property editors.
     *
     * @param {array} List of event actions
     * @protected
     */
    PropertyEditor.prototype.setEventPropertyEditors = function(aEventPropertyEditors) {
        this._aEventPropertyEditors = aEventPropertyEditors;
    };

    /**
     * Returns the list of Event property editors.
     *
     * @return {array} List of Event actions
     * @protected
     */
    PropertyEditor.prototype.getEventPropertyEditors = function() {
        return this._aEventPropertyEditors;
    };

    /**
     * Sets the list of transaction property editors.
     *
     * @param {array} List of transaction actions
     * @protected
     */
    PropertyEditor.prototype.setTransactionPropertyEditors = function(aTransactionPropertyEditors) {
        this._aTransactionPropertyEditors = aTransactionPropertyEditors;
    };

    /**
     * Returns the list of transaction property editors.
     *
     * @return {array} List of transaction actions
     * @protected
     */
    PropertyEditor.prototype.getTransactionPropertyEditors = function() {
        return this._aTransactionPropertyEditors;
    };

    /**
     * Sets the list of production process property editors.
     *
     * @param {array} List of production process actions
     * @protected
     */
    PropertyEditor.prototype.setProductionProcessPropertyEditors = function(aProductionProcessPropertyEditors) {
        this._aProductionProcessPropertyEditors = aProductionProcessPropertyEditors;
    };

    /**
     * Returns the list of production process property editors.
     *
     * @return {array} List of production process actions
     * @protected
     */
    PropertyEditor.prototype.getProductionProcessPropertyEditors = function() {
        return this._aProductionProcessPropertyEditors;
    };

    /*--------------  end code to support Action Assignments Dialog  -----------*/

    /*
     * Used internally to initialize action buttons
     *
     * @private
     */
    PropertyEditor.prototype.initializedActionButtons = function(oPropertyFormContainer, sDataFieldName, oDefaultData) {
        let aValidValues = [];
        aValidValues[aValidValues.length] = "EMPTY";
        let aValidTexts = [];
        aValidTexts[aValidTexts.length] = "";
        let aActionSelections = this.getActionSelections();
        if (aActionSelections && aActionSelections.length > 0) {
            for (let oAction of aActionSelections) {
                aValidValues[aValidValues.length] = oAction.id;
                aValidTexts[aValidTexts.length] = oAction.text;
            }
        }
        return this.addSelect(oPropertyFormContainer, sDataFieldName, oDefaultData, aValidValues, aValidTexts, false);
    };

    /*
     * Used internally to initialize action pages
     *
     * @private
     */
    PropertyEditor.prototype.initializedActionPages = function(oPropertyFormContainer, sDataFieldName) {
        let sDataName = sDataFieldName;
        if (PodUtility.isEmpty(sDataFieldName)) {
            sDataName = "selectActionPageName";
        }
        let aNavigationPageSelections = this.getNavigationPageSelections();
        return this._initializePageSelection(oPropertyFormContainer, sDataName, aNavigationPageSelections);
    };

    /*
     * Used internally to initialize tab pages
     *
     * @private
     */
    PropertyEditor.prototype.initializeTabPages = function(oPropertyFormContainer, sDataFieldName) {
        let sDataName = sDataFieldName;
        if (PodUtility.isEmpty(sDataFieldName)) {
            sDataName = "selectTabPageName";
        }
        let aTabPageSelections = this.getTabPageSelections();
        this._sortByDescription(aTabPageSelections);
        return this._initializePageSelection(oPropertyFormContainer, sDataName, aTabPageSelections);
    };

    /*
     * Used internally to initialize assigned tab pages
     *
     * @private
     */
    PropertyEditor.prototype.initializeAssignedTabPages = function(oPropertyFormContainer, sDataFieldName) {
        let sDataName = sDataFieldName;
        if (PodUtility.isEmpty(sDataFieldName)) {
            sDataName = "selectTabPageName";
        }
        let aTabPageSelections = this.getAssignedTabPages();
        return this._initializePageSelection(oPropertyFormContainer, sDataName, aTabPageSelections);
    };

    /*
     * Used internally to create the page selection control
     *
     * @private
     */
    PropertyEditor.prototype._initializePageSelection = function(oPropertyFormContainer, sDataFieldName, aPageSelections) {
        let aValidPageValues = [];
        let aValidPageTexts = [];
        this._loadValidPageLists(aPageSelections, aValidPageValues, aValidPageTexts);
        return this.addSelect(oPropertyFormContainer, sDataFieldName, this.getPropertyData(), aValidPageValues, aValidPageTexts, false);
    };

    /*
     * Used internally to load the page selection lists
     *
     * @private
     */
    PropertyEditor.prototype._loadValidPageLists = function(aPageSelections, aValidPageValues, aValidPageTexts) {
        aValidPageValues[aValidPageValues.length] = "EMPTY";
        aValidPageTexts[aValidPageTexts.length] = "";
        if (aPageSelections && aPageSelections.length > 0) {
            for (let oPage of aPageSelections) {
                aValidPageValues[aValidPageValues.length] = oPage.page;
                aValidPageTexts[aValidPageTexts.length] = oPage.description;
            }
        }
    };

    /*
     * Sorts the input array by the description property
     *
     * @param {array} aList List to sort {description: ""}
     * @private
     */
    PropertyEditor.prototype._sortByDescription = function(aList) {
        if (aList && aList.length > 1) {
            aList.sort(function(a, b) {
                let sParamA = a.description.toLowerCase();
                let sParamB = b.description.toLowerCase();
                if (sParamA < sParamB) {
                    return -1;
                } else if (sParamA > sParamB) {
                    return 1;
                }
                return 0;
            });
        }
    };

    /*
     * Used internally to show message box
     *
     * @private
     */
    PropertyEditor.prototype.showErrorMessage = function(sMessage) {
        // added to support QUnit tests
        MessageBox.error(sMessage);
    };

    /*
     * Used internally to show ajax errors
     *
     * @private
     */
    PropertyEditor.prototype._showAjaxErrorMessage = function(sDefaultMessage, oError) {
        let sErrorMessage = ErrorHandler.getErrorMessage(oError);
        if (PodUtility.isEmpty(sErrorMessage)) {
            sErrorMessage = sDefaultMessage;
        }
        this.showErrorMessage(sErrorMessage);
    };

    PropertyEditor.prototype._logMessage = function(sMessage) {
        // added to support stubbing QUnit tests
        oLogger.error(sMessage);
    };

    PropertyEditor.prototype._byId = function(sId) {
        // added to support QUnit tests
        return sap.ui.getCore().byId(sId);
    };

    /**
     * Register the custom extensions to allow property editor extensions
     *
     * @public
     */
    PropertyEditor.prototype.registerCustomExtensions = function() {
        let sName = this.getName();
        if (PodUtility.isEmpty(sName)) {
            return null;
        }
        let oLoader = this._getPropertyEditorExtensionLoader();
        return oLoader.registerCustomExtensions(sName);
    };

    /**
     * Returns the custom Property Editor extension
     *
     * @returns {PluginExtension} Custom PluginExtension for Property Editor
     * @public
     */
    PropertyEditor.prototype.getCustomExtension = function() {
        let sName = this.getName();
        if (PodUtility.isEmpty(sName)) {
            return null;
        }
        if (!this._oCustomExtension) {
            this._oCustomExtension = this.findCustomPropertyEditorExtension();
            if (this._oCustomExtension) {
                this._oCustomExtension.setController(this);
                this._oCustomExtension.setCoreExtension(this);
            }
        }
        return this._oCustomExtension;
    };

    /**
     * Returns the custom Property Editor extension for the one defined by the core name
     *
     * @returns {PluginExtension} Custom PluginExtension
     * @public
     */
    PropertyEditor.prototype.findCustomPropertyEditorExtension = function() {
        let oLoader = this._getPropertyEditorExtensionLoader();
        return oLoader.findCustomPropertyEditorExtension("propertyEditor");
    };

    /*
     * Returns the PropertyEditorExtensionLoader
     *
     * @returns {PropertyEditorExtensionLoader} PropertyEditorExtensionLoader
     * @private
     */
    PropertyEditor.prototype._getPropertyEditorExtensionLoader = function() {
        if (!this._oPropertyEditorExtensionLoader) {
            this._oPropertyEditorExtensionLoader = new PropertyEditorExtensionLoader(this);
        }
        return this._oPropertyEditorExtensionLoader;
    };

    PropertyEditor.prototype.setColumnProperties = function(sColumnId, bWrapping, sHAlign, sVAlign, aColumnList) {
        for (let oColumn of aColumnList) {
            if (oColumn.columnId === sColumnId) {
                oColumn.wrapping = bWrapping;
                oColumn.hAlign = sHAlign;
                oColumn.vAlign = sVAlign;
                break;
            }
        }
    };

    PropertyEditor.prototype.addListColumnEditorDetail = function(aList, aColumnNames, sColumnId, sDescriptionKey, bWrapping, sHAlign, sVAlign) {
        const sLabel = this.getPluginI18nText(sDescriptionKey);
        aList[aList.length] = {
            "columnId": sColumnId,
            "description": sLabel,
            "wrapping": bWrapping,
            "hAlign": sHAlign,
            "vAlign": sVAlign
        };
        aColumnNames[aColumnNames.length] = {
            name: sColumnId,
            description: sLabel
        };
    };

    return PropertyEditor;
});