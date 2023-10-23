/**
 * Provides session storage for user preferences
 */
sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.model.UserPreferences", {

        /**
         * Constructor for User Preferences
         *
         * @param oPodController POD Controller
         * @param sPodName POD id
         */
        constructor: function(oPodController, sPodId) {
            BaseObject.call(this);
            this._oPodController = oPodController;
            this._sUserPreferencesKey = "USER_PREFERENCES_" + sPodId;
        },

        /**
         * Returns JSON data for all user preferences from local storage
         *
         * @return Array of user preference data
         */
        getPreferences: function() {
            return this.getGlobalProperty(this._sUserPreferencesKey);
        },

        /**
         * Sets User Preference JSON data for all user preferences inot local storage
         *
         * @param aUserPreferencesData Array of user preference data (i.e.; a[sPreferenceKey] = {})
         */
        setPreferences: function(aUserPreferencesData) {
            this.setGlobalProperty(this._sUserPreferencesKey, aUserPreferencesData);
            return true;
        },

        /**
         * Will get JSON data from local storage using input key.
         *
         * @param sPreferenceKey unique key used to store preference data
         */
        getPreference: function(sPreferenceKey) {
            var aUserPreferences = this.getPreferences();
            if (aUserPreferences && aUserPreferences[sPreferenceKey]) {
                return aUserPreferences[sPreferenceKey];
            }
            return undefined;
        },

        /**
         * Will store preference data into local storage using input key.
         *
         * @param sPreferenceKey unique key to use to store the preference data
         * @param oPreferenceData JSON formatted preference data to store
         */
        setPreference: function(sPreferenceKey, oPreferenceData) {
            var aUserPreferences = this.getPreferences();
            if (!aUserPreferences) {
                aUserPreferences = {};
            }
            aUserPreferences[sPreferenceKey] = oPreferenceData;
            this.setPreferences(aUserPreferences);
        },

        /**
         * Will remove a user preference from local storage using input key.
         *
         * @param sPreferenceKey unique key to use to remove preference data
         */
        removePreference: function(sPreferenceKey) {
            var aUserPreferences = this.getPreferences();
            if (!aUserPreferences) {
                return;
            }
            if (aUserPreferences[sPreferenceKey]) {
                delete aUserPreferences[sPreferenceKey];
            }
            this.setPreferences(aUserPreferences);
        },

        /**
         * Will remove all preferences from local storage.
         */
        clearPreferences: function() {
            this.removeGlobalProperty(this._sUserPreferencesKey);
        },

        /**
         * Store a value in a global model
         * @param sPropertyName property name for storing a value
         * @param oValue stored value
         */
        setGlobalProperty: function(sPropertyName, oValue) {
            return this._oPodController.getOwnerComponent().setGlobalProperty(sPropertyName, oValue);
        },

        /**
         * Retrieve a value from a global model
         * @param sPropertyName property name for retrieving a value
         */
        getGlobalProperty: function(sPropertyName) {
            return this._oPodController.getOwnerComponent().getGlobalProperty(sPropertyName);
        },

        /**
         * Retrieve and remove a value from a global model
         * @param sPropertyName property name for retrieving a value
         */
        removeGlobalProperty: function(sPropertyName) {
            return this._oPodController.getOwnerComponent().removeGlobalProperty(sPropertyName);
        }
    });
}, true);