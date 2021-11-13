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
import { AreaForm } from './AreaForm';
import { ShapeFactory } from './Shape/Factory';
import { PolygonShape } from './Shape/Polygon/Shape';

export class Editor {
  readonly configuration: EditorConfiguration;

  readonly modalParent: Document;

  readonly browselinkParent: Document;

  private canvas: Fabric.Canvas;

  private formSelector: string = '#areasForm';

  private form: AreaForm;

  constructor(
    configuration: EditorConfiguration,
    canvas: HTMLCanvasElement,
    modalParent: Document,
    browselinkParent: Document
  ) {
    this.configuration = configuration;
    this.modalParent = modalParent;
    this.browselinkParent = browselinkParent;

    this.initializeCanvas(canvas);
    this.initializeAreaForm();
  }

  private initializeCanvas(canvas: HTMLCanvasElement): void {
    // @ts-ignore
    let helper: HTMLFrameElement = frameElement;
    if (helper && helper.contentWindow && Fabric.window !== helper.contentWindow.parent) {
      Fabric.window = helper.contentWindow.parent;
      Fabric.document = helper.contentWindow.parent.document;
    }

    this.canvas = new Fabric.Canvas(canvas, {
      width: AreaForm.width,
      height: AreaForm.height,
      top: AreaForm.height * -1,
      selection: false,
      preserveObjectStacking: true,
      hoverCursor: 'move',
    });
  }

  private initializeAreaForm(): void {
    let element: HTMLElement = this.modalParent.querySelector(this.formSelector);
    this.form = new AreaForm(element, this.canvas, this.configuration, this.modalParent, this.browselinkParent);
  }

  static objectModified(event: FabricEvent): void {
    let element: Fabric.Object = event.target;
    if (element.hasOwnProperty('fieldset')) {
      // circle, polygon, rectangle
      element.fieldset.shapeModified(element);
    }
  }

  public resize(width: number, height: number): void {
    if (AreaForm.width !== width || AreaForm.height !== height) {
      let data: Array<Area> = JSON.parse(this.getMapData());

      this.removeAreas();

      AreaForm.width = width;
      AreaForm.height = height;

      this.canvas.setWidth(width);
      this.canvas.setHeight(height);
      this.canvas.calcOffset();

      this.renderAreas(data);
    }
  }

  public renderAreas(areas: Array<Area>): void {
    if (areas !== undefined) {
      let shapeFactory = new ShapeFactory(this.canvas, this.configuration);

      areas.forEach((area) => {
        let shape = shapeFactory.create(area, true);

        this.canvas.add(shape.canvasShape);
        this.form.addArea(shape.sidebarFieldset);

        if (shape instanceof PolygonShape) {
          shape.canvasShape.initializeControls();
        }
      });
    }
  }

  public removeAreas(): void {
    this.form.areaFieldsets.forEach((area) => {
      this.form.deleteArea(area);
    })
  }

  public getMapData(): string {
    return this.form.getMapData();
  }

  public destroy(): void {
    this.canvas = null;
    this.form.destroy();
  }
}
