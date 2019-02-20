define(['jquery', 'jquery-ui/sortable', 'jquery-ui/draggable', 'TYPO3/CMS/Imagemap/JsGraphics'], function (jQuery) {
	jQuery(document).ready(function () {
		let configuration = window.imagemap,
			defaultAttributeSet = configuration.defaultAttributeset,
			canvasObject = new canvasClass(),
			scaleFactor = configuration.scaleFactor,
			zoomOut = jQuery('> .zout', '#magnify'),
			zoomIn = jQuery('> .zin', '#magnify');

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
			zoomOut.hide();
		} else {
			zoomIn.hide();
			zoomOut.hide();
		}

		zoomIn.click(function () {
			canvasObject.setScale(1);
			jQuery(this).hide();
			zoomOut.show();
		});

		zoomOut.click(function () {
			canvasObject.setScale(scaleFactor);
			jQuery(this).hide();
			zoomIn.show();
		});

		jQuery('#addRect').click(function () {
			canvasObject.addArea(new areaRectClass(), '', '', '', '', 1, defaultAttributeSet);
			return false;
		});

		jQuery('#addPoly').click(function () {
			canvasObject.addArea(new areaPolyClass(), '', '', '', '', 1, defaultAttributeSet);
			return false;
		});

		jQuery('#addCirc').click(function () {
			canvasObject.addArea(new areaCircleClass(), '', '', '', '', 1, defaultAttributeSet);
			return false;
		});

		jQuery('#submit').click(function () {
			let field = checkReference();
			if (field) {
				$(field, parent.opener.document).val('<map>' + canvasObject.persistanceXML() + '</map>');
			}
			close();
		});

		jQuery('#canvas')
			.mousedown(function (e) {
				return canvasObject.mousedown(e);
			})
			.mouseup(function (e) {
			return canvasObject.mouseup(e);
		})
			.mousemove(function (e) {
			return canvasObject.mousemove(e);
		})
			.dblclick(function (e) {
			return canvasObject.dblclick(e);
		});

		function checkReference() {
			let selector = 'input[name="' + configuration.itemName + '"]';
			if (window.opener && window.opener.document && window.opener.document.querySelector(selector)) {
				return window.opener.document.querySelector(selector);
			} else {
				close();
			}
		};
	});
});
