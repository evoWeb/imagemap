define([
	'jquery',
	'TYPO3/CMS/Imagemap/AreaEditor',
	'jquery-ui/sortable',
	'jquery-ui/draggable'
], ($, AreaEditor) => {
	$(document).ready(() => {
		let configuration = window.imagemap,
			$image = $('.image img'),
			editorOptions = {
				canvas: {
					width: parseInt($image.css('width')),
					height: parseInt($image.css('height')),
					top: parseInt($image.css('height')) * -1,
				}
			},
			areaEditor = new AreaEditor(editorOptions, 'canvas', '#areasForm');

		configuration.areaEditor = areaEditor;

		let initializeScaleFactor = () => {
			let $magnify = $('#magnify'),
				$zoomOut = $magnify.find('.zoomout'),
				$zoomIn = $magnify.find('.zoomin'),
				scaleFactor = areaEditor.initializeScaling($magnify.data('scale-factor'));

			areaEditor.setScale(scaleFactor);

			if (scaleFactor < 1) {
				$zoomIn.removeClass('hide');
				$zoomOut.addClass('hide');
			} else {
				$zoomIn.addClass('hide');
				$zoomOut.addClass('hide');
			}

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
		};

		let initializeAreas = (areas) => {
			console.log(areas);
			areas.forEach((area) => {
				switch (area.shape) {
					case 'rect':
						areaEditor.addRect(area);
						break;

					case 'circle':
						areaEditor.addCircle(area);
						break;

					case 'poly':
						areaEditor.addPoly(area);
						break;
				}
			});
		};

		let initializeEvents = () => {
			$('#addRect').on('click', function () {
				areaEditor.addRect({
					coords: (parseInt($image.css('width')) / 2 - 50) + ',' + (parseInt($image.css('height')) / 2 - 50)
						+ ',' + (parseInt($image.css('width')) / 2 + 50) + ',' + (parseInt($image.css('height')) / 2 + 50),
				});
			});

			$('#addCircle').on('click', function () {
				areaEditor.addCircle({
					coords: (parseInt($image.css('width')) / 2 - 50) + ',' + (parseInt($image.css('height')) / 2 - 50) + ',50',
				});
			});

			$('#addPoly').on('click', function () {
				areaEditor.addPoly({
					coords: (parseInt($image.css('width')) / 2) + ',' + (parseInt($image.css('height')) / 2 - 50)
						+ ',' + (parseInt($image.css('width')) / 2 + 50) + ',' + (parseInt($image.css('height')) / 2 + 50)
						+ ',' + (parseInt($image.css('width')) / 2) + ',' + (parseInt($image.css('height')) / 2 + 70)
						+ ',' + (parseInt($image.css('width')) / 2 - 50) + ',' + (parseInt($image.css('height')) / 2 + 50)
				});
			});

			$('#submit').on('click', function () {
				window.opener.$('input[name="' + configuration.itemName + '"]')
					.val(areaEditor.toAreaXml())
					.trigger('imagemap:changed');
				close();
			});
		};

		initializeScaleFactor();
		initializeAreas(configuration.existingAreas);
		initializeEvents();
	});
});
