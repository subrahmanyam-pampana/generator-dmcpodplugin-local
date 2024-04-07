sap.ui.define([
	"sap/ui/core/Control",
], function(
	Control
) {
	"use strict";
    const cssUri = sap.ui.require.toUrl('custom/controls/ColorBar/ColorBar.css')
    
    function loadCss() {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = cssUri;
        document.head.appendChild(link);
    }

    loadCss()
	return Control.extend("custom.controls.ColorBar.ColorBar",{
        metadata:{
            properties:{
                text:{
                    type:"string",
                    defaultValue: '',
                    bindable: "bindable" 
                },
                width:{
                    type:"sap.ui.core.CSSSize",
                    defaultValue:"100%",
                    bindable: "bindable" 
                },
                height:{
                    type:"sap.ui.core.CSSSize",
                    defaultValue:"100%",
                    bindable: "bindable" 
                },
                color:{
                    type:"sap.ui.core.CSSColor",
                    defaultValue:"grey",
                    bindable: "bindable" 
                },
                textColor:{
                    type:"sap.ui.core.CSSColor",
                    defaultValue:"black",
                    bindable: "bindable" 
                },
                count:{
                    type:"string",
                    defaultValue: '',
                    bindable: "bindable" 
                }
            },
        },
        renderer:{
            render:function(oRm, oColorBar){
                // get control values
                let sText=oColorBar.getText(),
                    sWidth=oColorBar.getWidth(),
                    sHeight=oColorBar.getHeight(),
                    sColor =oColorBar.getColor(),
                    sTextColor = oColorBar.getTextColor(),
                    sCount=oColorBar.getCount();
                
                // start writing html   
                oRm.openStart("div", oColorBar); 
                oRm.class('ccColorBar');
               
                //add styles
                oRm.style("background-color", sColor);
                oRm.style("color", sTextColor);
                oRm.style("width", sWidth);
                oRm.style("height", sHeight);
    
                oRm.openEnd(); //<dev style="">
    
                //add text
                oRm.openStart("span"); 
                oRm.openEnd("span"); 

                oRm.text(sText)
                oRm.close("span"); //<div><span>sText<span>
    
                //add count
                if(sCount){
                    oRm.openStart("span"); 
                    oRm.openEnd("span"); 
                    oRm.text(sCount)
                    oRm.close("span") //<div><span>sText<span><span>sCount</span>
                }
    
                oRm.close("div")
            }
        }
	});
});