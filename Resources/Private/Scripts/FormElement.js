define(['jquery', 'jquery-ui/sortable', 'jquery-ui/draggable', 'TYPO3/CMS/Imagemap/JsGraphics'], function (jQuery) {
	jQuery(document).ready(function () {
		let control = $('.imagemap-control:eq(0)'),
			canvas = control.find('.canvas:eq(0)'),
			existingAreas = canvas.data('existing-areas'),
			hiddenField = control.find('input').first(),

			canvasObject = new previewCanvasClass();
			canvasObject.init(canvas.attr('id'), canvas.data('thumbnail-scale'));

		existingAreas.forEach(function (configuration) {
			canvasObject.addArea(
				new window['area' + configuration.shape + 'Class'](),
				configuration.coords,
				configuration.alt,
				configuration.link,
				configuration.color,
				0
			);
		});

		hiddenField.on('change', function () {
			jQuery.ajax({
				url: TYPO3.settings.ajaxUrls['imagemap_tceform'],
				global: false,
				type: 'POST',
				data: {
					context: 'tceform',
					P: {
						itemFormElName: hiddenField.attr('name'),
						tableName: 'tt_content',
						fieldName: 'tx_imagemap_links',
						uid: 'uid',
						value: hiddenField.val()
					}
				}
			}).done(function (data, textStatus) {
				if (textStatus === 'success') {
					canvas.html(data);
				}
			});
		});
	});
});
