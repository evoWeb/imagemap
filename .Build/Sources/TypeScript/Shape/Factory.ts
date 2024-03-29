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
import * as Fabric from '../vendor/Fabric.min';
import { AbstractArea } from './AbstractArea';
import { CircleArea } from './Circle/Area';
import { CircleFieldset } from './Circle/Fieldset';
import { CircleShape } from './Circle/Shape';
import { PolygonArea } from './Polygon/Area';
import { PolygonFieldset } from './Polygon/Fieldset';
import { PolygonShape } from './Polygon/Shape';
import { RectangleArea } from './Rectangle/Area';
import { RectangleFieldset } from './Rectangle/Fieldset';
import { RectangleShape } from './Rectangle/Shape';

export class ShapeFactory {
  static shapeConfiguration: ShapeConfiguration = {
    cornerColor: '#eee',
    cornerStrokeColor: '#bbb',
    cornerSize: 10,
    cornerStyle: 'circle',
    hasBorders: false,
    hasRotatingPoint: false,
    transparentCorners: false,
  };

  readonly canvas: Fabric.Canvas;

  readonly configuration: EditorConfiguration;

  constructor(canvas: Fabric.Canvas = null, configuration: EditorConfiguration = null) {
    this.canvas = canvas;
    this.configuration = configuration;
  }

  public create(areaData: AreaData, selectable: boolean): AbstractArea {
    areaData.color = this.getRandomColor(areaData.color);

    let area: AbstractArea,
      configuration: ShapeConfiguration = {
        ...ShapeFactory.shapeConfiguration,
        selectable: selectable,
        hasControls: selectable,
        stroke: areaData.color,
        fill: ShapeFactory.hexToRgbA(areaData.color, 0.4),
        id: ShapeFactory.getObjectId(),
        canvas: this.canvas
      };

    switch (areaData.shape) {
      case 'circle':
        area = this.createCircle(areaData, configuration);
        break;

      case 'poly':
        area = this.createPolygon(areaData, configuration);
        break;

      case 'rect':
        area = this.createRectangle(areaData, configuration);
        break;
    }

    return area;
  }

  protected createCircle(areaData: AreaData, configuration: ShapeConfiguration): CircleArea {
    let coords = areaData.coords,
      radius = this.outputX(coords.radius),
      left = this.outputX(coords.left) - radius,
      top = this.outputY(coords.top) - radius;

    let area = new CircleArea(areaData);
    area.setFieldset(new CircleFieldset(area, this.configuration));
    area.setShape(new CircleShape(area, {
      ...configuration,
      left: left,
      top: top,
      radius: radius,
      // disable control points as these would stretch the circle
      // to an ellipse which is not possible in html areas
      _controlsVisibility: {
        ml: false,
        mt: false,
        mr: false,
        mb: false,
        mtr: false,
      }
    }));

    return area;
  }

  protected createPolygon(areaData: AreaData, configuration: ShapeConfiguration): PolygonArea {
    let points: Point[] = areaData.points || [],
      polygonPoints: Point[] = [];

    points.map((point) => {
      point.id = configuration.id + '-' + ShapeFactory.getObjectId();
      polygonPoints.push({
        x: this.outputX(point.x),
        y: this.outputY(point.y),
        id: point.id,
      });
    });

    let area = new PolygonArea(areaData);
    area.setFieldset(new PolygonFieldset(area, this.configuration));
    area.setShape(new PolygonShape(area, polygonPoints, {
      ...configuration,
      objectCaching: false,
    }))
    return area;
  }

  protected createRectangle(areaData: AreaData, configuration: ShapeConfiguration): RectangleArea {
    let coords = areaData.coords,
      left = this.outputX(coords.left),
      top = this.outputY(coords.top),
      width = this.outputX(coords.right) - left,
      height = this.outputY(coords.bottom) - top;

    let area = new RectangleArea(areaData);
    area.setFieldset(new RectangleFieldset(area, this.configuration));
    area.setShape(new RectangleShape(area, {
      ...configuration,
      left: left,
      top: top,
      width: width,
      height: height,
      _controlsVisibility: {
        mtr: false,
      }
    }));
    return area;
  }

  protected outputX(value: number): number {
    return Math.round(value * this.canvas.get('width'));
  }

  protected outputY(value: number): number {
    return Math.round(value * this.canvas.get('height'));
  }

  protected getRandomColor(color: string): string {
    while (color === undefined || !(/^#([A-Fa-f0-9]{3}){1,2}$/.test(color))) {
      color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
    return color;
  }

  static getObjectId(): number {
    return Fabric.Object.__uid++;
  }

  static hexToRgbA(hex: string, alpha?: number): string {
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
