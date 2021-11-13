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

import { AbstractFieldset } from '../AbstractFieldset';

export class CircleFieldset extends AbstractFieldset {
  readonly name: string = 'circle';

  protected updateFields(): void {
    for (let attributeKey in this.area.areaData) {
      if (!this.area.areaData.hasOwnProperty(attributeKey)) {
        continue;
      }
      let attributeValue = this.area.areaData[attributeKey] || '',
        element = this.getElement(`.${attributeKey}`);

      if (element !== null) {
        if (typeof attributeValue === 'number') {
          attributeValue = attributeValue.toString();
        }
        element.value = attributeValue;
      }
    }

    for (let coordinatesKey in this.area.areaData.coords) {
      if (!this.area.areaData.coords.hasOwnProperty(coordinatesKey)) {
        continue;
      }
      let coordinatesValue = this.area.areaData.coords[coordinatesKey] || '',
        element = this.getElement(`.${coordinatesKey}`);

      if (['left', 'right', 'radius'].indexOf(coordinatesKey) > -1) {
        coordinatesValue = this.area.outputX(coordinatesValue);
      } else if (['top', 'bottom'].indexOf(coordinatesKey) > -1) {
        coordinatesValue = this.area.outputY(coordinatesValue);
      }

      if (element !== null) {
        element.value = coordinatesValue;
      }
    }
  }

  public shapeModified(left: number, top: number, radius: number): void {
    this.getElement('.left').setAttribute('value', left.toString());
    this.getElement('.top').setAttribute('value', top.toString());
    this.getElement('.radius').setAttribute('value', radius.toString());
  }

  protected fieldsetModified(event: Event): void {
    this.area.fieldsetModified(event);
  }
}
