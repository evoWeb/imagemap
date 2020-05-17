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
import { Canvas, Object } from './vendor/Fabric';
import { AreaShapeFactory } from './AreaShapeFactory';

export class Preview {
  readonly configurations: EditorConfigurations;

  protected areaShapes: Array<Object> = [];

  protected canvas: Canvas;

  constructor(configurations: EditorConfigurations, canvas: HTMLElement) {
    this.configurations = configurations;
    this.initializeCanvas(canvas);
  }

  protected initializeCanvas(canvas: HTMLElement): void {
    this.canvas = new Canvas(canvas, {
      ...this.configurations.canvas,
      selection: false,
      preserveObjectStacking: true,
      hoverCursor: 'default',
    });
  }

  public renderAreas(areas: Array<AreaAttributes>): void {
    if (areas !== undefined) {
      let areaShapeFactory = new AreaShapeFactory(this.configurations);

      areas.forEach((area: AreaAttributes) => {
        let areaShape = areaShapeFactory.createShape(area, false);

        this.canvas.add(areaShape);
        this.areaShapes.push(areaShape);
      });
    }
  }

  public removeAreas(): void {
    this.areaShapes.forEach((area) => {
      area.remove();
    });
  }
}
