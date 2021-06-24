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
// @ts-ignore
import ImagesLoaded = require('TYPO3/CMS/Core/Contrib/imagesloaded.pkgd.min');
// @ts-ignore
import Icons = require('TYPO3/CMS/Backend/Icons');
// @ts-ignore
import Modal = require('TYPO3/CMS/Backend/Modal');
import { AreaForm } from './AreaForm';
import { Editor } from './Editor';

class EditControl {
  private hiddenInput: HTMLInputElement;

  private formElement: HTMLDivElement;

  private editor: Editor;

  private trigger: HTMLButtonElement;

  private currentModal: Modal;

  private buttonAddRectangle: HTMLButtonElement;

  private buttonAddCircle: HTMLButtonElement;

  private buttonAddPolygon: HTMLButtonElement;

  private buttonDismiss: HTMLButtonElement;

  private buttonSave: HTMLButtonElement;

  private editorImageSelector: string = '#t3js-editor-image';

  private formElementSelector: string = '#t3js-imagemap-container';

  private resizeTimeout: number = 450;

  constructor(fieldSelector: string) {
    this.initializeFormElement(fieldSelector);
    this.initializeTrigger();
    this.resizeEnd(this.resizeEditor.bind(this));
  }

  private initializeFormElement(fieldSelector: string): void {
    this.hiddenInput = document.querySelector(fieldSelector);
  }

  private initializeTrigger(): void {
    this.trigger = document.querySelector('.t3js-area-wizard-trigger');
    this.trigger.removeEventListener('click', this.triggerHandler);
    this.trigger.addEventListener('click', this.triggerHandler.bind(this));
  }

  private triggerHandler(event: MouseEvent): void {
    event.preventDefault();
    this.show();
  }

  private initializeAreaEditorModal(): void {
    const image: HTMLImageElement = this.currentModal[0].querySelector(this.editorImageSelector);
    ImagesLoaded(image, (): void => {
      setTimeout(
        (): void => {
          AreaForm.width = image.width;
          AreaForm.height = image.height;

          this.init();
        },
        100,
      );
    });
  }

  private show(): void {
    const modalTitle: string = this.trigger.dataset.modalTitle,
      buttonAddRectangleText: string = this.trigger.dataset.buttonAddrectText,
      buttonAddCircleText: string = this.trigger.dataset.buttonAddcircleText,
      buttonAddPolygonText: string = this.trigger.dataset.buttonAddpolyText,
      buttonDismissText: string = this.trigger.dataset.buttonDismissText,
      buttonSaveText: string = this.trigger.dataset.buttonSaveText,
      wizardUri: string = this.trigger.dataset.url,
      payload: {arguments: string, signature: string} = JSON.parse(this.trigger.dataset.payload),
      initEditorModal: () => void = this.initializeAreaEditorModal.bind(this);

    Icons.getIcon('spinner-circle', Icons.sizes.default, null, null, Icons.markupIdentifiers.inline).done((icon: string) => {
      let content = '<div class="modal-loading">' + icon + '</div>';

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
            icon: 'extensions-imagemap-rectangle',
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
            icon: 'extensions-imagemap-polygon',
            text: buttonAddPolygonText,
          },
          {
            btnClass: 'btn-default',
            dataAttributes: {
              method: 'dismiss',
            },
            icon: 'actions-close',
            text: buttonDismissText,
          },
          {
            btnClass: 'btn-primary',
            dataAttributes: {
              method: 'save',
            },
            icon: 'actions-document-save',
            text: buttonSaveText,
          },
        ],
        content: content,
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
              currentModal.find('.t3js-modal-body').html(request.responseText).addClass('imagemap-editor');
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

  private init(): void {
    let modal = this.currentModal[0];

    this.formElement = modal.querySelector(this.formElementSelector);

    this.buttonAddCircle = modal.querySelector('[data-method=circle]');
    this.buttonAddCircle.removeEventListener('click', this.buttonAddCircleHandler);
    this.buttonAddCircle.addEventListener('click', this.buttonAddCircleHandler.bind(this));

    this.buttonAddPolygon = modal.querySelector('[data-method=polygon]');
    this.buttonAddPolygon.removeEventListener('click', this.buttonAddPolygonHandler);
    this.buttonAddPolygon.addEventListener('click', this.buttonAddPolygonHandler.bind(this));

    this.buttonAddRectangle = modal.querySelector('[data-method=rectangle]');
    this.buttonAddRectangle.removeEventListener('click', this.buttonAddRectangleHandler);
    this.buttonAddRectangle.addEventListener('click', this.buttonAddRectangleHandler.bind(this));

    this.buttonDismiss = modal.querySelector('[data-method=dismiss]');
    this.buttonDismiss.removeEventListener('click', this.buttonDismissHandler);
    this.buttonDismiss.addEventListener('click', this.buttonDismissHandler.bind(this));

    this.buttonSave = modal.querySelector('[data-method=save]');
    this.buttonSave.removeEventListener('click', this.buttonSaveHandler);
    this.buttonSave.addEventListener('click', this.buttonSaveHandler.bind(this));

    $(top.document).on('mousedown.minicolors touchstart.minicolors', this.hideColorSwatch);

    this.initializeEditor();
    this.renderAreas(this.hiddenInput.value);
  }

  private initializeEditor(): void {
    let image: HTMLImageElement = this.formElement.querySelector(this.editorImageSelector),
      data: any = this.hiddenInput.dataset,
      configurations: EditorConfiguration = {
        formSelector: '#areasForm',
        tableName: data.tablename,
        fieldName: data.fieldname,
        uid: parseInt(data.uid),
        pid: parseInt(data.pid),
      },
      modalParent = image.parentNode;

    while (modalParent.parentNode) {
      modalParent = modalParent.parentNode;
    }

    this.editor = new Editor(
      configurations,
      this.formElement.querySelector('#canvas'),
      (modalParent as Document),
      // document in which the browslink is able to set fields
      window.document
    );
  }

  private resizeEditor(): void {
    if (this.editor) {
      let image: HTMLImageElement = this.formElement.querySelector(this.editorImageSelector);
      this.editor.resize(image.offsetWidth, image.offsetHeight);
    }
  }

  private renderAreas(areas: string): void {
    if (areas.length) {
      this.editor.renderAreas(JSON.parse(areas));
    }
  }

  private destroy(): void {
    if (this.currentModal) {
      this.editor.destroy();
      this.editor = null;
      this.currentModal = null;
    }
  }

  private buttonAddRectangleHandler(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.editor.renderAreas([{
      shape: 'rect',
      coords: {
        left: 0.3,
        top: 0.3,
        right: 0.7,
        bottom: 0.7
      },
    }]);
  }

  private buttonAddCircleHandler(event: MouseEvent): void {
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

  private buttonAddPolygonHandler(event: MouseEvent): void {
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

  private buttonDismissHandler(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.currentModal.modal('hide');
  }

  private buttonSaveHandler(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.hiddenInput.value = this.editor.getMapData();
    this.hiddenInput.dispatchEvent(new CustomEvent('imagemap:changed'));

    // without FormEngineValidation.markFieldAsChanged call
    EditControl.closest(this.hiddenInput, '.t3js-formengine-palette-field').classList.add('has-change');

    this.currentModal.modal('hide');
  }

  private hideColorSwatch(event: Event): void {
    let swatch = (event.target) as HTMLElement;
    if (!$(swatch).parents().add(swatch).hasClass('minicolors')) {
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
    window.addEventListener('resize', (): void => {
      clearTimeout(timer);
      timer = setTimeout(
        (): void => {
          callback();
        },
        this.resizeTimeout,
      );
    });
  }

  static closest(element: HTMLElement, selector: string): HTMLElement {
    let parent;
    // traverse parents
    while (element) {
      parent = element.parentElement;
      if (parent && parent.matches(selector)) {
        element = parent;
        break;
      }
      element = parent;
    }
    return element;
  }
}

export = EditControl;
