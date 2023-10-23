sap.ui.define([
    'jquery.sap.global',
    "<%= namespace %>/<%= name %>/<%= name %>/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (jQuery, BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("<%= namespace %>.<%= name %>.<%= name %>.controller.MainView", {
        onInit: function () {
            BaseController.prototype.onInit.apply(this, arguments);
        },

        onAfterRendering: function () {
            this.getView().byId("backButton").setVisible(this.getConfiguration().backButtonVisible);
            this.getView().byId("closeButton").setVisible(this.getConfiguration().closeButtonVisible);

            this.getView().byId("headerTitle").setText(this.getConfiguration().title);
            this.getView().byId("textPlugin").setText(this.getConfiguration().text);

        },

        onBeforeRenderingPlugin: function () {

        },
        isSubscribingToNotifications: function () {
            var bNotificationsEnabled = true;

            return bNotificationsEnabled;
        },


        getCustomNotificationEvents: function (sTopic) {
            //return ["template"];
        },


        getNotificationMessageHandler: function (sTopic) {

            //if (sTopic === "template") {
            //    return this._handleNotificationMessage;
            //}
            return null;
        },

        _handleNotificationMessage: function (oMsg) {

            var sMessage = "Message not found in payload 'message' property";
            if (oMsg && oMsg.parameters && oMsg.parameters.length > 0) {
                for (var i = 0; i < oMsg.parameters.length; i++) {

                    switch (oMsg.parameters[i].name) {
                        case "template":

                            break;
                        case "template2":


                    }
                }
            }

        },

        onExit: function () {
            BaseController.prototype.onExit.apply(this, arguments);

        }
    });
});