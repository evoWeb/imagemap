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

import { AreaPreview } from './AreaPreview';

class FormElement {
  protected hiddenInput: HTMLInputElement;

  protected formElement: HTMLDivElement;

  protected areaPreview: AreaPreview;

  constructor(fieldSelector: string) {
    this.initializeFormElement(fieldSelector);
    this.initializeAreaEditor();
    this.initializeEvents();
    this.renderAreas(this.hiddenInput.value);
  }

  protected initializeFormElement(fieldSelector: string) {
    this.hiddenInput = document.querySelector(fieldSelector);
    this.formElement = document.querySelector(fieldSelector + '-canvas');
  }

  protected initializeAreaEditor() {
    let image: HTMLImageElement = this.formElement.querySelector('.image'),
      configurations = {
        canvas: {
          width: image.offsetWidth,
          height: image.offsetHeight,
          top: image.offsetHeight * -1,
        },
      };

    this.areaPreview = new AreaPreview(configurations, this.formElement.querySelector('#canvas'));
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
    request.onreadystatechange = this.previewRerenderCallback.bind({
      request: request,
      formElement: this
    });
    request.send(data);
  }

  protected previewRerenderCallback(this: {request: XMLHttpRequest, formElement: FormElement}) {
    if (this.request.readyState === 4 && this.request.status === 200) {
      (this.formElement.formElement.querySelector('.modifiedState') as HTMLDivElement).style.display = 'block';
      this.formElement.areaPreview.removeAreas();

      let data = JSON.parse(this.request.responseText);
      if (data !== null && data.length) {
        this.formElement.areaPreview.renderAreas(data.areas);
      }
    }
  }

  protected renderAreas(areas: string) {
    if (areas.length) {
      this.areaPreview.renderAreas(JSON.parse(areas));
    }
  }
}

export = FormElement;
