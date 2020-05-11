/*
 * This file is developed by evoWeb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */

import * as $ from 'jquery';
import { Editor } from './Editor';
// @ts-ignore
import Icons = require('TYPO3/CMS/Backend/Icons');
// @ts-ignore
import Modal = require('TYPO3/CMS/Backend/Modal');
// @ts-ignore
import FormEngineValidation = require('TYPO3/CMS/Backend/FormEngineValidation');
// @ts-ignore
import ImagesLoaded = require('TYPO3/CMS/Core/Contrib/imagesloaded.pkgd.min');

class EditControl {
  private hiddenInput: HTMLInputElement;

  private formElement: HTMLDivElement;

  private trigger: JQuery;

  private currentModal: Modal;

  private editor: Editor;

  private buttonAddRect: JQuery;

  private buttonAddCircle: JQuery;

  private buttonAddPoly: JQuery;

  private buttonDismiss: JQuery;

  private buttonSave: JQuery;

  private editorImageSelector: string = '#t3js-editor-image';

  private formElementSelector: string = '#t3js-imagemap-container';

  private resizeTimeout: number = 450;

  constructor(fieldSelector: string) {
    this.initializeFormElement(fieldSelector);
    this.initializeTrigger();

    this.resizeEnd(this.resizeEditor.bind(this));
  }

  protected initializeFormElement(fieldSelector: string): void {
    this.hiddenInput = document.querySelector(fieldSelector);
  }

  protected initializeTrigger(): void {
    this.trigger = $('.t3js-area-wizard-trigger');
    this.trigger
      .off('click')
      .on('click', this.triggerHandler.bind(this));
  }

  protected triggerHandler(event: JQueryEventObject): void {
    event.preventDefault();
    this.show();
  }

  protected initializeAreaEditorModal(): void {
    const image: JQuery = this.currentModal.find(this.editorImageSelector);
    ImagesLoaded(image as any, (): void => {
      setTimeout(
        (): void => {
          this.init();
        },
        100,
      );
    });
  }

  protected show(): void {
    const modalTitle: string = this.trigger.data('modalTitle'),
      buttonAddRectangleText: string = this.trigger.data('buttonAddrectText'),
      buttonAddCircleText: string = this.trigger.data('buttonAddcircleText'),
      buttonAddPolygonText: string = this.trigger.data('buttonAddpolyText'),
      buttonDismissText: string = this.trigger.data('buttonDismissText'),
      buttonSaveText: string = this.trigger.data('buttonSaveText'),
      wizardUri: string = this.trigger.data('url'),
      payload: {arguments: string, signature: string} = this.trigger.data('payload'),
      initEditorModal: () => void = this.initializeAreaEditorModal.bind(this);

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
          let data = new FormData(),
            request = new XMLHttpRequest();

          data.append('arguments', payload.arguments);
          data.append('signature', payload.signature);

          request.open('POST', wizardUri);
          request.onreadystatechange = (e: ProgressEvent) => {
            let request = (e.target as XMLHttpRequest);
            if (request.readyState === 4 && request.status === 200) {
              currentModal.find('.t3js-modal-body').html(request.responseText).addClass('area-editor');
              initEditorModal();
            }
          };
          request.send(data);
        },
      });

      this.currentModal.on('hide.bs.modal', () => {
        this.destroy();
      });
      // do not dismiss the modal when clicking beside it to avoid data loss
      this.currentModal.data('bs.modal').options.backdrop = 'static';
    });
  }

  protected init(): void {
    this.formElement = this.currentModal.find(this.formElementSelector)[0];

    this.buttonAddRect = this.currentModal.find('.button-add-rect').off('click').on('click', this.buttonAddRectHandler.bind(this));
    this.buttonAddCircle = this.currentModal.find('.button-add-circle').off('click').on('click', this.buttonAddCircleHandler.bind(this));
    this.buttonAddPoly = this.currentModal.find('.button-add-poly').off('click').on('click', this.buttonAddPolyHandler.bind(this));
    this.buttonDismiss = this.currentModal.find('.button-dismiss').off('click').on('click', this.buttonDismissHandler.bind(this));
    this.buttonSave = this.currentModal.find('.button-save').off('click').on('click', this.buttonSaveHandler.bind(this));

    $([document, top.document]).on('mousedown.minicolors touchstart.minicolors', this.hideColorSwatch);

    this.initializeEditor();
    this.renderAreas(this.hiddenInput.value);
  }

  protected initializeEditor() {
    let image: HTMLImageElement = this.formElement.querySelector(this.editorImageSelector),
      configurations: EditorConfigurations = {
        canvas: {
          width: image.offsetWidth,
          height: image.offsetHeight,
          top: image.offsetHeight * -1,
        },
        formSelector: '[name="areasForm"]',
      },
      modalParent = image.parentNode,
      // document in which the browslink is able to set fields
      browselinkParent = window.document;

    while (modalParent.parentNode) {
      modalParent = modalParent.parentNode;
    }

    this.editor = new Editor(
      configurations,
      this.formElement.querySelector('#canvas'),
      (modalParent as Document),
      browselinkParent
    );
  }

  protected resizeEditor() {
    if (this.editor) {
      let image: HTMLImageElement = this.formElement.querySelector(this.editorImageSelector);
      this.editor.resize(image.offsetWidth, image.offsetHeight);
    }
  }

  protected renderAreas(areas: string) {
    if (areas.length) {
      this.editor.renderAreas(JSON.parse(areas));
    }
  }

  protected destroy() {
    if (this.currentModal) {
      this.editor.destroy();
      this.editor = null;
      this.currentModal = null;
    }
  }

  protected buttonAddRectHandler(event: JQueryEventObject) {
    event.stopPropagation();
    event.preventDefault();

    this.editor.renderAreas([{
      shape: 'rect',
      coords: {
        left: 0.4,
        top: 0.4,
        right: 0.4,
        bottom: 0.4
      },
    }]);
  }

  protected buttonAddCircleHandler(event: JQueryEventObject) {
    event.stopPropagation();
    event.preventDefault();

    this.editor.renderAreas([{
      shape: 'circle',
      coords: {
        left: 0.5,
        top: 0.5,
        radius: 0.2
      },
    }]);
  }

  protected buttonAddPolyHandler(event: JQueryEventObject) {
    event.stopPropagation();
    event.preventDefault();

    this.editor.renderAreas([{
      shape: 'poly',
      points: [
        {x: 0.5, y: 0.4},
        {x: 0.6, y: 0.6},
        {x: 0.5, y: 0.7},
        {x: 0.4, y: 0.6},
      ]
    }]);
  }

  protected buttonDismissHandler(event: JQueryEventObject) {
    event.stopPropagation();
    event.preventDefault();

    this.currentModal.modal('hide');
  }

  protected buttonSaveHandler(event: JQueryEventObject) {
    event.stopPropagation();
    event.preventDefault();

    let hiddenField = $(this.hiddenInput);
    this.hiddenInput.value = this.editor.getMapData();
    hiddenField.trigger('imagemap:changed');
    FormEngineValidation.markFieldAsChanged(hiddenField);
    this.currentModal.modal('hide');
  }

  protected hideColorSwatch(event: JQueryEventObject) {
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

  /**
   * Calls a function when the editor window has been resized
   */
  private resizeEnd(callback: () => void): void {
    let timer: number;
    $(window).on('resize', (): void => {
      clearTimeout(timer);
      timer = setTimeout(
        (): void => {
          callback();
        },
        this.resizeTimeout,
      );
    });
  }
}

export = EditControl;
