jQuery.sap.declare("sap.dm.dme.util.PlantSettings");

sap.dm.dme.util.PlantSettings = (function() {

    let currentPlant;
    let timeZone;
    let industryType;
    let fsmScenarioZero;
    let plantChanged = false;

    let PlantSettings = function() {
        sap.ui.getCore().getEventBus().subscribe("dmc", "plant-changed", function(sChannelId, sEventId, oEvent) {
            console.log(sChannelId, sEventId, oEvent.plant);
            currentPlant = oEvent.plant;
            plantChanged = true;
        });
    };

    PlantSettings.prototype.getCurrentPlant = function() {
        console.log("Getting plant '" + currentPlant + "'");
        return currentPlant;
    }

    PlantSettings.prototype.setCurrentPlant = function(sPlant) {
        currentPlant = sPlant;
        console.log("Set plant '" + currentPlant + "'");
    }

    PlantSettings.prototype.getTimeZone = function() {
        return timeZone;
    }

    PlantSettings.prototype.setTimeZone = function(sTimeZone) {
        timeZone = sTimeZone;
    }

    PlantSettings.prototype.getIndustryType = function() {
        return industryType;
    }

    PlantSettings.prototype.setIndustryType = function(sIndustryType) {
        industryType = sIndustryType;
    }

    PlantSettings.prototype.getPlantChanged = function() {
        return plantChanged;
    }

    PlantSettings.prototype.setPlantChanged = function(bPlantChanged) {
        plantChanged = bPlantChanged;
    }

    PlantSettings.prototype.getFsmScenarioZero = function() {
        return fsmScenarioZero;
    }

    PlantSettings.prototype.setFsmScenarioZero = function(sFsmScenarioZero) {
        fsmScenarioZero = sFsmScenarioZero;
    }

    let plantSettings = new PlantSettings();
    let publicInterfaces = {
        "getCurrentPlant": jQuery.proxy(plantSettings.getCurrentPlant, plantSettings),
        "setCurrentPlant": jQuery.proxy(plantSettings.setCurrentPlant, plantSettings),
        "getTimeZone": jQuery.proxy(plantSettings.getTimeZone, plantSettings),
        "setTimeZone": jQuery.proxy(plantSettings.setTimeZone, plantSettings),
        "getIndustryType": jQuery.proxy(plantSettings.getIndustryType, plantSettings),
        "setIndustryType": jQuery.proxy(plantSettings.setIndustryType, plantSettings),
        "getPlantChanged": jQuery.proxy(plantSettings.getPlantChanged, plantSettings),
        "setPlantChanged": jQuery.proxy(plantSettings.setPlantChanged, plantSettings),
        "getFsmScenarioZero": jQuery.proxy(plantSettings.getFsmScenarioZero, plantSettings),
        "setFsmScenarioZero": jQuery.proxy(plantSettings.setFsmScenarioZero, plantSettings)
    };
    return publicInterfaces;
})();