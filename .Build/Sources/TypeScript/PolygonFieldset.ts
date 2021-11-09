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
import { Object, Point, util } from './vendor/Fabric.min';
import { AbstractFieldset } from './AbstractFieldset';
import { AreaForm } from './AreaForm';
import { ShapeFactory } from './ShapeFactory';
import { PolygonShape } from './PolygonShape';

export class PolygonFieldset extends AbstractFieldset {
  readonly name: string = 'polygon';

  public shape: PolygonShape;

  protected updateFields(): void {
    for (let attributeKey in this.area) {
      if (!this.area.hasOwnProperty(attributeKey)) {
        continue;
      }
      let attributeValue = this.area[attributeKey] || '',
        element = this.getElement(`.${attributeKey}`);

      if (element !== null) {
        if (typeof attributeValue === 'number') {
          attributeValue = attributeValue.toString();
        }
        element.value = attributeValue;
      }
    }

    let parentElement = this.getElement('.positionOptions');
    this.area.points.forEach((point: Point) => {
      if (!point.hasOwnProperty('element')) {
        point.element = this.getFieldsetElement('#polygonCoords', point.id);
        parentElement.append(point.element);
      }

      let xField = point.element.querySelector('[data-field="x"]'),
        yField = point.element.querySelector('[data-field="y"]');
      xField.dataset.point = point.id;
      yField.dataset.point = point.id;
      xField.value = AreaForm.outputX(point.x);
      yField.value = AreaForm.outputY(point.y);
    });
  }

  protected shapeModified(shape: Object): void {
    let matrix = shape.calcTransformMatrix();

    shape.points.forEach((point: Point) => {
      let temporaryPoint = new Point(point.x - shape.pathOffset.x, point.y - shape.pathOffset.y),
        transformed = util.transformPoint(temporaryPoint, matrix),
        areaPoint = this.area.points.find((findPoint: Point) => { return findPoint.id === point.id });

      if (areaPoint) {
        let xField: HTMLInputElement = areaPoint.element.querySelector('[data-field="x"]'),
          yField: HTMLInputElement = areaPoint.element.querySelector('[data-field="y"]')

        areaPoint.x = this.inputX(transformed.x);
        areaPoint.y = this.inputY(transformed.y);

        xField.value = AreaForm.outputX(areaPoint.x);
        yField.value = AreaForm.outputY(areaPoint.y);
      }
    });
  }

  protected moveShape(event: InputEvent): void {
    let field = (event.target) as HTMLInputElement,
      point: Point = this.shape.points.find((findPoint: Point) => { return findPoint.id === field.dataset.point }),
      areaPoint = this.area.points.find((findPoint: Point) => { return findPoint.id === point.id }),
      left: number,
      top: number;

    if (point !== null) {
      left = field.dataset.field === 'x' ? parseInt(field.value) : point.x;
      top = field.dataset.field === 'y' ? parseInt(field.value) : point.y;

      areaPoint.x = this.inputX(left);
      areaPoint.y = this.inputY(top);
      point.x = left;
      point.y = top;
      this.form.canvas.renderAll();
    }
  }

  public getData(): Area {
    let data = {
      ...this.area
    };

    data.points.forEach((point: Point) => {
      delete(point.element);
      delete(point.id);
    });

    return data as Area;
  }

  protected addPointAfterAction(event: Event): void {
    let currentElement = (event.currentTarget as HTMLElement),
      parentElement = this.getElement('.positionOptions'),
      [currentPoint, nextPoint, newIndex] = this.getCurrentAndNextIndex(
        currentElement.dataset.point,
        AbstractFieldset.after
      ),
      areaPoint: Point = {
        x: (currentPoint.x + nextPoint.x) / 2,
        y: (currentPoint.y + nextPoint.y) / 2,
        id: this.id + '-' + Object.__uid++,
        element: null,
      };
    areaPoint.element = this.getPointFields(areaPoint);

    if (currentPoint.element.nextSibling) {
      parentElement.insertBefore(areaPoint.element, currentPoint.element.nextSibling);
    } else {
      parentElement.append(areaPoint.element);
    }

    this.area.points = PolygonFieldset.addElementWithPosition(this.area.points, areaPoint, newIndex);

    this.renderNewShape(this.area as Area, true);
  }

  protected removePointAction(event: Event): void {
    if (this.area.points.length > 3) {
      let element = (event.currentTarget) as HTMLElement;
      this.area.points.forEach((findPoint: Point, index: number) => {
        if (findPoint.id === element.dataset.point) {
          this.area.points[index].element.remove();
          delete(this.area.points[index]);
        }
      });
      this.area.points = this.area.points.filter((findPoint: Point) => { return findPoint !== null; });

      this.renderNewShape(this.area as Area, true);
    }
  }

  private renderNewShape(area: Area, selectable: boolean): void {
    let points: Point[] = area.points || [],
      polygonPoints: Point[] = [],
      configuration: ShapeConfiguration = {
        ...ShapeFactory.shapeConfiguration,
        selectable: selectable,
        hasControls: selectable,
        stroke: area.color,
        strokeWidth: 0,
        fill: ShapeFactory.hexToRgbA(area.color, 0.4),
        id: this.id,
        canvas: this.canvas,
      };

    points.map((point) => {
      polygonPoints.push({
        x: AreaForm.outputiX(point.x),
        y: AreaForm.outputiY(point.y),
        id: point.id,
      });
    });

    this.form.canvas.remove(this.shape);
    this.shape = new PolygonShape(polygonPoints, {
      ...configuration,
      objectCaching: false,
    });
    this.shape.fieldset = this;
    this.form.canvas.add(this.shape);

    this.shape.initializeControls();
    this.initializeShapeEvents(this.shape);
  }

  private getCurrentAndNextIndex(currentId: string, direction: number): any[] {
    let currentIndex = 0;

    this.area.points.forEach((findPoint: Point, index: number) => {
      if (findPoint.id === currentId) {
        currentIndex = index;
      }
    })

    let nextPointIndex = currentIndex + direction;
    if (nextPointIndex < 0) {
      nextPointIndex = this.area.points.length - 1;
    }
    if (nextPointIndex >= this.area.points.length) {
      nextPointIndex = 0;
    }

    return [this.area.points[currentIndex], this.area.points[nextPointIndex], nextPointIndex];
  }

  private getPointFields(point: Point) {
    let element = this.getFieldsetElement('#polygonCoords', point.id),
      xField: HTMLInputElement = element.querySelector('[data-field="x"]'),
      yField: HTMLInputElement = element.querySelector('[data-field="y"]');

    xField.dataset.point = point.id;
    yField.dataset.point = point.id;
    xField.value = AreaForm.outputX(point.x);
    yField.value = AreaForm.outputY(point.y);

    this.initializeCoordinateFieldEvents(element.querySelectorAll('.t3js-field'));
    this.initializeButtonEvents(element.querySelectorAll('.t3js-btn'));

    return element;
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
