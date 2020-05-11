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
import { Rect, Circle, Polygon, Canvas, Object } from './vendor/Fabric';

export class AreaShapeFactory {
  readonly areaConfiguration = {
    cornerColor: '#eee',
    cornerStrokeColor: '#bbb',
    cornerSize: 10,
    cornerStyle: 'circle',
    hasBorders: false,
    hasRotatingPoint: false,
    transparentCorners: false
  };

  readonly width: number;

  readonly height: number;

  readonly canvas: Canvas;

  constructor(configurations: EditorConfigurations, canvas: Canvas = null) {
    this.width = configurations.canvas.width;
    this.height = configurations.canvas.height;
    this.canvas = canvas;
  }

  public createShape(area: AreaConfiguration, selectable: boolean): Object {
    area.color = AreaShapeFactory.getRandomColor(area.color);
    let areaShape: Object,
      configuration = {
        ...area,
        ...this.areaConfiguration,
        selectable: selectable,
        hasControls: selectable,
        stroke: area.color,
        strokeWidth: 1,
        fill: AreaShapeFactory.hexToRgbA(area.color, 0.3)
      };

    switch (configuration.shape) {
      case 'rect':
        areaShape = this.createRectangle(configuration);
        break;

      case 'circle':
        areaShape = this.createCircle(configuration);
        break;

      case 'poly':
        areaShape = this.createPolygon(configuration);
        break;
    }

    if (this.canvas !== null) {
      areaShape.canvas = this.canvas;
    }

    return areaShape;
  }

  private createRectangle(configuration: AreaConfiguration): Rect {
    let coords = configuration.coords,
      left = Math.round(coords.left * this.width),
      top = Math.round(coords.top * this.height),
      width = Math.round(coords.right * this.width) - left,
      height = Math.round(coords.bottom * this.height) - top;

    return new Rect({
      ...configuration,
      left: left,
      top: top,
      width: width,
      height: height,
    });
  }

  private createCircle(configuration: AreaConfiguration): Circle {
    let coords = configuration.coords,
      radius = Math.round(coords.radius * this.width),
      left = Math.round(coords.left * this.width) - radius,
      top = Math.round(coords.top * this.height) - radius,
      area = new Circle({
        ...configuration,
        left: left,
        top: top,
        radius: radius,
      });

    // disable control points as these would stretch the circle
    // to an ellipse which is not possible in html areas
    area.setControlVisible('ml', false);
    area.setControlVisible('mt', false);
    area.setControlVisible('mr', false);
    area.setControlVisible('mb', false);

    return area;
  }

  private createPolygon(configuration: AreaConfiguration): Polygon {
    let points: Point[] = configuration.points || [],
      area: Polygon;

    points.map((point) => {
      point.x = Math.round(point.x * this.width);
      point.y = Math.round(point.y * this.height);
    });

    area = new Polygon(points, {
      ...configuration,
      objectCaching: false,
    });
    area.controls = [];

    if (configuration.selectable) {
      points.forEach((point: Object, index: number) => {
        AreaShapeFactory.addControl(area, this.areaConfiguration, point, index, 100000);
      });
    }

    return area;
  }

  static addControl(
    area: Polygon,
    areaConfig: AreaConfiguration,
    point: Object,
    index: number,
    newControlIndex: number
  ): void {
    let circle = new Circle({
      ...areaConfig,
      hasControls: false,
      radius: 5,
      fill: areaConfig.cornerColor,
      stroke: areaConfig.cornerStrokeColor,
      originX: 'center',
      originY: 'center',
      name: index,
      polygon: area,
      point: point,
      type: 'control',
      opacity: area.opacity,

      // set control position relative to polygon
      left: area.left + point.x,
      top: area.top + point.y,
    });

    point.control = circle;

    area.controls = AreaShapeFactory.addElementToArrayWithPosition(area.controls, circle, newControlIndex);
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

  static getRandomColor(color: string): string {
    while (color === undefined || !(/^#([A-Fa-f0-9]{3}){1,2}$/.test(color))) {
      color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
    return color;
  }

  static hexToRgbA(hex: string, alpha: number): string {
    let chars, r, g, b, result;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      chars = hex.substring(1).split('');
      if (chars.length === 3) {
        chars = [chars[0], chars[0], chars[1], chars[1], chars[2], chars[2]];
      }

      r = parseInt(chars[0] + chars[1], 16);
      g = parseInt(chars[2] + chars[3], 16);
      b = parseInt(chars[4] + chars[5], 16);

      if (alpha) {
        result = 'rgba(' + [r, g, b, alpha].join(', ') + ')';
      } else {
        result = 'rgb(' + [r, g, b].join(', ') + ')';
      }
      return result;
    }
    throw new Error('Bad Hex: ' + hex);
  }
}
