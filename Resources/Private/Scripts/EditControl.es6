define([
	'jquery',
	'TYPO3/CMS/Backend/Icons',
	'TYPO3/CMS/Backend/Modal',
	'./AreaEditor',
	'TYPO3/CMS/Backend/FormEngineValidation'
], ($, Icons, Modal, AreaEditor, FormEngineValidation) => {
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

		/**
		 * @type {jQuery}
		 */
		image = null;

		/**
		 * @type {jQuery}
		 */
		buttonAddRect = null;

		/**
		 * @type {jQuery}
		 */
		buttonAddCircle = null;

		/**
		 * @type {jQuery}
		 */
		buttonAddPoly = null;

		/**
		 * @type {jQuery}
		 */
		buttonDismiss = null;

		/**
		 * @type {jQuery}
		 */
		buttonSave = null;

		/**
		 * @type {object}
		 */
		configuration = null;

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
				buttonDismissText = this.trigger.data('buttonDismissText'),
				buttonSaveText = this.trigger.data('buttonSaveText'),
				wizardUri = this.trigger.data('url'),
				payload = this.trigger.data('payload'),
				initWizardModal = this.initialize.bind(this);

			Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).done((icon) => {
				/**
				 * Open modal with areas to edit
				 */
				this.currentModal = Modal.advanced({
					additionalCssClasses: ['modal-area-wizard'],
					buttons: [
						{
							btnClass: 'btn-default pull-left button-add-rect',
							icon: 'extensions-imagemap-rect',
							text: buttonAddrectText,
						},
						{
							btnClass: 'btn-default pull-left button-add-circle',
							icon: 'extensions-imagemap-circle',
							text: buttonAddcircleText,
						},
						{
							btnClass: 'btn-default pull-left button-add-poly',
							icon: 'extensions-imagemap-poly',
							text: buttonAddpolyText,
						},
						{
							btnClass: 'btn-default button-dismiss',
							icon: 'actions-close',
							text: buttonDismissText,
						},
						{
							btnClass: 'btn-primary button-save',
							icon: 'actions-document-save',
							text: buttonSaveText,
						},
					],
					callback: (currentModal) => {
						$.post({
							url: wizardUri,
							data: payload
						}).done((response) => {
							currentModal.find('.t3js-modal-body').html(response).addClass('area-editor');
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

		initialize() {
			this.image = this.currentModal.find('.image img');
			this.configuration = this.currentModal.find('.picture').data('configuration');
			this.buttonAddRect = this.currentModal.find('.button-add-rect').off('click').on('click', this.buttonAddRectHandler.bind(this));
			this.buttonAddCircle = this.currentModal.find('.button-add-circle').off('click').on('click', this.buttonAddCircleHandler.bind(this));
			this.buttonAddPoly = this.currentModal.find('.button-add-poly').off('click').on('click', this.buttonAddPolyHandler.bind(this));
			this.buttonDismiss = this.currentModal.find('.button-dismiss').off('click').on('click', this.buttonDismissHandler.bind(this));
			this.buttonSave = this.currentModal.find('.button-save').off('click').on('click', this.buttonSaveHandler.bind(this));

			$([document, top.document]).on('mousedown.minicolors touchstart.minicolors', this.hideColorSwatch);

			this.image.on('load', () => {
				setTimeout(this.initializeArea.bind(this), 100);
			});
		}

		initializeArea() {
			let scaleFactor = this.currentModal.find('.picture').data('scale-factor'),
				width = parseInt(this.image.css('width')),
				height = parseInt(this.image.css('height')),
				editorOptions = {
					fauxFormDocument: document,
					canvas: {
						width: width,
						height: height,
						top: height * -1,
					},
					browseLinkUrlAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_browselink_url,
					browseLink: this.configuration.browseLink
				};

			let canvas = this.currentModal.find('#modal-canvas')[0];
			this.areaEditor = new AreaEditor(editorOptions, canvas, '#areasForm', this.currentModal[0]);

			window.imagemap = { areaEditor: this.areaEditor };

			((scaleFactor) => {
				this.areaEditor.setScale(scaleFactor);

				let that = this,
					$magnify = $('#magnify'),
					$zoomOut = $magnify.find('.zoomout'),
					$zoomIn = $magnify.find('.zoomin');

				if (scaleFactor < 1) {
					$zoomIn.removeClass('hide');

					$zoomIn.click(() => {
						that.areaEditor.setScale(1);
						$zoomIn.hide();
						$zoomOut.show();
					});

					$zoomOut.click(() => {
						that.areaEditor.setScale(scaleFactor);
						$zoomOut.hide();
						$zoomIn.show();
					});
				}
			})(scaleFactor);

			this.areaEditor.initializeAreas(this.configuration.existingAreas);
		}

		destroy() {
			if (this.currentModal) {
				this.currentModal = null;
				this.areaEditor.form.destroy();
				this.areaEditor = null;
			}
		}

		buttonAddRectHandler(event) {
			event.stopPropagation();
			event.preventDefault();

			let width = parseInt(this.image.css('width')),
				height = parseInt(this.image.css('height'));

			this.areaEditor.addRect({
				coords: (width / 2 - 50) + ',' + (height / 2 - 50) + ',' + (width / 2 + 50) + ',' + (height / 2 + 50),
			});
		}

		buttonAddCircleHandler(event) {
			event.stopPropagation();
			event.preventDefault();

			let width = parseInt(this.image.css('width')),
				height = parseInt(this.image.css('height'));

			this.areaEditor.addCircle({
				coords: (width / 2) + ',' + (height / 2) + ',50',
			});
		}

		buttonAddPolyHandler(event) {
			event.stopPropagation();
			event.preventDefault();

			let width = parseInt(this.image.css('width')),
				height = parseInt(this.image.css('height'));

			this.areaEditor.addPoly({
				coords: (width / 2) + ',' + (height / 2 - 50)
					+ ',' + (width / 2 + 50) + ',' + (height / 2 + 50)
					+ ',' + (width / 2) + ',' + (height / 2 + 70)
					+ ',' + (width / 2 - 50) + ',' + (height / 2 + 50)
			});
		}

		buttonDismissHandler(event) {
			event.stopPropagation();
			event.preventDefault();

			this.currentModal.modal('hide');
		}

		buttonSaveHandler(event) {
			event.stopPropagation();
			event.preventDefault();

			const hiddenField = $(`input[name="${this.configuration.itemName}"]`);
			hiddenField.val(this.areaEditor.toAreaXml()).trigger('imagemap:changed');
			FormEngineValidation.markFieldAsChanged(hiddenField);
			this.currentModal.modal('hide');
		}

		hideColorSwatch(event) {
			if (!$(event.target).parents().add(event.target).hasClass('minicolors')) {
				// Hides all dropdown panels
				top.window.$('.minicolors-focus').each(() => {
					let minicolors = $(this),
						input = minicolors.find('.minicolors-input'),
						panel = minicolors.find('.minicolors-panel'),
						settings = input.data('minicolors-settings');

					panel.fadeOut(settings.hideSpeed, () => {
						if( settings.hide ) settings.hide.call(input.get(0));
						minicolors.removeClass('minicolors-focus');
					});
				});
			}
		}
	}

	return EditControl;
});
