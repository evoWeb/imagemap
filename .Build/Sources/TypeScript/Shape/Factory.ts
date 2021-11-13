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
import { Canvas, Object } from '../vendor/Fabric.min';
import { AreaForm } from '../AreaForm';
import { AbstractArea } from './AbstractArea';
import { CircleArea } from './Circle/Area';
import { CircleShape } from './Circle/Shape';
import { CircleFieldset } from './Circle/Fieldset';
import { PolygonArea } from './Polygon/Area';
import { PolygonShape } from './Polygon/Shape';
import { PolygonFieldset } from './Polygon/Fieldset';
import { RectangleArea } from './Rectangle/Area';
import { RectangleShape } from './Rectangle/Shape';
import { RectangleFieldset } from './Rectangle/Fieldset';

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

  readonly canvas: Canvas;

  readonly configuration: EditorConfiguration;

  constructor(canvas: Canvas = null, configuration: EditorConfiguration = null) {
    this.canvas = canvas;
    this.configuration = configuration;
  }

  public create(areaData: Area, selectable: boolean): AbstractArea {
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

  protected createCircle(areaData: Area, configuration: ShapeConfiguration): CircleArea {
    let coords = areaData.coords,
      radius = this.outputiX(coords.radius),
      left = this.outputiX(coords.left) - radius,
      top = this.outputiY(coords.top) - radius;

    return new CircleArea(
      areaData,
      new CircleFieldset(this.configuration),
      new CircleShape({
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
      })
    );
  }

  protected createPolygon(areaData: Area, configuration: ShapeConfiguration): PolygonArea {
    let points: Point[] = areaData.points || [],
      polygonPoints: Point[] = [];

    points.map((point) => {
      point.id = configuration.id + '-' + ShapeFactory.getObjectId();
      polygonPoints.push({
        x: this.outputiX(point.x),
        y: this.outputiY(point.y),
        id: point.id,
      });
    });

    return new PolygonArea(
      areaData,
      new PolygonFieldset(this.configuration),
      new PolygonShape(polygonPoints, {
        ...configuration,
        objectCaching: false,
      })
    );
  }

  protected createRectangle(areaData: Area, configuration: ShapeConfiguration): RectangleArea {
    let coords = areaData.coords,
      left = this.outputiX(coords.left),
      top = this.outputiY(coords.top),
      width = this.outputiX(coords.right) - left,
      height = this.outputiY(coords.bottom) - top;

    return new RectangleArea(
      areaData,
      new RectangleFieldset(this.configuration),
      new RectangleShape({
        ...configuration,
        left: left,
        top: top,
        width: width,
        height: height,
        _controlsVisibility: {
          mtr: false,
        }
      })
    );
  }

  protected outputiX(value: number): number {
    return Math.round(value * AreaForm.width);
  }

  protected outputiY(value: number): number {
    return Math.round(value * AreaForm.height);
  }

  protected getRandomColor(color: string): string {
    while (color === undefined || !(/^#([A-Fa-f0-9]{3}){1,2}$/.test(color))) {
      color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    }
    return color;
  }

  static getObjectId(): number {
    return Object.__uid++;
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
