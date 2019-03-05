define([
	'jquery',
	'TYPO3/CMS/Backend/Icons',
	'TYPO3/CMS/Backend/Modal',
	'./AreaEditor',
	'jquery-ui/draggable',
	'jquery-ui/resizable'
], ($, Icons, Modal, AreaEditor) => {
	'use strict';

	class EditControl {
		/**
		 * @type {jQuery}
		 */
		trigger = null;

		/**
		 * @type {jQuery}
		 */
		currentModal = null;

		/**
		 * @type {AreaEditor}
		 */
		areaEditor = null;

		constructor() {
			this.initializeTrigger();
		}

		initializeTrigger() {
			$('.t3js-area-wizard-trigger').off('click').on('click', this.triggerHandler.bind(this));
		}

		triggerHandler(event) {
			event.preventDefault();
			this.trigger = $(event.currentTarget);
			this.show();
		}

		show() {
			let modalTitle = this.trigger.data('modalTitle'),
				buttonAddrectText = this.trigger.data('buttonAddrectText'),
				buttonAddcircleText = this.trigger.data('buttonAddcircleText'),
				buttonAddpolyText = this.trigger.data('buttonAddpolyText'),
				buttonSubmitText = this.trigger.data('buttonSubmitText'),
				wizardUri = this.trigger.data('url'),
				payload = this.trigger.data('payload'),
				initWizardModal = this.init.bind(this);

			Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).done((icon) => {
				/**
				 * Open modal with areas to edit
				 */
				this.currentModal = Modal.advanced({
					additionalCssClasses: ['modal-area-wizard'],
					buttons: [
						{
							btnClass: 'btn-default pull-left',
							dataAttributes: {
								method: 'addRect',
							},
							icon: 'extensions-imagemap-rect',
							text: buttonAddrectText,
						},
						{
							btnClass: 'btn-default pull-left',
							dataAttributes: {
								method: 'addCircle',
							},
							icon: 'extensions-imagemap-circle',
							text: buttonAddcircleText,
						},
						{
							btnClass: 'btn-default pull-left',
							dataAttributes: {
								method: 'addPoly',
							},
							icon: 'extensions-imagemap-poly',
							text: buttonAddpolyText,
						},
						{
							btnClass: 'btn-primary',
							dataAttributes: {
								method: 'save',
							},
							icon: 'actions-document-save',
							text: buttonSubmitText,
						},
					],
					callback: (currentModal) => {
						$.post({
							url: wizardUri,
							data: payload
						}).done((response) => {
							currentModal.find('.t3js-modal-body').html(response);
							initWizardModal();
						});
					},
					content: $('<div class="modal-loading">').append(icon),
					size: Modal.sizes.full,
					style: Modal.styles.dark,
					title: modalTitle,
				});

				this.currentModal.on('hide.bs.modal', () => {
					this.destroy();
				});
				// do not dismiss the modal when clicking beside it to avoid data loss
				this.currentModal.data('bs.modal').options.backdrop = 'static';
			});
		}

		init() {
			let $image = $('.modal-panel-main .image img'),
				$canvas = $('.modal-panel-main .picture'),
				configuration = $canvas.data('configuration'),
				editorOptions = {
					canvas: {
						width: parseInt($image.css('width')),
						height: parseInt($image.css('height')),
						top: parseInt($image.css('height')) * -1,
					},
					browseLinkUrlAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_browselink_url
				};

			let areaEditor = new AreaEditor(editorOptions, 'modal-canvas', '#areasForm');

			this.areaEditor = areaEditor;

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
		}

		destroy() {
			if (this.currentModal) {
				this.currentModal = null;
				this.data = null;
			}
		}
	}

	return EditControl;
});
