sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    /**
     * Constructor for the Selection information object
     *
     * @class
     * <code>sap.dm.dme.podfoundation.model.Selection</code> holds Selection information.
     *
     * @extends sap.ui.base.Object
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.model.Selection
     */
    var Selection = BaseObject.extend("sap.dm.dme.podfoundation.model.Selection", {
        constructor: function() {
            this.input = "";
            this.sfc;
            this.item;
            this.processLot;
            this.shopOrder;
            this.sfcData;
        }
    });

    /**
     * Initializes the object with the input data object
     *
     * @param {object} oData as defined below
     * <pre>
     *     {
     *         input: sInput,
     *         sfc: sSfc,
     *         item: sItem,
     *         processLot: sProcessLot,
     *         shopOrder: sShopOrder,
     *         sfcData: oSfcData
     *     }
     * </pre>
     * @public
     */
    Selection.prototype.init = function(oData) {
        this.input = oData.input;
        this.sfc = oData.sfc;
        this.item = oData.item;
        this.processLot = oData.processLot;
        this.shopOrder = oData.shopOrder;
        this.sfcData = oData.sfcData;
    };

    /**
     * Gets the Input value
     *
     * @returns {string} Input value
     * @public
     */
    Selection.prototype.getInput = function() {
        return this.input;
    };

    /**
     * Sets the Input value
     *
     * @param {string} Input value
     * @public
     */
    Selection.prototype.setInput = function(sInput) {
        this.input = sInput;
    };

    /**
     * Gets the Sfc key data
     *
     * @returns {sap.dm.dme.podfoundation.model.SfcKeyData} Sfc key data
     * @public
     */
    Selection.prototype.getSfc = function() {
        return this.sfc;
    };

    /**
     * Sets the Sfc key data
     *
     * @param {sap.dm.dme.podfoundation.model.SfcKeyData} Sfc key data
     * @public
     */
    Selection.prototype.setSfc = function(oSfc) {
        this.sfc = oSfc;
    };

    /**
     * Gets the Item key data
     *
     * @returns {sap.dm.dme.podfoundation.model.ItemKeyData} Item key data
     * @public
     */
    Selection.prototype.getItem = function() {
        return this.item;
    };

    /**
     * Sets the Item key data
     *
     * @param {sap.dm.dme.podfoundation.model.ItemKeyData} Item key data
     * @public
     */
    Selection.prototype.setItem = function(oItem) {
        this.item = oItem;
    };

    /**
     * Gets the Process Lot key data
     *
     * @returns {sap.dm.dme.podfoundation.model.ProcessLotKeyData} Process Lot key data
     * @public
     */
    Selection.prototype.getProcessLot = function() {
        return this.processLot;
    };

    /**
     * Sets the Process Lot key data
     *
     * @param {sap.dm.dme.podfoundation.model.ProcessLotKeyData} Process Lot key data
     * @public
     */
    Selection.prototype.setProcessLot = function(oProcessLot) {
        this.processLot = oProcessLot;
    };

    /**
     * Gets the Shop Order key data
     *
     * @returns {sap.dm.dme.podfoundation.model.ShopOrderKeyData} Shop Order key data
     * @public
     */
    Selection.prototype.getShopOrder = function() {
        return this.shopOrder;
    };

    /**
     * Sets the Shop Order key data
     *
     * @param {sap.dm.dme.podfoundation.model.ShopOrderKeyData} Shop Order key data
     * @public
     */
    Selection.prototype.setShopOrder = function(oShopOrder) {
        this.shopOrder = oShopOrder;
    };

    /**
     * Gets the Sfc data 
     *
     * @returns {sap.dm.dme.podfoundation.model.SfcData} Sfc data
     * @public
     */
    Selection.prototype.getSfcData = function() {
        return this.sfcData;
    };

    /**
     * Sets the Sfc data
     *
     * @param {sap.dm.dme.podfoundation.model.SfcData} Sfc data
     * @public
     */
    Selection.prototype.setSfcData = function(oSfcData) {
        this.sfcData = oSfcData;
    };

    return Selection;
});