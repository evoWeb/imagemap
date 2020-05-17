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

export class AreaFieldsetRectangle extends AreaFieldsetAbstract {
  readonly name: string = 'rectangle';

  protected updateFields(): void {
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

      if (['left', 'right'].indexOf(coordinatesKey) > -1) {
        coordinatesValue = this.outputX(coordinatesValue);
      } else if (['top', 'bottom'].indexOf(coordinatesKey) > -1) {
        coordinatesValue = this.outputY(coordinatesValue);
      }

      if (element !== null) {
        element.value = coordinatesValue;
      }
    }
  }

  protected shapeMoved(event: FabricEvent): void {
    console.log(event);
  }

  protected moveShape(event: Event): void {
    let field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = parseInt(field.value);

    switch (field.dataset.field) {
      case 'left':
        this.attributes.coords.left = this.inputX(value);
        this.attributes.coords.right = this.inputX(value + this.shape.getScaledWidth());
        this.getElement('#right').value = value + this.shape.getScaledWidth();
        this.shape.set({left: value});
        break;

      case 'top':
        this.attributes.coords.top = this.inputY(value);
        this.attributes.coords.bottom = this.inputY(value + this.shape.getScaledHeight());
        this.getElement('#bottom').value = value + this.shape.getScaledHeight();
        this.shape.set({top: value});
        break;

      case 'right':
        this.attributes.coords.right = this.inputX(value);
        value -= this.shape.left;
        if (value < 0) {
          value = 10;
          field.value = this.left + value;
        }
        this.shape.set({width: value});
        break;

      case 'bottom':
        this.attributes.coords.bottom = this.inputY(value);
        value -= this.shape.top;
        if (value < 0) {
          value = 10;
          field.value = this.top + value;
        }
        this.shape.set({height: value});
        break;
    }

    this.shape.canvas.renderAll();
  }
}
