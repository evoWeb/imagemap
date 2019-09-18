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
/// <reference types="fabric"/>

// @ts-ignore
import * as fabric from './vendor/fabric';
import 'TYPO3/CMS/Core/Contrib/jquery.minicolors';
// @ts-ignore
import * as Modal from 'TYPO3/CMS/Backend/Modal';

export class AreaUtility {
  static before: number = -1;

  static after: number = 1;

  static getRandomColor(color: string): string {
    if (color === undefined || color === '') {
      let r = (Math.floor(Math.random() * 5) * 3).toString(16),
        g = (Math.floor(Math.random() * 5) * 3).toString(16),
        b = (Math.floor(Math.random() * 5) * 3).toString(16);
      color = '#' + r + r + g + g + b + b;
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
    throw new Error('Bad Hex');
  }

  static wait(callback: Function, delay: number) {
    return window.setTimeout(callback, delay);
  }

  static addElementToArrayWithPosition(array: Array<any>, item: any, newPointIndex: number) {
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

abstract class FormArea {
  protected abstract name: string;

  readonly id: number = 0;

  private eventDelay: number;

  private _element: HTMLElement;

  private _canvasArea: CanvasRectangle|CanvasCircle|CanvasPolygon|fabric.Object;

  readonly form: AreaForm;

  protected configuration: HTML5Area;

  [property: string]: any;

  constructor(form: AreaForm, canvasArea: CanvasRectangle|CanvasCircle|CanvasPolygon, configuration: HTML5Area) {
    this.form = form;
    this.configuration = configuration;

    this._canvasArea = canvasArea;
    this._canvasArea.formArea = this;
    this.id = canvasArea.id;
  }

  public initialize() {
    this.prepareAreaTemplate();
    this.updateFields(this.configuration);
    this.initializeColorPicker();
    this.initializeEvents();
    this.addFauxInput();
  }

  get canvasArea(): CanvasRectangle|CanvasCircle|CanvasPolygon|fabric.Object {
    return this._canvasArea;
  }
  set canvasArea(value: CanvasRectangle|CanvasCircle|CanvasPolygon|fabric.Object) {
    this._canvasArea = value;
  }

  get element() {
    return this._element;
  }

  protected getFormElement(selector: string, id: number): HTMLElement {
    let template = this.form.element
      .querySelector(selector)
      .innerHTML.replace(
        new RegExp('_ID', 'g'), String(id ? id : this.id)
      );
    return (new DOMParser()).parseFromString(template, 'text/html').body.firstChild as HTMLElement;
  }

  private prepareAreaTemplate() {
    this._element = this.getFormElement('#' + this.name + 'Form', this.id);
  }

  protected getElement(selector: string): HTMLInputElement {
    return this.element.querySelector(selector);
  }

  protected getElements(selector: string) {
    return this.element.querySelectorAll(selector);
  }

  private hideElement(selector: string) {
    this.getElement(selector).classList.add('hide');
  }

  private showElement(selector: string) {
    this.getElement(selector).classList.remove('hide');
  }

  public getFieldValue(selector: string): string {
    return this.getElement(selector).value;
  }

  public setFieldValue(selector: string, value: string|number) {
    this.getElement(selector).value = (value || '').toString();
  }

  private initializeColorPicker() {
    ($(this.getElement('.t3js-color-picker')) as any).minicolors({
      format: 'hex',
      position: 'left',
      theme: 'default',
      changeDelay: 100,
      change: this.colorPickerAction.bind(this)
    });
  }

  private colorPickerAction(value: string) {
    (this.getElement('.t3js-color-picker') as HTMLInputElement).value = value;
    this.canvasArea.set('borderColor', value);
    this.canvasArea.set('stroke', value);
    this.canvasArea.set('fill', AreaUtility.hexToRgbA(value, 0.2));
    this.canvasArea.canvas.renderAll();
  }

  private initializeEvents() {
    // this.on('moved', this.updateFields.bind(this));
    // this.on('modified', this.updateFields.bind(this));

    this.getElements('.positionOptions .t3js-field').forEach((field: HTMLInputElement) => {
      field.addEventListener('keyup', this.fieldKeyUpHandler.bind(this));
    });
    this.getElements('.basicOptions .t3js-field').forEach((field: HTMLInputElement) => {
      field.addEventListener('keyup', this.updateProperties.bind(this));
    });
    this.getElements('.t3js-btn').forEach((button: HTMLElement) => {
      let action = button.dataset.action + 'Action';
      button.addEventListener('click', (this[action] as Function).bind(this));
    });
  }

  private fieldKeyUpHandler(event: Event) {
    clearTimeout(this.eventDelay);
    this.eventDelay = AreaUtility.wait(() => { this.updateCanvas(event); }, 500);
  }

  private updateProperties(event: Event) {
    let field = (event.currentTarget as HTMLInputElement),
      property = field.id;
    if (this.configuration.hasOwnProperty(property)) {
      this.configuration[property] = field.value;
    } else if (this.configuration.coords.hasOwnProperty(property)) {
      this.configuration.coords[property] = field.value;
    } else if (this.configuration.data.hasOwnProperty(property)) {
      this.configuration.data[property] = field.value;
    }
  }

  public updateArrowsState() {
    let areaZone = this.form.areaZone;
    this.getElement('[data-action="up"]').classList[areaZone.firstChild !== this.element ? 'remove' : 'add']('disabled');
    this.getElement('[data-action="down"]').classList[areaZone.lastChild !== this.element ? 'remove' : 'add']('disabled');
  }

  private linkAction(event: Event) {
    event.preventDefault();
    this.form.openLinkBrowser((event.currentTarget as HTMLElement), this);
  }

  private upAction(event: Event) {
    event.preventDefault();
    this.form.moveArea(this, AreaUtility.before);
  }

  private downAction(event: Event) {
    event.preventDefault();
    this.form.moveArea(this, AreaUtility.after);
  }

  private deleteAction(event: Event) {
    event.preventDefault();
    if (this.element) {
      this.element.remove();
    }
    this.removeFauxInput();
    this.form.deleteArea(this);
  }

  private expandAction(event: Event) {
    event.preventDefault();
    this.showElement('.moreOptions');
    this.hideElement('[data-action="expand"]');
    this.showElement('[data-action="collapse"]');
  }

  private collapseAction(event: Event) {
    event.preventDefault();
    this.hideElement('.moreOptions');
    this.hideElement('[data-action="collapse"]');
    this.showElement('[data-action="expand"]');
  }

  private undoAction() {
  }

  private redoAction() {
  }

  /**
   * Add faux input as target for browselink which listens for changes and writes value to real field
   */
  private addFauxInput() {
    if (this.form.fauxForm) {
      let fauxInput = this.form.fauxDocument.createElement('input');
      fauxInput.setAttribute('id', 'link' + this.id);
      fauxInput.setAttribute('data-formengine-input-name', 'link' + this.id);
      fauxInput.setAttribute('value', this.configuration.href);
      fauxInput.onchange = this.changedFauxInput.bind(this);
      this.form.fauxForm.appendChild(fauxInput);
    }
  }

  private removeFauxInput() {
    if (this.form && this.form.fauxForm) {
      let field = this.form.fauxForm.querySelector('#link' + this.id);
      if (field) {
        field.remove();
      }
    }
  }

  private changedFauxInput() {
    let field = (this.form.fauxDocument.querySelector('#link' + this.id) as HTMLInputElement);
    this.configuration.href = field.value;
    this.updateFields(this.configuration);
  }

  public abstract updateFields(configuration: HTML5Area): void;

  public abstract updateCanvas(event: Event): void;

  public abstract getData(): HTML5Area;

  public destroy() {
    this.element.remove();
    this.removeFauxInput();
    this.form.deleteArea(this);
  }
}

class FormRectangle extends FormArea {
  protected name: string = 'rectangle';

  public updateFields(configuration: HTML5Area) {
    this.configuration = configuration;

    this.setFieldValue('.color', configuration.data.color);
    this.setFieldValue('.alt', configuration.alt);
    this.setFieldValue('.href', configuration.href);
    this.setFieldValue('#left', configuration.coords.left);
    this.setFieldValue('#top', configuration.coords.top);
    this.setFieldValue('#right', configuration.coords.right);
    this.setFieldValue('#bottom', configuration.coords.bottom);
  }

  public updateCanvas(event: Event) {
    let coords = this.configuration.coords,
      field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = parseInt(field.value),
      scaledWidth = this.canvasArea.getScaledWidth(),
      scaledHeight = this.canvasArea.getScaledHeight(),
      property = '';

    switch (field.id) {
      case 'left':
        this.getElement('#right').value = value + scaledWidth;
        coords.right = value + scaledWidth;
        coords.left = value;
        property = 'left';
        break;

      case 'top':
        this.getElement('#bottom').value = value + scaledHeight;
        coords.bottom = value + scaledWidth;
        coords.top = value;
        property = 'top';
        break;

      case 'right':
        value -= coords.left;
        coords.right = value;
        if (value < 0) {
          value = 10;
          field.value = (coords.left + value).toString();
        }
        property = 'width';
        break;

      case 'bottom':
        value -= coords.top;
        coords.bottom = value;
        if (value < 0) {
          value = 10;
          field.value = (coords.top + value).toString();
        }
        property = 'height';
        break;
    }

    if (property && value) {
      let set = ({} as {[property: string]: any});
      set[property] = value;
      this.canvasArea.set(set);
      this.canvasArea.canvas.renderAll();
    }
  }

  public getData(): HTML5Area {
    return {
      shape: 'rect',
      href: this.getFieldValue('.href'),
      alt: this.getFieldValue('.alt'),
      coords: {
        left: parseInt(this.getFieldValue('#left')),
        top: parseInt(this.getFieldValue('#top')),
        right: parseInt(this.getFieldValue('#right')),
        bottom: parseInt(this.getFieldValue('#bottom'))
      },
      data: {
        color: this.getFieldValue('.color')
      }
    };
  }
}

class FormCircle extends FormArea {
  protected name: string = 'circle';

  public updateFields(configuration: HTML5Area) {
    this.configuration = configuration;

    this.setFieldValue('.color', configuration.data.color);
    this.setFieldValue('.alt', configuration.alt);
    this.setFieldValue('.href', configuration.href);
    this.setFieldValue('#left', configuration.coords.left);
    this.setFieldValue('#top', configuration.coords.top);
    this.setFieldValue('#radius', configuration.coords.radius);
  }

  public updateCanvas(event: Event) {
    let coords = this.configuration.coords,
      field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = parseInt(field.value),
      property = '';

    switch (field.id) {
      case 'left':
        coords.left = value;
        property = 'left';
        break;

      case 'top':
        coords.left = value;
        property = 'top';
        break;

      case 'radius':
        coords.left = value;
        property = 'radius';
        break;
    }
    if (property && value) {
      let set = ({} as {[property: string]: any});
      set[property] = value;
      this.canvasArea.set(set);
      this.canvasArea.canvas.renderAll();
    }
  }

  public getData(): HTML5Area {
    return {
      shape: 'circle',
      href: this.getFieldValue('.href'),
      alt: this.getFieldValue('.alt'),
      coords: {
        left: parseInt(this.getFieldValue('#left')),
        top: parseInt(this.getFieldValue('#top')),
        radius: parseInt(this.getFieldValue('#radius'))
      },
      data: {
        color: this.getFieldValue('.color')
      }
    };
  }
}

class FormPolygon extends FormArea {
  protected name: string = 'polygon';

  public updateFields(configuration: HTML5Area) {
    this.configuration = configuration;

    this.setFieldValue('.color', configuration.data.color);
    this.setFieldValue('.alt', configuration.alt);
    this.setFieldValue('.href', configuration.href);

    let parentElement = this.getElement('.positionOptions');
    configuration.coords.points.forEach((point: fabric.Point, index: number) => {
      point.id = point.id ? point.id : 'p' + this.id + '_' + index;

      if (!point.hasOwnProperty('element')) {
        point.element = this.getFormElement('#polyCoords', point.id);
        parentElement.append(point.element);
      }

      point.element.querySelector('#x' + point.id).value = point.x + this.canvasArea.left;
      point.element.querySelector('#y' + point.id).value = point.y + this.canvasArea.top;
    });
  }

  public updateCanvas(event: Event) {
    let coords = this.configuration.coords,
      field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = parseInt(field.value),
      [, point] = field.id.split('_'),
      control = this.controls[parseInt(point)],
      x = control.getCenterPoint().x,
      y = control.getCenterPoint().y;

    if (field.id.indexOf('x') > -1) {
      x = value;
    }
    if (field.id.indexOf('y') > -1) {
      y = value;
    }
console.log([
  coords,
  field,
  value,
  point,
  control,
  x,
  y
]);
    control.set('left', x);
    control.set('top', y);
    control.setCoords();
    coords[control.name] = {x: x, y: y};
    this.canvas.renderAll();
  }

  public getData(): HTML5Area {
    let coords = ([] as Array<any>),
      xCoords = this.getElements('.x-coord'),
      yCoords = this.getElements('.y-coord');

    xCoords.forEach((x: HTMLInputElement, index: number) => {
      let y = (yCoords[index] as HTMLInputElement),
        point = {
          x: parseInt(x.value),
          y: parseInt(y.value)
        };
      coords.push(point);
    });

    return {
      shape: 'poly',
      href: this.getFieldValue('.href'),
      alt: this.getFieldValue('.alt'),
      coords: coords,
      data: {
        color: this.getFieldValue('.color')
      }
    };
  }

  private addPointBeforeAction(event: Event) {
    let direction = AreaUtility.before,
      index = this.points.length,
      parentElement = this.getElement('.positionOptions'),
      [point, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction);

    parentElement.insertBefore(element, currentPoint.element);

    this.points = AreaUtility.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
    this.addControl(this.editor.areaConfig, point, index, currentPointIndex + direction);
  }

  private addPointAfterAction(event: Event) {
    let direction = AreaUtility.after,
      index = this.points.length,
      parentElement = this.getElement('.positionOptions'),
      [point, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction);

    if (currentPoint.element.nextSibling) {
      parentElement.insertBefore(element, currentPoint.element.nextSibling);
    } else {
      parentElement.append(element);
    }

    this.points = AreaUtility.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
    this.addControl(this.editor.areaConfig, point, index, currentPointIndex + direction);
  }

  private removePointAction(event: Event) {
    if (this.points.length > 3) {
      let element = (event.currentTarget as HTMLElement).parentNode.parentNode as HTMLElement,
        points = ([] as fabric.Point),
        controls = ([] as fabric.Object);

      this.points.forEach((point: fabric.Point, index: number) => {
        if (element.id !== point.id) {
          points.push(point);
          controls.push(this.controls[index]);
        } else {
          point.element.remove();
          this.canvas.remove(this.controls[index]);
        }
      });

      points.forEach((point: fabric.Point, index: number) => {
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
}

class AreaForm {
  readonly _element: HTMLElement;

  readonly _areaZone: HTMLElement;

  readonly options: FormOptions;

  public areas: Array<FormArea> = [];

  /**
   * Element needed to add inputs that act as target for browselink finalizeFunction target
   */
  readonly fauxDocument: Document;

  public fauxForm: HTMLFormElement;

  constructor(options: FormOptions, editor: AreaManipulation) {
    this.options = options;
    this.fauxDocument = this.options.formDocument;
    this._element = editor.container.querySelector(options.formSelector);
    this._areaZone = this.element.querySelector('#areaZone');

    this.addFauxFormForLinkBrowser();
  }

  get element() {
    return this._element;
  }

  get areaZone() {
    return this._areaZone;
  }

  public addArea(area: HTML5Area, canvasArea: CanvasRectangle|CanvasCircle|CanvasPolygon): FormArea {
    let formArea;

    switch (area.shape) {
      case 'rect':
      case 'rectangle':
        formArea = new FormRectangle(this, canvasArea, area);
        break;

      case 'circ':
      case 'circle':
        formArea = new FormCircle(this, canvasArea, area);
        break;

      case 'poly':
      case 'polygon':
        formArea = new FormPolygon(this, canvasArea, area);
        break;

      case 'default':
    }

    formArea.initialize();
    this._areaZone.append(formArea.element);
    this.areas.push(formArea);
    return formArea;
  }

  public deleteArea(area: FormArea) {
    let areas = ([] as Array<FormArea>);
    this.areas.forEach((currentArea) => {
      if (area !== currentArea) {
        areas.push(currentArea);
      }
    });
    this.areas = areas;
    area.canvasArea.canvas.remove(area.canvasArea);
    area = null;
    this.updateArrowsState();
  }

  public moveArea(area: FormArea, offset: number) {
    let index = this.areas.indexOf(area),
      newIndex = index + offset,
      parent = area.element.parentNode;

    if (newIndex > -1 && newIndex < this.areas.length) {
      let removedArea = this.areas.splice(index, 1)[0];
      this.areas.splice(newIndex, 0, removedArea);

      parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
    }

    this.updateArrowsState();
  }

  public updateArrowsState() {
    this.areas.forEach((area: FormArea) => {
      area.updateArrowsState();
    });
  }

  /**
   * Create form element that is reachable for LinkBrowser.finalizeFunction
   */
  private addFauxFormForLinkBrowser() {
    if (top.document !== this.fauxDocument) {
      if (!(this.fauxForm = this.fauxDocument.querySelector(this.options.formSelector))) {
        this.fauxForm = this.fauxDocument.createElement('form');
        this.fauxForm.setAttribute('name', 'areasForm');
        this.fauxForm.setAttribute('id', 'fauxForm');
        this.fauxDocument.body.appendChild(this.fauxForm);
      }

      // empty previously created fauxForm
      while (this.fauxForm.firstChild) {
        this.fauxForm.removeChild(this.fauxForm.firstChild);
      }
    }
  }

  public openLinkBrowser(link: HTMLElement, area: FormArea) {
    link.blur();

    let data = {
      ...this.options.browseLink,
      objectId: area.id,
      formName: 'areasForm',
      itemFormElName: 'link' + area.id
    };

    $.ajax({
      url: this.options.browseLinkUrlAjaxUrl,
      context: area,
      data: data
    }).done((response: {url: string}) => {
      const url = response.url
        + '&P[currentValue]=' + encodeURIComponent(area.getFieldValue('.href'))
        + '&P[currentSelectedValues]=' + encodeURIComponent(area.getFieldValue('.href'));
      window.FormArea = area;

      Modal.advanced({
        type: Modal.types.iframe,
        content: url,
        size: Modal.sizes.large,
      });
    });
  }

  public destroy() {
    this.areas.forEach((area: FormArea) => {
      area.destroy();
    })
  }
}

class CanvasRectangle extends fabric.Rect {
  public id: number = 0;

  private _canvas: AreaCanvas;

  private _formArea: FormArea;

  constructor(options: CanvasAreaConfiguration) {
    super(options);
    this.id = fabric.Object.__uid++;
  }

  get canvas(): AreaCanvas {
    return this._canvas;
  }
  set canvas(value: AreaCanvas) {
    this._canvas = value;
  }

  get formArea(): FormArea {
    return this._formArea;
  }
  set formArea(value: FormArea) {
    this._formArea = value;
  }
}

class CanvasCircle extends fabric.Circle {
  public id: number = 0;

  private _canvas: AreaCanvas;

  private _formArea: FormArea;

  constructor(options: CanvasAreaConfiguration) {
    super(options);
    this.id = fabric.Object.__uid++;
  }

  get canvas(): AreaCanvas {
    return this._canvas;
  }
  set canvas(value: AreaCanvas) {
    this._canvas = value;
  }

  get formArea(): FormArea {
    return this._formArea;
  }
  set formArea(value: FormArea) {
    this._formArea = value;
  }
}

class CanvasPolygon extends fabric.Polygon {
  public id: number = 0;

  private _canvas: AreaCanvas;

  private _formArea: FormArea;

  constructor(options: CanvasAreaConfiguration, points: Array<any>) {
    super(points, options);
    this.id = fabric.Object.__uid++;
  }

  get canvas(): AreaCanvas {
    return this._canvas;
  }
  set canvas(value: AreaCanvas) {
    this._canvas = value;
  }

  get formArea(): FormArea {
    return this._formArea;
  }
  set formArea(value: FormArea) {
    this._formArea = value;
  }

  public addControls() {
  }
}

class AreaCanvas {
  readonly areaConfig = {
    cornerColor: '#eee',
    cornerStrokeColor: '#bbb',
    cornerSize: 10,
    cornerStyle: 'circle',
    hasBorders: false,
    hasRotatingPoint: false,
    strokeWidth: 1,
    transparentCorners: false
  };

  readonly options: CanvasOptions;

  readonly canvas: fabric.Canvas;

  private areas: Array<CanvasRectangle|CanvasCircle|CanvasPolygon> = [];

  constructor(element: HTMLCanvasElement, options: CanvasOptions) {
    this.options = options;

    this.canvas = new fabric.Canvas(element, options);
    fabric.util.setStyle(this.canvas.wrapperEl, {
      position: 'absolute',
    });

    this.canvas.on('object:moving', this.canvasObjectMoving);
    this.canvas.on('selection:created', this.canvasSelectionCreated);
    this.canvas.on('selection:updated', this.canvasSelectionUpdated);
  }

  private canvasObjectMoving(event: FabricEvent) {
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

  private canvasSelectionCreated(event: FabricEvent) {
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

  private canvasSelectionUpdated(event: FabricEvent) {
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

  public addArea(area: HTML5Area): CanvasRectangle|CanvasCircle|CanvasPolygon {
    let canvasArea,
      configuration = {
        coords: area.coords,
        selectable: this.options.interactive,
        hasControls: this.options.interactive,
        stroke: area.data.color,
        fill: AreaUtility.hexToRgbA(area.data.color, 0.3)
      };

    switch (area.shape) {
      case 'rect':
      case 'rectangle':
        canvasArea = this.createRectangle(configuration);
        break;

      case 'circ':
      case 'circle':
        canvasArea = this.createCircle(configuration);
        break;

      case 'poly':
      case 'polygon':
        canvasArea = this.createPolygon(configuration);
        break;

      case 'default':
    }

    canvasArea.canvas = this;
    this.canvas.add(canvasArea);
    this.areas.push(canvasArea);

    return canvasArea;
  }

  private createRectangle(configuration: CanvasAreaConfiguration): CanvasRectangle {
    let coords = configuration.coords,
      options = {
        ...this.areaConfig,
        ...configuration,
        top: coords.top,
        left: coords.left,
        width: coords.right - coords.left,
        height: coords.bottom - coords.top,
      };

    return new CanvasRectangle(options);
  }

  private createCircle(configuration: CanvasAreaConfiguration): CanvasCircle {
    let coords = configuration.coords,
      options = {
        ...this.areaConfig,
        ...configuration,
        top: coords.top - coords.radius,
        left: coords.left - coords.radius,
        radius: coords.radius,
      },
      canvasArea = new CanvasCircle(options);

    // disable control points as these would stretch the circle
    // to an ellipse which is not possible in html areas
    // @ts-ignore
    canvasArea.setControlVisible('ml', false);
    // @ts-ignore
    canvasArea.setControlVisible('mt', false);
    // @ts-ignore
    canvasArea.setControlVisible('mr', false);
    // @ts-ignore
    canvasArea.setControlVisible('mb', false);

    return canvasArea;
  }

  private createPolygon(configuration: CanvasAreaConfiguration) {
    let left = 100000,
      top = 100000,
      options = {
        ...this.areaConfig,
        ...configuration,
        left: 0,
        top: 0,
        selectable: true,
        hasControls: false,
        objectCaching: false,
        controlConfig: this.areaConfig,
      };

    // get top and left corner of polygon
    options.coords.points.forEach((point) => {
      left = Math.min(left, point.x);
      top = Math.min(top, point.y);
    });

    // reduce point x/y values by top/left values
    options.coords.points.forEach((point) => {
      point.x = point.x - left;
      point.y = point.y - top;
    });

    options.left = left;
    options.top = top;

    let canvasArea = new CanvasPolygon(options, options.coords.points);

    if (this.options.interactive) {
      canvasArea.addControls();
    }

    return canvasArea;
  }

  public deleteArea(area: CanvasRectangle|CanvasCircle|CanvasPolygon) {
    let areas = ([] as Array<CanvasRectangle|CanvasCircle|CanvasPolygon>);
    this.areas.forEach((currentArea) => {
      if (area !== currentArea) {
        areas.push(currentArea);
      }
    });
    this.areas = areas;
    this.canvas.remove(area);
    area = null;
  }

  public destroy() {
    this.areas.forEach((area: CanvasRectangle|CanvasPolygon|CanvasCircle) => {
      this.deleteArea(area);
    })
  }
}

export class AreaManipulation {
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

  private initializeCanvas() {
    let canvas: HTMLCanvasElement = this.container.querySelector(this.options.canvasSelector);
    this.canvas = new AreaCanvas(
      canvas,
      {
        width: this.options.canvas.width,
        height: this.options.canvas.height,
        interactive: this.interactive,
        selection: false,
        preserveObjectStacking: true,
        hoverCursor: this.interactive ? 'move' : 'default',
      }
    );
  }

  private initializeForm() {
    if (this.interactive) {
      this.form = new AreaForm({
        formSelector: this.options.formSelector,
        formDocument: this.options.editControlDocument,
        browseLink: this.options.browseLink,
        browseLinkUrlAjaxUrl: this.options.browseLinkUrlAjaxUrl,
      }, this);
    }
  }

  public initializeAreas(areas: Array<HTML5Area>) {
    areas = areas || [];
    areas.forEach((area: HTML5Area) => {
      area.data.color = AreaUtility.getRandomColor(area.data.color);

      let canvasArea = this.canvas.addArea(area);
      if (this.form) {
        this.form.addArea(area, canvasArea);
      }
    });

    if (this.form) {
      this.form.updateArrowsState();
    }
  }

  public removeAllAreas() {
    this.form.areas.forEach((area) => {
      this.canvas.deleteArea(area.canvasArea);
      this.form.deleteArea(area);
    });
  }

  public getAreasData(): Array<any> {
    let data = ([] as Array<HTML5Area>);
    this.form.areas.forEach((area: FormArea) => {
      data.push(area.getData());
    });
    return data;
  }

  public destroy() {
    this.canvas.destroy();
    this.canvas = null;
    if (this.form) {
      this.form.destroy();
      this.form = null;
    }
  }
}
