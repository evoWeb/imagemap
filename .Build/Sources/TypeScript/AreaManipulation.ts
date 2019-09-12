/**
 * This file is developed by evoweb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */

/// <reference types="../types/index"/>

// @ts-ignore
import * as fabric from './vendor/fabric';

class AreaForm {
  private element: HTMLElement;

  constructor(options: FormOptions, editor: AreaManipulation) {
    this.element = editor.container.querySelector(options.formSelector);
  }
}

class AreaCanvas {
  readonly canvas: fabric.Canvas;

  constructor(element: HTMLCanvasElement, options: CanvasOptions) {
    this.canvas = new fabric.Canvas(element, options);
    fabric.util.setStyle(this.canvas.wrapperEl, {
      height: '100%',
      position: 'absolute',
      width: '100%',
    });

    this.canvas.on('object:moving', this.canvasObjectMoving);
    this.canvas.on('selection:created', this.canvasSelectionCreated);
    this.canvas.on('selection:updated', this.canvasSelectionUpdated);
  }

  canvasObjectMoving(event: FabricEvent) {
    let element = (event.target as fabric.Object);
    switch (element.type) {
      case 'control':
        let center = element.getCenterPoint();
        element.point.x = center.x - element.polygon.left;
        element.point.y = center.y - element.polygon.top;
        break;

      case 'polygon':
        element.controls.forEach((control: fabric.Object) => {
          control.left = element.left + control.point.x;
          control.top = element.top + control.point.y;
        });
        break;
    }
  }

  canvasSelectionCreated(event: FabricEvent) {
    let activePolygon:fabric.Object = null;

    if (event.target.type === 'polygon') {
      activePolygon = event.target;
      // show controls of active polygon
      activePolygon.controls.forEach((control: fabric.Object) => {
        control.opacity = 1;
      });
      this.canvas.renderAll();
    }
  }

  canvasSelectionUpdated(event: FabricEvent) {
    let activePolygon:fabric.Object = null;

    event.deselected.forEach((element: fabric.Object) => {
      if (element.type === 'polygon' && event.selected[0].type !== 'control') {
        // hide controls of active polygon
        element.controls.forEach((control: fabric.Object) => {
          control.opacity = 0;
        });
        activePolygon = null;
        this.canvas.renderAll();
      } else if (element.type === 'control') {
        // hide controls of active polygon
        activePolygon.controls.forEach((control: fabric.Object) => {
          control.opacity = 0;
        });
        activePolygon = null;
        this.canvas.renderAll();
      }
    });

    event.selected.forEach((element: fabric.Object) => {
      if (element.type === 'polygon') {
        activePolygon = element;
        // hide controls of active polygon
        element.controls.forEach((control: fabric.Object) => {
          control.opacity = 1;
        });
        this.canvas.renderAll();
      }
    });
  }
}


export default class AreaManipulation {
  readonly interactive: boolean = false;

  public container: HTMLElement;

  private options: EditorOptions;

  private canvas: AreaCanvas;

  private form: AreaForm;

  constructor(container: HTMLElement, options: EditorOptions) {
    this.options = options;
    this.container = container;
    this.interactive = !!(options.formSelector || '');

    this.initializeCanvas();
    this.initializeForm();
  }

  initializeCanvas() {
    let canvas: HTMLCanvasElement = this.container.querySelector(this.options.canvasSelector);
    this.canvas = new AreaCanvas(
      canvas,
      {
        width: this.options.canvas.width,
        height: this.options.canvas.height,
        selection: false,
        preserveObjectStacking: true,
        hoverCursor: this.interactive ? 'move' : 'default',
      }
    );
  }

  initializeForm() {
    if (this.interactive) {
      this.form = new AreaForm({
        formSelector: this.options.formSelector
      }, this);
    }
  }

  removeAllAreas() {

  }

  initializeAreas(areas: Array<any>) {

  }

  getAreasData(): Array<any> {
    return [];
  }

  destruct() {
    // this.form.destroy();
  }

  static wait(callback: Function, delay: number) {
    return window.setTimeout(callback, delay);
  }
}
