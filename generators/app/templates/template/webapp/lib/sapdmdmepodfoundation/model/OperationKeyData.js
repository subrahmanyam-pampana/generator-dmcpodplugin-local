sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    /**
     * Constructor for Operation key data object
     *
     * @param {string} [sOperationName] Operation name value
     *
     * @class
     * <code>sap.dm.dme.podfoundation.model.OperationKeyData</code> holds key data for the Operation object.
     *
     * @extends sap.ui.base.Object
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.model.OperationKeyData
     */
    var OperationKeyData = BaseObject.extend("sap.dm.dme.podfoundation.model.OperationKeyData", {
        constructor: function(sOperationName) {
            this.ref = "";
            this.site = "";
            this.operation = sOperationName;
            this.version = "";
        }
    });

    /**
     * Initializes the object with the input data object
     *
     * @param {object} oData as defined below
     * <pre>
     *     {
     *         ref: sRef,
     *         site: sSite,
     *         operation: sOperation,
     *         version: sVersion
     *     }
     * </pre>
     * @public
     */
    OperationKeyData.prototype.init = function(oData) {
        this.ref = oData.ref;
        this.site = oData.site;
        this.operation = oData.operation;
        this.version = oData.version;
    };

    /**
     * Gets the Operation ref
     *
     * @returns {string} Operation ref
     * @public
     */
    OperationKeyData.prototype.getRef = function() {
        return this.ref;
    };

    /**
     * Sets the Operation ref
     *
     * @param {string} Operation ref
     * @public
     */
    OperationKeyData.prototype.setRef = function(sRef) {
        this.ref = sRef;
    };

    /**
     * Gets the Site
     *
     * @returns {string} Site
     * @public
     */
    OperationKeyData.prototype.getSite = function() {
        return this.site;
    };

    /**
     * Sets the Site
     *
     * @param {string} Site
     * @public
     */
    OperationKeyData.prototype.setSite = function(sSite) {
        this.site = sSite;
    };

    /**
     * Gets the Operation
     *
     * @returns {string} Operation
     * @public
     */
    OperationKeyData.prototype.getOperation = function() {
        return this.operation;
    };

    /**
     * Sets the Operation
     *
     * @param {string} Operation
     * @public
     */
    OperationKeyData.prototype.setOperation = function(sOperationName) {
        this.operation = sOperationName;
    };

    /**
     * Gets the Operation version
     *
     * @returns {string} Operation version
     * @public
     */
    OperationKeyData.prototype.getVersion = function() {
        return this.version;
    };

    /**
     * Sets the Operation version
     *
     * @param {string} Operation version
     * @public
     */
    OperationKeyData.prototype.setVersion = function(sVersion) {
        this.version = sVersion;
    };

    return OperationKeyData;
});