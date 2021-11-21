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
import { Canvas, Rect } from '../../vendor/Fabric.min';
import { RectangleArea } from './Area';

export class RectangleShape extends Rect {
  public id: number;

  public canvas: Canvas;

  public area: RectangleArea;

  [property: string]: any;

  constructor(area: RectangleArea, options: any) {
    super(options);
    this.area = area;
    this.initializeEvents();
  }

  protected initializeEvents() {
    this.on('moved', this.area.shapeModified);
    this.on('modified', this.area.shapeModified);
  }
}
