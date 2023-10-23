/**
 *  This class defines a notification configuration. It contains properties indicating
 *  which topics and POD selection properties should be included when creating subscriptions.
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/serverevent/Topic"
], function(BaseObject, Topic) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.serverevent.NotificationConfig", {

        constructor: function(mSettings) {
            BaseObject.call(this);
            let oSettings = mSettings ? mSettings : {};

            this._subscribeWorkCenter = !!oSettings.subscribeWorkCenter;
            this._subscribeOperation = !!oSettings.subscribeOperation;
            this._subscribeResource = !!oSettings.subscribeResource;
            this._subscribeMaterial = !!oSettings.subscribeMaterial;
            this._subscribeOrder = !!oSettings.subscribeOrder;
            this._sfcStartNotification = !!oSettings.sfcStartNotification;
            this._sfcCompleteNotification = !!oSettings.sfcCompleteNotification;
            this._sfcSelectNotification = !!oSettings.sfcSelectNotification;
            this._dataCollectionNotification = !!oSettings.dataCollectionNotification;
            this._productionProcessNotification = !!oSettings.productionProcessNotification;
            this._weighDispenseScaleNotification = !!oSettings.weighDispenseScaleNotification;
            this._ncLogNotification = !!oSettings.ncLogNotification;
            this._resourceStatusChangeNotification = !!oSettings.resourceStatusChangeNotification;
            this._uiLoggingNotification = !!oSettings.uiLoggingNotification;
            this._customNotification = false;

            this._topics = this._addTopics(oSettings);
        },

        //&* Consider changing the design to have the caller specify the topics they're interested in
        _addTopics: function(oSettings) {
            let aTopics = [];
            !!oSettings.sfcStartNotification && aTopics.push(Topic.SFC_START);
            !!oSettings.sfcCompleteNotification && aTopics.push(Topic.SFC_COMPLETE);
            !!oSettings.sfcSelectNotification && aTopics.push(Topic.SFC_SELECT);
            !!oSettings.dataCollectionNotification && aTopics.push(Topic.DATA_COLLECTION);
            !!oSettings.productionProcessNotification &&
                aTopics.push(Topic.PP_START) &&
                aTopics.push(Topic.PP_END) &&
                aTopics.push(Topic.PP_ACTION);
            aTopics.push(Topic.BACKFLUSH_FAILURE_MSG);
            !!oSettings.weighDispenseScaleNotification && aTopics.push(Topic.WD_SCALE);
            !!oSettings.ncLogNotification && aTopics.push(Topic.NC_LOG);
            !!oSettings.resourceStatusChangeNotification && aTopics.push(Topic.RESOURCE_STATUS_CHANGE);
            !!oSettings.uiLoggingNotification && aTopics.push(Topic.UI_LOG);
            return aTopics;
        },

        addCustomTopics: function(aCustomTopics) {
            if (this._topics && aCustomTopics.length > 0) {
                this._customNotification = true;
                let sTopic;
                for (let i = 0; i < aCustomTopics.length; i++) {
                    if (aCustomTopics[i].toUpperCase().indexOf(Topic.CUSTOM + ".") === 0) {
                        // make sure custom topic is upper case "CUSTOM."
                        sTopic = Topic.CUSTOM + "." + aCustomTopics[i].substring(7);
                    } else {
                        sTopic = Topic.CUSTOM + "." + aCustomTopics[i];
                    }
                    this._topics.push(sTopic);
                }
            }
        },

        workCenterEnabled: function() {
            return this._subscribeWorkCenter;
        },

        operationEnabled: function() {
            return this._subscribeOperation;
        },

        resourceEnabled: function() {
            return this._subscribeResource;
        },

        materialEnabled: function() {
            return this._subscribeMaterial;
        },

        orderEnabled: function() {
            return this._subscribeOrder;
        },

        uiLoggingEnabled: function() {
            return this._uiLoggingNotification;
        },

        sfcStartNotificationEnabled: function() {
            return this._sfcStartNotification;
        },

        sfcCompleteNotificationEnabled: function() {
            return this._sfcCompleteNotification;
        },

        sfcSelectNotificationEnabled: function() {
            return this._sfcSelectNotification;
        },

        dataCollectionNotificationEnabled: function() {
            return this._dataCollectionNotification;
        },

        productionProcessNotificationEnabled: function() {
            return this._productionProcessNotification;
        },

        weighDispenseScaleNotificationEnabled: function() {
            return this._weighDispenseScaleNotification;
        },

        ncLogNotificationEnabled: function() {
            return this._ncLogNotification;
        },

        resourceStatusChangeNotificationEnabled: function() {
            return this._resourceStatusChangeNotification;
        },

        customNotificationEnabled: function() {
            return this._customNotification;
        },

        /**
         * @returns  A clone of the topics array
         */
        getTopics: function() {
            return this._topics.slice(0, this._topics.length + 1);
        },

        /**
         *
         * @returns {boolean} true if at least one notification context type is enabled and
         * there is at least on topic in this configuration
         */
        isNotificationsEnabled: function() {

            // If nothing is enabled then no subscriptions should be created
            if (!(this.workCenterEnabled() ||
                    this.operationEnabled() ||
                    this.resourceEnabled() ||
                    this.materialEnabled() ||
                    this.orderEnabled() ||
                    this.customNotificationEnabled())) {
                return false;
            }

            // No subscriptions if no topics
            return this.getTopics().length > 0;
        },

        /**
         *
         * @param oNotificationContext
         * @returns {boolean} true if at least one notification context type is enabled and
         * any enabled context has a corresponding value in the given NotificationContext
         */
        hasValuesForSubscription: function(oNotificationContext) {
            // If any context is enabled but there's no context value then no subscriptions should
            // be created
            if (this.workCenterEnabled() && !oNotificationContext.getWorkCenter()) {
                return false;
            }
            if (this.operationEnabled() && !oNotificationContext.getOperation()) {
                return false;
            }
            if (this.resourceEnabled() && !oNotificationContext.getResource()) {
                return false;
            }
            if (this.materialEnabled() && !oNotificationContext.getMaterial()) {
                return false;
            }
            if (this.orderEnabled() && !oNotificationContext.getOrder()) {
                return false;
            }
            return true;
        },

        /**
         * Remove context values for which there is no enabled subscription setting.
         * @param oNotificationContext
         */
        clearContextValuesWithNoSubscription: function(oNotificationContext) {
            if (!this.workCenterEnabled() && oNotificationContext.getWorkCenter()) {
                oNotificationContext.setWorkCenter();
            }
            if (!this.operationEnabled() && oNotificationContext.getOperation()) {
                oNotificationContext.setOperation();
            }
            if (!this.resourceEnabled() && oNotificationContext.getResource()) {
                oNotificationContext.setResource();
            }
            if (!this.materialEnabled() && oNotificationContext.getMaterial()) {
                oNotificationContext.setMaterial();
            }
            if (!this.orderEnabled() && oNotificationContext.getOrder()) {
                oNotificationContext.setOrder();
            }
        },

        getConfigData: function() {
            return {
                subscribeWorkCenter: this._subscribeWorkCenter,
                subscribeOperation: this._subscribeOperation,
                subscribeResource: this._subscribeResource,
                subscribeMaterial: this._subscribeMaterial,
                subscribeOrder: this._subscribeOrder,
                sfcStartNotification: this._sfcStartNotification,
                sfcCompleteNotification: this._sfcCompleteNotification,
                sfcSelectNotification: this._sfcSelectNotification,
                dataCollectionNotification: this._dataCollectionNotification,
                productionProcessNotification: this._productionProcessNotification,
                weighDispenseScaleNotification: this._weighDispenseScaleNotification,
                ncLogNotification: this._ncLogNotification,
                resourceStatusChangeNotification: this._resourceStatusChangeNotification,
                customNotification: this._customNotification
            };
        }

    });
}, true);