sap.ui.define(
  ["sap/dm/dme/podfoundation/controller/PluginViewController",
  "<%= namespacePath %>/model/models",
  "<%= namespacePath %>/builder/localPodConfigs",
  "<%= namespacePath %>/controller/LocalPodSelectionModel"
],
   function (PluginViewController,models,localPodConfigs,LocalPodSelectionModel) {
    "use strict";
    let controller;

    return PluginViewController.extend(
      "<%= namespace %>.controller.BaseController",
      {
        onInit:function () {
          PluginViewController.prototype.onInit.apply(this, arguments);
          controller = this;
          this.ownerComponent = this._getPodController().getOwnerComponent();
          
          this.eventBus = this.ownerComponent.getEventBus();

          //create mdo model
          this.mdoModel  = models.createMdoModel(this.getApiUrl(''));
          this.getView().setModel(this.mdoModel,'mdo')
        
          if(!this.getPodController()){
              //when running in the local
              let podSelModel = new LocalPodSelectionModel(controller);
              this.ownerComponent.setModel(podSelModel, "podSelectionModel");
              this.podSelectionModel = podSelModel;     
          }else{
              this.podSelectionModel = this.ownerComponent.getModel("podSelectionModel");     
          }  
            
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
            return this.podSelectionModel._getPlant() 
          }
        },
        getUser:function(){
          if(this.getPodController()){
            return this.getPodController().getUserId();
          }else{
            return this.podSelectionModel._getUserId() 
          }       
        },
        /**
         * returns pod selection data. 
         * When running in local, it returns selection data maitained in localPodSelectionData file
         * @returns {PODSelectionData}
         */
        getPodSelectionData:function(){
          /**@type {PODSelectionData} */
          let podSelData = this.podSelectionModel.getSelection();
          return podSelData;
        },
        getWorkCenter:function(){
          return this.podSelectionModel.getWorkCenter()
        },
        getResource: function () {
          return this.podSelectionModel.getResource().resource;
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
            let paramsString = (Object.keys(params).length>0)?"?"+$.param(params):"";
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
                url: controller.getApiUrl(api)+paramsString,
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
            let paramsString = (Object.keys(params).length>0)?"?"+$.param(params):"";
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
            let paramsString = (Object.keys(params).length>0)?"?"+$.param(params):"";
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
            let paramsString = (Object.keys(params).length>0)?"?"+$.param(params):"";
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
        delete: function (api, data,headers={},params={}) {
          return new Promise((resolve, reject) => {
            let paramsString = (Object.keys(params).length>0)?"?"+$.param(params):"";
            if (this.getPodController()) {
              this.getPodController()._oPodController.ajaxDeleteRequest(
                controller.getApiUrl(api)+paramsString,
                
                function (oResponseData) {
                  resolve(oResponseData);
                },
                function (oError, sHttpErrorMessage) {
                  var err = oError || sHttpErrorMessage;
                  console.log(err);
                  reject(err);
                },
                data
              );
            } else {
              $.ajax({
                url: controller.getApiUrl(api)+paramsString,
                method: "DELETE",
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
        /**
         * call the production process
         * @param {string} key 
         * @param {object} payload 
         * @returns 
         */
        callpp:function(key,payload){
          return this.post("pe/api/v1/process/processDefinitions/start",payload,{},{key:key})
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
        },
        /**
         * return pod plugin base url
         * @returns {string} pod base url
         */
        getPluginBaseUri:function(){
          let manifest  = this.getOwnerComponent().getManifest();
          return jQuery.sap.getModulePath(manifest['sap.app'].id)+'/../';
        },
        getMdoUri:function(MDOName){
          return `${this.getApiUrl()}dmci/v4/extractor/${MDOName}`
        }
      }
    );
  }
);
