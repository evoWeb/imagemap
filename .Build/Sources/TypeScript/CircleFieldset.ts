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

import { AbstractFieldset } from './AbstractFieldset';
import { AreaForm } from './AreaForm';
import { CircleShape } from './CircleShape';

export class CircleFieldset extends AbstractFieldset {
  readonly name: string = 'circle';

  public shape: CircleShape;

  protected updateFields(): void {
    for (let attributeKey in this.area) {
      if (!this.area.hasOwnProperty(attributeKey)) {
        continue;
      }
      let attributeValue = this.area[attributeKey] || '',
        element = this.getElement(`.${attributeKey}`);

      if (element !== null) {
        if (typeof attributeValue === 'number') {
          attributeValue = attributeValue.toString();
        }
        element.value = attributeValue;
      }
    }

    for (let coordinatesKey in this.area.coords) {
      if (!this.area.coords.hasOwnProperty(coordinatesKey)) {
        continue;
      }
      let coordinatesValue = this.area.coords[coordinatesKey] || '',
        element = this.getElement(`.${coordinatesKey}`);

      if (['left', 'radius'].indexOf(coordinatesKey) > -1) {
        coordinatesValue = AreaForm.outputX(coordinatesValue);
      } else if (['top'].indexOf(coordinatesKey) > -1) {
        coordinatesValue = AreaForm.outputY(coordinatesValue);
      }

      if (element !== null) {
        element.value = coordinatesValue;
      }
    }
  }

  protected shapeModified(event: FabricEvent): void {
    let shape = (event.target as CircleShape),
      radius = shape.getRadiusX(),
      left = shape.left + radius,
      top = shape.top + radius;

    this.area.coords.left = this.inputX(left);
    this.area.coords.top = this.inputY(top);
    this.area.coords.radius = this.inputX(radius);

    this.getElement('.left').setAttribute('value', left);
    this.getElement('.top').setAttribute('value', top);
    this.getElement('.radius').setAttribute('value', radius);
  }

  protected moveShape(event: Event): void {
    let field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = parseInt(field.value);

    switch (field.dataset.field) {
      case 'left':
        value -= parseInt(this.getElement(`.radius`).value);
        this.area.coords.left = this.inputX(value);
        this.shape.set({left: value});
        break;

      case 'top':
        value -= parseInt(this.getElement(`.radius`).value);
        this.area.coords.top = this.inputY(value);
        this.shape.set({top: value});
        break;

      case 'radius':
        this.area.coords.top = this.inputX(value);
        this.shape.set({radius: value});
        break;
    }

    this.form.canvas.renderAll();
  }
}
