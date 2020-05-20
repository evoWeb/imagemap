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
import { Object, Point, util } from './vendor/Fabric';
import { AreaFieldsetAbstract } from './AreaFieldsetAbstract';
import { AreaShapePolygon } from './AreaShapePolygon';

export class AreaFieldsetPolygon extends AreaFieldsetAbstract {
  readonly name: string = 'polygon';

  public shape: AreaShapePolygon;

  protected updateFields(): void {
    for (let attributeKey in this.area) {
      if (!this.area.hasOwnProperty(attributeKey)) {
        continue;
      }
      let attributeValue = this.area[attributeKey] || '',
        element = this.getElement('.' + attributeKey);

      if (element !== null) {
        if (typeof attributeValue === 'number') {
          attributeValue = attributeValue.toString();
        }
        element.setAttribute('value', attributeValue);
      }
    }

    let parentElement = this.getElement('.positionOptions');
    this.shape.points.forEach((point: Point) => {
      if (!point.hasOwnProperty('element')) {
        point.element = this.getFieldsetElement('#polygonCoords', point.id);
        parentElement.append(point.element);
      }

      let xField = this.getElement(`#x${point.id}`),
        yField = this.getElement(`#y${point.id}`);
      xField.dataset.point = point.id;
      yField.dataset.point = point.id;
      xField.setAttribute('value', this.outputX(point.areaPoint.x));
      yField.setAttribute('value', this.outputY(point.areaPoint.y));
    });
  }

  protected shapeModified(event: FabricEvent): void {
    let element = (event.target as Object);
    let matrix = element.calcTransformMatrix()
    element.points.forEach((point: Point) => {
      let temporaryPoint = new Point(point.x - element.pathOffset.x, point.y - element.pathOffset.y),
        transformed = util.transformPoint(temporaryPoint, matrix);

      point.areaPoint.x = this.inputX(transformed.x);
      point.areaPoint.y = this.inputX(transformed.y);
      this.getElement(`#x${point.id}`).setAttribute('value', transformed.x.toString());
      this.getElement(`#y${point.id}`).setAttribute('value', transformed.y.toString());
    });
  }

  protected moveShape(event: Event): void {
    let field = (event.target) as HTMLInputElement;
    if (field.dataset.field === 'x' || field.dataset.field === 'y') {
      let point: Point = null,
        left: number,
        top: number;

      this.shape.points.forEach((point1: Point) => {
        if (point1.id === field.dataset.point) {
          point = point1;
        }
      });

      if (point !== null) {
        left = parseInt(field.dataset.field === 'x' ? field.value : point.x);
        top = parseInt(field.dataset.field === 'y' ? field.value : point.y);

        point.areaPoint.x = this.inputX(left);
        point.areaPoint.y = this.inputY(top);
        point.x = left;
        point.y = top;
        this.shape.canvas.renderAll();
      }
    }
  }

  public getData(): object {
    let data = {
      ...this.area
    };

    data.points.forEach((point: Point) => {
      delete(point.polygonPoint);
      delete(point.id);
    });

    return data;
  }

  protected addPointAfterAction(event: Event): void {
    let direction = AreaFieldsetAbstract.after,
      parentElement = this.getElement('.positionOptions'),
      [polygonPoint, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction),
      areaPoint = {
        x: this.inputX(polygonPoint.x),
        y: this.inputY(polygonPoint.y),
        id: polygonPoint.id,
        polygonPoint: polygonPoint,
      };

    if (currentPoint.element.nextSibling) {
      parentElement.insertBefore(element, currentPoint.element.nextSibling);
    } else {
      parentElement.append(element);
    }

    this.area.points = AreaFieldsetPolygon.addElementToArrayWithPosition(this.area.points, areaPoint, currentPointIndex + direction);
    this.shape.points = AreaFieldsetPolygon.addElementToArrayWithPosition(this.shape.points, polygonPoint, currentPointIndex + direction);
  }

  protected removePointAction(event: Event): void {
    if (this.points.length > 3) {
      let element = (event.currentTarget as HTMLElement).parentNode.parentNode as HTMLElement,
        points: Point = [];

      this.points.forEach((point: Point) => {
        if (element.id !== point.id) {
          points.push(point);
        } else {
          point.element.remove();
        }
      });

      points.forEach((point: Point, index: number) => {
        let oldId = point.id;
        point.id = `p${this.id}_${index}`;
        this.getElement(`#${oldId}`).id = point.id;
        this.getElement(`#x${oldId}`).id = 'x' + point.id;
        this.getElement(`#y${oldId}`).id = 'y' + point.id;
        this.getElement(`[for="x${oldId}"]`).setAttribute('for', 'x' + point.id);
        this.getElement(`[for="y${oldId}"]`).setAttribute('for', 'y' + point.id);
      });

      this.points = points;
      this.canvas.renderAll();
    }
  }

  protected getPointElementAndCurrentPoint(event: Event, direction: number): any[] {
    let currentPointId = ((event.currentTarget as HTMLElement).parentNode.parentNode as HTMLElement).id,
      [currentPoint, nextPoint, currentPointIndex] = this.getCurrentAndNextPoint(currentPointId, direction),
      index = this.points.length,
      id = 'p' + this.id + '_' + index,
      element = this.getFieldsetElement('#polyCoords', id),
      point = {
        x: Math.floor((currentPoint.x + nextPoint.x) / 2),
        y: Math.floor((currentPoint.y + nextPoint.y) / 2),
        id: id,
        element: element
      };

    element.querySelectorAll('.t3js-btn').forEach(this.buttonHandler.bind(this));

    (element.querySelector('#x' + point.id) as HTMLInputElement).setAttribute('value', point.x.toString());
    (element.querySelector('#y' + point.id) as HTMLInputElement).setAttribute('value', point.y.toString());

    return [point, element, currentPointIndex, currentPoint];
  }

  protected getCurrentAndNextPoint(currentPointId: string, direction: number): any[] {
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

  static addElementToArrayWithPosition(array: any[], item: any, index: number): any[] {
    if (index < 0) {
      array.unshift(item);
    } else if (index >= array.length) {
      array.push(item);
    } else {
      let newPoints = [];
      for (let i = 0; i < array.length; i++) {
        newPoints.push(array[i]);
        if (i === index - 1) {
          newPoints.push(item);
        }
      }
      array = newPoints;
    }
    return array;
  }
}
