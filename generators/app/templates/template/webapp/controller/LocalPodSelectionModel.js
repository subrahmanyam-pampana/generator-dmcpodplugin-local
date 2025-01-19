sap.ui.define(
  [
    "<%= namespacePath %>/controller/localPodSelectionData",
    "sap/dm/dme/podfoundation/model/PodSelectionModel"
  ],
  function (localPodSelectionData, PodSelectionModel) {
    "use strict";

    let LocalPodSelectionModel = PodSelectionModel.extend(
      "<%= namespace %>.controller.localPodSelectionModel",
      {
        constructor: function (_controller) {
          PodSelectionModel.apply(this, arguments);
          this.controller = _controller;
          this.podType = localPodSelectionData.podType;
          this.podSelectionType = localPodSelectionData.podSelectionType;
          this.inputType = localPodSelectionData.inputType || InputType.Sfc;
          this.worklistType = localPodSelectionData.worklistType || InputType.Sfc;
          this.user = localPodSelectionData.user || "";
          this.substepGroup = localPodSelectionData.substepGroup || "";
          this.workCenter = localPodSelectionData.workCenter || "";
          this.orderId = localPodSelectionData.orderId || "";
          this.endUnit = localPodSelectionData.endUnit || "";
          this.quantity = localPodSelectionData.quantity || null;
          this.currentComponentIndex = localPodSelectionData.currentComponentIndex || -1;
          this.downtimeTypeToShow = localPodSelectionData.downtimeTypeToShow || "";
          this.selectedWorklistOperations =
            localPodSelectionData.selectedWorklistOperations || [];
          this.selectedWorkCenters = localPodSelectionData.selectedWorkCenters || [];
          this.shopOrders = localPodSelectionData.shopOrders || [];
          this.selectedPhaseWorkCenter = localPodSelectionData.selectedPhaseWorkCenter || "";
          this.requiredValuesLoaded = localPodSelectionData.requiredValuesLoaded || false;
          this.selectedRoutingSteps = localPodSelectionData.selectedRoutingSteps || [];
        }
      });
      LocalPodSelectionModel.prototype._getPlant = function(){
        return localPodSelectionData.loginData.plant;
      }
      LocalPodSelectionModel.prototype._getUserId = function(){
        return localPodSelectionData.loginData.userId;
      }
    return LocalPodSelectionModel;
  }
);
