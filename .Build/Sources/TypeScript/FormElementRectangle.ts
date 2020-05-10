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

import { FormElementAbstract } from './FormElementAbstract';

export class FormElementRectangle extends FormElementAbstract {
  protected name: string = 'rectangle';

  public updateFields() {
    this.getElement('.color').value = this.data.color;
    this.getElement('.alt').value = this.alt || '';
    this.getElement('.href').value = this.href || '';
    this.getElement('#left').value = Math.floor(this.left).toString();
    this.getElement('#top').value = Math.floor(this.top).toString();
    this.getElement('#right').value = Math.floor(this.left + this.getScaledWidth()).toString();
    this.getElement('#bottom').value = Math.floor(this.top + this.getScaledHeight()).toString();

    Object.entries(this.attributes).forEach((attribute) => {
      this.getElement('#' + attribute[0]).value = attribute[1] || '';
    });
  }

  protected updateCanvas(event: Event) {
    let field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = parseInt(field.value);

    switch (field.id) {
      case 'left':
        this.getElement('#right').value = value + this.getScaledWidth();
        this.set({left: value});
        break;

      case 'top':
        this.getElement('#bottom').value = value + this.getScaledHeight();
        this.set({top: value});
        break;

      case 'right':
        value -= this.left;
        if (value < 0) {
          value = 10;
          field.value = this.left + value;
        }
        this.set({width: value});
        break;

      case 'bottom':
        value -= this.top;
        if (value < 0) {
          value = 10;
          field.value = this.top + value;
        }
        this.set({height: value});
        break;
    }
    this.canvas.renderAll();
  }

  public getData(): object {
    return {
      ...this.attributes,
      coords: {
        left: Math.floor(this.left),
        top: Math.floor(this.top),
        right: Math.floor(this.left + this.getScaledWidth() - 1),
        bottom: Math.floor(this.top + this.getScaledHeight() - 1)
      },
    };
  }
}
