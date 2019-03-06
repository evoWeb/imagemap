function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _objectSpread(t){for(var e=1;e<arguments.length;e++){var i=null!=arguments[e]?arguments[e]:{},r=Object.keys(i);"function"==typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(i).filter(function(e){return Object.getOwnPropertyDescriptor(i,e).enumerable}))),r.forEach(function(e){_defineProperty(t,e,i[e])})}return t}function _slicedToArray(e,t){return _arrayWithHoles(e)||_iterableToArrayLimit(e,t)||_nonIterableRest()}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}function _iterableToArrayLimit(e,t){var i=[],r=!0,n=!1,o=void 0;try{for(var a,s=e[Symbol.iterator]();!(r=(a=s.next()).done)&&(i.push(a.value),!t||i.length!==t);r=!0);}catch(e){n=!0,o=e}finally{try{r||null==s.return||s.return()}finally{if(n)throw o}}return i}function _arrayWithHoles(e){if(Array.isArray(e))return e}function _defineProperties(e,t){for(var i=0;i<t.length;i++){var r=t[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function _createClass(e,t,i){return t&&_defineProperties(e.prototype,t),i&&_defineProperties(e,i),e}function _defineProperty(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){return!t||"object"!==_typeof(t)&&"function"!=typeof t?_assertThisInitialized(e):t}function _getPrototypeOf(e){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function _assertThisInitialized(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&_setPrototypeOf(e,t)}function _setPrototypeOf(e,t){return(_setPrototypeOf=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}define(["jquery","TYPO3/CMS/Imagemap/Fabric"],function(r,n){var t=function(t){for(var e=arguments.length,a=new Array(1<e?e-1:0),i=1;i<e;i++)a[i-1]=arguments[i];var r=function(e){function o(){var e,t;_classCallCheck(this,o);for(var i=arguments.length,r=new Array(i),n=0;n<i;n++)r[n]=arguments[n];return t=_possibleConstructorReturn(this,(e=_getPrototypeOf(o)).call.apply(e,[this].concat(r))),a.forEach(function(e){s(_assertThisInitialized(t),new e)}),t}return _inherits(o,t),o}(),s=function(t,i){var e=Object.getOwnPropertySymbols(i);Object.getOwnPropertyNames(i).concat(e).forEach(function(e){e.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)||Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(i,e))})};return a.forEach(function(e){s(r.prototype,e.prototype),s(r,e)}),r},i=function(e){function o(){var e,t;_classCallCheck(this,o);for(var i=arguments.length,r=new Array(i),n=0;n<i;n++)r[n]=arguments[n];return _defineProperty(_assertThisInitialized(t=_possibleConstructorReturn(this,(e=_getPrototypeOf(o)).call.apply(e,[this].concat(r)))),"name",""),_defineProperty(_assertThisInitialized(t),"element",null),_defineProperty(_assertThisInitialized(t),"form",null),_defineProperty(_assertThisInitialized(t),"eventDelay",0),t}return _inherits(o,n.Object),_createClass(o,[{key:"postAddToForm",value:function(){this.id=n.Object.__uid++,this.hasOwnProperty("attributes")||(this.attributes=[]),this.initializeElement(),this.initializeColorPicker(),this.updateFields(),this.initializeEvents()}},{key:"initializeElement",value:function(){this.element=this.getFormElement("#"+this.name+"Form"),this.form.areaZone.append(this.element),this.form.initializeArrows()}},{key:"initializeColorPicker",value:function(){for(var e=this.getElement(".colorPicker"),t=["00","33","66","99","CC","FF"],i=1;i<6;i++)for(var r=1;r<5;r++)for(var n=1;n<6;n++){var o=t[i]+t[r]+t[n],a=document.createElement("div");a.id=o,a.style.backgroundColor="#"+o,a.classList.add("colorPickerCell"),a.addEventListener("click",this.colorPickerAction.bind(this)),e.append(a)}}},{key:"initializeEvents",value:function(){this.on("moved",this.updateFields.bind(this)),this.on("modified",this.updateFields.bind(this)),this.getElements(".positionOptions .t3js-field").forEach(this.coordinateFieldHandler.bind(this)),this.getElements(".basicOptions .t3js-field, .attributes .t3js-field").forEach(this.attributeFieldHandler.bind(this)),this.getElements(".t3js-btn").forEach(this.buttonHandler.bind(this))}},{key:"coordinateFieldHandler",value:function(e){e.addEventListener("keyup",this.fieldKeyUpHandler.bind(this))}},{key:"fieldKeyUpHandler",value:function(e){var t=this;clearTimeout(this.eventDelay),this.eventDelay=o.wait(function(){t.updateCanvas(e)},500)}},{key:"attributeFieldHandler",value:function(e){e.addEventListener("keyup",this.updateProperties.bind(this))}},{key:"buttonHandler",value:function(e){e.addEventListener("click",this[e.id+"Action"].bind(this))}},{key:"initializeArrows",value:function(){var e=this.form.areaZone;this.getElement("#up").classList[e.firstChild!==this.element?"remove":"add"]("disabled"),this.getElement("#down").classList[e.lastChild!==this.element?"remove":"add"]("disabled")}},{key:"updateFields",value:function(){}},{key:"updateProperties",value:function(e){var t=e.currentTarget;t.classList.contains("link")?this.link=t.value:this.hasOwnProperty(t.id)?this[t.id]=t.value:this.attributes.hasOwnProperty(t.id)&&(this.attributes[t.id]=t.value)}},{key:"updateCanvas",value:function(){}},{key:"linkAction",value:function(e){this.form.openLinkBrowser(e.currentTarget,this)}},{key:"upAction",value:function(){this.form.moveArea(this,-1)}},{key:"downAction",value:function(){this.form.moveArea(this,1)}},{key:"undoAction",value:function(){}},{key:"redoAction",value:function(){}},{key:"deleteAction",value:function(){this.element&&this.element.remove(),this.form&&this.form.initializeArrows(),this.editor.deleteArea(this)}},{key:"expandAction",value:function(){this.showElement(".moreOptions"),this.hideElement("#expand"),this.showElement("#collapse")}},{key:"collapseAction",value:function(){this.hideElement(".moreOptions"),this.hideElement("#collapse"),this.showElement("#expand")}},{key:"colorPickerAction",value:function(e){var t=e.currentTarget.style.backgroundColor;this.getElement("#color").style.backgroundColor=t,this.set("borderColor",t),this.set("stroke",t),this.set("fill",l.hexToRgbA(l.rgbAToHex(t),.2)),this.editor.canvas.renderAll()}},{key:"getFormElement",value:function(e,t){var i=this.form.element.querySelector(e).innerHTML.replace(new RegExp("_ID","g"),t||this.id);return(new DOMParser).parseFromString(i,"text/html").body.firstChild}},{key:"getElement",value:function(e){return this.element.querySelector(e)}},{key:"getElements",value:function(e){return this.element.querySelectorAll(e)}},{key:"hideElement",value:function(e){this.getElement(e).classList.add("hide")}},{key:"showElement",value:function(e){this.getElement(e).classList.remove("hide")}},{key:"toAreaXml",value:function(){return['<area shape="'+this.name+'"',' coords="'+this.getAreaCoords()+'"',this.getAdditionalAttributes()+">",this.getLink(),"</area>"].join("")}},{key:"getAreaCoords",value:function(){}},{key:"getAdditionalAttributes",value:function(){var t=[];return this.getElements(".t3js-field").forEach(function(e){if(!e.classList.contains("ignored-attribute"))switch(e.id){case"color":t.push(e.id+'="'+l.rgbAToHex(e.style.backgroundColor)+'"');break;default:t.push(e.id+'="'+e.value+'"')}}),(0<t.length?" ":"")+t.join(" ")}},{key:"getLink",value:function(){return this.getElement(".link").value}}],[{key:"wait",value:function(e,t){return window.setTimeout(e,t)}}]),o}(),s=function(e){function o(){var e,t;_classCallCheck(this,o);for(var i=arguments.length,r=new Array(i),n=0;n<i;n++)r[n]=arguments[n];return _defineProperty(_assertThisInitialized(t=_possibleConstructorReturn(this,(e=_getPrototypeOf(o)).call.apply(e,[this].concat(r)))),"name","rect"),t}return _inherits(o,t(n.Rect,i)),_createClass(o,[{key:"updateFields",value:function(){var t=this;this.getElement("#color").style.backgroundColor=this.color,this.getElement("#alt").value=this.alt,this.getElement(".link").value=this.link,this.getElement("#left").value=Math.floor(this.left+0),this.getElement("#top").value=Math.floor(this.top+0),this.getElement("#right").value=Math.floor(this.left+this.getScaledWidth()),this.getElement("#bottom").value=Math.floor(this.top+this.getScaledHeight()),Object.entries(this.attributes).forEach(function(e){t.getElement("#"+e[0]).value=e[1]})}},{key:"updateCanvas",value:function(e){var t=e.currentTarget||e.target,i=0;switch(t.id){case"left":i=parseInt(t.value),this.getElement("#right").value=i+this.getScaledWidth(),this.set({left:i});break;case"top":i=parseInt(t.value),this.getElement("#bottom").value=i+this.getScaledHeight(),this.set({top:i});break;case"right":(i=t.value-this.left)<0&&(i=10,t.value=this.left+i),this.set({width:i});break;case"bottom":(i=t.value-this.top)<0&&(i=10,t.value=this.top+i),this.set({height:i})}this.canvas.renderAll()}},{key:"getAreaCoords",value:function(){return[Math.floor(this.left+0),Math.floor(this.top+0),Math.floor(this.left+this.getScaledWidth()-1),Math.floor(this.top+this.getScaledHeight()-1)].join(",")}}]),o}(),a=function(e){function o(){var e,t;_classCallCheck(this,o);for(var i=arguments.length,r=new Array(i),n=0;n<i;n++)r[n]=arguments[n];return _defineProperty(_assertThisInitialized(t=_possibleConstructorReturn(this,(e=_getPrototypeOf(o)).call.apply(e,[this].concat(r)))),"name","circle"),t}return _inherits(o,t(n.Circle,i)),_createClass(o,[{key:"updateFields",value:function(){var t=this;this.getElement("#color").style.backgroundColor=this.color,this.getElement("#alt").value=this.alt,this.getElement(".link").value=this.link,this.getElement("#left").value=Math.floor(this.left+0),this.getElement("#top").value=Math.floor(this.top+0),this.getElement("#radius").value=Math.floor(this.getRadiusX()),Object.entries(this.attributes).forEach(function(e){t.getElement("#"+e[0]).value=e[1]})}},{key:"updateCanvas",value:function(e){var t=e.currentTarget||e.target,i=0;switch(t.id){case"left":i=parseInt(t.value),this.set({left:i});break;case"top":i=parseInt(t.value),this.set({top:i});break;case"radius":i=parseInt(t.value),this.set({radius:i})}this.canvas.renderAll()}},{key:"getAreaCoords",value:function(){return[Math.floor(this.left+this.getRadiusX()),Math.floor(this.top+this.getRadiusX()),Math.floor(this.getRadiusX())].join(",")}}]),o}(),c=function(e){function o(){var e,t;_classCallCheck(this,o);for(var i=arguments.length,r=new Array(i),n=0;n<i;n++)r[n]=arguments[n];return _defineProperty(_assertThisInitialized(t=_possibleConstructorReturn(this,(e=_getPrototypeOf(o)).call.apply(e,[this].concat(r)))),"name","poly"),_defineProperty(_assertThisInitialized(t),"controls",[]),t}return _inherits(o,t(n.Polygon,i)),_createClass(o,[{key:"updateFields",value:function(){var i=this;this.getElement("#color").style.backgroundColor=this.color,this.getElement("#alt").value=this.alt,this.getElement(".link").value=this.link,Object.entries(this.attributes).forEach(function(e){i.getElement("#"+e[0]).value=e[1]});var r=this.getElement(".positionOptions");this.points.forEach(function(e,t){e.id=e.id?e.id:"p"+i.id+"_"+t,e.hasOwnProperty("element")||(e.element=i.getFormElement("#polyCoords",e.id),r.append(e.element)),e.element.querySelector("#x"+e.id).value=e.x,e.element.querySelector("#y"+e.id).value=e.y})}},{key:"updateCanvas",value:function(e){var t=e.currentTarget||e.target,i=_slicedToArray(t.id.split("_"),2)[1],r=this.controls[parseInt(i)],n=r.getCenterPoint().x,o=r.getCenterPoint().y;-1<t.id.indexOf("x")&&(n=parseInt(t.value)),-1<t.id.indexOf("y")&&(o=parseInt(t.value)),r.set("left",n),r.set("top",o),r.setCoords(),this.points[r.name]={x:n,y:o},this.canvas.renderAll()}},{key:"getAreaCoords",value:function(){var i=[];return this.controls.forEach(function(e){var t=e.getCenterPoint();i.push(t.x),i.push(t.y)}),i.join(",")}},{key:"addControls",value:function(i){var r=this;this.points.forEach(function(e,t){r.addControl(i,e,t)}),this.canvas.on("object:moving",function(e){if("control"===e.target.get("type")){var t=e.target,i=t.getCenterPoint();t.polygon.points[t.name]={x:i.x,y:i.y}}})}},{key:"addControl",value:function(e,t,i){var r=new n.Circle(_objectSpread({},e,{hasControls:!1,radius:5,fill:e.cornerColor,stroke:e.cornerStrokeColor,left:t.x,top:t.y,originX:"center",originY:"center",name:i,polygon:this,type:"control"}));r.on("moved",this.pointMoved.bind(this)),this.controls[i]=r,this.canvas.add(r)}},{key:"pointMoved",value:function(e){var t=e.currentTabId||e.target,i="p"+t.polygon.id+"_"+t.name,r=t.getCenterPoint();this.getElement("#x"+i).value=r.x,this.getElement("#y"+i).value=r.y}},{key:"addPointAction",value:function(){var e=this.points.length,t=this.points[0],i=this.points[e-1],r="p"+this.id+"_"+e,n=this.getElement(".positionOptions"),o=this.getFormElement("#polyCoords",r),a={x:(t.x+i.x)/2,y:(t.y+i.y)/2,id:r,element:o};o.querySelectorAll(".t3js-btn").forEach(this.buttonHandler.bind(this)),o.querySelector("#x"+a.id).value=a.x,o.querySelector("#y"+a.id).value=a.y,n.append(o),this.points.push(a),this.addControl(this.editor.areaConfig,a,e)}},{key:"removePointAction",value:function(e){var r=this;if(3<this.points.length){var i=e.currentTarget.parentNode.parentNode,n=[],o=[];this.points.forEach(function(e,t){i.id!==e.id?(n.push(e),o.push(r.controls[t])):(e.element.remove(),r.canvas.remove(r.controls[t]))}),n.forEach(function(e,t){var i=e.id;e.id="p"+r.id+"_"+t,r.getElement("#"+i).id=e.id,r.getElement("#x"+i).id="x"+e.id,r.getElement("#y"+i).id="y"+e.id,r.getElement('[for="x'+i+'"]').setAttribute("for","x"+e.id),r.getElement('[for="y'+i+'"]').setAttribute("for","y"+e.id),o[t].name=t}),this.points=n,this.controls=o,this.canvas.renderAll()}}}]),o}(),o=function(){function i(e,t){_classCallCheck(this,i),_defineProperty(this,"areaZone",null),_defineProperty(this,"editor",null),this.element=n.document.querySelector(e),this.areaZone=this.element.querySelector("#areaZone"),this.editor=t}return _createClass(i,[{key:"initializeArrows",value:function(){this.editor.areas.forEach(function(e){e.initializeArrows()})}},{key:"addArea",value:function(e){e.form=this,e.postAddToForm()}},{key:"moveArea",value:function(e,t){var i=this.editor.areas.indexOf(e),r=i+t,n=e.element.parentNode;if(-1<r&&r<this.editor.areas.length){var o=this.editor.areas.splice(i,1)[0];this.editor.areas.splice(r,0,o),n.childNodes[i][t<0?"after":"before"](n.childNodes[r])}this.initializeArrows()}},{key:"openLinkBrowser",value:function(e,t){e.blur();var i=_objectSpread({},window.imagemap.browseLink,{objectId:t.id,itemName:"link"+t.id,currentValue:t.getLink()});r.ajax({url:this.editor.browseLinkUrlAjaxUrl,context:t,data:i}).done(function(e){window.open(e.url,"","height=600,width=500,status=0,menubar=0,scrollbars=1").focus()})}},{key:"syncAreaLinkValue",value:function(t){this.editor.areas.forEach(function(e){e.id===parseInt(t)&&(e.link=e.getElement(".link").value)})}},{key:"toAreaXml",value:function(){var t=["<map>"];return this.editor.areas.forEach(function(e){t.push(e.toAreaXml())}),t.push("</map>"),t.join("\n")}}]),i}(),l=function(){function l(e,t,i){_classCallCheck(this,l),_defineProperty(this,"areaConfig",{cornerColor:"#eee",cornerStrokeColor:"#bbb",cornerSize:10,cornerStyle:"circle",hasBorders:!1,hasRotatingPoint:!1,transparentCorners:!1}),_defineProperty(this,"browseLinkUrlAjaxUrl",""),_defineProperty(this,"preview",!0),_defineProperty(this,"areas",[]),this.initializeOptions(e),this.canvas=new n.Canvas(t,_objectSpread({},e.canvas,{selection:!1})),void 0!==i&&(this.preview=!1,this.form=new o(i,this))}return _createClass(l,[{key:"initializeOptions",value:function(e){for(var t in e)e.hasOwnProperty(t)&&(this[t]=e[t])}},{key:"setScale",value:function(e){this.canvas.setZoom(this.canvas.getZoom()*(e||1))}},{key:"initializeAreas",value:function(e){var t=this;e.forEach(function(e){switch(e.shape){case"rect":t.addRect(e);break;case"circle":t.addCircle(e);break;case"poly":t.addPoly(e)}})}},{key:"removeAllAreas",value:function(){this.areas.forEach(function(e){e.deleteAction()})}},{key:"addRect",value:function(e){e.color=l.getRandomColor(e.color);var t=_slicedToArray(e.coords.split(","),4),i=t[0],r=t[1],n=t[2],o=t[3],a=new s(_objectSpread({},e,this.areaConfig,{selectable:!this.preview,hasControls:!this.preview,left:parseInt(i),top:parseInt(r),width:n-i,height:o-r,stroke:e.color,strokeWidth:1,fill:l.hexToRgbA(e.color,this.preview?.1:.3)}));(a.editor=this).canvas.add(a),this.areas.push(a),this.form&&this.form.addArea(a)}},{key:"addCircle",value:function(e){e.color=l.getRandomColor(e.color);var t=_slicedToArray(e.coords.split(","),3),i=t[0],r=t[1],n=t[2],o=new a(_objectSpread({},e,this.areaConfig,{selectable:!this.preview,hasControls:!this.preview,left:i-n,top:r-n,radius:parseInt(n),stroke:e.color,strokeWidth:1,fill:l.hexToRgbA(e.color,this.preview?.1:.3)}));o.setControlVisible("ml",!1),o.setControlVisible("mt",!1),o.setControlVisible("mr",!1),o.setControlVisible("mb",!1),(o.editor=this).canvas.add(o),this.areas.push(o),this.form&&this.form.addArea(o)}},{key:"addPoly",value:function(e){e.color=l.getRandomColor(e.color);var t=e.coords.split(","),i=1e5,r=1e5,n=0,o=[];if(t.length%2)throw new Error("Bad coords count");for(;n<t.length;n+=2){var a={x:parseInt(t[n]),y:parseInt(t[n+1])};o.push(a),i=Math.min(i,a.x),r=Math.min(r,a.y)}var s=new c(o,_objectSpread({},e,this.areaConfig,{selectable:!1,objectCaching:!1,hasControls:!this.preview,top:r,left:i,stroke:e.color,strokeWidth:1,fill:l.hexToRgbA(e.color,this.preview?.1:.3)}));(s.editor=this).canvas.add(s),this.areas.push(s),this.form&&(s.addControls(this.areaConfig),this.form.addArea(s))}},{key:"triggerAreaLinkUpdate",value:function(e){this.form.syncAreaLinkValue(e)}},{key:"deleteArea",value:function(t){var i=[];this.areas.forEach(function(e){t!==e&&i.push(e)}),this.areas=i,this.canvas.remove(t)}},{key:"toAreaXml",value:function(){return this.form.toAreaXml()}}],[{key:"getRandomColor",value:function(e){if(void 0===e){var t=(3*Math.floor(5*Math.random())).toString(16),i=(3*Math.floor(5*Math.random())).toString(16),r=(3*Math.floor(5*Math.random())).toString(16);e="#"+t+t+i+i+r+r}return e}},{key:"hexToRgbA",value:function(e,t){var i,r,n,o;if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(e))return 3===(i=e.substring(1).split("")).length&&(i=[i[0],i[0],i[1],i[1],i[2],i[2]]),r=parseInt(i[0]+i[1],16),n=parseInt(i[2]+i[3],16),o=parseInt(i[4]+i[5],16),t?"rgba("+[r,n,o,t].join(", ")+")":"rgb("+[r,n,o].join(", ")+")";throw new Error("Bad Hex")}},{key:"rgbAToHex",value:function(e){var t=e.replace(/[^0-9,]*/g,"").split(",");if(t.length<3)throw new Error("Bad rgba");return"#"+(16777216+(t[2]|t[1]<<8|t[0]<<16)).toString(16).slice(1).toUpperCase()}}]),l}();return l});
//# sourceMappingURL=AreaEditor.js.map
