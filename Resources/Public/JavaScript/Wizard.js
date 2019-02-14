define(['jquery', 'jquery-ui/sortable', 'jquery-ui/draggable'], function ($) {
	$(document).ready(function () {
		var defaultAttributeSet = window.imagemap.defaultAttributeset,
			canvasObject = new canvasClass(),
			scaleFactor = window.imagemap.scaleFactor,
			zoomOut = $('> .zout', '#magnify'),
			zoomIn = $('> .zin', '#magnify');

		canvasObject.init('canvas', 'picture', 'areaForms');
		scaleFactor = canvasObject.initializeScaling(scaleFactor);
		canvasObject.setScale(scaleFactor);

		window.imagemap.existingFields.forEach(function (configuration) {
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
			zoomOut.hide();
		} else {
			zoomIn.hide();
			zoomOut.hide();
		}

		zoomIn.click(function () {
			canvasObject.setScale(1);
			$(this).hide();
			zoomOut.show();
		});

		zoomOut.click(function () {
			canvasObject.setScale(scaleFactor);
			$(this).hide();
			zoomIn.show();
		});

		$('#addRect').click(function () {
			canvasObject.addArea(new areaRectClass(), '', '', '', '', 1, defaultAttributeSet);
			return false;
		});

		$('#addPoly').click(function () {
			canvasObject.addArea(new areaPolyClass(), '', '', '', '', 1, defaultAttributeSet);
			return false;
		});

		$('#addCirc').click(function () {
			canvasObject.addArea(new areaCircleClass(), '', '', '', '', 1, defaultAttributeSet);
			return false;
		});

		$('#submit').click(function () {
			setValue('<map>' + canvasObject.persistanceXML() + '\n</map>');
			close();
		});

		$('#canvas')
			.mousedown(function (e) {
				return canvasObject.mousedown(e);
			}).mouseup(function (e) {
				return canvasObject.mouseup(e);
			}).mousemove(function (e) {
				return canvasObject.mousemove(e);
			}).dblclick(function (e) {
				return canvasObject.dblclick(e);
			});
	});
});
