define(['jquery', 'jquery-ui/sortable', 'jquery-ui/draggable', 'TYPO3/CMS/Imagemap/JsGraphics'], ($) => {
	$(document).ready(function () {
		let $control = $('.imagemap-control:eq(0)'),
			$canvas = $control.find('.canvas'),
			areaEditor = new previewCanvasClass();

		areaEditor.init($canvas.attr('id'));

		let initializeScaleFactor = (scaleFactor) => {
			areaEditor.setScale(scaleFactor);
		};

		let initializeAreas = (areas) => {
			areas.forEach((area) => {
				areaEditor.addArea(
					new window['area' + area.shape + 'Class'](),
					area.coords,
					area.alt,
					area.link,
					area.color,
					0
				);
			});
		};

		let initializeEvents = () => {
			$control.find('input').on('imagemap:changed', function () {
				let $field = $(this);
				$.ajax({
					url: window.TYPO3.settings.ajaxUrls['imagemap_preview_rerender'],
					method: 'POST',
					data: {
						P: {
							itemFormElName: $field.attr('name'),
							tableName: 'tt_content',
							fieldName: 'tx_imagemap_links',
							uid: $field.attr('name').replace('data[tt_content][', '').replace('][tx_imagemap_links]', ''),
							value: $field.val()
						}
					}
				}).done((data, textStatus) => {
					if (textStatus === 'success') {
						areaEditor.removeAreas();
						initializeAreas(data);
					}
				});
			});
		};

		initializeScaleFactor($canvas.data('thumbnail-scale'));
		initializeAreas($canvas.data('existing-areas'));
		initializeEvents();
	});
});
