sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    /**
     * Constructor for Sfc key data object
     *
     * @param {string} [sSfc] Sfc value
     *
     * @class
     * <code>sap.dm.dme.podfoundation.model.SfcKeyData</code> holds key data for the SFC object.
     *
     * @extends sap.ui.base.Object
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.model.SfcKeyData
     */
    var SfcKeyData = BaseObject.extend("sap.dm.dme.podfoundation.model.SfcKeyData", {
        constructor: function(sSfc) {
            this.ref = "";
            this.site = "";
            this.sfc = sSfc;
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
     *         sfc: sSfc
     *     }
     * </pre>
     * @public
     */
    SfcKeyData.prototype.init = function(oData) {
        this.ref = oData.ref;
        this.site = oData.site;
        this.sfc = oData.sfc;
    };


    /**
     * Gets the Sfc ref
     *
     * @returns {string} Sfc ref
     * @public
     */
    SfcKeyData.prototype.getRef = function() {
        return this.ref;
    };

    /**
     * Sets the Sfc ref
     *
     * @param {string} Sfc ref
     * @public
     */
    SfcKeyData.prototype.setRef = function(sRef) {
        this.ref = sRef;
    };

    /**
     * Gets the Site
     *
     * @returns {string} Site
     * @public
     */
    SfcKeyData.prototype.getSite = function() {
        return this.site;
    };

    /**
     * Sets the Site
     *
     * @param {string} Site
     * @public
     */
    SfcKeyData.prototype.setSite = function(sSite) {
        this.site = sSite;
    };

    /**
     * Gets the Sfc
     *
     * @returns {string} Sfc
     * @public
     */
    SfcKeyData.prototype.getSfc = function() {
        return this.sfc;
    };

    /**
     * Sets the Sfc
     *
     * @param {string} Sfc
     * @public
     */
    SfcKeyData.prototype.setSfc = function(sSfc) {
        this.sfc = sSfc;
    };

    return SfcKeyData;
});