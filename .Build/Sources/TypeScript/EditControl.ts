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

// @todo remove if not needed import * as $ from 'jquery';
// @ts-ignore
import 'TYPO3/CMS/Core/Contrib/jquery.minicolors';
// @ts-ignore
import ImagesLoaded = require('imagesloaded');
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
    this.initializeModal();
  }

  private initializeModal(): void {
    Icons.getIcon(
      'spinner-circle',
      Icons.sizes.default,
      null,
      null,
      Icons.markupIdentifiers.inline
    ).then(this.createModal.bind(this));
  }

  private createModal(icon: string) {
    const wizardUri: string = this.trigger.dataset.url,
      payload: {arguments: string, signature: string} = JSON.parse(this.trigger.dataset.payload),
      modalLoading = document.createElement('div');

    modalLoading.innerHTML = icon;
    modalLoading.setAttribute('class', 'modal-loading');

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
          text: this.trigger.dataset.buttonAddrectText,
        },
        {
          btnClass: 'btn-default pull-left',
          dataAttributes: {
            method: 'circle',
          },
          icon: 'extensions-imagemap-circle',
          text: this.trigger.dataset.buttonAddcircleText,
        },
        {
          btnClass: 'btn-default pull-left',
          dataAttributes: {
            method: 'polygon',
          },
          icon: 'extensions-imagemap-polygon',
          text: this.trigger.dataset.buttonAddpolyText,
        },
        {
          btnClass: 'btn-default',
          dataAttributes: {
            method: 'dismiss',
          },
          icon: 'actions-close',
          text: this.trigger.dataset.buttonDismissText,
        },
        {
          btnClass: 'btn-primary',
          dataAttributes: {
            method: 'save',
          },
          icon: 'actions-document-save',
          text: this.trigger.dataset.buttonSaveText,
        },
      ],
      content: modalLoading,
      size: Modal.sizes.full,
      style: Modal.styles.dark,
      title: this.trigger.dataset.modalTitle,
      callback: () => {
        let data = new FormData();
        data.append('arguments', payload.arguments);
        data.append('signature', payload.signature);

        fetch(
          wizardUri,
          {
            method: 'POST',
            cache: 'no-cache',
            credentials: 'same-origin',
            body: data
          }
        )
          .then(async (response: Response): Promise<void> => {
            this.currentModal.find('.t3js-modal-body').html(await response.text()).addClass('imagemap-editor');
            this.currentModal.find('.modal-loading').remove();
            this.initializeAreaEditorModal();
          });
      },
    });

    this.currentModal.on('hide.bs.modal', () => {
      this.destroy();
    });
  }

  private initializeAreaEditorModal(): void {
    const image: HTMLImageElement = this.currentModal[0].querySelector(this.editorImageSelector);
    ImagesLoaded(image, (): void => {
      this.initializeEventHandler();
      this.initializeEditor(image);
      this.resizeEnd(this.resizeEditor.bind(this));
      this.renderAreas(this.hiddenInput.value);
    });
  }

  private initializeEventHandler(): void {
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
  }

  private initializeEditor(image: HTMLImageElement): void {
    let data: any = this.hiddenInput.dataset,
      configurations: EditorConfiguration = {
        formSelector: '#areasForm',
        tableName: data.tablename,
        fieldName: data.fieldname,
        uid: parseInt(data.uid),
        pid: parseInt(data.pid),
      };

    AreaForm.width = image.width;
    AreaForm.height = image.height;

    this.editor = new Editor(
      configurations,
      this.formElement.querySelector('#canvas'),
      this.getTopMostParentOfElement(image),
      window.document
    );
  }

  private getTopMostParentOfElement(modalParent: Node): Document {
    while (modalParent.parentNode) {
      modalParent = modalParent.parentNode;
    }
    return modalParent as Document;
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
      if (this.editor instanceof Editor) {
        this.editor.destroy();
      }
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

  /**
   * Calls a function when the editor window has been resized
   */
  private resizeEnd(callback: () => void): void {
    let timer: number;
    window.addEventListener('resize', (): void => {
      clearTimeout(timer);
      timer = setTimeout(callback, this.resizeTimeout);
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
