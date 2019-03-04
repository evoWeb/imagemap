define([
	'jquery',
	'TYPO3/CMS/Imagemap/AreaEditor'
], ($, AreaEditor) => {
	$(document).ready(() => {
		let $control = $('.imagemap-control:eq(0)'),
			$image = $control.find('.image img'),
			$canvas = $control.find('.picture'),
			editorOptions = {
				canvas: {
					width: parseInt($image.css('width')),
					height: parseInt($image.css('height')),
					top: parseInt($image.css('height')) * -1,
				}
			},
			areaEditor = new AreaEditor(editorOptions, 'canvas');

		let initializeScaleFactor = (scaleFactor) => {
			areaEditor.setScale(scaleFactor);
		};

		let initializeEvents = () => {
			$control.find('input[type=hidden]').on('imagemap:changed', () => {
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
						areaEditor.removeAllAreas();
						areaEditor.initializeAreas(data);
					}
				});
			});
		};

		initializeScaleFactor($canvas.data('thumbnail-scale'));
		initializeEvents();
		areaEditor.initializeAreas($canvas.data('existing-areas'));
	});
});
