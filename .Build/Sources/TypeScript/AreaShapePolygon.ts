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
import * as fabric from './vendor/Fabric';
import { AreaFieldsetPolygon } from './AreaFieldsetPolygon';

export class AreaShapePolygon extends fabric.Polygon {
  public id: number;

  public canvas: fabric.Canvas;

  public fieldset: AreaFieldsetPolygon;

  public points: any[];

  public selectable: boolean;

  public opacity: boolean;

  public controls: any;

  [property: string]: any;

  constructor(points: any, options: any) {
    super(points, options);
  }
}
