sap.ui.define([], function() {
    "use strict";
    /**
     * Enumeration defines the type of POD
     * <pre>
     *    PodType.Operation: Represents a Operation POD
     *    PodType.WorkCenter: Represents a Operation POD
     *    PodType.Order: Represents a Operation POD
     *    PodType.NC: Represents a Standalone Non Conformance POD
     *    PodType.Monitor: Represents a Monitor POD
     *    PodType.Custom: Represents a Custom POD
     * </pre>
     * <code>sap.dm.dme.podfoundation.model.PodType</code> describes type of POD
     * @readonly
     * @enum {string}
     * @namespace sap.dm.dme.podfoundation.model.PodType
     */
    return {
        /** 
         * Type for an Operation POD 
         * @memberOf sap.dm.dme.podfoundation.model.PodType
         */
        Operation: "OPERATION",
        /** 
         * Type for a Work Center POD 
         * @memberOf sap.dm.dme.podfoundation.model.PodType
         */
        WorkCenter: "WORK_CENTER",
        /** 
         * Type for a Order POD 
         * @memberOf sap.dm.dme.podfoundation.model.PodType
         */
        Order: "ORDER",
        /** 
         * Type for a NC POD
         * @memberOf sap.dm.dme.podfoundation.model.PodType
         */
        NC: "NC",
        /** 
         * Type for a Custom POD 
         * @memberOf sap.dm.dme.podfoundation.model.PodType
         */
        Custom: "OTHER",
        /** 
         * Type for a Monitor POD 
         * @memberOf sap.dm.dme.podfoundation.model.PodType
         */
        Monitor: "MONITOR",
        /** 
         * Type for a OEE POD 
         * @memberOf sap.dm.dme.podfoundation.model.PodType
         */
        OEE: "OEE"
    };
});