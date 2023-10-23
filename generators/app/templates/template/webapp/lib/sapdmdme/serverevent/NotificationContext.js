/**
 *  This class defines a context used to route notifications according to context values.
 *  The context includes the subscription topic and production values such as work center and resource.
 *  
 *  For CUSTOM topic, the custom event name must be added to the header
 *
 *  For example, if a notification subscription is created for topic 'SFC_SELECT', then
 *  if the context contains work center 'WC1' and resource 'RS1', notifications will only be received for that
 *  work center and resource.
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/serverevent/Topic"
], function(BaseObject, Topic) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.serverevent.NotificationContext", {

        /**
         *
         * @param sTopic The name of the message topic
         */
        constructor: function(sTopic) {
            BaseObject.call(this);
            this.setTopic(sTopic);
        },

        setTopic: function(sTopic) {
            if (sTopic) {
                this._topic = "/" + sTopic + "/";
            }
            return this;
        },

        getTopic: function() {
            return this._topic;
        },

        setPlant: function(sPlant) {
            this._plant = sPlant;
            return this;
        },

        getPlant: function() {
            return this._getHeaderValue(this._plant);
        },

        setWorkCenter: function(sWorkCenter) {
            this._workCenter = sWorkCenter;
            return this;
        },

        getWorkCenter: function() {
            return this._getHeaderValue(this._workCenter);
        },

        setResource: function(sResource) {
            this._resource = sResource;
            return this;
        },

        getResource: function() {
            return this._getHeaderValue(this._resource);
        },

        setOperation: function(sOperation) {
            this._operation = sOperation;
            return this;
        },

        getOperation: function() {
            return this._getHeaderValue(this._operation);
        },

        setMaterial: function(sMaterial) {
            this._material = sMaterial;
            return this;
        },

        getMaterial: function() {
            return this._getHeaderValue(this._material);
        },

        setOrder: function(sOrder) {
            this._order = sOrder;
            return this;
        },

        getOrder: function() {
            return this._getHeaderValue(this._order);
        },

        setPodId: function(sPodId) {
            this._podId = sPodId;
        },

        getPodId: function() {
            return this._getHeaderValue(this._podId);
        },

        setPodType: function(sPodType) {
            this._podType = sPodType;
        },

        getPodType: function() {
            return this._getHeaderValue(this._podType);
        },

        setBackendLoggingConfigurationId: function(sConfigId) {
            this._backendLoggingId = sConfigId;
        },

        getBackendLoggingConfigurationId: function() {
            return this._getHeaderValue(this._backendLoggingId);
        },

        setCustomEventName: function(sCustomEventName) {
            this._customEventName = sCustomEventName;
            return this;
        },

        getCustomEventName: function() {
            return this._getHeaderValue(this._customEventName);
        },

        getMessageHeaders: function() {
            let oHeaders = {
                "ack": "client-individual",
                "Plant": this.getPlant(),
                "WorkCenter": this.getWorkCenter(),
                "Resource": this.getResource(),
                "Operation": this.getOperation(),
                "Material": this.getMaterial(),
                "Order": this.getOrder(),
                "PodId": this.getPodId(),
                "LoggingConfigurationId": this.getBackendLoggingConfigurationId(),
                "PodType": this.getPodType()
            };
            if (this.getTopic() === "/" + Topic.CUSTOM + "/") {
                oHeaders.CustomEvent = this.getCustomEventName();
            }
            let bValid = false;
            for (let sHeader in oHeaders) {
                if (oHeaders[sHeader] && sHeader !== "PodId" && sHeader !== "ack") {
                    bValid = true;
                    break;
                }
            }
            if (bValid) {
                return oHeaders;
            }
        },

        isEqualTo: function(oOther) {

            let bTopicMatch = this.getTopic() === oOther.getTopic();
            return bTopicMatch &&
                this.getPlant() === oOther.getPlant() &&
                this.getWorkCenter() === oOther.getWorkCenter() &&
                this.getResource() === oOther.getResource() &&
                this.getOperation() === oOther.getOperation() &&
                this.getMaterial() === oOther.getMaterial() &&
                this.getOrder() === oOther.getOrder() &&
                this.getCustomEventName() === oOther.getCustomEventName();
        },

        isEqualToTopicOnly: function(oOther) {

            let bTopicMatch;
            if (this.getCustomEventName()) {
                bTopicMatch = this.getCustomEventName() === oOther.getCustomEventName();
            } else {
                bTopicMatch = this.getTopic() === oOther.getTopic();
            }

            const bProdContextMatch = this.getPlant() === oOther.getPlant() &&
                this.getWorkCenter() === oOther.getWorkCenter() &&
                this.getResource() === oOther.getResource() &&
                this.getOperation() === oOther.getOperation() &&
                this.getMaterial() === oOther.getMaterial() &&
                this.getOrder() === oOther.getOrder();
            return bTopicMatch && !bProdContextMatch;
        },

        _getHeaderValue: function(sInValue) {
            return sInValue ? sInValue : "";
        }

    });
}, true);