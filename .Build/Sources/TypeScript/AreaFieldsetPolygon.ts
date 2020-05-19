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
import { Circle, Object, Point } from './vendor/Fabric';
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
    this.shape.controls.forEach((control: Circle) => {
      if (!control.hasOwnProperty('element')) {
        control.element = this.getFormElement('#polygonCoords', control.id);
        parentElement.append(control.element);
      }
      let xField = this.getElement(`#x${control.id}`),
        yField = this.getElement(`#y${control.id}`);

      xField.dataset.control = control.id;
      yField.dataset.control = control.id;
      xField.setAttribute('value', this.outputX(control.point.x));
      yField.setAttribute('value', this.outputY(control.point.y));
    });
  }

  protected shapeModified(event: FabricEvent): void {
    // @todo check these
    let element = (event.target as Object),
      center = element.getCenterPoint();

    this.getElement(`#x${element.id}`).setAttribute('value', center.x);
    this.getElement(`#y${element.id}`).setAttribute('value', center.y);

    element.controls.forEach((control: Object) => {
      control.left = element.left + control.point.x;
      control.top = element.top + control.point.y;
    });
  }

  protected moveShape(event: Event): void {
    let field = (event.currentTarget || event.target) as HTMLInputElement;
    if (field.dataset.field === 'x' || field.dataset.field === 'y') {
      let control: Circle = null,
        left: number,
        top: number;

      this.shape.controls.forEach((circle: Circle) => {
        if (circle.id === field.dataset.control) {
          control = circle;
        }
      });

      if (control !== null) {
        if (field.dataset.field === 'x') {
          left = parseInt(field.value);
        } else {
          left = parseInt(control.left);
        }
        if (field.dataset.field === 'y') {
          top = parseInt(field.value);
        } else {
          top = parseInt(control.top);
        }

        control.set('left', left);
        control.set('top', top);
        control.point.x = this.inputX(left);
        control.point.y = this.inputY(top);
        control.setCoords();

        this.shape.points.forEach((point: Point) => {
          if (point.id === control.id) {
            point.x = left;
            point.y = top;
          }
        })

        this.shape.canvas.renderAll();
      }
    }
  }

  public getData(): object {
    let data = {
      ...this.area
    };

    data.points.forEach((point: Point) => {
      if (typeof point.id !== 'undefined') {
        delete point.id;
      }
    });

    return data;
  }

  protected addPointAfterAction(event: Event): void {
    let direction = AreaFieldsetAbstract.after,
      index = this.points.length,
      parentElement = this.getElement('.positionOptions'),
      [point, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction);

    if (currentPoint.element.nextSibling) {
      parentElement.insertBefore(element, currentPoint.element.nextSibling);
    } else {
      parentElement.append(element);
    }

    this.shape.points = AreaShapePolygon.addElementToArrayWithPosition(this.shape.points, point, currentPointIndex + direction);
    this.shape.addControl(point, index, currentPointIndex + direction);
  }

  protected removePointAction(event: Event): void {
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

  protected getPointElementAndCurrentPoint(event: Event, direction: number): any[] {
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
}
