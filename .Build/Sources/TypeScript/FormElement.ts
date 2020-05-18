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
import { AreaForm } from './AreaForm';
import { Preview } from './Preview';

class FormElement {
  protected hiddenInput: HTMLInputElement;

  protected formElement: HTMLDivElement;

  protected preview: Preview;

  constructor(fieldSelector: string) {
    this.initializeFormElement(fieldSelector);
    this.initializePreview();
    this.initializeEvents();
  }

  protected initializeFormElement(fieldSelector: string): void {
    this.hiddenInput = document.querySelector(fieldSelector);
    this.formElement = document.querySelector(fieldSelector + '-canvas');
  }

  protected initializePreview(): void {
    const image: JQuery = $(this.formElement).find('.image');
    ImagesLoaded(image as any, (): void => {
      setTimeout(
        (): void => {
          AreaForm.width = image.width();
          AreaForm.height = image.height();

          this.preview = new Preview(this.formElement.querySelector('#canvas'));
          this.renderAreas(this.hiddenInput.value);
        },
        100,
      );
    });
  }

  protected initializeEvents(): void {
    this.hiddenInput.addEventListener('imagemap:changed', this.fieldChangedHandler.bind(this));
  }

  protected fieldChangedHandler(event: Event): void {
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

  protected previewRerenderCallback(this: FormElement, e: ProgressEvent): void {
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

  protected renderAreas(areas: string): void {
    if (areas.length) {
      this.preview.renderAreas(JSON.parse(areas));
    }
  }
}

export = FormElement;
