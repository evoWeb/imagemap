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
import { Point, Object } from './vendor/Fabric';

import { AreaFieldsetAbstract } from './AreaFieldsetAbstract';
import { AreaShapeFactory } from './AreaShapeFactory';

export class AreaFieldsetPolygon extends AreaFieldsetAbstract {
  protected name: string = 'polygon';

  protected configuration: ShapeConfiguration;

  public controls: Array<any> = [];

  constructor(attributes: AreaConfiguration, configuration: EditorConfigurations, shape: Object) {
    super(attributes, configuration, shape)
    this.bindControls();
  }

  protected updateFields() {
    for (let attributeKey in this.attributes) {
      if (!this.attributes.hasOwnProperty(attributeKey)) {
        continue;
      }
      let attributeValue = this.attributes[attributeKey] || '',
        element = this.getElement('.' + attributeKey);

      if (element !== null) {
        if (typeof attributeValue === 'number') {
          attributeValue = attributeValue.toString();
        }
        element.value = attributeValue;
      }
    }

    let parentElement = this.getElement('.positionOptions');
    this.shape.points.forEach((point: Point, index: number) => {
      point.id = point.id ? point.id : 'p' + this.id + '_' + index;

      if (!point.hasOwnProperty('element')) {
        point.element = this.getFormElement('#polyCoords', point.id);
        parentElement.append(point.element);
      }

      point.element.querySelector('#x' + point.id).value = point.x + this.left;
      point.element.querySelector('#y' + point.id).value = point.y + this.top;
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

  public getData(): object {
    let data = {
      ...this.attributes
    };

    data.points.forEach((point: Point) => {
      if (typeof point.id !== 'undefined') {
        delete point.id;
      }
    });

    return data;
  }

  protected bindControls() {
    this.shape.controls.forEach((control: any) => {
      control.on('moved', this.pointMoved.bind(this));
      this.shape.canvas.add(control);
    })
    this.shape.canvas.renderAll();
  }

  public pointMoved(event: FabricEvent) {
    let control = (event.target as Object),
      id = 'p' + control.polygon.id + '_' + control.name,
      center = control.getCenterPoint();

    this.getElement('#x' + id).value = center.x;
    this.getElement('#y' + id).value = center.y;
  }

  protected polygonMoved() {
    this.points.forEach((point: Object) => {
      this.getElement('#x' + point.id).value = this.left + point.x;
      this.getElement('#y' + point.id).value = this.top + point.y;
    });
  }

  private addPointBeforeAction(event: Event) {
    let direction = AreaFieldsetAbstract.before,
      index = this.points.length,
      parentElement = this.getElement('.positionOptions'),
      [point, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction);

    parentElement.insertBefore(element, currentPoint.element);

    this.points = AreaShapeFactory.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
    AreaShapeFactory.addControl(this.shape, this.configuration, point, index, currentPointIndex + direction);
  }

  protected addPointAction(event: Event) {
    let direction = AreaFieldsetAbstract.after,
      index = this.points.length,
      parentElement = this.getElement('.positionOptions'),
      [point, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction);

    if (currentPoint.element.nextSibling) {
      parentElement.insertBefore(element, currentPoint.element.nextSibling);
    } else {
      parentElement.append(element);
    }

    this.points = AreaShapeFactory.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
    AreaShapeFactory.addControl(this.shape, this.configuration, point, index, currentPointIndex + direction);
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
        points: Point = [],
        controls: Object = [];

      this.points.forEach((point: Point, index: number) => {
        if (element.id !== point.id) {
          points.push(point);
          controls.push(this.controls[index]);
        } else {
          point.element.remove();
          this.canvas.remove(this.controls[index]);
        }
      });

      points.forEach((point: Point, index: number) => {
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
}
