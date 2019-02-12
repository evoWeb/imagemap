define(['jquery', 'jquery-ui/sortable', 'jquery-ui/draggable'], function($) {
	$(document).ready(function() {
		var defaultAttributeset = window.imagemap.defaultAttributeset,
			canvasObject = new canvasClass(),
			scaleFactor = window.imagemap.scaleFactor;

		canvasObject.init('canvas', 'picture', 'areaForms');
		scaleFactor = canvasObject.initializeScaling(scaleFactor);
		canvasObject.setScale(scaleFactor);

		window.imagemap.existingFields.forEach(function (configuration) {
			console.log(configuration);
			canvasObject.addArea(
				new window['area' + configuration.shape + 'Class'](),
				configuration.coords,
				configuration.alt,
				configuration.link,
				configuration.color,
				configuration.prepend,
				configuration.attribute
			);
		});

		if (scaleFactor < 1) {
			$('#magnify > .zout').hide();
		} else {
			$('#magnify > .zin').hide();
			$('#magnify > .zout').hide();
		}

		$('#addRect').click(function() {
			canvasObject.addArea(new areaRectClass(), '', '', '', '', 1, defaultAttributeset);
			return false;
		});

		$('#addPoly').click(function() {
			canvasObject.addArea(new areaPolyClass(), '', '', '', '', 1, defaultAttributeset);
			return false;
		});

		$('#addCirc').click(function() {
			canvasObject.addArea(new areaCircleClass(), '', '', '', '', 1, defaultAttributeset);
			return false;
		});

		$('#submit').click(function() {
			setValue('<map>' + canvasObject.persistanceXML() + '\n</map>');
			close();
		});

		$('#canvas')
			.mousedown(function(e){
				return canvasObject.mousedown(e);
			}).mouseup(function(e){
			return canvasObject.mouseup(e);
		}).mousemove(function(e){
			return canvasObject.mousemove(e);
		}).dblclick(function(e){
			return canvasObject.dblclick(e);
		});

		$('> .zin', '#magnify').click(function() {
			canvasObject.setScale(1);
			$(this).hide();
			$('#magnify > .zout').show();
		});

		$('> .zout', '#magnify').click(function() {
			canvasObject.setScale(scaleFactor);
			$(this).hide();
			$('#magnify > .zin').show();
		});
	});
});
