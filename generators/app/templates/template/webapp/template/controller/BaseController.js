sap.ui.define(
  ["sap/dm/dme/podfoundation/controller/PluginViewController",'sap/ui/model/json/JSONModel'],
   function (PluginViewController,JSONModel) {
    "use strict";
    let controller;
    let localPodConfigs = {}

    return PluginViewController.extend(
      "<%= namespace %>.<%= name %>.<%= name %>.controller.BaseController",
      {
        onInit:function () {
          PluginViewController.prototype.onInit.apply(this, arguments);
          controller = this;
          this.ownerComponent = this._getPodController().getOwnerComponent();
          
          this.eventBus = this.ownerComponent.getEventBus();
          console.log(localPodConfigs)

          this.getJsonFile(sap.ui.require.toUrl("<%= namespacePath %>/<%= name %>/<%= name %>/builder/localPodConfigs.json"))
          .then(configs=>{
            localPodConfigs = configs;
            this.onAfterPodConfigsLoad(this._getConfiguration())
          })
          
          //only for local development
          if(!this.getPodController()){
            let localPodSelDataUrl = sap.ui.require.toUrl('<%= namespacePath %>/<%= name %>/<%= name %>/data/localPodSelectionModelData.json')
            this.getJsonFile(localPodSelDataUrl)
            .then(data=>{
              this.ownerComponent.setModel(new JSONModel(data), "zPodSelectionModel");
            })
          }

          this.zPodSelectionModel = this.ownerComponent.getModel("zPodSelectionModel");
         
        },
        //called once pod configurations loaded
        onAfterPodConfigsLoad:function(configs){

        },
        setCSSFile: function (filePath) {
          $('head').append(`<link rel="stylesheet" href=${filePath}>`)
        },
        getJsonFile:function(filePath){
          return new Promise((resolve)=>{
            $.get(filePath, resolve)
          })
        },
        _getConfiguration:function(){
            if(this.getPodController()){
              return this.getConfiguration()
            }else{
              return localPodConfigs;
            }
        },
        _getPodController: function () {
          if (this.getPodController()) {
            return this.getPodController();
          }
          return this;
        },
        getPlant: function () {
          if(this.getPodController()){
            return this.getPodController().getUserPlant();
          }else{
            return this.zPodSelectionModel.getProperty("/loginData/plant");
          }
        },
        getUser:function(){
          if(this.getPodController()){
            return this.getUserId();
          }else{
            return this.zPodSelectionModel.getProperty('/loginData/userId')
          }          
        },
        getWorkCenter:function(){
          return this.zPodSelectionModel.getProperty('/loginData/workcenter')
        },
        
        getResource: function () {
          return this.zPodSelectionModel.getProperty("/loginData/resource");
        },
        
        get: function (api, params) {
          return new Promise((resolve, reject) => {
            if (this.getPodController()) {
              this.getPodController()._oPodController.ajaxGetRequest(
                controller.getApiUrl(api),
                params,
                function (oResponseData) {
                  resolve(oResponseData);
                },
                function (oError, sHttpErrorMessage) {
                  var err = oError || sHttpErrorMessage;
                  console.log(err);
                  reject(err);
                }
              );
            }else{
              $.ajax({
                url: controller.getApiUrl(api),
                method: "GET",
                headers: {
                  "X-Dme-Plant": controller.getPlant(),
                },
                data: params,
                success: resolve,
                error: reject,
              });
            }
          
          });
        },
        getoData: function (api, params) {
          return new Promise((resolve, reject) => {
            if (this.getPodController()) {
              this.getPodController()._oPodController.ajaxGetRequest(
                controller.getoDataUrl(api),
                params,
                resolve,
                reject
              );
            }else{
              $.ajax({
                url: controller.getoDataUrl(api),
                method: "GET",
                headers: {
                  "X-Dme-Plant": controller.getPlant(),
                },
                data: params,
                success: resolve,
                error: reject,
              });
            }
           
           
          });
        },
      /**
       * Make an AJAX POST request with the given parameters and return a Promise.
       * @param {string} api - API endpoint, e.g., 'sfc/v1/startSfc'.
       * @param {object} data - Body of the AJAX request, pass it as an object.
       * @param {object} [headers={}] - (Optional) Additional headers as an object.
       * @param {object} [params={}] - (Optional) Additional query parameters as an object.
       * @returns {Promise<object>} A Promise containing the response object.
       * @example
       * // Example usage:
       * this.post('sfc/v1/startSfc', 
       *    { sfc: '100212', plant: 'AAAFTS' },
       *    { 'Accept': '/' },
       *    { queryParam1: 'some query param' }
       *  ).then(response => {
       *   // Handle the response here
       *  }).catch(error => {
       *   // Handle any errors here
       * });
       */
        post: function (api, data,headers={},params={}) {
          return new Promise((resolve, reject) => {
            let paramsString = (Object.keys(params).length>0)?"?"+$.param(params):"";
            if (this.getPodController()) {
              this.getPodController()._oPodController.ajaxPostRequest(
                controller.getApiUrl(api)+paramsString,
                data,
                function (oResponseData) {
                  resolve(oResponseData);
                },
                function (oError, sHttpErrorMessage) {
                  var err = oError || sHttpErrorMessage;
                  console.log(err);
                  reject(err);
                }
              );
            } else {
              $.ajax({
                url: controller.getApiUrl(api)+paramsString,
                method: "POST",
                dataType: "json", 
                contentType: "application/json",
                data: JSON.stringify(data),
                headers:{
                  "X-Dme-Plant": controller.getPlant(),
                  ...headers
                },
                success: resolve,
                error: (oError)=>{
                  reject((oError && oError.responseJSON)||oError)
                },
              });
            }
          });
        },
        patch: function (api, data,headers={},params={}) {
          return new Promise((resolve, reject) => {
            let paramsString = "?"+$.param(params)
            if (this.getPodController()) {
              this.getPodController()._oPodController.ajaxPatchRequest(
                controller.getApiUrl(api)+paramsString,
                data,
                function (oResponseData) {
                  resolve(oResponseData);
                },
                function (oError, sHttpErrorMessage) {
                  var err = oError || sHttpErrorMessage;
                  console.log(err);
                  reject(err);
                }
              );
            } else {
              $.ajax({
                url: controller.getApiUrl(api),
                method: "PATCH",
                contentType: "application/json",
                data: JSON.stringify(data),
                headers:{
                  "X-Dme-Plant": controller.getPlant(),
                  ...headers
                },
                success: resolve,
                error: (oError)=>{
                  reject((oError && oError.responseJSON)||oError)
                },
              });
            }
          });
        },
        postoData: function (api, data,headers={},params={}) {
          return new Promise((resolve, reject) => {
            let paramsString = "?"+$.param(params)
            if (this.getPodController()) {
              this.getPodController()._oPodController.ajaxPostRequest(
                api+paramsString,
                data,
                function (oResponseData) {
                  resolve(oResponseData);
                },
                function (oError, sHttpErrorMessage) {
                  var err = oError || sHttpErrorMessage;
                  console.log(err);
                  reject(err);
                }
              );
            } else {
              $.ajax({
                url: controller.getoDataUrl(api)+paramsString,
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(data),
                headers:{
                  "X-Dme-Plant": controller.getPlant(),
                  ...headers
                },
                success: resolve,
                error: reject,
              });
            }
          });
        },
        put: function (api, data,headers={},params={}) {
          return new Promise((resolve, reject) => {
            let paramsString = "?"+$.param(params)
            if (this.getPodController()) {
              this.getPodController()._oPodController.ajaxPutRequest(
                controller.getApiUrl(api)+paramsString,
                data,
                function (oResponseData) {
                  resolve(oResponseData);
                },
                function (oError, sHttpErrorMessage) {
                  var err = oError || sHttpErrorMessage;
                  console.log(err);
                  reject(err);
                }
              );
            } else {
              $.ajax({
                url: controller.getApiUrl(api)+paramsString,
                method: "PUT",
                contentType: "application/json",
                headers:{
                  "X-Dme-Plant": controller.getPlant(),
                  ...headers
                },
                data: JSON.stringify(data),
                success: resolve,
                error: (oError)=>{
                  reject((oError && oError.responseJSON)||oError)
                },
              });
            }
          });
        },
        putoData: function (api, data,headers={}, params={}) {
          return new Promise((resolve, reject) => {
            let paramsString = "?"+$.param(params)
            if (this.getPodController()) {
              this.getPodController()._oPodController.ajaxPutRequest(
                api+paramsString,
                data,
                function (oResponseData) {
                  resolve(oResponseData);
                },
                function (oError, sHttpErrorMessage) {
                  var err = oError || sHttpErrorMessage;
                  console.log(err);
                  reject(err);
                }
              );
            } else {
              $.ajax({
                url: controller.getoDataUrl(api)+paramsString,
                method: "PUT",
                contentType: "application/json",
                headers:{
                  "X-Dme-Plant": controller.getPlant(),
                  ...headers
                },
                data: JSON.stringify(data),
                success: resolve,
                error: reject,
              });
            }
          });
        },
        getApiUrl: function (endPoint) {
          if (!this.getPublicApiRestDataSourceUri()) {
            return "/api/" + endPoint;
          }
          return this.getPublicApiRestDataSourceUri() + endPoint;
        },
        getoDataUrl: function (endPoint) {
          if (!this.getPodController()) {
            return "/oData" + endPoint;
          }
          return endPoint;
        },
        getCurrentTime:function(){
          return moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ')
        },
        /**
         * returns the i18n translated text
         * @param {string} sText 
         * @param {object} [aParams=[]] 
         * @returns 
         */
        getTranslatedText:function(sText,aParams=[]){
          return this.getView().getModel('i18n').getResourceBundle().getText(sText,aParams)
        }
      }
    );
  }
);
