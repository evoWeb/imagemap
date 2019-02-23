define(['jquery', 'jquery-ui/sortable', 'jquery-ui/draggable', 'TYPO3/CMS/Imagemap/JsGraphics'], function ($) {
	$(document).ready(function () {
		let configuration = window.imagemap,
			defaultAttributeSet = configuration.defaultAttributeset,
			canvasObject = new canvasClass(),
			scaleFactor = configuration.scaleFactor,
			$zoomOut = $('> .zout', '#magnify'),
			$zoomIn = $('> .zin', '#magnify');

		canvasObject.init('canvas', 'picture', 'areaForms');
		scaleFactor = canvasObject.initializeScaling(scaleFactor);
		canvasObject.setScale(scaleFactor);
		configuration.canvasObject = canvasObject;

		configuration.existingAreas.forEach(function (configuration) {
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
			$zoomOut.hide();
		} else {
			$zoomIn.hide();
			$zoomOut.hide();
		}

		$zoomIn.click(function () {
			canvasObject.setScale(1);
			$(this).hide();
			$zoomOut.show();
		});

		$zoomOut.click(function () {
			canvasObject.setScale(scaleFactor);
			$(this).hide();
			$zoomIn.show();
		});

		$('#addRect').on('click', function () {
			canvasObject.addArea(new areaRectClass(), '', '', '', '', 1, defaultAttributeSet);
		});

		$('#addPoly').on('click', function () {
			canvasObject.addArea(new areaPolyClass(), '', '', '', '', 1, defaultAttributeSet);
		});

		$('#addCircle').on('click', function () {
			canvasObject.addArea(new areaCircleClass(), '', '', '', '', 1, defaultAttributeSet);
		});

		$('#submit').on('click', function () {
			let $field = window.opener.$('input[name="' + configuration.itemName + '"]');
			$field
				.val('<map>' + canvasObject.persistanceXML() + '</map>')
				.trigger('imagemap:changed');
			close();
		});

		$('#canvas')
			.on('mousedown', canvasObject.mousedown.bind(canvasObject))
			.on('mouseup', canvasObject.mouseup.bind(canvasObject))
			.on('mousemove', canvasObject.mousemove.bind(canvasObject))
			.on('dblclick', canvasObject.dblclick.bind(canvasObject));
	});
});
