sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    /**
     * Constructor for Item key data object
     *
     * @param {string} [sItem] Item value
     *
     * @class
     * <code>sap.dm.dme.podfoundation.model.ItemKeyData</code> holds key data for the Item object.
     *
     * @extends sap.ui.base.Object
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.model.ItemKeyData
     */
    var ItemKeyData = BaseObject.extend("sap.dm.dme.podfoundation.model.ItemKeyData", {
        constructor: function(sItem) {
            this.ref = "";
            this.site = "";
            this.item = sItem;
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
     *         item: sItem,
     *         version: sVersion
     *     }
     * </pre>
     * @public
     */
    ItemKeyData.prototype.init = function(oData) {
        this.ref = oData.ref;
        this.site = oData.site;
        this.item = oData.item;
        this.version = oData.version;
    };

    /**
     * Gets the Item ref
     *
     * @returns {string} Item ref
     * @public
     */
    ItemKeyData.prototype.getRef = function() {
        return this.ref;
    };

    /**
     * Sets the Item ref
     *
     * @param {string} Item ref
     * @public
     */
    ItemKeyData.prototype.setRef = function(sRef) {
        this.ref = sRef;
    };

    /**
     * Gets the Site
     *
     * @returns {string} Site
     * @public
     */
    ItemKeyData.prototype.getSite = function() {
        return this.site;
    };

    /**
     * Sets the Site
     *
     * @param {string} Site
     * @public
     */
    ItemKeyData.prototype.setSite = function(sSite) {
        this.site = sSite;
    };

    /**
     * Gets the Item
     *
     * @returns {string} Item
     * @public
     */
    ItemKeyData.prototype.getItem = function() {
        return this.item;
    };

    /**
     * Sets the Item
     *
     * @param {string} Item
     * @public
     */
    ItemKeyData.prototype.setItem = function(sItem) {
        this.item = sItem;
    };

    /**
     * Gets the Item version
     *
     * @returns {string} Item version
     * @public
     */
    ItemKeyData.prototype.getVersion = function() {
        return this.version;
    };

    /**
     * Sets the Item version
     *
     * @param {string} Item version
     * @public
     */
    ItemKeyData.prototype.setVersion = function(sVersion) {
        this.version = sVersion;
    };

    return ItemKeyData;
});