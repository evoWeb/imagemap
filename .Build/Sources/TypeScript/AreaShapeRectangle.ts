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
import { Canvas, Rect } from './vendor/Fabric';

export class AreaShapeRectangle extends Rect {
  public id: number;

  public canvas: Canvas;

  [property: string]: any;

  constructor(options: any) {
    super(options);
  }
}
