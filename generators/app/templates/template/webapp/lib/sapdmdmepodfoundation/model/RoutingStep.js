sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    /**
     * Constructor for Routing Step object
     *
     * @param {object}  oData as defined below
     * <pre>
     *     {
     *         routing: sRouting,
     *         routingVersion: sRoutingVersion,
     *         routingType: sRoutingType
     *         operation: sOperation
     *         stepId: sStepId
     *     }
     * </pre>
     *
     * @class
     * <code>sap.dm.dme.podfoundation.model.RoutingStep</code> holds selected routing step and related data.
     *
     * @extends sap.ui.base.Object
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.model.RoutingStep
     */
    var RoutingStep = BaseObject.extend("sap.dm.dme.podfoundation.model.RoutingStep", {
        constructor: function(oData) {
            this.routing = "";
            this.routingVersion = "";
            this.routingType = "";
            this.operation = "";
            this.stepId = "";
            if (oData) {
                this.init(oData);
            }
        }
    });

    /**
     * Initializes the object with the input data object
     *
     * @param {object} oData as defined below
     * <pre>
     *     {
     *         routing: sRouting,
     *         routingVersion: sRoutingVersion,
     *         routingType: sRoutingType
     *         operation: sOperation
     *         stepId: sStepId
     *     }
     * </pre>
     * @public
     */
    RoutingStep.prototype.init = function(oData) {
        this.routing = oData.routing;
        this.routingVersion = oData.routingVersion;
        this.routingType = oData.routingType;
        this.operation = oData.operation;
        this.stepId = oData.stepId;
    };

    /**
     * Gets the Routing
     *
     * @returns {string} Routing
     * @public
     */
    RoutingStep.prototype.getRouting = function() {
        return this.routing;
    };

    /**
     * Sets the Routing
     *
     * @param {string} Routing
     * @public
     */
    RoutingStep.prototype.setRouting = function(sRouting) {
        this.routing = sRouting;
    };

    /**
     * Gets the Routing Version
     *
     * @returns {string} Routing Version
     * @public
     */
    RoutingStep.prototype.getRoutingVersion = function() {
        return this.routingVersion;
    };

    /**
     * Sets the Routing Version
     *
     * @param {string} Routing Version
     * @public
     */
    RoutingStep.prototype.setRoutingVersion = function(sRoutingVersion) {
        this.routingVersion = sRoutingVersion;
    };

    /**
     * Gets the Routing Type
     *
     * @returns {string} Routing Type
     * @public
     */
    RoutingStep.prototype.getRoutingType = function() {
        return this.routingType;
    };

    /**
     * Sets the Routing Type
     *
     * @param {string} Routing Type
     * @public
     */
    RoutingStep.prototype.setRoutingType = function(sRoutingType) {
        this.routingType = sRoutingType;
    };

    /**
     * Gets the Operation Activity for this routing step
     *
     * @returns {string} Operation Activity name
     * @public
     */
    RoutingStep.prototype.getOperation = function() {
        return this.operation;
    };

    /**
     * Sets the Operation Activity for this routing step
     *
     * @param {string} operation Activity name
     * @public
     */
    RoutingStep.prototype.setOperation = function(sOperation) {
        this.operation = sOperation;
    };

    /**
     * Gets the Routing Step ID
     *
     * @returns {string} Routing Step ID
     * @public
     */
    RoutingStep.prototype.getStepId = function() {
        return this.stepId;
    };

    /**
     * Sets the Routing Step ID
     *
     * @param {string} sStepId Step ID
     * @public
     */
    RoutingStep.prototype.setStepId = function(sStepId) {
        this.stepId = sStepId;
    };

    return RoutingStep;
});