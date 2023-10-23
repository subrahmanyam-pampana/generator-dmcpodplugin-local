sap.ui.define([
    "sap/dm/dme/podfoundation/control/PropertyEditor",
    "sap/dm/dme/logging/Logging",
    "sap/ui/core/ValueState",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(PropertyEditor, Logging, ValueState, PodUtility) {
    "use strict";

    return PropertyEditor.extend("sap.dm.dme.podfoundation.control.BasePodSelectionPropertyEditor", {

        constructor: function(sId, mSettings) {
            PropertyEditor.apply(this, arguments);
            this._oLogger = Logging.getLogger("sap.dm.dme.podfoundation.control.BasePodSelectionPropertyEditor");
        },

        addPropertyEditorContent: function(oPropertyFormContainer) {
            const oData = this.getPropertyData();

            this.addStartPropertyEditorContent(oPropertyFormContainer, oData);

            this.addDefaultPropertyEditorContent(oPropertyFormContainer, oData);

            this.addImplementationPropertyEditorContent(oPropertyFormContainer, oData);

            this.completePropertyEditorContent(oPropertyFormContainer, oData);
        },

        addStartPropertyEditorContent: function(oPropertyFormContainer, oData) {
            // To be implemented by sub-classes
        },

        addDefaultPropertyEditorContent: function(oPropertyFormContainer, oData) {
            // To be implemented by sub-classes
        },

        addImplementationPropertyEditorContent: function(oPropertyFormContainer, oData) {
            this.addFilter(oPropertyFormContainer, oData, "inputTypeFilter", false);
            this.addFilter(oPropertyFormContainer, oData, "inputFilter");
            this.initializedActionButtons(oPropertyFormContainer, "mainInputActionButtonId", oData);
        },

        completePropertyEditorContent: function(oPropertyFormContainer, oData) {
            this.addFilter(oPropertyFormContainer, oData, "resourceFilter");
            this.addFilter(oPropertyFormContainer, oData, "quantityFilter");
        },

        addFilter: function(oPropertyFormContainer, oData, sFilterPrefix, bInputField) {
            this.addSwitch(oPropertyFormContainer, sFilterPrefix.concat("Visible"), oData);
            this.addInputField(oPropertyFormContainer, sFilterPrefix.concat("Label"), oData);
            this.addInputField(oPropertyFormContainer, sFilterPrefix.concat("Tooltip"), oData);
            if (typeof bInputField === "undefined" || bInputField) {
                this.addInputField(oPropertyFormContainer, sFilterPrefix.concat("Placeholder"), oData);
                this.addSelect(oPropertyFormContainer, sFilterPrefix.concat("Enforcement"), oData, ["EMPTY", "OPTIONAL_REQUIRED", "REQUIRED"]);
                this.addInputField(oPropertyFormContainer, sFilterPrefix.concat("MaxLength"), oData);
                this.addInputField(oPropertyFormContainer, sFilterPrefix.concat("Width"), oData);
            }
        },

        addInputTypeSelect: function(oPropertyFormContainer, oData) {
            return this.addSelect(oPropertyFormContainer, "inputType", oData, ["PROCESS_LOT", "SFC"]);
        },

        addQuantityInputField: function(oPropertyFormContainer, oData) {
            let oMetaData = {
                value: {
                    path: '/quantity'
                }
            };
            let oControl = this.addInputField(oPropertyFormContainer, "quantity", oData, oMetaData);

            this.setInitialQuantity(oControl, oData, "quantity");

            return oControl;
        },

        setInitialQuantity: function(oControl, oData, sDataFieldName) {
            let sValue = null;
            if (PodUtility.isNotEmpty(oData[sDataFieldName])) {
                let fValue = oData[sDataFieldName];
                if (typeof fValue === "string") {
                    let oFormat = {
                        fromFormatLocale: "en",
                        toFormatLocale: null
                    };
                    fValue = PodUtility.stringToFloat(oData[sDataFieldName], oFormat);
                }
                sValue = PodUtility.floatToString(fValue);
            }
            oControl.setValue(sValue);
        },

        handleInputChange: function(sDataFieldName, vValue, oInput) {
            let oData = this.getPropertyData();
            if (sDataFieldName === "quantity") {
                oInput.setValueState(ValueState.None);
                if (PodUtility.isNotEmpty(vValue)) {
                    if (!this.isValidDecimalQuantity(vValue)) {
                        oInput.setValueState(ValueState.Error);
                        oInput.setValueStateText(this.getI18nText("invalidQuantityValue"));
                        return;
                    }
                }
                if (typeof vValue === "string") {
                    // always store in english
                    vValue = PodUtility.stringToFloat(vValue, {
                        toFormatLocale: "en"
                    });
                }
            }
            oData[sDataFieldName] = vValue;
        },

        isValidDecimalQuantity: function(sCurrentQuantity) {
            if (PodUtility.isEmpty(sCurrentQuantity)) {
                return true;
            }
            let fQuantityValue = -1;
            if (PodUtility.isNumeric(sCurrentQuantity)) {
                fQuantityValue = PodUtility.stringToFloat(sCurrentQuantity, {
                    toFormatLocale: "en"
                });
                if (isNaN(fQuantityValue)) {
                    return false;
                }
            }
            if (fQuantityValue <= 0) {
                return false;
            }
            return true;
        },

        getWidthOrHeightProperty: function(sProperty) {
            for (const element of this.aWidthProperties) {
                if (sProperty === element) {
                    return "width";
                }
            }
            return null;
        },

        isMaxLengthProperty: function(sProperty) {
            for (const element of this.aMaxLengthProperties) {
                if (sProperty === element) {
                    return true;
                }
            }
            return false;
        },

        /***
         * Get the control from the oPropertyFormContainer based on the provided  sControlId
         * @param oPropertyFormContainer the property container
         * @param sControlId the control id to locate
         */
        getPropertyControl: function(oPropertyFormContainer, sControlId) {
            if (oPropertyFormContainer && oPropertyFormContainer._aElements) {
                for (const element of oPropertyFormContainer._aElements) {
                    if ((element.sId).indexOf(sControlId) > -1) {
                        return element;
                    }
                }
            }
            return undefined;
        },

        /*
         * Override to set default value for input type setting
         * @override
         */
        setPropertyData: function(oData) {
            if (oData) {
                if (typeof oData.inputType === "undefined") {
                    oData.inputType = "SFC";
                }
                if (typeof oData.inputTypeFilterVisible === "undefined") {
                    oData.inputTypeFilterVisible = false;
                }
                if (typeof oData.inputTypeFilterLabel === "undefined") {
                    oData.inputTypeFilterLabel = "";
                }
                if (typeof oData.inputTypeFilterTooltip === "undefined") {
                    oData.inputTypeFilterTooltip = "";
                }
                if (typeof oData.enableViews === "undefined") {
                    oData.enableViews = false;
                }
            }
            PropertyEditor.prototype.setPropertyData.apply(this, [oData]);
        },

        /**
         * Set the control to enabled/disabled based on the provided bEnabled flag
         * @param oPropertyControl the control to be set
         * @param bEnabled boolean representing the enablement and state
         */
        setPropertyEnablement: function(oPropertyControl, bEnabled) {
            if (oPropertyControl) {
                oPropertyControl.setEnabled(bEnabled);
                if (!bEnabled) {
                    oPropertyControl.setState = true;
                }
            }
        },

        setFilterEnforcment: function(sFilter, bRequired, bEnabled) {
            let oData = this.getPropertyData();
            let sFiterName = sFilter + "Enforcement";
            let sFiterId = sFilter + "EnforcementSelect";
            if (bRequired) {
                // setting input filter to required in SFC Mode
                oData[sFiterName] = "REQUIRED";
            } else {
                // reset back to default
                oData[sFiterName] = "";
            }
            let oFilterEnforcementControl = this.getPropertyControl(this._oPropertyFormContainer, sFiterId);
            if (oFilterEnforcementControl) {
                oFilterEnforcementControl.setEnabled(bEnabled);
                if (!bEnabled) {
                    oFilterEnforcementControl.setState = true;
                }
                oFilterEnforcementControl.setSelectedKey(oData[sFiterName]);
            }
        },

        setSwitchControlVisible: function(sDataFieldName, bVisible) {
            const oLabelControl = this.getPropertyControl(this._oPropertyFormContainer, sDataFieldName + "Label");
            if (oLabelControl) {
                oLabelControl.setVisible(bVisible);
            }
            const oSwitchControl = this.getPropertyControl(this._oPropertyFormContainer, sDataFieldName + "Switch");
            if (oSwitchControl) {
                oSwitchControl.setVisible(bVisible);
            }
            if (!bVisible) {
                // setting back to false for SFC Selection type
                if (oSwitchControl) {
                    oSwitchControl.setState(false);
                }
                let oData = this.getPropertyData();
                oData[sDataFieldName] = false;
            }
        },

        setInputTypeControlsVisible: function(bVisible) {
            const sDefaultFieldName = "inputType";
            let oLabelControl = this.getPropertyControl(this._oPropertyFormContainer, sDefaultFieldName + "Label");
            if (oLabelControl) {
                oLabelControl.setVisible(bVisible);
            }
            let oControl = this.getPropertyControl(this._oPropertyFormContainer, sDefaultFieldName + "Select");
            if (oControl) {
                oControl.setVisible(bVisible);
            }
            const sFilterFieldName = "inputTypeFilter";
            oLabelControl = this.getPropertyControl(this._oPropertyFormContainer, sFilterFieldName + "VisibleLabel");
            if (oLabelControl) {
                oLabelControl.setVisible(bVisible);
            }
            oControl = this.getPropertyControl(this._oPropertyFormContainer, sFilterFieldName + "VisibleSwitch");
            if (oControl) {
                oControl.setState(false);
                oControl.setVisible(bVisible);
            }
            oLabelControl = this.getPropertyControl(this._oPropertyFormContainer, sFilterFieldName + "LabelLabel");
            if (oLabelControl) {
                oLabelControl.setVisible(bVisible);
            }
            oControl = this.getPropertyControl(this._oPropertyFormContainer, sFilterFieldName + "LabelInput");
            if (oControl) {
                oControl.setVisible(bVisible);
            }
            oLabelControl = this.getPropertyControl(this._oPropertyFormContainer, sFilterFieldName + "TooltipLabel");
            if (oLabelControl) {
                oLabelControl.setVisible(bVisible);
            }
            oControl = this.getPropertyControl(this._oPropertyFormContainer, sFilterFieldName + "TooltipInput");
            if (oControl) {
                oControl.setVisible(bVisible);
            }
            if (!bVisible) {
                const oData = this.getPropertyData();
                oData[sDefaultFieldName] = "SFC";
                oData[sFilterFieldName + "Visible"] = false;
                oData[sFilterFieldName + "Label"] = "";
                oData[sFilterFieldName + "Tooltip"] = "";
            }
        },

        getDefaultPropertyData: function() {
            return {
                "resource": "",
                "quantity": null,
                "inputType": "SFC",
                "enableViews": false,
                "inputFilterVisible": true,
                "inputFilterLabel": "",
                "inputFilterTooltip": "",
                "inputFilterPlaceholder": "",
                "inputFilterEnforcement": "",
                "inputFilterMaxLength": 128,
                "inputFilterWidth": "",
                "inputTypeFilterVisible": false,
                "inputTypeFilterLabel": "",
                "inputTypeFilterTooltip": "",
                "resourceFilterVisible": true,
                "resourceFilterLabel": "",
                "resourceFilterTooltip": "",
                "resourceFilterPlaceholder": "",
                "resourceFilterEnforcement": "",
                "resourceFilterMaxLength": 128,
                "resourceFilterWidth": "",
                "quantityFilterVisible": false,
                "quantityFilterLabel": "",
                "quantityFilterTooltip": "",
                "quantityFilterPlaceholder": "",
                "quantityFilterEnforcement": "",
                "quantityFilterMaxLength": 0,
                "quantityFilterWidth": "100px"
            };
        }

    });
});