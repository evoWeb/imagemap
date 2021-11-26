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
import { AbstractArea } from './Shape/AbstractArea';

export class Editor {
  readonly configuration: EditorConfiguration;

  readonly modalParent: Document;

  readonly browselinkParent: Document;

  private areas: Array<AbstractArea> = [];

  private canvas: Fabric.Canvas;

  private formSelector: string = '#areasForm';

  private form: AreaForm;

  /**
   * @param canvas element to use to render shapes into
   * @param configuration
   * @param modalParent document in which the image is rendered
   * @param browselinkParent document in which the browslink is going to set fields
   */
  constructor(
    canvas: HTMLCanvasElement,
    configuration: EditorConfiguration,
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
    this.setWindowAndDocument();

    this.canvas = new Fabric.Canvas(canvas, {
      width: this.configuration.width,
      height: this.configuration.height,
      top: this.configuration.height * -1,
      selection: false,
      preserveObjectStacking: true,
      hoverCursor: 'move',
    });
  }

  private setWindowAndDocument() {
    let frame: HTMLFrameElement = frameElement as HTMLFrameElement;
    if (frame && frame.contentWindow && Fabric.window !== frame.contentWindow.parent) {
      Fabric.window = frame.contentWindow.parent;
      Fabric.document = frame.contentWindow.parent.document;
    }
  }

  private initializeAreaForm(): void {
    let element: HTMLElement = this.modalParent.querySelector(this.formSelector);
    this.form = new AreaForm(element, this.canvas, this.configuration, this.modalParent, this.browselinkParent);
  }

  public renderAreas(areas: Array<Area>): void {
    if (areas !== undefined) {
      let shapeFactory = new ShapeFactory(this.canvas, this.configuration);

      areas.forEach((area) => {
        let shape = shapeFactory.create(area, true);

        this.areas.push(shape);
        this.canvas.add(shape.canvasShape);
        this.form.addArea(shape.sidebarFieldset);

        if (shape instanceof PolygonShape) {
          shape.canvasShape.initializeControls();
        }
      });
    }
  }

  public resize(width: number, height: number): void {
    if (this.configuration.width !== width || this.configuration.height !== height) {
      this.configuration.width = width;
      this.configuration.height = height;

      this.canvas.setWidth(width);
      this.canvas.setHeight(height);
      this.canvas.calcOffset();

      this.resizeAreas();
    }
  }

  public resizeAreas(): void {
    this.areas.forEach((area) => {
      area.resize(this.configuration.width, this.configuration.height);
    })
  }

  public getMapData(): string {
    let areas: Area[] = [];

    this.areas.forEach((area: AbstractArea) => {
      areas.push(area.getData());
    });

    return JSON.stringify(areas);
  }

  public destroy(): void {
    this.canvas = null;
    this.form.destroy();
  }
}
