sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    /**
     * Constructor for Shop Order key data object
     *
     * @param {string} [sShopOrder] Shop Order value
     *
     * @class
     * <code>sap.dm.dme.podfoundation.model.ShopOrderKeyData</code> holds key data for the Shop Order object.
     *
     * @extends sap.ui.base.Object
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.model.ShopOrderKeyData
     */
    var ShopOrderKeyData = BaseObject.extend("sap.dm.dme.podfoundation.model.ShopOrderKeyData", {
        constructor: function(sShopOrder) {
            this.ref = "";
            this.site = "";
            this.shopOrder = sShopOrder;
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
     *         shopOrder: sShopOrder
     *     }
     * </pre>
     * @public
     */
    ShopOrderKeyData.prototype.init = function(oData) {
        this.ref = oData.ref;
        this.site = oData.site;
        this.shopOrder = oData.shopOrder;
    };

    /**
     * Gets the Shop Order ref
     *
     * @returns {string} Shop Order ref
     * @public
     */
    ShopOrderKeyData.prototype.getRef = function() {
        return this.ref;
    };

    /**
     * Sets the Shop Order ref
     *
     * @param {string} Shop Order ref
     * @public
     */
    ShopOrderKeyData.prototype.setRef = function(sRef) {
        this.ref = sRef;
    };

    /**
     * Gets the Site
     *
     * @returns {string} Site
     * @public
     */
    ShopOrderKeyData.prototype.getSite = function() {
        return this.site;
    };

    /**
     * Sets the Site
     *
     * @param {string} Site
     * @public
     */
    ShopOrderKeyData.prototype.setSite = function(sSite) {
        this.site = sSite;
    };

    /**
     * Gets the Shop Order
     *
     * @returns {string} Shop Order
     * @public
     */
    ShopOrderKeyData.prototype.getShopOrder = function() {
        return this.shopOrder;
    };

    /**
     * Sets the Shop Order
     *
     * @param {string} Shop Order
     * @public
     */
    ShopOrderKeyData.prototype.setShopOrder = function(sShopOrder) {
        this.shopOrder = sShopOrder;
    };

    return ShopOrderKeyData;
});