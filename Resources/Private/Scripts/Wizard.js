define(['jquery', 'TYPO3/CMS/Imagemap/AreaEditor', 'jquery-ui/sortable', 'jquery-ui/draggable'], function ($, AreaEditor) {
	$(document).ready(function () {
		let configuration = window.imagemap,
			defaultAttributeSet = configuration.defaultAttributeset,
			scaleFactor = configuration.scaleFactor,
			$zoomOut = $('> .zout', '#magnify'),
			$zoomIn = $('> .zin', '#magnify'),
			areaEditor = new AreaEditor('canvas', 'picture', 'areaForms');

		scaleFactor = areaEditor.initializeScaling(scaleFactor);
		areaEditor.setScale(scaleFactor);
		configuration.areaEditor = areaEditor;

		configuration.existingAreas.forEach((configuration) => {
			let {left, top, width, height} = configuration.coords.split(',');
			let area = new window.fabric[configuration.shape]({
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

		if (scaleFactor < 1) {
			$zoomOut.hide();
		} else {
			$zoomIn.hide();
			$zoomOut.hide();
		}

		$zoomIn.click(function () {
			areaEditor.setScale(1);
			$(this).hide();
			$zoomOut.show();
		});

		$zoomOut.click(function () {
			areaEditor.setScale(scaleFactor);
			$(this).hide();
			$zoomIn.show();
		});

		function addArea (shape) {
			areaEditor.add(new window['area' + shape + 'Class'](), '', '', '', '', 1, defaultAttributeSet);
		}

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

		$('#canvas')
			.on('mousedown', areaEditor.mousedown.bind(areaEditor))
			.on('mouseup', areaEditor.mouseup.bind(areaEditor))
			.on('mousemove', areaEditor.mousemove.bind(areaEditor))
			.on('dblclick', areaEditor.dblclick.bind(areaEditor));
	});
});
