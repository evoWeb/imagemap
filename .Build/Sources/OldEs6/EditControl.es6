define([
  'jquery',
  './AreaEditor',
  'TYPO3/CMS/Backend/Icons',
  'TYPO3/CMS/Backend/Modal',
  'TYPO3/CMS/Backend/FormEngineValidation'
], ($, AreaEditor, Icons, Modal, FormEngineValidation) => {
  'use strict';

  class EditControl {
    /**
     * @type {string}
     */
    fieldSelector = '';

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
    configuration = {
      existingAreas: null
    };

    constructor(fieldSelector) {
      this.fieldSelector = fieldSelector;
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
        buttonAddRectangleText = this.trigger.data('buttonAddrectText'),
        buttonAddCircleText = this.trigger.data('buttonAddcircleText'),
        buttonAddPolygonText = this.trigger.data('buttonAddpolyText'),
        buttonDismissText = this.trigger.data('buttonDismissText'),
        buttonSaveText = this.trigger.data('buttonSaveText'),
        wizardUri = this.trigger.data('url'),
        payload = this.trigger.data('payload'),
        initWizardModal = this.initialize.bind(this);

      this.configuration = this.trigger.data('configuration');

      Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).done((icon) => {
        /**
         * Open modal with areas to edit
         */
        this.currentModal = Modal.advanced({
          additionalCssClasses: ['modal-area-wizard modal-image-manipulation'],
          buttons: [
            {
              btnClass: 'btn-default pull-left',
              dataAttributes: {
                method: 'rectangle',
              },
              icon: 'extensions-imagemap-rect',
              text: buttonAddRectangleText,
            },
            {
              btnClass: 'btn-default pull-left',
              dataAttributes: {
                method: 'circle',
              },
              icon: 'extensions-imagemap-circle',
              text: buttonAddCircleText,
            },
            {
              btnClass: 'btn-default pull-left',
              dataAttributes: {
                method: 'polygon',
              },
              icon: 'extensions-imagemap-poly',
              text: buttonAddPolygonText,
            },
            {
              btnClass: 'btn-default button-dismiss',
              dataAttributes: {
                method: 'dismiss',
              },
              icon: 'actions-close',
              text: buttonDismissText,
            },
            {
              btnClass: 'btn-primary button-save',
              dataAttributes: {
                method: 'save',
              },
              icon: 'actions-document-save',
              text: buttonSaveText,
            },
          ],
          content: $('<div class="modal-loading">').append(icon),
          size: Modal.sizes.full,
          style: Modal.styles.dark,
          title: modalTitle,
          callback: (currentModal) => {
            $.post({
              url: wizardUri,
              data: payload
            }).done((response) => {
              currentModal.find('.t3js-modal-body').html(response).addClass('area-editor');
              initWizardModal();
            });
          },
        });

        this.currentModal.on('hide.bs.modal', () => {
          this.destroy();
        });
        // do not dismiss the modal when clicking beside it to avoid data loss
        this.currentModal.data('bs.modal').options.backdrop = 'static';
      });
    }

    initialize() {
      this.image = this.currentModal.find('img.image');
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
      let width = parseInt(this.image.css('width')),
        height = parseInt(this.image.css('height')),
        editorOptions = {
          canvas: {
            width: width,
            height: height,
            top: height * -1,
          },
          fauxFormDocument: window.document,
          browseLink: this.configuration.browseLink,
          browseLinkUrlAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_browselink_url,
          formSelector: '[name="areasForm"]',
        };

      let canvas = this.currentModal.find('#modal-canvas')[0];
      this.areaEditor = new AreaEditor(editorOptions, canvas, '#areasForm', this.currentModal[0]);

      window.imagemap = {areaEditor: this.areaEditor};

      // @todo remove .areas to use all values
      let areas = jQuery(this.fieldSelector).eq(0).val();
      this.areaEditor.initializeAreas(JSON.parse(areas).areas);
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

      this.areaEditor.initializeAreas([{
        shape: 'rect',
        coords: (width / 2 - 50) + ',' + (height / 2 - 50) + ',' + (width / 2 + 50) + ',' + (height / 2 + 50),
      }]);
    }

    buttonAddCircleHandler(event) {
      event.stopPropagation();
      event.preventDefault();

      let width = parseInt(this.image.css('width')),
        height = parseInt(this.image.css('height'));

      this.areaEditor.initializeAreas([{
        shape: 'circle',
        coords: (width / 2) + ',' + (height / 2) + ',50',
      }]);
    }

    buttonAddPolyHandler(event) {
      event.stopPropagation();
      event.preventDefault();

      let width = parseInt(this.image.css('width')),
        height = parseInt(this.image.css('height'));

      this.areaEditor.initializeAreas([{
        shape: 'poly',
        coords: (width / 2) + ',' + (height / 2 - 50)
          + ',' + (width / 2 + 50) + ',' + (height / 2 + 50)
          + ',' + (width / 2) + ',' + (height / 2 + 70)
          + ',' + (width / 2 - 50) + ',' + (height / 2 + 50)
      }]);
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
      hiddenField.val(this.areaEditor.getMapData()).trigger('imagemap:changed');
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
            if (settings.hide) settings.hide.call(input.get(0));
            minicolors.removeClass('minicolors-focus');
          });
        });
      }
    }
  }

  return EditControl;
});
