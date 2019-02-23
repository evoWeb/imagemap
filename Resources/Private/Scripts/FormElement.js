define(['jquery', 'jquery-ui/sortable', 'jquery-ui/draggable', 'TYPO3/CMS/Imagemap/JsGraphics'], ($) => {
	$(document).ready(function () {
		let $control = $('.imagemap-control:eq(0)'),
			$canvas = $control.find('.canvas'),
			canvasObject = new previewCanvasClass();

		canvasObject.init($canvas.attr('id'), $canvas.data('thumbnail-scale'));

		$canvas.data('existing-areas').forEach((configuration) => {
			canvasObject.addArea(
				new window['area' + configuration.shape + 'Class'](),
				configuration.coords,
				configuration.alt,
				configuration.link,
				configuration.color,
				0
			);
		});

		$control.find('input').on('imagemap:changed', function () {
			let $field = $(this);
			$.ajax({
				url: TYPO3.settings.ajaxUrls['imagemap_tceform'],
				global: false,
				type: 'POST',
				data: {
					context: 'tceform',
					P: {
						itemFormElName: $field.attr('name'),
						tableName: 'tt_content',
						fieldName: 'tx_imagemap_links',
						uid: 'uid',
						value: $field.val()
					}
				}
			}).done((data, textStatus) => {
				if (textStatus === 'success') {
					$canvas.html(data);
				}
			});
		});
	});
});
