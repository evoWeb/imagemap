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
import { Canvas, Circle, Polygon } from './vendor/Fabric';
import { AreaFieldsetPolygon } from './AreaFieldsetPolygon';
import { AreaForm } from './AreaForm';

export class AreaShapePolygon extends Polygon {
  public id: number;

  public canvas: Canvas;

  public fieldset: AreaFieldsetPolygon;

  public points: any[];

  public controls: Array<Circle> = [];

  public selectable: boolean;

  public opacity: boolean;

  [property: string]: any;

  constructor(points: any, options: any) {
    super(points, options);
  }

  public initializeControls(points: Point[]) {
    if (this.selectable) {
      this.controls = [];
      points.forEach((point: Point, index: number) => {
        this.addControl(point, index, 100000);
      });
      this.canvas.renderAll();
    }
  }

  public addControl(point: Point, index: number, newControlIndex: number): void {
    let circle = new Circle({
      hasControls: false,
      fill: '#eee',
      stroke: '#bbb',
      originX: 'center',
      originY: 'center',
      name: index,
      type: 'control',
      opacity: this.opacity,

      // set control position relative to polygon
      left: Math.round(point.x * AreaForm.width),
      top: Math.round(point.y * AreaForm.height),
      radius: 5,

      id: point.id,
      polygon: this,
      point: point,
    });

    this.canvas.add(circle);
    this.controls = AreaShapePolygon.addElementToArrayWithPosition(this.controls, circle, newControlIndex);
  }

  static addElementToArrayWithPosition(array: any[], item: any, newPointIndex: number): any[] {
    if (newPointIndex < 0) {
      array.unshift(item);
    } else if (newPointIndex >= array.length) {
      array.push(item);
    } else {
      let newPoints = [];
      for (let i = 0; i < array.length; i++) {
        newPoints.push(array[i]);
        if (i === newPointIndex - 1) {
          newPoints.push(item);
        }
      }
      array = newPoints;
    }
    return array;
  }
}
