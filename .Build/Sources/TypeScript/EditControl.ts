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

/// <reference types="../types/index"/>

import * as $ from 'jquery';
import AreaManipulation from './AreaManipulation';
// @ts-ignore
import * as Icons from 'TYPO3/CMS/Backend/Icons';
// @ts-ignore
import * as Modal from 'TYPO3/CMS/Backend/Modal';
// @ts-ignore
import * as FormEngineValidation from 'TYPO3/CMS/Backend/FormEngineValidation';

class EditControl {
  private areaManipulation: AreaManipulation;

  private configuration: EditorConfiguration;

  private currentModal: Modal;

  private button: JQuery;

  private image: JQuery;

  private buttonAddRect: JQuery;

  private buttonAddCircle: JQuery;

  private buttonAddPoly: JQuery;

  private buttonDismiss: JQuery;

  private buttonSave: JQuery;

  constructor() {
    this.button = $('.t3js-area-wizard-trigger');

    this.initialize();
  }

  private initialize() {
    this.initializeEvents();
  }

  private initializeEvents() {
    this.button
      .off('click')
      .on('click', this.areaWizardTriggerClickHandler.bind(this));
  }

  private areaWizardTriggerClickHandler(event: JQueryEventObject) {
    event.preventDefault();
    this.openModal();
  }

  private openModal() {
    Icons.getIcon(
      'spinner-circle',
      Icons.sizes.default,
      null,
      null,
      Icons.markupIdentifiers.inline
    ).done(this.iconLoaded.bind(this));
  }

  private iconLoaded(icon: string) {
    let modalTitle: string = this.button.data('modalTitle'),
      buttonAddRectangleText: string = this.button.data('buttonAddrectText'),
      buttonAddCircleText: string = this.button.data('buttonAddcircleText'),
      buttonAddPolygonText: string = this.button.data('buttonAddpolyText'),
      buttonDismissText: string = this.button.data('buttonDismissText'),
      buttonSaveText: string = this.button.data('buttonSaveText'),
      wizardUri: string = this.button.data('url'),
      payload: string = this.button.data('payload');

    /**
     * Open modal with areas to edit
     */
    this.currentModal = Modal.advanced({
      additionalCssClasses: ['modal-area-wizard modal-image-manipulation'],
      buttons: [
        {
          btnClass: 'btn-default pull-left',
          dataAttributes: {
            method: 'add-rectangle',
          },
          icon: 'extensions-imagemap-rect',
          text: buttonAddRectangleText,
        },
        {
          btnClass: 'btn-default pull-left',
          dataAttributes: {
            method: 'add-circle',
          },
          icon: 'extensions-imagemap-circle',
          text: buttonAddCircleText,
        },
        {
          btnClass: 'btn-default pull-left',
          dataAttributes: {
            method: 'add-polygon',
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
        this.currentModal = currentModal;

        $.post({
          url: wizardUri,
          data: payload
        }).done(this.modalLoaded.bind(this));
      },
    });

    this.currentModal.on('hide.bs.modal', () => {
      this.destruct();
    });
    // do not dismiss the modal when clicking beside it to avoid data loss
    this.currentModal.data('bs.modal').options.backdrop = 'static';
  }

  private modalLoaded(response: string) {
    this.currentModal
      .find('.t3js-modal-body')
      .html(response)
      .addClass('area-editor');
    this.initializeModal();
  }

  private initializeModal() {
    this.image = this.currentModal.find('.image img');
    this.configuration = this.currentModal.find('.image').data('configuration');
    this.buttonAddRect = this.currentModal.find('[data-method=rectangle]').off('click').on('click', this.buttonAddRectHandler.bind(this));
    this.buttonAddCircle = this.currentModal.find('[data-method=circle]').off('click').on('click', this.buttonAddCircleHandler.bind(this));
    this.buttonAddPoly = this.currentModal.find('[data-method=polygon]').off('click').on('click', this.buttonAddPolyHandler.bind(this));
    this.buttonDismiss = this.currentModal.find('[data-method=dismiss]').off('click').on('click', this.buttonDismissHandler.bind(this));
    this.buttonSave = this.currentModal.find('[data-method=save]').off('click').on('click', this.buttonSaveHandler.bind(this));

    $([document, top.document]).on('mousedown.minicolors touchstart.minicolors', this.hideColorSwatch);

    this.image.on('load', () => {
      AreaManipulation.wait(this.initializeAreaManipulation, 100);
    });
  }

  private initializeAreaManipulation() {
    this.areaManipulation = new AreaManipulation(
      this.currentModal[0],
      {
        canvas: {
          width: parseInt(this.image.css('width')),
          height: parseInt(this.image.css('height')),
        },
        fauxFormDocument: top.window.document,
        browseLinkUrlAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_browselink_url,
        browseLink: this.configuration.browseLink,
        formSelector: '#areasForm',
        canvasSelector: '#modal-canvas',
      }
    );
    this.areaManipulation.initializeAreas($('.picture').data('existingAreas'));
  }

  private destruct() {
    if (this.currentModal) {
      this.currentModal = null;
      this.areaManipulation.destruct();
      this.areaManipulation = null;
    }
  }

  private buttonAddRectHandler(event: JQueryEventObject) {
    event.stopPropagation();
    event.preventDefault();

    let width = parseInt(this.image.css('width')),
      height = parseInt(this.image.css('height'));

    this.areaManipulation.initializeAreas([{
      shape: 'rect',
      coords: (width / 2 - 50) + ',' + (height / 2 - 50) + ',' + (width / 2 + 50) + ',' + (height / 2 + 50),
    }]);
  }

  private buttonAddCircleHandler(event: JQueryEventObject) {
    event.stopPropagation();
    event.preventDefault();

    let width = parseInt(this.image.css('width')),
      height = parseInt(this.image.css('height'));

    this.areaManipulation.initializeAreas([{
      shape: 'circle',
      coords: (width / 2) + ',' + (height / 2) + ',50',
    }]);
  }

  private buttonAddPolyHandler(event: JQueryEventObject) {
    event.stopPropagation();
    event.preventDefault();

    let width = parseInt(this.image.css('width')),
      height = parseInt(this.image.css('height'));

    this.areaManipulation.initializeAreas([{
      shape: 'poly',
      coords: (width / 2) + ',' + (height / 2 - 50)
        + ',' + (width / 2 + 50) + ',' + (height / 2 + 50)
        + ',' + (width / 2) + ',' + (height / 2 + 70)
        + ',' + (width / 2 - 50) + ',' + (height / 2 + 50)
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

    const areasData = this.areaManipulation.getAreasData(),
      hiddenField = $(`input[name="${this.configuration.itemName}"]`);
    hiddenField.val(areasData).trigger('imagemap:changed');
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
