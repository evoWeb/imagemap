define([
	'jquery',
	'TYPO3/CMS/Imagemap/AreaEditor'
], ($, AreaEditor) => {
	$(document).ready(() => {
		let configuration = window.imagemap,
			$image = $('.image img'),
			$canvas = $('.picture'),
			editorOptions = {
				canvas: {
					width: parseInt($image.css('width')),
					height: parseInt($image.css('height')),
					top: parseInt($image.css('height')) * -1,
				},
				browseLinkUrlAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_browselink_url
			},
			areaEditor = new AreaEditor(editorOptions, 'canvas', '#areasForm');

		configuration.areaEditor = areaEditor;

		let initializeScaleFactor = (scaleFactor) => {
			let $magnify = $('#magnify'),
				$zoomOut = $magnify.find('.zoomout'),
				$zoomIn = $magnify.find('.zoomin');

			areaEditor.setScale();

			if (scaleFactor < 1) {
				$zoomIn.removeClass('hide');

				$zoomIn.click(() => {
					areaEditor.setScale(1);
					$zoomIn.hide();
					$zoomOut.show();
				});

				$zoomOut.click(() => {
					areaEditor.setScale(scaleFactor);
					$zoomOut.hide();
					$zoomIn.show();
				});
			}
		};

		let initializeEvents = () => {
			$('#addRect').on('click', () => {
				areaEditor.addRect({
					coords: (parseInt($image.css('width')) / 2 - 50) + ',' + (parseInt($image.css('height')) / 2 - 50)
						+ ',' + (parseInt($image.css('width')) / 2 + 50) + ',' + (parseInt($image.css('height')) / 2 + 50),
				});
			});

			$('#addCircle').on('click', () => {
				areaEditor.addCircle({
					coords: (parseInt($image.css('width')) / 2 - 50) + ',' + (parseInt($image.css('height')) / 2 - 50) + ',50',
				});
			});

			$('#addPoly').on('click', () => {
				areaEditor.addPoly({
					coords: (parseInt($image.css('width')) / 2) + ',' + (parseInt($image.css('height')) / 2 - 50)
						+ ',' + (parseInt($image.css('width')) / 2 + 50) + ',' + (parseInt($image.css('height')) / 2 + 50)
						+ ',' + (parseInt($image.css('width')) / 2) + ',' + (parseInt($image.css('height')) / 2 + 70)
						+ ',' + (parseInt($image.css('width')) / 2 - 50) + ',' + (parseInt($image.css('height')) / 2 + 50)
				});
			});

			$('#submit').on('click', () => {
				window.opener.$('input[name="' + configuration.itemName + '"]')
					.val(areaEditor.toAreaXml())
					.trigger('imagemap:changed');
				close();
			});
		};

		initializeScaleFactor($canvas.data('scale-factor'));
		initializeEvents();
		areaEditor.initializeAreas(configuration.existingAreas);
	});
});
