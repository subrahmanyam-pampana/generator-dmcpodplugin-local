sap.ui.define([], function() {
    "use strict";
    /**
     * Enumeration defines the selection type of the POD
     * <pre>
     *    PodSelectionType.Sfc: Represents a W/C POD's SFC Selection Type
     *    PodSelectionType.WorkCenter: Represents a W/C POD's Work Center Selection Type
     * </pre>
     * <code>sap.dm.dme.podfoundation.model.PodSelectionType</code> describes the selection type of the W/C POD
     * @readonly
     * @enum {string}
     * @namespace sap.dm.dme.podfoundation.model.PodSelectionType
     */
    return {
        /** 
         * Type for an SFC Selection Type 
         * @memberOf sap.dm.dme.podfoundation.model.PodSelectionType
         */
        Sfc: "SFC",
        /** 
         * Type for a Work Center Selection Type
         * @memberOf sap.dm.dme.podfoundation.model.PodSelectionType
         */
        WorkCenter: "WORK_CENTER",
        /** 
         * Type for a Operation Selection Type
         * @memberOf sap.dm.dme.podfoundation.model.PodSelectionType
         */
        Operation: "OPERATION"
    };
});