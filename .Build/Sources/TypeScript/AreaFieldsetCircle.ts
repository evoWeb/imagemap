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

import { AreaFieldsetAbstract } from './AreaFieldsetAbstract';

export class AreaFieldsetCircle extends AreaFieldsetAbstract {
  protected name: string = 'circle';

  protected updateFields() {
    for (let attributeKey in this.attributes) {
      if (!this.attributes.hasOwnProperty(attributeKey)) {
        continue;
      }
      let attributeValue = this.attributes[attributeKey] || '',
        element = this.getElement('.' + attributeKey);

      if (element !== null) {
        if (typeof attributeValue === 'number') {
          attributeValue = attributeValue.toString();
        }
        element.value = attributeValue;
      }
    }

    for (let coordinatesKey in this.attributes.coords) {
      if (!this.attributes.coords.hasOwnProperty(coordinatesKey)) {
        continue;
      }
      let coordinatesValue = this.attributes.coords[coordinatesKey] || '',
        element = this.getElement('.' + coordinatesKey);

      if (['left', 'radius'].indexOf(coordinatesKey)) {
        coordinatesValue = Math.round(coordinatesValue * this.form.editor.width);
      } else if (['top'].indexOf(coordinatesKey)) {
        coordinatesValue = Math.round(coordinatesValue * this.form.editor.height);
      }

      if (element !== null) {
        if (typeof coordinatesValue === 'number') {
          coordinatesValue = coordinatesValue.toString();
        }
        element.value = coordinatesValue;
      }
    }
  }

  protected updateCanvas(event: Event) {
    let field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = parseInt(field.value);

    switch (field.id) {
      case 'left':
        this.attributes.coords.left = value / this.form.editor.width;
        this.shape.set({left: value});
        break;

      case 'top':
        this.attributes.coords.top = value / this.form.editor.height;
        this.shape.set({top: value});
        break;

      case 'radius':
        this.attributes.coords.top = value / this.form.editor.width;
        this.shape.set({radius: value});
        break;
    }
    this.canvas.renderAll();
  }
}
