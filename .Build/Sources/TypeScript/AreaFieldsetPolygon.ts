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
import { Circle, Point, Object } from './vendor/Fabric';
import { AreaFieldsetAbstract } from './AreaFieldsetAbstract';

export class AreaFieldsetPolygon extends AreaFieldsetAbstract {
  readonly name: string = 'polygon';

  public controls: Array<any> = [];

  constructor(attributes: AreaAttributes, configuration: EditorConfigurations, shape: Object) {
    super(attributes, configuration, shape)
  }

  protected initializeElement(): void {
    super.initializeElement();

    if (this.shape.selectable) {
      this.shape.controls = [];
      this.attributes.points.forEach((point: Object, index: number) => {
        this.addControl(point, index, 100000);
      });
      this.shape.canvas.renderAll();
    }
  }

  protected updateFields(): void {
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
    this.shape.controls.forEach((control: Circle) => {
      if (!control.hasOwnProperty('element')) {
        control.element = this.getFormElement('#polygonCoords', control.id);
        parentElement.append(control.element);
      }
      let xField = this.getElement(`#x${control.id}`),
        yField = this.getElement(`#y${control.id}`);

      xField.dataset.control = control.id;
      xField.value = this.outputX(control.point.x);
      yField.dataset.control = control.id;
      yField.value = this.outputY(control.point.y);
    });
  }

  protected shapeMoved(event: FabricEvent): void {
    let control = (event.target as Object),
      center = control.getCenterPoint();

    this.getElement(`#x${control.id}`).value = center.x;
    this.getElement(`#y${control.id}`).value = center.y;
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
      ...this.attributes
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

    this.shape.points = AreaFieldsetPolygon.addElementToArrayWithPosition(this.shape.points, point, currentPointIndex + direction);
    this.addControl(point, index, currentPointIndex + direction);
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

    (element.querySelector('#x' + point.id) as HTMLInputElement).value = point.x.toString();
    (element.querySelector('#y' + point.id) as HTMLInputElement).value = point.y.toString();

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

  protected addControl(point: Point, index: number, newControlIndex: number): void {
    let circle = new Circle({
      hasControls: false,
      fill: '#eee',
      stroke: '#bbb',
      originX: 'center',
      originY: 'center',
      name: index,
      type: 'control',
      opacity: this.shape.opacity,

      // set control position relative to polygon
      left: this.outputX(point.x),
      top: this.outputY(point.y),
      radius: 5,

      id: point.id,
      polygon: this.shape,
      point: point,
    });

    // @todo check these
    circle.on('moved', this.shapeMoved.bind(this));

    this.shape.canvas.add(circle);
    this.shape.controls = AreaFieldsetPolygon.addElementToArrayWithPosition(this.shape.controls, circle, newControlIndex);
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
