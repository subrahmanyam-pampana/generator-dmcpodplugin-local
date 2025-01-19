sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	'sap/ui/model/odata/v2/ODataModel'
], function (JSONModel, Device,ODataModel) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
		createMdoModel:function(publicApiURL){
			if(!this.mdoModel){
				this.mdoModel = new ODataModel(publicApiURL+'dmci/v2/extractor/',{
					"useBatch": false,
					"defaultBindingMode": "OneWay",
					"operationMode": "Server",
					"autoExpandSelect": true,
					"earlyRequests": true
				  })
			}
			
			return this.mdoModel;
			
		}

	};
});