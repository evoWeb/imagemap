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
import { Point, util } from '../../vendor/Fabric.min';
import { AbstractArea } from '../AbstractArea';
import { PolygonShape } from './Shape';
import {ShapeFactory} from "../Factory";

export class PolygonArea extends AbstractArea {
  public getData(): Area {
    let data = {
      ...this.areaData
    };

    data.points.forEach((point: Point) => {
      // @todo remove delete element as these should never be connected
      delete(point.element);
      delete(point.id);
    });

    return data as Area;
  }

  public shapeModified(shape: PolygonShape): void {
    let matrix = shape.calcTransformMatrix(),
      fieldValues: {id: string, x: string, y: string}[] = [];

    shape.points.forEach((point: Point) => {
      let temporaryPoint = new Point(point.x - shape.pathOffset.x, point.y - shape.pathOffset.y),
        transformed = util.transformPoint(temporaryPoint, matrix),
        areaPoint = this.areaData.points.find((findPoint: Point) => { return findPoint.id === point.id });

      if (areaPoint) {
        areaPoint.x = this.inputX(transformed.x);
        areaPoint.y = this.inputY(transformed.y);

        fieldValues.push({
          id: point.id,
          x: this.outputX(areaPoint.x),
          y: this.outputY(areaPoint.y)
        });
      }
    });

    this.sidebarFieldset.shapeModified(fieldValues);
  }

  public fieldsetModified(event: Event): void {
    let field = (event.target) as HTMLInputElement,
      point: Point = this.canvasShape.points.find((findPoint: Point) => { return findPoint.id === field.dataset.point }),
      areaPoint = this.areaData.points.find((findPoint: Point) => { return findPoint.id === point.id }),
      value: number = parseInt(field.value);

    switch (field.dataset.field) {
      case 'x':
        areaPoint.x = this.inputX(value);
        point.x = value;
        break;

      case 'y':
        areaPoint.y = this.inputY(value);
        point.y = value;
        break;
    }

    this.canvasShape.canvas.renderAll();
  }

  public renderNewShape(areaData: Area, selectable: boolean): void {
    let points: Point[] = areaData.points || [],
      polygonPoints: Point[] = [],
      configuration: ShapeConfiguration = {
        ...ShapeFactory.shapeConfiguration,
        selectable: selectable,
        hasControls: selectable,
        stroke: areaData.color,
        strokeWidth: 0,
        fill: ShapeFactory.hexToRgbA(areaData.color, 0.4),
        id: this.id,
        canvas: this.canvasShape.canvas,
      };

    points.map((point) => {
      polygonPoints.push({
        x: this.outputiX(point.x),
        y: this.outputiY(point.y),
        id: point.id,
      });
    });

    this.canvasShape.canvas.remove(this.canvasShape);
    this.canvasShape = new PolygonShape(polygonPoints, {
      ...configuration,
      objectCaching: false,
    });
    this.canvasShape.area = this;
    this.canvasShape.canvas.add(this.canvasShape);

    this.canvasShape.initializeControls();
  }
}
