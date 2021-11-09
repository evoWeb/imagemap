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

// @ts-ignore
import ImagesLoaded = require('imagesloaded');
import { AreaForm } from './AreaForm';
import { Preview } from './Preview';

class FormElement {
  private hiddenInput: HTMLInputElement;

  private formElement: HTMLDivElement;

  private preview: Preview;

  constructor(fieldSelector: string) {
    this.initializeFormElement(fieldSelector);
    this.initializePreview();
    this.initializeEvents();
  }

  private initializeFormElement(fieldSelector: string): void {
    this.hiddenInput = document.querySelector(fieldSelector);
    this.formElement = document.querySelector(fieldSelector + '-canvas');
  }

  private initializePreview(): void {
    const image: HTMLImageElement = this.formElement.querySelector('.image');
    ImagesLoaded(image, (): void => {
      setTimeout(
        (): void => {
          AreaForm.width = image.width;
          AreaForm.height = image.height;

          this.preview = new Preview(this.formElement.querySelector('#canvas'));
          this.renderAreas(this.hiddenInput.value);
        },
        100,
      );
    });
  }

  private initializeEvents(): void {
    this.hiddenInput.addEventListener('imagemap:changed', this.fieldChangedHandler.bind(this));
  }

  private fieldChangedHandler(): void {
    this.preview.removeAreas();

    const image: HTMLImageElement = this.formElement.querySelector('.image');
    AreaForm.width = image.width;
    AreaForm.height = image.height;

    this.renderAreas(this.hiddenInput.value);
  }

  private renderAreas(areas: string): void {
    if (areas.length) {
      this.preview.renderAreas(JSON.parse(areas));
    }
  }
}

export = FormElement;
