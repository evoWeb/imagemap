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
import { Canvas, Control, Point, Polygon, util } from './vendor/Fabric';
import { AreaFieldsetPolygon } from './AreaFieldsetPolygon';

export class AreaShapePolygon extends Polygon {
  public id: number;

  public canvas: Canvas;

  public fieldset: AreaFieldsetPolygon;

  public points: any[];

  public selectable: boolean;

  public opacity: boolean;

  public controls: any = [];

  [property: string]: any;

  constructor(points: any, options: any) {
    super(points, options);
  }

  initializeControls(): void {
    let lastControl = this.points.length - 1;

    this.edit = true;
    this.hasBorders = false;
    this.cornerStyle = 'circle';

    this.controls = this.points.reduce((acc: {[property: string]: any}, point: Point, index: number) => {
      acc['p' + index] = new Control({
        positionHandler: this.polygonPositionHandler,
        actionHandler: this.anchorWrapper(index > 0 ? index - 1 : lastControl, this.actionHandler),
        actionName: 'modifyPolygon',
        pointIndex: index
      });
      return acc;
    }, { });

    this.canvas.requestRenderAll();
  }

  addPoint(newPoint: Point, newIndex: number): void {
    this.points = AreaShapePolygon.addElementWithPosition(this.points, newPoint, newIndex);
    this.initializeControls();
  }

  removePoint(pointToRemove: Point): void {
    this.points.forEach((point: Point, index: number) => {
      if (pointToRemove === point) {
        delete(this.points[index]);
      }
    });
    this.initializeControls();
  }

  // from example
  // define a function that can locate the controls.
  // this function will be used both for drawing and for interaction.
  polygonPositionHandler(dim: any, finalMatrix: any, fabricObject: AreaShapePolygon): Point {
    let x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
      y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);

    return util.transformPoint(
      { x: x, y: y },
      fabricObject.calcTransformMatrix()
    );
  }

  // from example
  // define a function that will define what the control does
  // this function will be called on every mouse move after a control has been
  // clicked and is being dragged.
  // The function receive as argument the mouse event, the current transform object
  // and the current position in canvas coordinate
  // transform.target is a reference to the current object being transformed,
  actionHandler(eventData: any, transform: any, x: number, y: number): boolean {
    let polygon = transform.target,
      currentControl = polygon.controls[polygon.__corner],
      mouseLocalPosition = polygon.toLocalPoint(new Point(x, y), 'center', 'center'),
      size = polygon._getTransformedDimensions(0, 0);

    polygon.points[currentControl.pointIndex] = {
      x: mouseLocalPosition.x * polygon.width / size.x + polygon.pathOffset.x,
      y: mouseLocalPosition.y * polygon.height / size.y + polygon.pathOffset.y
    };
    return true;
  }

  // from example
  // define a function that can keep the polygon in the same position when we change its
  // width/height/top/left.
  anchorWrapper(anchorIndex: number, fn: Function): Function {
    return function(eventData: any, transform: any, x: number, y: number) {
      let fabricObject = transform.target,
        absolutePoint = util.transformPoint({
          x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
          y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
        }, fabricObject.calcTransformMatrix()),
        actionPerformed = fn(eventData, transform, x, y);

      fabricObject._setPositionDimensions({});

      let newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / fabricObject.width,
        newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / fabricObject.height;

      fabricObject.setPositionByOrigin(absolutePoint, (newX + 0.5).toString(), (newY + 0.5).toString());
      return actionPerformed;
    }
  }

  static addElementWithPosition(array: any[], newPoint: any, newIndex: number): any[] {
    if (newIndex < 0) {
      array.unshift(newPoint);
    } else if (array.length <= newIndex) {
      array.push(newPoint);
    } else {
      let points: any[] = [];
      array.forEach((point: Point, index: number) => {
        if (index === newIndex) {
          points.push(newPoint);
        }
        points.push(point);
      });
      array = points;
    }
    return array;
  }
}
