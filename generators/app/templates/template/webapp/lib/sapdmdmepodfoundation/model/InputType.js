sap.ui.define([], function() {
    "use strict";

    /**
     * Enumeration defines the type of object that the POD Selection Input field represents
     * <pre>
     *    InputType.Sfc: Input field value represents a SFC
     *    InputType.ShopOrder: Input field value represents a Shop Order
     *    InputType.ProcessLot: Input field value represents a Process Lot
     *    InputType.Item: Input field value represents a Item
     *    InputType.ItemVersion: Input field value represents a Item/Version
     * </pre>
     * <code>sap.dm.dme.podfoundation.model.InputType</code> contains valid Input Type's.
     * @readonly
     * @enum {string}
     * @namespace sap.dm.dme.podfoundation.model.InputType
     */
    return {
        /** 
         * POD Selection Input field contains a SFC 
         * @memberOf sap.dm.dme.podfoundation.model.InputType
         */
        Sfc: "SFC",
        /** 
         * POD Selection Input field contains a Shop Order 
         * @memberOf sap.dm.dme.podfoundation.model.InputType
         */
        ShopOrder: "SHOP_ORDER",
        /** 
         * POD Selection Input field contains a Process Lot 
         * @memberOf sap.dm.dme.podfoundation.model.InputType
         */
        ProcessLot: "PROCESS_LOT",
        /** 
         * POD Selection Input field contains a Item (Material) 
         * @memberOf sap.dm.dme.podfoundation.model.InputType
         */
        Item: "ITEM",
        /** 
         * POD Selection Input field contains a Item/Version (Material/Version) 
         * @memberOf sap.dm.dme.podfoundation.model.InputType
         */
        ItemVersion: "ITEM_VERSION"
    };
});