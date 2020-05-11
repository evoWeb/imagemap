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

import { Preview } from './Preview';

class FormElement {
  protected hiddenInput: HTMLInputElement;

  protected formElement: HTMLDivElement;

  protected preview: Preview;

  constructor(fieldSelector: string) {
    this.initializeFormElement(fieldSelector);
    this.initializePreview();
    this.initializeEvents();
    this.renderAreas(this.hiddenInput.value);
  }

  protected initializeFormElement(fieldSelector: string) {
    this.hiddenInput = document.querySelector(fieldSelector);
    this.formElement = document.querySelector(fieldSelector + '-canvas');
  }

  protected initializePreview() {
    let image: HTMLImageElement = this.formElement.querySelector('.image'),
      configurations: EditorConfigurations = {
        canvas: {
          width: image.offsetWidth,
          height: image.offsetHeight,
          top: image.offsetHeight * -1,
        },
      };

    this.preview = new Preview(
      configurations,
      this.formElement.querySelector('#canvas')
    );
  }

  protected initializeEvents() {
    this.hiddenInput.addEventListener('imagemap:changed', this.fieldChangedHandler.bind(this));
  }

  protected fieldChangedHandler(event: Event) {
    let field = (event.currentTarget as HTMLInputElement),
      data = new FormData(),
      request = new XMLHttpRequest();

    data.append('P[itemFormElName]', field.getAttribute('name'));
    data.append('P[tableName]', field.dataset.tablename);
    data.append('P[fieldName]', field.dataset.fieldname);
    data.append('P[uid]', field.dataset.uid);
    data.append('P[value]', field.value);

    request.open('POST', window.TYPO3.settings.ajaxUrls.imagemap_preview_rerender);
    request.onreadystatechange = this.previewRerenderCallback.bind(this);
    request.send(data);
  }

  protected previewRerenderCallback(this: FormElement, e: ProgressEvent) {
    let request = (e.target as XMLHttpRequest);
    if (request.readyState === 4 && request.status === 200) {
      (this.formElement.querySelector('.modifiedState') as HTMLDivElement).style.display = 'block';
      this.preview.removeAreas();

      let data = JSON.parse(request.responseText);
      if (data !== null && data.length) {
        this.preview.renderAreas(data.areas);
      }
    }
  }

  protected renderAreas(areas: string) {
    if (areas.length) {
      this.preview.renderAreas(JSON.parse(areas));
    }
  }
}

export = FormElement;
