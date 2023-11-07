sap.ui.define([
    "<%= namespacePath %>/<%= name %>/<%= name %>/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (BaseController,
    JSONModel,
    MessageToast) {
    "use strict";
    let podConfigs = {};
    let apis = {
        get_sfcDetails: "sfc/v1/sfcdetail"
    }
    return BaseController.extend("<%= namespace %>.<%= name %>.<%= name %>.controller.MainView", {
        onInit: function () {
            BaseController.prototype.onInit.apply(this, arguments);
            podConfigs = this._getConfiguration()
            this.getView().byId("idBackButton").setVisible(podConfigs.backButtonVisible);
            this.getView().byId("closeButton").setVisible(podConfigs.closeButtonVisible);
            this.getView().byId("headerTitle").setText(podConfigs.title);

            //Example of calling public API
            /*
            this.get(apis.get_sfcDetails,{
               plant: this.getPlant(),
               sfc:"enter sfc here"
           }).then(res=>{
               console.log(res)
           })
           */
        },
        onBeforeRenderingPlugin: function () {

        },
        onAfterRendering: function () {

        },
        onAfterPodConfigsLoad: function (configs) {
            
        },

        isSubscribingToNotifications: function () {
            var bNotificationsEnabled = false;
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
        onBackButtonPress: function (oEvent) {
            MessageToast.show('Back Button Pressed!')
        },

        onExit: function () {
            BaseController.prototype.onExit.apply(this, arguments);

        }
    });
});