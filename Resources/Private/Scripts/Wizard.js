define(['jquery', 'TYPO3/CMS/Imagemap/Imagemap', 'jquery-ui/sortable', 'jquery-ui/draggable'], function ($, Imagemap) {
	$(document).ready(function () {
		let configuration = window.imagemap,
			$image = $('#image img'),
			areaEditor = new Imagemap.AreaEditor('canvas', {
				width: parseInt($image.css('width')),
				height: parseInt($image.css('height')),
				top: parseInt($image.css('height')) * -1,
				form: 'areaForms'
			});

		configuration.areaEditor = areaEditor;

		let initializeScaleFactor = (scaleFactor) => {
			let $zoomOut = $('> .zout', '#magnify'),
				$zoomIn = $('> .zin', '#magnify');

			scaleFactor = areaEditor.initializeScaling(scaleFactor);
			areaEditor.setScale(scaleFactor);

			if (scaleFactor < 1) {
				$zoomIn.show();
				$zoomOut.hide();
			} else {
				$zoomIn.hide();
				$zoomOut.hide();
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
			areas.forEach((configuration) => {
				switch (configuration.shape) {
					case 'rect':
						areaEditor.addRect(configuration);
						break;

					case 'circle':
						areaEditor.addCircle(configuration);
						break;

					case 'poly':
						areaEditor.addPoly(configuration);
						break;
				}
			});
		};

		let initializeEvents = () => {
			$('#addRect').on('click', function () {
				areaEditor.addRect({
					color: '#ff0',
					coords: (parseInt($image.css('width')) / 2 - 50) + ',' + (parseInt($image.css('height')) / 2 - 50)
						+ ',' + (parseInt($image.css('width')) / 2 + 50) + ',' + (parseInt($image.css('height')) / 2 + 50),
				});
			});

			$('#addCircle').on('click', function () {
				areaEditor.addCircle({
					color: '#ff0',
					coords: (parseInt($image.css('width')) / 2 - 50) + ',' + (parseInt($image.css('height')) / 2 - 50) + ',50',
				});
			});

			$('#addPoly').on('click', function () {
				areaEditor.addPoly({
					color: '#ff0',
					coords: (parseInt($image.css('width')) / 2) + ',' + (parseInt($image.css('height')) / 2 - 50)
						+ ',' + (parseInt($image.css('width')) / 2 + 50) + ',' + (parseInt($image.css('height')) / 2 + 50)
						+ ',' + (parseInt($image.css('width')) / 2 - 50) + ',' + (parseInt($image.css('height')) / 2 + 50)
				});
			});

			$('#submit').on('click', function () {
				let $field = window.opener.$('input[name="' + configuration.itemName + '"]');
				$field
					.val('<map>' + areaEditor.persistanceXML() + '</map>')
					.trigger('imagemap:changed');
				close();
			});

			$('#canvas')
				.on('mousedown', areaEditor.mousedown.bind(areaEditor))
				.on('mouseup', areaEditor.mouseup.bind(areaEditor))
				.on('mousemove', areaEditor.mousemove.bind(areaEditor))
				.on('dblclick', areaEditor.dblclick.bind(areaEditor));
		};

		initializeScaleFactor(configuration.scaleFactor);
		initializeAreas(configuration.existingAreas);
		initializeEvents();
	});
});
