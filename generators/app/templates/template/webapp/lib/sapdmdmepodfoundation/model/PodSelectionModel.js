sap.ui.define([
    "sap/ui/base/Object", "./InputType", "./PodType"
], function(BaseObject, InputType, PodType) {
    "use strict";

    const PROPERTIES = [
        "podType",
        "podSelectionType",
        "inputType",
        "worklistType",
        "inputValue",
        "resource",
        "user",
        "substepGroup",
        "workCenter",
        "endUnit",
        "quantity",
        "workInstruction",
        "dataCollection",
        "currentComponentIndex",
        "assemblyMode",
        "materialNo",
        "materialVersion",
        "fromDate",
        "toDate",
        "orderSelectionRange",
        "timeZoneId",
        "downtimeTypeToShow",
        "orderContextFromSpeedLossRow",
        "inspectionCharacteristic",
        "selectedWorklistOperations",
        "isInventoryManaged",
        "selectedPhaseWorkCenter",
        "requiredValuesLoaded",
        "orderId",
        "productionProcessWorkCenters"
    ];

    const COLLECTIONS = [{
            singular: "selection",
            plural: "selections"
        },
        // refactor: now contains only selected operations; should store all
        {
            singular: "operation",
            plural: "operations"
        },
        // contains all components for selected operation
        {
            singular: "component",
            plural: "components"
        },
        // contains selections without duplicates(unique orders)
        {
            singular: "distinctSelection",
            plural: "distinctSelections"
        },
        // contains selected workcenters
        {
            singular: "selectedWorkCenter",
            plural: "selectedWorkCenters"
        },
        // contains selected routing steps
        {
            singular: "selectedRoutingStep",
            plural: "selectedRoutingSteps"
        },
        // contains selected shoporders
        {
            singular: "shopOrder",
            plural: "shopOrders"
        }
    ];

    function firstCap(sString) {
        return sString.charAt(0).toUpperCase() + sString.slice(1);
    }

    function createGetter(oModel, sProperty) {
        oModel["get" + firstCap(sProperty)] = function() {
            return oModel[sProperty];
        };
    }

    function createSetter(oModel, sProperty) {
        let sMethodName = "set" + firstCap(sProperty);
        if (!oModel[sMethodName]) {
            oModel[sMethodName] = function(vValue) {
                oModel[sProperty] = vValue;
            };
        }
    }

    function createElementGetter(oModel, sCollection, sElement) {
        oModel["get" + firstCap(sElement)] = function(i) {
            return oModel[sCollection][i || 0];
        };
    }

    function createAddElement(oModel, sCollection, sElement) {
        oModel["add" + firstCap(sElement)] = function(vValue) {
            return oModel[sCollection].unshift(vValue);
        };
    }

    function createClearCollection(oModel, sCollection) {
        let sMethodName = "clear" + firstCap(sCollection);
        if (!oModel[sMethodName]) {
            oModel[sMethodName] = function() {
                oModel[sCollection] = [];
            };
        }
    }

    function createPropertyAccessors(oModel) {
        for (let sProperty of PROPERTIES) {
            createGetter(oModel, sProperty);
            createSetter(oModel, sProperty);
        }
    }

    function createCollectionAccessors(oModel) {
        for (let oCollection of COLLECTIONS) {
            oModel[oCollection.plural] = [];
            createGetter(oModel, oCollection.plural);
            createSetter(oModel, oCollection.plural);
            createElementGetter(oModel, oCollection.plural, oCollection.singular);
            createAddElement(oModel, oCollection.plural, oCollection.singular);
            createClearCollection(oModel, oCollection.plural);
        }
    }

    function createAccessors(oModel) {
        createPropertyAccessors(oModel);
        createCollectionAccessors(oModel);
    }

    /**
     * Constructor for The POD Selection model
     *
     * @class
     * <code>sap.dm.dme.podfoundation.model.PodSelectionModel</code> holds the POD context information
     * which includes the type of POD currently running and all selection information from the POD plugins.
     *
     * @extends sap.ui.base.Object
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.model.PodSelectionModel
     */
    let PodSelectionModel = BaseObject.extend("sap.dm.dme.podfoundation.model.PodSelectionModel", {
        constructor: function() {
            BaseObject.apply(this, arguments);

            createAccessors(this);

            // set defaults
            this.podType = PodType.Operation;
            this.podSelectionType = "";
            this.inputType = InputType.Sfc;
            this.worklistType = InputType.Sfc;
            this.user = "";
            this.substepGroup = "";
            this.workCenter = "";
            this.orderId = "";
            this.endUnit = "";
            this.quantity = null;
            this.currentComponentIndex = -1;
            this.downtimeTypeToShow = "";
            this.selectedWorklistOperations = [];
            this.selectedWorkCenters = [];
            this.shopOrders = [];
            this.selectedPhaseWorkCenter = "";
            this.requiredValuesLoaded = false;
            this.selectedRoutingSteps = [];
        }
    });

    /**
     * Clears all context information in the model.
     *
     * @public
     * @function
     */
    PodSelectionModel.prototype.clear = function() {
        this.selections = [];
        this.operations = [];
        this.distinctSelections = [];
        this.resource = null;
        this.user = "";
        this.substepGroup = "";
        this.workCenter = "";
        this.endUnit = "";
        this.quantity = null;
        this.workInstruction = null;
        this.dataCollection = null;
        this.currentComponentIndex = -1;
        this.materialNo = "";
        this.materialVersion = "";
        this.orderId = "";
        this.fromDate = "";
        this.toDate = "";
        this.orderSelectionRange = "";
        this.timeZoneId = "";
        this.downtimeTypeToShow = "";
        this.orderContextFromSpeedLossRow = "";
        this.inspectionCharacteristic = {};
        this.selectedWorklistOperations = [];
        this.isInventoryManaged = {};
        this.selectedWorkCenters = [];
        this.selectedPhaseWorkCenter = "";
        this.requiredValuesLoaded = false;
        this.selectedRoutingSteps = [];
        this.shopOrders = [];
    };

    /**
     * Sets new value for components collection and resets current component index.
     *
     * @param {Array} aComponents Component data objects
     * @public
     */
    PodSelectionModel.prototype.setComponents = function(aComponents) {
        this.components = aComponents || [];
        this.currentComponentIndex = -1;
    };

    /**
     * Clears components collection and resets current component index.
     * @public
     */
    PodSelectionModel.prototype.clearComponents = function() {
        this.components = [];
        this.currentComponentIndex = -1;
    };

    /**
     * Helping getter for the component according to current value of the currentComponentIndex.
     * @returns {object} Object from components collection at given index.
     * @public
     */
    PodSelectionModel.prototype.getCurrentComponent = function() {
        return this.components[this.currentComponentIndex];
    };

    // The following javadoc is to support the generated functions

    /**
     * Gets the components collection.
     *
     * @returns {Array} Component data objects
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getComponents
     * @function
     */

    /**
     * Gets the current component index in the components collection.
     *
     * @returns {int} current index into components collection
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getCurrentComponentIndex
     * @function
     */

    /**
     * Sets the current component index in the components collection.
     *
     * @param {int} current index into components collection
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setCurrentComponentIndex
     * @function
     */

    /**
     * Gets the distinctSelections collection.
     *
     * @returns {Array} Operation data objects
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getDistinctSelections
     * @function
     */

    /**
     * Sets the distinctSelections collection.
     *
     * @param {Array} Operation data objects
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setDistinctSelections
     * @function
     */

    /**
     * Gets the operations collection.
     *
     * @returns {Array} Operation data objects
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getOperations
     * @function
     */

    /**
     * Sets the operations collection.
     *
     * @param {Array} Operation data objects
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setOperations
     * @function
     */

    /**
     * Gets the selections collection.
     *
     * @returns {sap.dm.dme.podfoundation.model.Selection[]} Selection objects
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getSelections
     * @function
     */

    /**
     * Sets the selections collection.
     *
     * @param {sap.dm.dme.podfoundation.model.Selection[]} Selection objects
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setSelections
     * @function
     */

    /**
     * Gets the POD Type
     *
     * @returns {sap.dm.dme.podfoundation.model.PodType} POD Type
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getPodType
     * @function
     */

    /**
     * Sets the POD Type
     *
     * @param {sap.dm.dme.podfoundation.model.PodType} sPodType POD Type
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setPodType
     * @function
     */

    /**
     * Gets the POD Selection Type
     *
     * @returns {sap.dm.dme.podfoundation.model.PodSelectionType} POD Selection Type
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getPodSelectionType
     * @function
     */

    /**
     * Sets the POD Selection Type
     *
     * @param {sap.dm.dme.podfoundation.model.PodSelectionType} sPodSelectionType POD Selection Type
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setPodSelectionType
     * @function
     */

    /**
     * Gets the Input Type
     *
     * @returns {sap.dm.dme.podfoundation.model.InputType} Input Type
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getInputType
     * @function
     */

    /**
     * Sets the Input Type
     *
     * @param {sap.dm.dme.podfoundation.model.InputType} sInputType Input Type
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setInputType
     * @function
     */
    /**
     * Gets the Input value
     *
     * @returns {string} Input value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getInputValue
     * @function
     */

    /**
     * Sets the Input value
     *
     * @param {string} sInputType Input value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setInputValue
     * @function
     */

    /**
     * Gets the Resource key data object
     *
     * @returns {sap.dm.dme.podfoundation.model.ResourceKeyData} Resource key data
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getResource
     * @function
     */

    /**
     * Sets the Resource key data object
     *
     * @param {sap.dm.dme.podfoundation.model.ResourceKeyData} sResource Resource key data
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setResource
     * @function
     */

    /**
     * Gets the User value
     *
     * @returns {string} User value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getUser
     * @function
     */

    /**
     * Sets the User value
     *
     * @param {string} sUser User value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setUser
     * @function
     */

    /**
     * Gets the Substep Group value
     *
     * @returns {string} Substep Group value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getSubstepGroup
     * @function
     */

    /**
     * Sets the Substep Group value
     *
     * @param {string} sSubstepGroup Substep Group value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setSubstepGroup
     * @function
     */

    /**
     * Gets the Work Center value
     *
     * @returns {string} Work Center value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getWorkCenter
     * @function
     */

    /**
     * Sets the Work Center value
     *
     * @param {string} sWorkCenter Work Center value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setWorkCenter
     * @function
     */

    /**
     * Gets the End Unit value
     *
     * @returns {string} End Unit value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getEndUnit
     * @function
     */

    /**
     * Sets the End Unit value
     *
     * @param {string} sEndUnit End Unit value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setEndUnit
     * @function
     */

    /**
     * Gets the Quantity value
     *
     * @returns {float} Quantity value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getQuantity
     * @function
     */

    /**
     * Sets the Quantity value
     *
     * @param {float} iQuantity Quantity value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setQuantity
     * @function
     */

    /**
     * Gets the Work Instruction value
     *
     * @returns {string} Work Instruction value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getWorkInstruction
     * @function
     */

    /**
     * Sets the Work Instruction value
     *
     * @param {string} sWorkInstruction Work Instruction value
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setWorkInstruction
     * @function
     */

    /**
     * Gets the selected Routing Steps collection.
     *
     * @returns {sap.dm.dme.podfoundation.model.RoutingStep[]} List of Routing Step objects
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#getSelectedRoutingSteps
     * @function
     */

    /**
     * Sets the selected Routing Steps collection.
     *
     * @param {sap.dm.dme.podfoundation.model.RoutingStep[]} List of Routing Step objects
     * @public
     * @name sap.dm.dme.podfoundation.model.PodSelectionModel#setSelectedRoutingSteps
     * @function
     */

    return PodSelectionModel;
});