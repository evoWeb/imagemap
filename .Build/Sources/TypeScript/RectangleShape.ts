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
import { Canvas, Rect } from './vendor/Fabric.min';
import { RectangleFieldset } from './RectangleFieldset';

export class RectangleShape extends Rect {
  public id: number;

  public canvas: Canvas;

  public fieldset: RectangleFieldset;

  [property: string]: any;

  constructor(options: any) {
    super(options);
    this.initializeEvents();
  }

  protected initializeEvents() {
    this.on('moved', this.shapeModified.bind(this));
    this.on('modified', this.shapeModified.bind(this));
  }

  public shapeModified() {
    this.fieldset.shapeModified(this);
  }
}
