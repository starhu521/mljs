
com=window.com||{};com.marklogic=window.com.marklogic||{};com.marklogic.widgets=window.com.marklogic.widgets||{};com.marklogic.widgets.openlayers=function(container){this.container=container;this.HIGH=256;this.MEDIUM=128;this.LOW=64;this.map=null;this.baseLayer=null;this._config={"constraint-name":null,showGoogleStreet:false,showArcGISOnline:false,showAllBing:false,heatmapGranularity:this.HIGH};this.transformWgs84=new OpenLayers.Projection("EPSG:4326");this.series={};this._allLayers=new Array();this._selectionLayer=null;this._polyControl=null;this._polygonControl=null;this._dragControl=null;this._geoSelectionPublisher=new com.marklogic.events.Publisher();this._resultSelectionPublisher=new com.marklogic.events.Publisher();this._resultHighlightPublisher=new com.marklogic.events.Publisher();this._selectedUri=null;this._highlightedUri=null;this._configurationContext=null;this.heatmap=null;this._refresh();};com.marklogic.widgets.openlayers.getConfigurationDefinition=function(){var self=this;return{showGoogleStreet:{type:"boolean",default:false,title:"Show Google Street Layer",description:"Show the Google Street layer."},showArcGISOnline:{type:"boolean",default:false,title:"Show Arc GIS Online Layer",description:"Show the Arc GIS Online layer."},showAllBing:{type:"boolean",default:false,title:"Show All Bing Maps Layers",description:"Show all Bing Maps layers."},"constraint-name":{type:"string",default:null,title:"Selection Constraint Name",description:"The name of the search options constraint to use for selection."},heatmapGranularity:{type:"enum",default:256,title:" Heat Map Granularity",description:"How detailed a heatmap to calculate in MarkLogic Server.",options:[{value:256,title:"High",description:"Many heatmap areas("+self.HIGH+")."},{value:128,title:"Medium",description:"Several heatmap areas("+self.MEDIUM+")."},{value:64,title:"Low",description:"Few heatmap areas("+self.LOW+")."}]},startLat:{type:"string",default:"51.5",title:"Start Latitude",description:"Initial latitude centre position."},startLon:{type:"string",default:"-0.1",title:"Start Longitude",description:"Initial longitude centre position."},startZoom:{type:"string",default:"13",minimum:1,maximum:15,title:"Start Zoom",description:"Initial zoom on centre position."},series:{type:"multiple",minimum:0,default:[],title:"Series",description:"Data series to render on the map",childDefinitions:{title:{type:"string",default:"",title:"Series name",description:"Common name for this series"},searchcontext:{type:"SearchContext",default:null,title:"Search Context",description:"Search context data source"},latsrc:{type:"string",default:null,title:"Latitude Source",description:"document value to extract latitude from"},lonsrc:{type:"string",default:null,title:"Longitude Source",description:"document value to extract longitude from"},titlesrc:{type:"string",default:null,title:"Title Source",description:"document value to extract Title from"},summarysrc:{type:"string",default:null,title:"Summary Source",description:"document value to extract Summary from"},iconsrc:{type:"string",default:null,title:"Icon Source",description:"document value to extract Icon URL from"},heatmapconstraint:{type:"string",default:null,title:"Heatmap Constraint",description:"Name of the constraint holding the heatmap"}}}};};com.marklogic.widgets.openlayers.prototype.setConfigurationContext=function(ctx){this._configurationContext=ctx;};com.marklogic.widgets.openlayers.prototype.setConfiguration=function(config){for(var prop in config){this._config[prop]=config[prop];}
this.heatmap=null;this._refresh();if(undefined!=this._config.startLat&&undefined!=this._config.startLon&&undefined!=this._config.startZoom&&""!=this._config.startLat&&""!=this._config.startLon&&""!=this._config.startZoom){this.go(this._config.startLat,this._config.startLon,this._config.startZoom);}
if(undefined!=config.series&&null!=this._configurationContext){for(var s=0,maxs=config.series.length,series;s<maxs;s++){series=config.series[s];this.addSeries(series.title,this._configurationContext.getInstance(series.searchcontext),series.latsrc,series.lonsrc,series.titlesrc,series.summarysrc,series.iconsrc,series.heatmapconstraint);}}
if(true===this._config.showGoogleStreet){this.addGoogleStreet();}
if(true===this._config.showArcGISOnline){this.addArcGISOnline();}
if(true===this._config.showAllBing){this.addAllBing();}};com.marklogic.widgets.openlayers.prototype.setHeatmapGranularity=function(val){this._config.heatmapGranularity=val;};com.marklogic.widgets.openlayers.prototype.addGeoSelectionListener=function(lis){this._geoSelectionPublisher.subscribe(lis);};com.marklogic.widgets.openlayers.prototype.removeGeoSelectionListener=function(lis){this._geoSelectionPublisher.unsubscribe(lis);};com.marklogic.widgets.openlayers.prototype.addResultSelectionListener=function(lis){this._resultSelectionPublisher.subscribe(lis);};com.marklogic.widgets.openlayers.prototype.removeResultSelectionListener=function(lis){this._resultSelectionPublisher.unsubscribe(lis);};com.marklogic.widgets.openlayers.prototype.addResultHighlightListener=function(lis){this._resultHighlightPublisher.subscribe(lis);};com.marklogic.widgets.openlayers.prototype.removeResultHighlightListener=function(lis){this._resultHighlightPublisher.unsubscribe(lis);};com.marklogic.widgets.openlayers.prototype.updateResultSelection=function(newsel){};com.marklogic.widgets.openlayers.prototype.updateResultHighlight=function(newsel){};com.marklogic.widgets.openlayers.prototype.setGeoSelectionConstraint=function(name){this._config["constraint-name"]=name;};com.marklogic.widgets.openlayers.prototype.addGeolocate=function(){var geolocate=new OpenLayers.Control.Geolocate({bind:false,geolocationOptions:{enableHighAccuracy:false,maximumAge:0,timeout:7000}});this.map.addControl(geolocate);};com.marklogic.widgets.openlayers.prototype.addGoogleStreet=function(){var g=new OpenLayers.Layer.Google("Google Streets",null,{eventListeners:{tileloaded:this._updateStatus,loadend:this._detect}});this.addLayer(g);return g;};com.marklogic.widgets.openlayers.prototype.addArcGISOnline=function(){var layerInfo={"currentVersion":10.01,"serviceDescription":"This worldwide street map presents highway-level data for the world and street-level data for the United States, Canada, Japan, Southern Africa, and a number of countries in Europe and elsewhere. This comprehensive street map includes highways, major roads, minor roads, railways, water features, administrative boundaries, cities, parks, and landmarks, overlaid on shaded relief imagery for added context. The street map was developed by ESRI using ESRI basemap data, AND road data, USGS elevation data, and UNEP-WCMC parks and protected areas for the world, and Tele Atlas Dynamap� and Multinet� street data for North America and Europe. Coverage for street-level data in Europe includes Andorra, Austria, Belgium, Czech Republic, Denmark, France, Germany, Great Britain, Greece, Hungary, Ireland, Italy, Luxembourg, Netherlands, Northern Ireland (Belfast only), Norway, Poland, Portugal, San Marino, Slovakia, Spain, Sweden, and Switzerland. Coverage for street-level data elsewhere in the world includes China (Hong Kong only), Colombia, Egypt (Cairo only), Indonesia (Jakarta only), Japan, Mexico (Mexico City only), Russia (Moscow and St. Petersburg only), South Africa, Thailand, and Turkey (Istanbul and Ankara only). For more information on this map, visit us \u003ca href=\"http://goto.arcgisonline.com/maps/World_Street_Map \" target=\"_new\"\u003eonline\u003c/a\u003e.","mapName":"Layers","description":"This worldwide street map presents highway-level data for the world and street-level data for the United States, Canada, Japan, Southern Africa, most countries in Europe, and several other countries. This comprehensive street map includes highways, major roads, minor roads, one-way arrow indicators, railways, water features, administrative boundaries, cities, parks, and landmarks, overlaid on shaded relief imagery for added context. The map also includes building footprints for selected areas in the United States and Europe and parcel boundaries for much of the lower 48 states.\n\nThe street map was developed by ESRI using ESRI basemap data, DeLorme base map layers, AND road data, USGS elevation data, UNEP-WCMC parks and protected areas for the world, Tele Atlas Dynamap� and Multinet� street data for North America and Europe, and First American parcel data for the United States. Coverage for street-level data in Europe includes Andorra, Austria, Belgium, Czech Republic, Denmark, France, Germany, Great Britain, Greece, Hungary, Ireland, Italy, Luxembourg, Netherlands, Norway, Poland, Portugal, San Marino, Slovakia, Spain, Sweden, and Switzerland. Coverage for street-level data elsewhere in the world includes China (Hong Kong only), Colombia, Egypt (Cairo only), Indonesia (Jakarta only), Japan, Mexico, Russia, South Africa, Thailand, and Turkey (Istanbul and Ankara only). For more information on this map, visit us online at http://goto.arcgisonline.com/maps/World_Street_Map\n","copyrightText":"Sources: ESRI, DeLorme, AND, Tele Atlas, First American, ESRI Japan, UNEP-WCMC, USGS, METI, ESRI Hong Kong, ESRI Thailand, Procalculo Prosis","layers":[{"id":0,"name":"World Street Map","parentLayerId":-1,"defaultVisibility":true,"subLayerIds":null,"minScale":0,"maxScale":0}],"tables":[],"spatialReference":{"wkid":102100},"singleFusedMapCache":true,"tileInfo":{"rows":256,"cols":256,"dpi":96,"format":"JPEG","compressionQuality":90,"origin":{"x":-20037508.342787,"y":20037508.342787},"spatialReference":{"wkid":102100},"lods":[{"level":0,"resolution":156543.033928,"scale":591657527.591555},{"level":1,"resolution":78271.5169639999,"scale":295828763.795777},{"level":2,"resolution":39135.7584820001,"scale":147914381.897889},{"level":3,"resolution":19567.8792409999,"scale":73957190.948944},{"level":4,"resolution":9783.93962049996,"scale":36978595.474472},{"level":5,"resolution":4891.96981024998,"scale":18489297.737236},{"level":6,"resolution":2445.98490512499,"scale":9244648.868618},{"level":7,"resolution":1222.99245256249,"scale":4622324.434309},{"level":8,"resolution":611.49622628138,"scale":2311162.217155},{"level":9,"resolution":305.748113140558,"scale":1155581.108577},{"level":10,"resolution":152.874056570411,"scale":577790.554289},{"level":11,"resolution":76.4370282850732,"scale":288895.277144},{"level":12,"resolution":38.2185141425366,"scale":144447.638572},{"level":13,"resolution":19.1092570712683,"scale":72223.819286},{"level":14,"resolution":9.55462853563415,"scale":36111.909643},{"level":15,"resolution":4.77731426794937,"scale":18055.954822},{"level":16,"resolution":2.38865713397468,"scale":9027.977411},{"level":17,"resolution":1.19432856685505,"scale":4513.988705}]},"initialExtent":{"xmin":-20037507.0671618,"ymin":-20037507.0671618,"xmax":20037507.0671618,"ymax":20037507.0671619,"spatialReference":{"wkid":102100}},"fullExtent":{"xmin":-20037507.0671618,"ymin":-19971868.8804086,"xmax":20037507.0671618,"ymax":19971868.8804086,"spatialReference":{"wkid":102100}},"units":"esriMeters","supportedImageFormatTypes":"PNG24,PNG,JPG,DIB,TIFF,EMF,PS,PDF,GIF,SVG,SVGZ,AI,BMP","documentInfo":{"Title":"World Street Map","Author":"ESRI","Comments":"","Subject":"streets, highways, major roads, railways, water features, administrative boundaries, cities, parks, protected areas, landmarks ","Category":"transportation(Transportation Networks) ","Keywords":"World, Global, 2009, Japan, UNEP-WCMC","Credits":""},"capabilities":"Map"};var maxExtent=new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34);var layerMaxExtent=new OpenLayers.Bounds(layerInfo.fullExtent.xmin,layerInfo.fullExtent.ymin,layerInfo.fullExtent.xmax,layerInfo.fullExtent.ymax);var resolutions=[];for(var i=0;i<layerInfo.tileInfo.lods.length;i++){resolutions.push(layerInfo.tileInfo.lods[i].resolution);}
var l=new OpenLayers.Layer.ArcGISCache("Arc GIS Online","http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",{isBaseLayer:true,resolutions:resolutions,tileSize:new OpenLayers.Size(layerInfo.tileInfo.cols,layerInfo.tileInfo.rows),tileOrigin:new OpenLayers.LonLat(layerInfo.tileInfo.origin.x,layerInfo.tileInfo.origin.y),maxExtent:layerMaxExtent,projection:'EPSG:'+layerInfo.spatialReference.wkid});this.addLayer(l);return l;};com.marklogic.widgets.openlayers.prototype.addAllBing=function(){var apiKey="AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";var road=new OpenLayers.Layer.Bing({name:"Bing Road",key:apiKey,type:"Road"});var hybrid=new OpenLayers.Layer.Bing({name:"Bing Hybrid",key:apiKey,type:"AerialWithLabels"});var aerial=new OpenLayers.Layer.Bing({name:"Bing Aerial",key:apiKey,type:"Aerial"});var layers=[road,hybrid,aerial];this.addLayers(layers);return layers;};com.marklogic.widgets.openlayers.prototype.ensureHeatmap=function(){if(null==this.heatmap){this.heatmap=new OpenLayers.Layer.Heatmap("Heatmap",this.map,this.baseLayer,{visible:true,radius:40},{isBaseLayer:false,opacity:0.3,projection:new OpenLayers.Projection("EPSG:4326")});this.addLayer(this.heatmap);}};com.marklogic.widgets.openlayers.prototype.addLayer=function(layer){this.map.addLayer(layer);};com.marklogic.widgets.openlayers.prototype.addLayers=function(layers){this.map.addLayers(layers);};com.marklogic.widgets.openlayers.prototype.__mode=function(newmode){mljs.defaultconnection.logger.debug("openlayers.__mode: Mode selected: "+newmode);if("drag"==newmode){this._dragControl.activate();this._polyControl.deactivate();this._polygonControl.deactivate();}else if("none"==newmode){this._dragControl.deactivate();this._polyControl.deactivate();this._polygonControl.deactivate();}else if("polygon"==newmode){this._dragControl.deactivate();this._polyControl.deactivate();this._polygonControl.activate();}else{var options={sides:4};if("circle"==newmode){options.sides=40;options.irregular=false;}else if("box"==newmode){options.sides=4;options.irregular=true;}
this._polyControl.handler.setOptions(options);this._dragControl.deactivate();this._polyControl.activate();this._polygonControl.deactivate();}};com.marklogic.widgets.openlayers.prototype._removeAllFeaturesBut=function(feature){var nonMeFeatures=new Array();for(var f=0;f<this._selectionLayer.features.length;f++){if(feature===this._selectionLayer.features[f]){}else{nonMeFeatures.push(this._selectionLayer.features[f]);}}
this._selectionLayer.removeFeatures(nonMeFeatures);};com.marklogic.widgets.openlayers.prototype._refresh=function(){var self=this;var p=document.getElementById(this.container);var width=p.offsetWidth;if(undefined==width||width==0||width<100){width=800;}
var height=p.offsetHeight;if(undefined==height||height==0||height<100){height=500;}
var actualHeight=height-26;var actualWidth=width-2;this.width=actualWidth;this.height=actualHeight;var str="<div class='mljswidget panel panel-info openlayers'>";str+="<div class='panel-body openlayers-content'>";str+="<div id='"+this.container+"-map' class='openlayers-map' style='height:"+(actualHeight-55)+"px;width:"+(actualWidth-30)+"px;'></div>";str+="<div class='openlayers-controls'>";str+="<div class='openlayers-mode'>Mode: <select id='"+this.container+"-mode'><option value='none'>Move</option><option value='circle'>Circle Radius Select</option>";str+="<option value='box'>Bounding Box Select</option><option value='polygon'>Polygon Select</option></select>";str+=" <a href='#' id='"+this.container+"-clear' class='openalyers-clear'>Clear Selection</a>  ";str+=" | <span class='small'>Hint: Hold down shift and drag to draw a freehand polygon. Double click to complete. </span></div></div>";str+="</div>";str+="</div>";p.innerHTML=str;var sel=document.getElementById(this.container+"-mode");sel.onchange=function(evt){self.__mode(sel.value);};var clear=document.getElementById(this.container+"-clear");clear.onclick=function(evt){self._removeAllFeaturesBut();self._geoSelectionPublisher.publish({type:null,contributor:self.container});evt.preventDefault();return false;};var map,cacheWrite,cacheRead1,cacheRead2;function init(){self.baseLayer=new OpenLayers.Layer.OSM("OpenStreetMap (CORS)",null,{eventListeners:{tileloaded:this._updateStatus,loadend:this._detect}});map=new OpenLayers.Map({div:self.container+"-map",projection:"EPSG:900913",displayProjection:new OpenLayers.Projection("EPSG:900913"),layers:[self.baseLayer],center:[0,0],zoom:1});self.map=map;self.ensureHeatmap();self._selectionLayer=new OpenLayers.Layer.Vector("Selection Layer");map.addLayers([self._selectionLayer]);var polyOptions={sides:4};self._polyControl=new OpenLayers.Control.DrawFeature(self._selectionLayer,OpenLayers.Handler.RegularPolygon,{handlerOptions:polyOptions});self._polygonControl=new OpenLayers.Control.DrawFeature(self._selectionLayer,OpenLayers.Handler.Polygon);map.addControl(self._polyControl);map.addControl(self._polygonControl);var drag=new OpenLayers.Control.DragFeature(self._selectionLayer);map.addControl(drag);self._dragControl=drag;var featureFunc=function(feature){mljs.defaultconnection.logger.debug("FEATURE ADDED: "+feature);self._removeAllFeaturesBut(feature);var selmode=document.getElementById(self.container+"-mode").value;if("polygon"==selmode){var points=[];var ps=feature.geometry.components[0].components;for(var p=0;p<ps.length;p++){var olps=ps[p];var mlps=new OpenLayers.LonLat(olps.x,olps.y).transform(this.map.displayProjection,self.transformWgs84);points[p]={latitude:mlps.lat,longitude:mlps.lon};}
self._geoSelectionPublisher.publish({type:"polygon",contributor:self.container,"constraint-name":self._config["constraint-name"],polygon:points});}else if("circle"==selmode){var center=feature.geometry.getCentroid();mljs.defaultconnection.logger.debug("x,y="+center.x+","+center.y);var point=feature.geometry.components[0].components[0];var line=new OpenLayers.Geometry.LineString([center,point]);var dist=line.getGeodesicLength(new OpenLayers.Projection("EPSG:900913"));var radiusMiles=dist*0.000621371192;var wgsPoint=new OpenLayers.LonLat(center.x,center.y).transform(self.map.displayProjection,self.transformWgs84);self._geoSelectionPublisher.publish({type:"circle",contributor:self.container,"constraint-name":self._config["constraint-name"],latitude:wgsPoint.lat,longitude:wgsPoint.lon,radiusmiles:radiusMiles});}else if("box"==selmode){var p1=feature.geometry.components[0].components[0];var p2=feature.geometry.components[0].components[2];var north=p1.y;var south=p2.y;if(south>north){north=p2.y;south=p1.y;}
var west=p1.x;var east=p2.x;if(west>east){west=p2.x;east=p1.x}
mljs.defaultconnection.logger.debug("GEOBOX: north: "+north+", south: "+south+", west: "+west+", east: "+east);var nw=new OpenLayers.LonLat(west,north).transform(self.map.displayProjection,self.transformWgs84);var se=new OpenLayers.LonLat(east,south).transform(self.map.displayProjection,self.transformWgs84);mljs.defaultconnection.logger.debug("GEOBOX: EPSG4326: north: "+nw.lat+", south: "+se.lat+", west: "+nw.lon+", east: "+se.lon);self._geoSelectionPublisher.publish({type:"box",contributor:self.container,"constraint-name":self._config["constraint-name"],box:{north:nw.lat,south:se.lat,east:se.lon,west:nw.lon}});}};self._polyControl.featureAdded=featureFunc;self._polygonControl.featureAdded=featureFunc;cacheRead1=new OpenLayers.Control.CacheRead({eventListeners:{activate:function(){cacheRead2.deactivate();}}});cacheRead2=new OpenLayers.Control.CacheRead({autoActivate:false,fetchEvent:"tileerror",eventListeners:{activate:function(){cacheRead1.deactivate();}}});cacheWrite=new OpenLayers.Control.CacheWrite({imageFormat:"image/jpeg",eventListeners:{cachefull:function(){if(seeding){stopSeeding();}
mljs.defaultconnection.logger.debug("Cache full.");}}});var layerSwitcher=new OpenLayers.Control.LayerSwitcher();map.addControls([cacheRead1,cacheRead2,cacheWrite,layerSwitcher]);function detect(evt){evt.object.events.unregister("loadend",null,detect);var tile=map.baseLayer.grid[0][0];try{var canvasContext=tile.getCanvasContext();if(canvasContext){canvasContext.canvas.toDataURL();}else{mljs.defaultconnection.logger.debug("Canvas not supported. Try a different browser.");}}catch(e){mljs.defaultconnection.logger.debug("CORS not supported - cannot load OSM maps");evt.object.destroy();layerSwitcher.destroy();}};this.__detect=function(evt){detect(evt);};function updateStatus(evt){if(window.localStorage){mljs.defaultconnection.logger.debug(localStorage.length+" entries in cache.");}else{mljs.defaultconnection.logger.debug("Local storage not supported. Try a different browser.");}
if(evt&&evt.tile.url.substr(0,5)==="data:"){cacheHits++;}};this.__updateStatus=function(evt){updateStatus(evt);};function toggleRead(){setType();};function toggleWrite(){cacheWrite[cacheWrite.active?"deactivate":"activate"]();};function clearCache(){OpenLayers.Control.CacheWrite.clearCache();updateStatus();};function setType(){cacheRead1.activate();};function startSeeding(){var layer=map.baseLayer,zoom=map.getZoom();seeding={zoom:zoom,extent:map.getExtent(),center:map.getCenter(),cacheWriteActive:cacheWrite.active,buffer:layer.buffer,layer:layer};map.zoomTo(zoom===layer.numZoomLevels-1?zoom-1:zoom+1);cacheWrite.activate();cacheRead1.deactivate();cacheRead2.deactivate();layer.events.register("loadend",null,seed);map.setCenter(seeding.center,zoom);};function seed(){var layer=seeding.layer;var tileWidth=layer.tileSize.w;var nextZoom=map.getZoom()+1;var extentWidth=seeding.extent.getWidth()/map.getResolutionForZoom(nextZoom);layer.buffer=Math.ceil((extentWidth/tileWidth-map.getSize().w/tileWidth)/2);map.zoomIn();if(nextZoom===layer.numZoomLevels-1){stopSeeding();}};function stopSeeding(){seeding.layer.events.unregister("loadend",null,seed);seeding.layer.buffer=seeding.buffer;map.setCenter(seeding.center,seeding.zoom);if(!seeding.cacheWriteActive){cacheWrite.deactivate();}
setType();seeding=false;};};init();};com.marklogic.widgets.openlayers.prototype.eightDecPlaces=function(val){var str=""+val;var pos=str.indexOf(".");return 1.0*(str.substring(0,pos+1)+str.substring(pos+1,pos+9));};com.marklogic.widgets.openlayers.prototype.go=function(lat,lon,zoom){this.map.setCenter(new OpenLayers.LonLat(lon,lat).transform(this.transformWgs84,this.map.projection),zoom,true,true);};com.marklogic.widgets.openlayers.prototype.updateLocale=function(locale){mljs.defaultconnection.logger.debug("openlayers.updateLocale: Called with: "+JSON.stringify(locale));this.map.setCenter(new OpenLayers.LonLat(locale.center.longitude,locale.center.latitude).transform(this.transformWgs84,this.map.projection),this.map.getZoom(),true,true);};com.marklogic.widgets.openlayers.prototype.addSeries=function(title,searchcontext,latsrc,lonsrc,titlesrc,summarysrc,icon_source_opt,heatmap_constraint){this.series[name]={title:title,context:searchcontext,latsource:latsrc,lonsource:lonsrc,titlesource:titlesrc,summarysource:summarysrc,constraint:heatmap_constraint};var layer=new OpenLayers.Layer.Markers(title);var size=new OpenLayers.Size(21,25);var offset=new OpenLayers.Pixel(-(size.w/2),-size.h);var icon=new OpenLayers.Icon('/js/OpenLayers-2.13.1/img/marker-blue.png',size,offset);this._allLayers.push(layer);this.series[name].layer=layer;this.map.addLayer(layer);var popup;var self=this;var lisfunc=function(results){mljs.defaultconnection.logger.debug("openlayers.addSeries.listfunc: In dynamic results listener...");self._selectedUri=null;self._highlightedUri=null;if(null==results||"boolean"==typeof(results)){if(false===results){}
self.heatmap.setDataSet({data:[],max:0});return;}
mljs.defaultconnection.logger.debug("openlayers.addSeries.listfunc: Deleting results markers in layer: "+title);var oldm=layer.markers;for(var i=0;i<oldm.length;i++){var mark=oldm[i];mark.erase();layer.removeMarker(mark);mark.destroy();}
layer.clearMarkers();mljs.defaultconnection.logger.debug("openlayers.addSeries.listfunc: Processing results");for(var i=0,max=results.results.length,r;i<max;i++){r=results.results[i];var thedoc=jsonOrXml(r.content);var lat=null;var lon=null;if("object"==typeof(latsrc)){if("extract"==latsrc.type){if("constraint"==latsrc.source){for(var metai=0,maxi=r.metadata.length,meta;metai<maxi;metai++){meta=r.metadata[metai];for(var param in meta){if(param==latsrc.constraint){var parts=meta[param].split(",");lat=parts[0];lon=parts[1];console.log("*** Found location parts: lat: "+parts[0]+", lon: "+parts[1]);}}}}else{console.log("latsrc source not a constraint");}}else{console.log("latsrc type not an extract");}}else{var lat=extractValue(thedoc,latsrc);var lon=extractValue(thedoc,lonsrc);}
mljs.defaultconnection.logger.debug("openlayers.addSeries.listfunc: lat: "+lat+", lon: "+lon);var m=new OpenLayers.Marker(new OpenLayers.LonLat(lon,lat).transform(self.transformWgs84,self.map.displayProjection),icon.clone());layer.addMarker(m);var addEvents=function(m,uri){m.events.register('mouseover',m,function(evt){self._highlightedUri=uri;self._resultHighlightPublisher.publish({mode:"replace",uri:uri});});m.events.register('mouseout',m,function(evt){self._highlightedUri=null;self._resultHighlightPublisher.publish({mode:"replace",uri:null});});m.events.register('click',m,function(evt){if(uri==self._selectedUri){self._selectedUri=null;self._resultSelectionPublisher.publish({mode:"replace",uri:null});}else{self._selectedUri=uri;self._resultSelectionPublisher.publish({mode:"replace",uri:uri});}});};addEvents(m,r.uri);}
mljs.defaultconnection.logger.debug("openlayers.addSeries.listfunc: Finished adding all results");if(undefined!=results.facets[heatmap_constraint]&&undefined!=results.facets[heatmap_constraint].boxes){var boxes=results.facets[heatmap_constraint].boxes;var data=[];for(var i=0,maxb=boxes.length,box,lat,lng,dp;i<maxb;i++){box=boxes[i];lat=0.5*(box.s+box.n);lng=0.5*(box.w+box.e);dp={lonlat:new OpenLayers.LonLat(lng,lat),count:box.count};data[i]=dp;}
mljs.defaultconnection.logger.debug("Heatmap MAX: "+boxes.length);self.heatmap.setDataSet({data:data,max:boxes.length});}};searchcontext.addResultsListener(lisfunc);this.series[name].listener=lisfunc;if(undefined!=this.series[name].constraint){this.ensureHeatmap();var self=this;var updateHeatmap=function(){var ex=self.map.getExtent().transform(self.map.displayProjection,self.transformWgs84);var amount=self._config.heatmapGranularity;var ratio=Math.sqrt(amount/(self.height*self.width));var up=Math.ceil(ratio*self.height);var across=Math.ceil(ratio*self.width);mljs.defaultconnection.logger.debug("Heatmap Amount: "+amount+", ratio: "+ratio+", up: "+up+", across: "+across);mljs.defaultconnection.logger.debug("Heatmap Bounds: N: "+ex.top+", South: "+ex.bottom+", West: "+ex.left+", East: "+ex.right);var heatmap={n:ex.top,s:ex.bottom,w:ex.left,e:ex.right,latdivs:up,londivs:across};searchcontext.updateGeoHeatmap(heatmap_constraint,heatmap);};this.map.events.register("moveend",this.map,function(){updateHeatmap();});updateHeatmap();}};