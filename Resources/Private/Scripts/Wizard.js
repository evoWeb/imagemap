define(['jquery', 'TYPO3/CMS/Imagemap/Imagemap', 'jquery-ui/sortable', 'jquery-ui/draggable'], function ($, Imagemap) {
	$(document).ready(function () {
		let configuration = window.imagemap,
			defaultAttributeSet = configuration.defaultAttributeset,
			areaEditor = new Imagemap.AreaEditor('canvas', 'picture', 'areaForms');

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
				let {left, top, width, height} = configuration.coords.split(',');
				let area = new Imagemap[configuration.shape]({
					...configuration,
					originX: 'left',
					originY: 'top',
					top: top,
					left: left,
					width: width,
					height: height,
					fill: configuration.color,
				});
				areaEditor.add(area);
			});
		};

		let initializeEvents = () => {
			let addArea = (shape) => {
				areaEditor.add(new Imagemap[shape](), '', '', '', '', 1, defaultAttributeSet);
			};

			$('#addRect').on('click', function () {
				addArea('Rect');
			});

			$('#addPoly').on('click', function () {
				addArea('Poly');
			});

			$('#addCircle').on('click', function () {
				addArea('Circle');
			});

			$('#submit').on('click', function () {
				let $field = window.opener.$('input[name="' + configuration.itemName + '"]');
				$field
					.val('<map>' + areaEditor.persistanceXML() + '</map>')
					.trigger('imagemap:changed');
				close();
			});

			/*$('#canvas')
				.on('mousedown', areaEditor.mousedown.bind(areaEditor))
				.on('mouseup', areaEditor.mouseup.bind(areaEditor))
				.on('mousemove', areaEditor.mousemove.bind(areaEditor))
				.on('dblclick', areaEditor.dblclick.bind(areaEditor));*/
		};

		initializeScaleFactor(configuration.scaleFactor);
		initializeAreas(configuration.existingAreas);
		initializeEvents();
	});
});
