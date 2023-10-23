sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    /**
     * Constructor for Resource key data object
     *
     * @param {string} [sResource] Resource value
     *
     * @class
     * <code>sap.dm.dme.podfoundation.model.ResourceKeyData</code> holds key data for the Resource object.
     *
     * @extends sap.ui.base.Object
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.model.ResourceKeyData
     */
    var ResourceKeyData = BaseObject.extend("sap.dm.dme.podfoundation.model.ResourceKeyData", {
        constructor: function(sResource) {
            this.ref = "";
            this.site = "";
            this.resource = sResource;
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
     *         resource: sResource
     *     }
     * </pre>
     * @public
     */
    ResourceKeyData.prototype.init = function(oData) {
        this.ref = oData.ref;
        this.site = oData.site;
        this.resource = oData.resource;
    };

    /**
     * Gets the Resource ref
     *
     * @returns {string} Resource ref
     * @public
     */
    ResourceKeyData.prototype.getRef = function() {
        return this.ref;
    };

    /**
     * Sets the Resource ref
     *
     * @param {string} Resource ref
     * @public
     */
    ResourceKeyData.prototype.setRef = function(sRef) {
        this.ref = sRef;
    };

    /**
     * Gets the Site
     *
     * @returns {string} Site
     * @public
     */
    ResourceKeyData.prototype.getSite = function() {
        return this.site;
    };

    /**
     * Sets the Site
     *
     * @param {string} Site
     * @public
     */
    ResourceKeyData.prototype.setSite = function(sSite) {
        this.site = sSite;
    };

    /**
     * Gets the Resource 
     *
     * @returns {string} Resource 
     * @public
     */
    ResourceKeyData.prototype.getResource = function() {
        return this.resource;
    };

    /**
     * Sets the Resource 
     *
     * @param {string} Resource 
     * @public
     */
    ResourceKeyData.prototype.setResource = function(sResource) {
        this.resource = sResource;
    };

    return ResourceKeyData;
});