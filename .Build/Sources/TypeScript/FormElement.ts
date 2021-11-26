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

/// <reference types="../../types/index"/>

// @ts-ignore
import ImagesLoaded = require('imagesloaded');
import { Preview } from './Preview';

class FormElement {
  private hiddenInput: HTMLInputElement;

  private formElement: HTMLDivElement;

  private preview: Preview;

  private previewImageSelector: string = '.image';

  constructor(fieldSelector: string) {
    this.initializeFormElement(fieldSelector);
    this.waitForImageToBeLoaded();
    this.initializeEvents();
  }

  private initializeFormElement(fieldSelector: string): void {
    this.hiddenInput = document.querySelector(fieldSelector);
    this.formElement = document.querySelector(fieldSelector + '-canvas');
  }

  private waitForImageToBeLoaded(): void {
    const image: HTMLImageElement = this.formElement.querySelector(this.previewImageSelector);
    ImagesLoaded(image, (): void => {
      this.initializePreview(image);
      this.renderAreas(this.hiddenInput.value);
    });
  }

  private initializePreview(image: HTMLImageElement): void {
    let configurations: EditorConfiguration = {
      width: image.width,
      height: image.height
    };

    this.preview = new Preview(image.parentNode.querySelector('#canvas'), configurations);
  }

  private initializeEvents(): void {
    this.hiddenInput.addEventListener('imagemap:changed', this.fieldChangedHandler.bind(this));
  }

  private fieldChangedHandler(): void {
    this.preview.removeAreas();
    this.renderAreas(this.hiddenInput.value);
  }

  private renderAreas(value: string): void {
    if (value.length) {
      let areas = JSON.parse(value);
      if (areas !== undefined && areas.length) {
        this.preview.renderAreas(areas);
      }
    }
  }
}

export = FormElement;
