define([
	'jquery',
	'./AreaEditor'
], ($, AreaEditor) => {
	'use strict';

	class FormElement {
		/**
		 * @type {jQuery}
		 */
		control = null;

		/**
		 * @type {jQuery}
		 */
		image = null;

		/**
		 * @type {jQuery}
		 */
		canvas = null;

		/**
		 * @type {object}
		 */
		editorOptions = {};

		/**
		 * @type {AreaEditor}
		 */
		areaEditor = null;

		constructor() {
			this.control = $('.imagemap-control:eq(0)');
			this.image = this.control.find('.image img');
			this.canvas = this.control.find('.picture');

			this.initialize();
		}

		initialize() {
			this.editorOptions = {
				canvas: {
					width: parseInt(this.image.css('width')),
					height: parseInt(this.image.css('height')),
					top: parseInt(this.image.css('height')) * -1,
				},
				previewRerenderAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_preview_rerender
			};

			this.initializeAreaEditor(this.editorOptions);
			this.initializeEvents(this.editorOptions);
			this.initializeScaleFactor(this.canvas.data('thumbnail-scale'));
			this.initializeAreas(this.canvas.data('existing-areas'));
		}

		initializeAreaEditor(editorOptions) {
			this.areaEditor = new AreaEditor(editorOptions, this.control.find('#canvas')[0], '', window.document);
		}

		initializeScaleFactor(scaleFactor) {
			this.areaEditor.setScale(scaleFactor);
		}

		initializeEvents() {
			this.control.find('input[type=hidden]').on('imagemap:changed', this.imagemapChangedHandler.bind(this));
		}

		initializeAreas(areas) {
			this.areaEditor.initializeAreas(areas);
		}

		imagemapChangedHandler(event) {
			let $field = $(event.currentTarget);
			$.ajax({
				url: this.editorOptions.previewRerenderAjaxUrl,
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
					this.areaEditor.removeAllAreas();
					this.areaEditor.initializeAreas(data);
				}
			});
		}
	}

	return FormElement;
});
