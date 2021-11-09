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
import { Canvas, Control, Point, Polygon, util } from './vendor/Fabric.min';

export class PolygonShape extends Polygon {
  public canvas: Canvas;

  [property: string]: any;

  constructor(points: any, options: any) {
    super(points, options);
    this.initializeEvents();
  }

  protected initializeEvents() {
    this.on('moved', this.shapeModified.bind(this));
    this.on('modified', this.shapeModified.bind(this));
  }

  public shapeModified() {
    this.fieldset.shapeModified(this);
  }

  initializeControls(): void {
    let self = this,
      lastControl = this.points.length - 1;

    this.controls = this.points.reduce(function(acc: Point, point: Point, index: number) {
      acc['p' + index] = new Control({
        positionHandler: self.polygonPositionHandler,
        actionHandler: self.anchorWrapper(index > 0 ? index - 1 : lastControl, self.actionHandler),
        actionName: 'modifyPolygon',
        pointIndex: index
      });
      return acc;
    }, { });

    this.canvas.requestRenderAll();
  }

  /**
   * from example http://fabricjs.com/custom-controls-polygon
   *  define a function that can locate the controls.
   *  this function will be used both for drawing and for interaction.
   *
   * @param dim
   * @param finalMatrix
   * @param fabricObject
   */
  polygonPositionHandler(dim: any, finalMatrix: any, fabricObject: PolygonShape): Point {
    let x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
      y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);

    return util.transformPoint(
      { x: x, y: y },
      fabricObject.calcTransformMatrix()
    );
  }

  /**
   * from example http://fabricjs.com/custom-controls-polygon
   *  define a function that will define what the control does
   *  this function will be called on every mouse move after a control has been
   *  clicked and is being dragged.
   *  The function receive as argument the mouse event, the current transform object
   *  and the current position in canvas coordinate
   *  transform.target is a reference to the current object being transformed,
   *
   * @param eventData
   * @param transform
   * @param x
   * @param y
   */
  actionHandler(eventData: any, transform: any, x: number, y: number): boolean {
    let polygon = transform.target,
      currentControl = polygon.controls[polygon.__corner],
      mouseLocalPosition = polygon.toLocalPoint(new Point(x, y), 'center', 'center'),
      size = polygon._getTransformedDimensions(0, 0);

    polygon.points[currentControl.pointIndex].x = mouseLocalPosition.x * polygon.width / size.x + polygon.pathOffset.x;
    polygon.points[currentControl.pointIndex].y = mouseLocalPosition.y * polygon.height / size.y + polygon.pathOffset.y;
    return true;
  }

  /**
   * from example http://fabricjs.com/custom-controls-polygon
   *  define a function that can keep the polygon in the same position when we change its
   *  width/height/top/left.
   *
   * @param anchorIndex
   * @param fn
   */
  anchorWrapper(anchorIndex: number, fn: Function): Function {
    return function(eventData: any, transform: any, x: number, y: number) {
      let fabricObject = transform.target,
        absolutePoint = util.transformPoint({
          x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
          y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
        }, fabricObject.calcTransformMatrix()),
        actionPerformed = fn(eventData, transform, x, y);

      fabricObject._setPositionDimensions({});

      let polygonBaseSize = fabricObject._getNonTransformedDimensions(),
        newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x,
        newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y;

      fabricObject.setPositionByOrigin(absolutePoint, (newX + 0.5).toString(), (newY + 0.5).toString());
      return actionPerformed;
    }
  }
}
