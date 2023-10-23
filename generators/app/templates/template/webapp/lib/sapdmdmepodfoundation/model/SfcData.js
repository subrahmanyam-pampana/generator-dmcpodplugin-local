sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    /**
     * Constructor for Sfc data object
     *
     * @param {string} [sSfc] Sfc value
     *
     * @class
     * <code>sap.dm.dme.podfoundation.model.SfcData</code> holds SFC related data.
     *
     * @extends sap.ui.base.Object
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.model.SfcData
     */
    var SfcData = BaseObject.extend("sap.dm.dme.podfoundation.model.SfcData", {
        constructor: function(sSfc) {
            this.sfc = sSfc;
            this.quantity = 0;
            this.statusCode = "";
            this.completePending = "";
            this.material = "";
            this.materialVersion = "";
            this.materialAndVersion = "";
            this.materialDescription = "";
            this.routing = "";
            this.routingVersion = "";
            this.routingType = "";
            this.operation = "";
            this.stepId = "";
            this.workCenter = "";
            this.resource = "";
        }
    });

    /**
     * Initializes the object with the input data object
     *
     * @param {object} oData as defined below
     * <pre>
     *     {
     *         sfc: sSfc,
     *         quantity: fQuantity,
     *         statusCode: sStatusCode,
     *         completePending: sCompletePending,
     *         material: sMaterial,
     *         materialVersion: sMaterialVersion,
     *         materialAndVersion: sMaterialAndVersion,
     *         materialDescription: sMaterialDescription
     *         routing: sRouting,
     *         routingVersion: sRoutingVersion,
     *         routingType: sRoutingType
     *         operation: sOperation
     *         workCenter: sWorkCenter
     *         resource: sResource
     *     }
     * </pre>
     * @public
     */
    SfcData.prototype.init = function(oData) {
        this.sfc = oData.sfc;
        this.quantity = oData.quantity;
        this.statusCode = oData.statusCode;
        this.completePending = oData.completePending;
        this.material = oData.material;
        this.materialVersion = oData.materialVersion;
        this.materialAndVersion = oData.materialAndVersion;
        this.materialDescription = oData.materialDescription;
        this.routing = oData.routing;
        this.routingVersion = oData.routingVersion;
        this.routingType = oData.routingType;
        this.operation = oData.operation;
        this.stepId = oData.stepId;
        this.workCenter = oData.workCenter;
        this.resource = oData.resource;
    };

    /**
     * Gets the Sfc
     *
     * @returns {string} Sfc
     * @public
     */
    SfcData.prototype.getSfc = function() {
        return this.sfc;
    };

    /**
     * Sets the Sfc value
     *
     * @param {string} Sfc
     * @public
     */
    SfcData.prototype.setSfc = function(sSfc) {
        this.sfc = sSfc;
    };

    /**
     * Gets the Quantity
     *
     * @returns {float} Quantity
     * @public
     */
    SfcData.prototype.getQuantity = function() {
        return this.quantity;
    };

    /**
     * Sets the Quantity
     *
     * @param {float} Quantity
     * @public
     */
    SfcData.prototype.setQuantity = function(nQuantity) {
        this.quantity = nQuantity;
    };

    /**
     * Gets the Status Code
     *
     * @returns {string} Status Code
     * @public
     */
    SfcData.prototype.getStatusCode = function() {
        return this.statusCode;
    };

    /**
     * Sets the Status Code
     *
     * @param {string} Status Code
     * @public
     */
    SfcData.prototype.setStatusCode = function(sStatusCode) {
        this.statusCode = sStatusCode;
    };

    /**
     * Gets the Complete Pending status of the current Sfc
     *
     * @returns {string} Complete Pending status
     * @public
     */
    SfcData.prototype.getCompletePending = function() {
        return this.completePending;
    };

    /**
     * Sets the Complete Pending status of the current Sfc
     *
     * @param {string} Complete Pending status
     * @public
     */
    SfcData.prototype.setCompletePending = function(sCompletePending) {
        this.completePending = sCompletePending;
    };


    /**
     * Gets the Material
     *
     * @returns {string} Material
     * @public
     */
    SfcData.prototype.getMaterial = function() {
        return this.material;
    };

    /**
     * Sets the Material
     *
     * @param {string} Material
     * @public
     */
    SfcData.prototype.setMaterial = function(sMaterial) {
        this.material = sMaterial;
    };

    /**
     * Gets the Material Version
     *
     * @returns {string} Material Version
     * @public
     */
    SfcData.prototype.getMaterialVersion = function() {
        return this.materialVersion;
    };

    /**
     * Sets the Material Version
     *
     * @param {string} Material Version
     * @public
     */
    SfcData.prototype.setMaterialVersion = function(sMaterialVersion) {
        this.materialVersion = sMaterialVersion;
    };

    /**
     * Gets the Material / Version
     *
     * @returns {string} Material / Version
     * @public
     */
    SfcData.prototype.getMaterialAndVersion = function() {
        return this.materialAndVersion;
    };

    /**
     * Sets the Material / Version
     *
     * @param {string} Material / Version
     * @public
     */
    SfcData.prototype.setMaterialAndVersion = function(sMaterialAndVersion) {
        this.materialAndVersion = sMaterialAndVersion;
    };

    /**
     * Gets the Material description
     *
     * @returns {string} Material description
     * @public
     */
    SfcData.prototype.getMaterialDescription = function() {
        return this.materialDescription;
    };

    /**
     * Sets the Material description
     *
     * @param {string} Material description
     * @public
     */
    SfcData.prototype.setMaterialDescription = function(sMaterialDescription) {
        this.materialDescription = sMaterialDescription;
    };

    /**
     * Gets the Routing
     *
     * @returns {string} Routing
     * @public
     */
    SfcData.prototype.getRouting = function() {
        return this.routing;
    };

    /**
     * Sets the Routing
     *
     * @param {string} Routing
     * @public
     */
    SfcData.prototype.setRouting = function(sRouting) {
        this.routing = sRouting;
    };

    /**
     * Gets the Routing Version
     *
     * @returns {string} Routing Version
     * @public
     */
    SfcData.prototype.getRoutingVersion = function() {
        return this.routingVersion;
    };

    /**
     * Sets the Routing Version
     *
     * @param {string} Routing Version
     * @public
     */
    SfcData.prototype.setRoutingVersion = function(sRoutingVersion) {
        this.routingVersion = sRoutingVersion;
    };

    /**
     * Gets the Routing Type
     *
     * @returns {string} Routing Type
     * @public
     */
    SfcData.prototype.getRoutingType = function() {
        return this.routingType;
    };

    /**
     * Sets the Routing Type
     *
     * @param {string} Routing Type
     * @public
     */
    SfcData.prototype.setRoutingType = function(sRoutingType) {
        this.routingType = sRoutingType;
    };

    /**
     * Gets the Operation Activity for the SFC in-queue or active at
     *
     * @returns {string} Operation Activity name
     * @public
     */
    SfcData.prototype.getOperation = function() {
        return this.operation;
    };

    /**
     * Sets the Operation Activity
     *
     * @param {string} operation Activity name
     * @public
     */
    SfcData.prototype.setOperation = function(sOperation) {
        this.operation = sOperation;
    };

    /**
     * Gets the Operation Step ID for the SFC in-queue or active at
     *
     * @returns {string} Operation Step ID
     * @public
     */
    SfcData.prototype.getStepId = function() {
        return this.stepId;
    };

    /**
     * Sets the Operation Step ID for the SFC in-queue or active at
     *
     * @param {string} sStepId Step ID
     * @public
     */
    SfcData.prototype.setStepId = function(sStepId) {
        this.stepId = sStepId;
    };

    /**
     * Gets the Work Center assigned to the SFC
     *
     * @returns {string} Work Center
     * @public
     */
    SfcData.prototype.getWorkCenter = function() {
        return this.workCenter;
    };

    /**
     * Sets the Work Center assigned to the SFC
     *
     * @param {string} sWorkCenter Work Center
     * @public
     */
    SfcData.prototype.setWorkCenter = function(sWorkCenter) {
        this.workCenter = sWorkCenter;
    };

    /**
     * Gets the Resource assigned to the SFC
     *
     * @returns {string} Resource
     * @public
     */
    SfcData.prototype.getResource = function() {
        return this.resource;
    };

    /**
     * Sets the Resource assigned to the SFC
     *
     * @param {string} sResource Resource
     * @public
     */
    SfcData.prototype.setResource = function(sResource) {
        this.resource = sResource;
    };

    return SfcData;
});