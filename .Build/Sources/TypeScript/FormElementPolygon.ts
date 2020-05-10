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

import { FormElementAbstract } from './FormElementAbstract';

export class FormElementPolygon extends FormElementAbstract {
  protected name: string = 'polygon';

  public controls: Array<any> = [];

  constructor(points: Array<any>, options: AreaConfiguration) {
    super(points, options);
    this.on('moved', this.polygonMoved.bind(this));
  }

  public updateFields() {
    this.getElement('.color').value = this.data.color;
    this.getElement('.alt').value = this.alt || '';
    this.getElement('.href').value = this.href || '';

    Object.entries(this.attributes).forEach((attribute) => {
      this.getElement('#' + attribute[0]).value = attribute[1] || '';
    });

    let parentElement = this.getElement('.positionOptions');
    this.points.forEach((point: fabric.Point, index: number) => {
      point.id = point.id ? point.id : 'p' + this.id + '_' + index;

      if (!point.hasOwnProperty('element')) {
        point.element = this.getFormElement('#polyCoords', point.id);
        parentElement.append(point.element);
      }

      point.element.querySelector('#x' + point.id).value = point.x + this.left;
      point.element.querySelector('#y' + point.id).value = point.y + this.top;
    });
  }

  public getData(): object {
    let points: object[] = [];

    this.controls.forEach((control) => {
      let center = control.getCenterPoint();
      points.push({x: center.x, y: center.y});
    });

    return {
      ...this.attributes,
      points: points,
    };
  }

  public addControls() {
    this.points.forEach((point: fabric.Object, index: number) => {
      this.addControl(this.controlConfig, point, index, 100000);
    });
  }

  protected updateCanvas(event: Event) {
    let field = (event.currentTarget || event.target) as HTMLInputElement,
      [, point] = field.id.split('_'),
      control = this.controls[parseInt(point)],
      x = control.getCenterPoint().x,
      y = control.getCenterPoint().y;

    if (field.id.indexOf('x') > -1) {
      x = parseInt(field.value);
    }
    if (field.id.indexOf('y') > -1) {
      y = parseInt(field.value);
    }

    control.set('left', x);
    control.set('top', y);
    control.setCoords();
    this.points[control.name] = {x: x, y: y};
    this.canvas.renderAll();
  }

  protected addControl(areaConfig: AreaConfiguration, point: fabric.Object, index: number, newControlIndex: number) {
    let circle = new fabric.Circle({
      ...areaConfig,
      hasControls: false,
      radius: 5,
      fill: areaConfig.cornerColor,
      stroke: areaConfig.cornerStrokeColor,
      originX: 'center',
      originY: 'center',
      name: index,
      polygon: this,
      point: point,
      type: 'control',
      opacity: this.controls.length === 0 ? 0 : this.controls[0].opacity,

      // set control position relative to polygon
      left: this.left + point.x,
      top: this.top + point.y,
    });
    circle.on('moved', this.pointMoved.bind(this));

    point.control = circle;

    this.controls = fabric.Polygon.addElementToArrayWithPosition(this.controls, circle, newControlIndex);
    this.canvas.add(circle);
    this.canvas.renderAll();
  }

  protected pointMoved(event: FabricEvent) {
    let control = (event.target as fabric.Object),
      id = 'p' + control.polygon.id + '_' + control.name,
      center = control.getCenterPoint();

    this.getElement('#x' + id).value = center.x;
    this.getElement('#y' + id).value = center.y;
  }

  protected polygonMoved() {
    this.points.forEach((point: fabric.Object) => {
      this.getElement('#x' + point.id).value = this.left + point.x;
      this.getElement('#y' + point.id).value = this.top + point.y;
    });
  }

  protected addPointBeforeAction(event: Event) {
    let direction = FormElementAbstract.before,
      index = this.points.length,
      parentElement = this.getElement('.positionOptions'),
      [point, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction);

    parentElement.insertBefore(element, currentPoint.element);

    this.points = fabric.Polygon.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
    this.addControl(this.configuration, point, index, currentPointIndex + direction);
  }

  protected addPointAfterAction(event: Event) {
    let direction = FormElementAbstract.after,
      index = this.points.length,
      parentElement = this.getElement('.positionOptions'),
      [point, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction);

    if (currentPoint.element.nextSibling) {
      parentElement.insertBefore(element, currentPoint.element.nextSibling);
    } else {
      parentElement.append(element);
    }

    this.points = fabric.Polygon.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
    this.addControl(this.configuration, point, index, currentPointIndex + direction);
  }

  protected getPointElementAndCurrentPoint(event: Event, direction: number) {
    let currentPointId = ((event.currentTarget as HTMLElement).parentNode.parentNode as HTMLElement).id,
      [currentPoint, nextPoint, currentPointIndex] = this.getCurrentAndNextPoint(currentPointId, direction),
      index = this.points.length,
      id = 'p' + this.id + '_' + index,
      element = this.getFormElement('#polyCoords', id),
      point = {
        x: Math.floor((currentPoint.x + nextPoint.x) / 2),
        y: Math.floor((currentPoint.y + nextPoint.y) / 2),
        id: id,
        element: element
      };

    element.querySelectorAll('.t3js-btn').forEach(this.buttonHandler.bind(this));

    (element.querySelector('#x' + point.id) as HTMLInputElement).value = point.x.toString();
    (element.querySelector('#y' + point.id) as HTMLInputElement).value = point.y.toString();

    return [point, element, currentPointIndex, currentPoint];
  }

  protected getCurrentAndNextPoint(currentPointId: string, direction: number) {
    let currentPointIndex = 0;

    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i].id === currentPointId) {
        break;
      }
      currentPointIndex++;
    }

    let nextPointIndex = currentPointIndex + direction;

    if (nextPointIndex < 0) {
      nextPointIndex = this.points.length - 1;
    }
    if (nextPointIndex >= this.points.length) {
      nextPointIndex = 0;
    }

    return [this.points[currentPointIndex], this.points[nextPointIndex], currentPointIndex, nextPointIndex];
  }

  protected removePointAction(event: Event) {
    if (this.points.length > 3) {
      let element = (event.currentTarget as HTMLElement).parentNode.parentNode as HTMLElement,
        points: fabric.Point = [],
        controls: fabric.Object = [];

      this.points.forEach((point: fabric.Point, index: number) => {
        if (element.id !== point.id) {
          points.push(point);
          controls.push(this.controls[index]);
        } else {
          point.element.remove();
          this.canvas.remove(this.controls[index]);
        }
      });

      points.forEach((point: fabric.Point, index: number) => {
        let oldId = point.id;
        point.id = 'p' + this.id + '_' + index;
        this.getElement('#' + oldId).id = point.id;
        this.getElement('#x' + oldId).id = 'x' + point.id;
        this.getElement('#y' + oldId).id = 'y' + point.id;
        this.getElement('[for="x' + oldId + '"]').setAttribute('for', 'x' + point.id);
        this.getElement('[for="y' + oldId + '"]').setAttribute('for', 'y' + point.id);
        controls[index].name = index;
      });

      this.points = points;
      this.controls = controls;
      this.canvas.renderAll();
    }
  }

  static addElementToArrayWithPosition(array: any[], item: any, newPointIndex: number) {
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
