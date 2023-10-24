sap.ui.define([
	"sap/dm/dme/podfoundation/component/production/ProductionUIComponent",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel"
], function (ProductionUIComponent, Device,JSONModel) {
	"use strict";

	return ProductionUIComponent.extend("<%= namespace %>.<%= name %>.<%= name %>.Component", {
		metadata: {
			manifest: "json"
		},
		init:function(){
			ProductionUIComponent.prototype.init.apply(this, arguments)
	
			var oDeviceModel = new JSONModel(Device);
			oDeviceModel.setDefaultBindingMode("OneWay");
			this.setModel(oDeviceModel, "device");

			this.getRouter().initialize();

		}
	});
});