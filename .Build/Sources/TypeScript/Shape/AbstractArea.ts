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

import { AbstractFieldset } from './AbstractFieldset';
import { CircleShape } from './Circle/Shape';
import { PolygonShape } from './Polygon/Shape';
import { RectangleShape } from './Rectangle/Shape';

export class AbstractArea {
  public id: number = 0;

  public areaData: {[k: string]: any} = {};

  public canvasShape: CircleShape|PolygonShape|RectangleShape;

  public sidebarFieldset: AbstractFieldset

  constructor(areaData: Area) {
    this.areaData = new Proxy(areaData, {
      set(target: any, property: string, value: any): any {
        console.log(`Property ${property} has been set to value ` + value);
        target[property] = value;
        return true;
      }
    });
  }

  public setFieldset(fieldset: AbstractFieldset): void {
    this.sidebarFieldset = fieldset;
  }

  public setShape(shape: CircleShape|PolygonShape|RectangleShape): void {
    this.canvasShape = shape;
    this.id = this.canvasShape.id;
  }

  public getData(): Area {
    return this.areaData as Area;
  }

  public resize(newWidth: number, newHeight: number): void {
    // @todo make this work
  }

  public shapeModified(event: FabricEvent): void {
  }

  public fieldsetModified(event: Event): void {
    this.canvasShape.fieldsetModified(event);
  }

  public inputX(value: number): number {
    return value / this.canvasShape.canvas.get('width');
  }

  public inputY(value: number): number {
    return value / this.canvasShape.canvas.get('height');
  }

  public outputX(value: number): number {
    return Math.round(value * this.canvasShape.canvas.get('width'));
  }

  public outputY(value: number): number {
    return Math.round(value * this.canvasShape.canvas.get('height'));
  }
}
