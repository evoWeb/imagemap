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

import { AbstractArea } from '../AbstractArea';
import { RectangleShape } from './Shape';

export class RectangleArea extends AbstractArea {
  public shapeModified(event: FabricEvent): void {
    let shape = (event.target as RectangleShape),
      left = Math.round(shape.left),
      top = Math.round(shape.top),
      right = Math.round(shape.getScaledWidth() + left),
      bottom = Math.round(shape.getScaledHeight() + top);

    this.areaData.coords.left = this.inputX(left);
    this.areaData.coords.top = this.inputY(top);
    this.areaData.coords.right = this.inputX(right);
    this.areaData.coords.bottom = this.inputX(bottom);

    this.sidebarFieldset.shapeModified(left, top, right, bottom);
  }

  public fieldsetModified(event: Event): void {
    let field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = parseInt(field.value);

    switch (field.dataset.field) {
      case 'left':
        this.areaData.coords.left = this.inputX(value);
        this.areaData.coords.right = this.inputX(value + this.canvasShape.getScaledWidth());
        this.sidebarFieldset.getElement('.right').setAttribute(
          'value',
          value + this.canvasShape.getScaledWidth()
        );
        this.canvasShape.set({left: value});
        break;

      case 'top':
        this.areaData.coords.top = this.inputY(value);
        this.areaData.coords.bottom = this.inputY(value + this.canvasShape.getScaledHeight());
        this.sidebarFieldset.getElement('.bottom').setAttribute(
          'value',
          value + this.canvasShape.getScaledHeight()
        );
        this.canvasShape.set({top: value});
        break;

      case 'right':
        this.areaData.coords.right = this.inputX(value);
        value -= this.canvasShape.left;
        if (value < 0) {
          value = 10;
          field.value = this.areaData.left + value;
        }
        this.canvasShape.set({width: value});
        break;

      case 'bottom':
        this.areaData.coords.bottom = this.inputY(value);
        value -= this.canvasShape.top;
        if (value < 0) {
          value = 10;
          field.value = this.areaData.top + value;
        }
        this.canvasShape.set({height: value});
        break;
    }

    this.canvasShape.canvas.renderAll();
  }
}
