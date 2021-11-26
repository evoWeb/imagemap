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
import * as Fabric from './vendor/Fabric.min';
import { AbstractArea } from './Shape/AbstractArea';
import { ShapeFactory } from './Shape/Factory';

export class Preview {
  readonly configuration: EditorConfiguration;

  private areas: Array<AbstractArea> = [];

  private canvas: Fabric.Canvas;

  constructor(
    canvas: HTMLElement,
    configuration: EditorConfiguration
  ) {
    this.configuration = configuration;

    this.initializeCanvas(canvas);
  }

  private initializeCanvas(canvas: HTMLElement): void {
    this.canvas = new Fabric.Canvas(canvas, {
      width: this.configuration.width,
      height: this.configuration.height,
      selection: false,
      preserveObjectStacking: true,
      hoverCursor: 'default',
    });
  }

  public renderAreas(areas: Array<AreaData>): void {
    let shapeFactory = new ShapeFactory(this.canvas, this.configuration);
    areas.forEach((areaData: AreaData) => {
      let area = shapeFactory.create(areaData, false);
      this.canvas.add(area.canvasShape);
      this.areas.push(area);
    });
  }

  public removeAreas(): void {
    this.areas.forEach((area: AbstractArea) => {
      this.canvas.remove(area.canvasShape);
      area = null;
    });
    this.areas = [];
  }
}
