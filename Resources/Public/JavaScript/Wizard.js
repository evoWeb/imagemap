define(["jquery","TYPO3/CMS/Imagemap/AreaEditor"],function(d,h){d(document).ready(function(){var s=window.imagemap,e=d(".image img"),i=d(".picture"),t={canvas:{width:parseInt(e.css("width")),height:parseInt(e.css("height")),top:-1*parseInt(e.css("height"))},browseLinkUrlAjaxUrl:window.TYPO3.settings.ajaxUrls.imagemap_browselink_url},a=new h(t,"canvas","#areasForm");s.areaEditor=a;var n,c,r,o;n=i.data("scale-factor"),c=d("#magnify"),r=c.find(".zoomout"),o=c.find(".zoomin"),a.setScale(),n<1&&(o.removeClass("hide"),o.click(function(){a.setScale(1),o.hide(),r.show()}),r.click(function(){a.setScale(n),r.hide(),o.show()})),d("#addRect").on("click",function(){a.addRect({coords:parseInt(e.css("width"))/2-50+","+(parseInt(e.css("height"))/2-50)+","+(parseInt(e.css("width"))/2+50)+","+(parseInt(e.css("height"))/2+50)})}),d("#addCircle").on("click",function(){a.addCircle({coords:parseInt(e.css("width"))/2-50+","+(parseInt(e.css("height"))/2-50)+",50"})}),d("#addPoly").on("click",function(){a.addPoly({coords:parseInt(e.css("width"))/2+","+(parseInt(e.css("height"))/2-50)+","+(parseInt(e.css("width"))/2+50)+","+(parseInt(e.css("height"))/2+50)+","+parseInt(e.css("width"))/2+","+(parseInt(e.css("height"))/2+70)+","+(parseInt(e.css("width"))/2-50)+","+(parseInt(e.css("height"))/2+50)})}),d("#submit").on("click",function(){window.opener.$('input[name="'+s.itemName+'"]').val(a.toAreaXml()).trigger("imagemap:changed"),close()}),a.initializeAreas(s.existingAreas)})});
//# sourceMappingURL=Wizard.js.map
