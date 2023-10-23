sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    /**
     * Constructor for Process Lot key data object
     *
     * @param {string} [sProcessLot] Process Lot name value
     *
     * @class
     * <code>sap.dm.dme.podfoundation.model.ProcessLotKeyData</code> holds key data for the Process Lot object.
     *
     * @extends sap.ui.base.Object
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.model.ProcessLotKeyData
     */
    var ProcessLotKeyData = BaseObject.extend("sap.dm.dme.podfoundation.model.ProcessLotKeyData", {
        constructor: function(sProcessLot) {
            this.ref = "";
            this.processLot = sProcessLot;
        }
    });

    /**
     * Initializes the object with the input data object
     *
     * @param {object} oData as defined below
     * <pre>
     *     {
     *         ref: sRef,
     *         processLot: sProcessLot
     *     }
     * </pre>
     * @public
     */
    ProcessLotKeyData.prototype.init = function(oData) {
        this.ref = oData.ref;
        this.processLot = oData.processLot;
    };

    /**
     * Gets the Process Lot ref
     *
     * @returns {string} Process Lot ref
     * @public
     */
    ProcessLotKeyData.prototype.getRef = function() {
        return this.ref;
    };

    /**
     * Sets the Process Lot ref
     *
     * @param {string} Process Lot ref
     * @public
     */
    ProcessLotKeyData.prototype.setRef = function(sRef) {
        this.ref = sRef;
    };

    /**
     * Gets the Process Lot
     *
     * @returns {string} Process Lot
     * @public
     */
    ProcessLotKeyData.prototype.getProcessLot = function() {
        return this.processLot;
    };

    /**
     * Sets the Process Lot
     *
     * @param {string} Process Lot
     * @public
     */
    ProcessLotKeyData.prototype.setProcessLot = function(sProcessLot) {
        this.processLot = sProcessLot;
    };

    return ProcessLotKeyData;
});