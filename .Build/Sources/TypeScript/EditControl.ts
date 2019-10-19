/**
 * This file is developed by evoweb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */

import * as $ from 'jquery';
// @ts-ignore
import * as AreaEditor from './AreaEditor';
// @ts-ignore
import * as Icons from 'TYPO3/CMS/Backend/Icons';
// @ts-ignore
import * as Modal from 'TYPO3/CMS/Backend/Modal';
// @ts-ignore
import * as FormEngineValidation from 'TYPO3/CMS/Backend/FormEngineValidation';
// @ts-ignore
import * as ImagesLoaded from 'TYPO3/CMS/Core/Contrib/imagesloaded.pkgd.min';

class EditControl {
  private fieldSelector: string;

  private trigger: JQuery;

  private configuration: EditorConfiguration;

  private currentModal: Modal;

  private areaEditor: AreaEditor;

  private image: JQuery;

  private buttonAddRect: JQuery;

  private buttonAddCircle: JQuery;

  private buttonAddPoly: JQuery;

  private buttonDismiss: JQuery;

  private buttonSave: JQuery;

  constructor(fieldSelector: string) {
    this.fieldSelector = fieldSelector;
    this.initializeTrigger();
  }

  private initializeTrigger() {
    this.trigger = $('.t3js-area-wizard-trigger');
    this.trigger
      .off('click')
      .on('click', this.triggerHandler.bind(this));
  }

  private triggerHandler(event: JQueryEventObject) {
    event.preventDefault();
    this.openModal();
  }

  private openModal() {
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

    Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).done((icon: string) => {
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
        callback: (currentModal: JQuery) => {
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

  private initialize() {
    this.image = this.currentModal.find('img.image');
    this.buttonAddRect = this.currentModal.find('.button-add-rect').off('click').on('click', this.buttonAddRectHandler.bind(this));
    this.buttonAddCircle = this.currentModal.find('.button-add-circle').off('click').on('click', this.buttonAddCircleHandler.bind(this));
    this.buttonAddPoly = this.currentModal.find('.button-add-poly').off('click').on('click', this.buttonAddPolyHandler.bind(this));
    this.buttonDismiss = this.currentModal.find('.button-dismiss').off('click').on('click', this.buttonDismissHandler.bind(this));
    this.buttonSave = this.currentModal.find('.button-save').off('click').on('click', this.buttonSaveHandler.bind(this));

    $([document, top.document]).on('mousedown.minicolors touchstart.minicolors', this.hideColorSwatch);

    ImagesLoaded(this.image as any, (): void => {
      setTimeout(this.initializeArea.bind(this), 100);
    });
  }

  private initializeArea() {
    let width = parseInt(this.image.css('width')),
      height = parseInt(this.image.css('height')),
      editorOptions: EditorOptions = {
        canvas: {
          width: width,
          height: height,
          top: height * -1,
        },
        fauxFormDocument: window.document,
        browseLink: this.configuration.browseLink,
        browseLinkUrlAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_browselink_url,
        formSelector: '[name="areasForm"]',
        typo3Branch: this.trigger.data('typo3-branch'),
      };

    let canvas = this.currentModal.find('#modal-canvas')[0];
    this.areaEditor = new AreaEditor(editorOptions, canvas, '#areasForm', this.currentModal[0]);

    window.imagemap = { areaEditor: this.areaEditor };

    // @todo remove .areas to use all values
    let areas = jQuery(this.fieldSelector).eq(0).val();
    this.areaEditor.initializeAreas(JSON.parse(areas).areas);
  }

  private destroy() {
    if (this.currentModal) {
      this.currentModal = null;
      this.areaEditor.form.destroy();
      this.areaEditor = null;
    }
  }

  private buttonAddRectHandler(event: JQueryEventObject) {
    event.stopPropagation();
    event.preventDefault();

    let width = parseInt(this.image.css('width')),
      height = parseInt(this.image.css('height'));

    this.areaEditor.initializeAreas([{
      shape: 'rect',
      coords: {
        left: (width / 2 - 50),
        top: (height / 2 - 50),
        right: (width / 2 + 50),
        bottom: (height / 2 + 50)
      },
    }]);
  }

  private buttonAddCircleHandler(event: JQueryEventObject) {
    event.stopPropagation();
    event.preventDefault();

    let width = parseInt(this.image.css('width')),
      height = parseInt(this.image.css('height'));

    this.areaEditor.initializeAreas([{
      shape: 'circle',
      coords: {
        left: (width / 2),
        top: (height / 2),
        radius: 50
      },
    }]);
  }

  private buttonAddPolyHandler(event: JQueryEventObject) {
    event.stopPropagation();
    event.preventDefault();

    let width = parseInt(this.image.css('width')),
      height = parseInt(this.image.css('height'));

    this.areaEditor.initializeAreas([{
      shape: 'poly',
      coords: {
        points: [
          {x: (width / 2), y: (height / 2 - 50)},
          {x: (width / 2 + 50), y: (height / 2 + 50)},
          {x: (width / 2), y: (height / 2 + 70)},
          {x: (width / 2 - 50), y: (height / 2 + 50)},
        ]
      }
    }]);
  }

  private buttonDismissHandler(event: JQueryEventObject) {
    event.stopPropagation();
    event.preventDefault();

    this.currentModal.modal('hide');
  }

  private buttonSaveHandler(event: JQueryEventObject) {
    event.stopPropagation();
    event.preventDefault();

    const hiddenField = $(`input[name="${this.configuration.itemName}"]`);
    hiddenField.val(this.areaEditor.getMapData()).trigger('imagemap:changed');
    FormEngineValidation.markFieldAsChanged(hiddenField);
    this.currentModal.modal('hide');
  }

  private hideColorSwatch(event: JQueryEventObject) {
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

export = EditControl;
