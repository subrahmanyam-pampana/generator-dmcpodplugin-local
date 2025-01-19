sap.ui.define([
	"sap/ui/base/Object"
], function(
	BaseObject
) {
	"use strict";
    let controller;

	return BaseObject.extend("<%= namespace %>.utils.AjaxUtil", {
        constructor:function(_controller){
            controller = _controller;
        },
        get: function (url, params) {
            return new Promise((resolve, reject) => {
              if (controller.getPodController()) {
                controller.getPodController().ajaxGetRequest(
                  url,
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
                  url: url,
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
        post: function (url, data,headers={},params={}) {
            return new Promise((resolve, reject) => {
              let paramsString = (Object.keys(params).length>0)?"?"+$.param(params):"";
              if (controller.getPodController()) {
                controller.getPodController().ajaxPostRequest(
                  url+paramsString,
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
                  url: url+paramsString,
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
        patch: function (url, data,headers={},params={}) {
            return new Promise((resolve, reject) => {
              let paramsString = (Object.keys(params).length>0)?"?"+$.param(params):""; 
              if (controller.getPodController()) {
                  controller.getPodController().ajaxPatchRequest(
                  url+paramsString,
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
                  url: url,
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
        put: function (url, data,headers={},params={}) {
            return new Promise((resolve, reject) => {
              let paramsString = (Object.keys(params).length>0)?"?"+$.param(params):""; 
              if (controller.getPodController()) {
                controller.getPodController().ajaxPutRequest(
                  url+paramsString,
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
                  url: url+paramsString,
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
        delete: function (api, data,headers={},params={}) {
          return new Promise((resolve, reject) => {
            let paramsString = (Object.keys(params).length>0)?"?"+$.param(params):"";
            if (this.getPodController()) {
              this.getPodController()._oPodController.ajaxDeleteRequest(
                url+paramsString,
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
                url: url+paramsString,
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
        }
	});
});