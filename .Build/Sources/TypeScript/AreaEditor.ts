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

import * as $ from 'jquery';
// @ts-ignore
import * as fabric from './vendor/fabric';
import 'TYPO3/CMS/Core/Contrib/jquery.minicolors';

let Aggregation = (baseClass: any, ...mixins: Array<any>) => {
		class base extends baseClass {
			constructor (...args: Array<any>) {
				super(...args);
				mixins.forEach((mixin) => {
					copyProperties(this, (new mixin));
				});
			}
		}

		// this function copies all properties and symbols, filtering out some special ones
		let copyProperties = (target: any, source: any) => {
			let propertySymbols = (Object.getOwnPropertySymbols(source) as unknown as Array<string>);
			Object.getOwnPropertyNames(source)
				.concat(propertySymbols)
				.forEach((property) => {
					if (!property.match(
						/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/
					)) {
						Object.defineProperty(target, property, Object.getOwnPropertyDescriptor(source, property));
					}
				})
		};

		// outside constructor() to allow Aggregation(a, b, c).staticFunction() to be called etc.
		mixins.forEach((mixin) => {
			copyProperties(base.prototype, mixin.prototype);
			copyProperties(base, mixin);
		});

		return base;
	};

class AreaFormElement extends fabric.Object {
  static before: number = -1;

  static after: number = 1;

  id: number = 0;

  shape: string = '';

  coords: string = '';

  link: string = '';

  color: string = '';

  alt: string = '';

  title: string = '';

  name: string = '';

  eventDelay: number = 0;

  element: HTMLElement;

  form: AreaForm;

  editor: AreaEditor;

  attributes: {[k: string]: any} = {};

  [property: string]: any;

  addForm(form: AreaForm) {
    this.form = form;
    this.postAddForm();
  }

  postAddForm() {
    this.id = fabric.Object.__uid++;

    this.initializeElement();
    this.updateFields();
    this.initializeColorPicker();
    this.initializeEvents();
    this.addFauxInput();
  }

  initializeElement() {
    this.element = this.getFormElement('#' + this.name + 'Form', this.id);
    this.form.areaZone.append(this.element);
    this.form.initializeArrows();
  }

  initializeColorPicker() {
    ($(this.getElement('.t3js-color-picker')) as any).minicolors({
      format: 'hex',
      position: 'left',
      theme: 'default',
      changeDelay: 100,
      change: this.colorPickerAction.bind(this)
    });
  }

  initializeEvents() {
    this.on('moved', this.updateFields.bind(this));
    this.on('modified', this.updateFields.bind(this));

    this.getElements('.positionOptions .t3js-field').forEach(this.coordinateFieldHandler.bind(this));
    this.getElements('.basicOptions .t3js-field, .attributes .t3js-field').forEach(this.attributeFieldHandler.bind(this));
    this.getElements('.t3js-btn').forEach(this.buttonHandler.bind(this));
  }

  coordinateFieldHandler(field: HTMLInputElement) {
    field.addEventListener('keyup', this.fieldKeyUpHandler.bind(this));
  }

  fieldKeyUpHandler(event: Event) {
    clearTimeout(this.eventDelay);
    this.eventDelay = AreaFormElement.wait(() => { this.updateCanvas(event); }, 500);
  }

  attributeFieldHandler(field: HTMLInputElement) {
    field.addEventListener('keyup', this.updateProperties.bind(this));
  }

  buttonHandler(button: HTMLElement) {
    button.addEventListener('click', this[button.id + 'Action'].bind(this));
  }

  initializeArrows() {
    let areaZone = this.form.areaZone;
    this.getElement('#up').classList[areaZone.firstChild !== this.element ? 'remove' : 'add']('disabled');
    this.getElement('#down').classList[areaZone.lastChild !== this.element ? 'remove' : 'add']('disabled');
  }

  updateFields() {
  }

  updateProperties(event: Event) {
    let field = (event.currentTarget as HTMLInputElement),
      property = field.id;
    if (field.classList.contains('link')) {
      this.link = field.value;
    } else if (this.hasOwnProperty(property)) {
      this[property] = field.value;
    } else if (this.attributes.hasOwnProperty(property)) {
      this.attributes[property] = field.value;
    }
  }

  updateCanvas(event: Event) {
  }

  linkAction(event: Event) {
    this.form.openLinkBrowser((event.currentTarget as HTMLElement), this);
  }

  upAction() {
    this.form.moveArea(this, AreaFormElement.before);
  }

  downAction() {
    this.form.moveArea(this, AreaFormElement.after);
  }

  undoAction() {
  }

  redoAction() {
  }

  deleteAction() {
    if (this.element) {
      this.element.remove();
    }
    if (this.form) {
      this.form.initializeArrows();
    }
    this.removeFauxInput();
    this.editor.deleteArea(this);
  }

  expandAction() {
    this.showElement('.moreOptions');
    this.hideElement('#expand');
    this.showElement('#collapse');
  }

  collapseAction() {
    this.hideElement('.moreOptions');
    this.hideElement('#collapse');
    this.showElement('#expand');
  }

  colorPickerAction(value: string) {
    (this.getElement('.t3js-color-picker') as HTMLInputElement).value = value;
    this.set('borderColor', value);
    this.set('stroke', value);
    this.set('fill', AreaEditor.hexToRgbA(value, 0.2));
    this.editor.canvas.renderAll();
  }


  getFormElement(selector: string, id: number): HTMLElement {
    let template = this.form.element.querySelector(selector)
      .innerHTML.replace(new RegExp('_ID', 'g'), String(id ? id : this.id));
    return (new DOMParser()).parseFromString(template, 'text/html').body.firstChild as HTMLElement;
  }

  getElement(selector: string) {
    return this.element.querySelector(selector);
  }

  getElements(selector: string) {
    return this.element.querySelectorAll(selector);
  }

  hideElement(selector: string) {
    this.getElement(selector).classList.add('hide');
  }

  showElement(selector: string) {
    this.getElement(selector).classList.remove('hide');
  }


  getMapData(): object {
    let attributes = this.getAdditionalAttributes();
    return {
      ...attributes,
      shape: this.name,
      coords: this.getAreaCoords(),
      link: this.getLink()
    };
  }

  getAreaCoords(): string {
    return '';
  }

  getAdditionalAttributes() {
    let result = ({} as any);

    this.getElements('.t3js-field').forEach((field: HTMLInputElement) => {
      if (!field.classList.contains('ignored-attribute')) {
        result[field.id] = field.value;
      }
    });

    return result;
  }

  getLink() {
    return (this.getElement('.link') as HTMLInputElement).value;
  }

  /**
   * Add faux input as target for browselink which listens for changes and writes value to real field
   */
  addFauxInput() {
    if (typeof this.form.fauxForm !== 'undefined') {
      let fauxInput = this.editor.fauxFormDocument.createElement('input');
      fauxInput.setAttribute('id', 'link' + this.id);
      fauxInput.setAttribute('data-formengine-input-name', 'link' + this.id);
      fauxInput.setAttribute('value', this.link);
      fauxInput.addEventListener('change', this.fauxInputChanged.bind(this));
      this.form.fauxForm.appendChild(fauxInput);
    }
  }

  fauxInputChanged(event: Event) {
    let field = (event.currentTarget as HTMLInputElement);
    this.link = field.value;
    this.updateFields();
  }

  removeFauxInput() {
    if (this.form && this.form.fauxForm !== null) {
      let field = this.form.fauxForm.querySelector('#link' + this.id);
      if (field) {
        field.remove();
      }
    }
  }

  static wait(callback: Function, delay: number) {
    return window.setTimeout(callback, delay);
  }
}

class Rect extends Aggregation(fabric.Rect, AreaFormElement) {
  name = 'rect';

  updateFields() {
    this.getElement('#color').value = this.color;
    this.getElement('#alt').value = this.alt || '';
    this.getElement('.link').value = this.link || '';
    this.getElement('#left').value = Math.floor(this.left + 0);
    this.getElement('#top').value = Math.floor(this.top + 0);
    this.getElement('#right').value = Math.floor(this.left + this.getScaledWidth());
    this.getElement('#bottom').value = Math.floor(this.top + this.getScaledHeight());

    Object.entries(this.attributes).forEach((attribute) => {
      this.getElement('#' + attribute[0]).value = attribute[1] || '';
    });
  }

  updateCanvas(event: Event) {
    let field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = parseInt(field.value);

    switch (field.id) {
      case 'left':
        this.getElement('#right').value = value + this.getScaledWidth();
        this.set({left: value});
        break;

      case 'top':
        this.getElement('#bottom').value = value + this.getScaledHeight();
        this.set({top: value});
        break;

      case 'right':
        value -= this.left;
        if (value < 0) {
          value = 10;
          field.value = this.left + value;
        }
        this.set({width: value});
        break;

      case 'bottom':
        value -= this.top;
        if (value < 0) {
          value = 10;
          field.value = this.top + value;
        }
        this.set({height: value});
        break;
    }
    this.canvas.renderAll();
  }

  getAreaCoords() {
    return [
      Math.floor(this.left + 0),
      Math.floor(this.top + 0),
      Math.floor(this.left + this.getScaledWidth() - 1),
      Math.floor(this.top + this.getScaledHeight() - 1)
    ].join(',');
  }
}

class Circle extends Aggregation(fabric.Circle, AreaFormElement) {
  name = 'circle';

  updateFields() {
    this.getElement('#color').value = this.color;
    this.getElement('#alt').value = this.alt || '';
    this.getElement('.link').value = this.link || '';
    this.getElement('#left').value = Math.floor(this.left + 0);
    this.getElement('#top').value = Math.floor(this.top + 0);
    this.getElement('#radius').value = Math.floor(this.getRadiusX());

    Object.entries(this.attributes).forEach((attribute) => {
      this.getElement('#' + attribute[0]).value = attribute[1] || '';
    });
  }

  updateCanvas(event: Event) {
    let field = ((event.currentTarget || event.target) as HTMLInputElement),
      value = parseInt(field.value);

    switch (field.id) {
      case 'left':
        this.set({left: value});
        break;

      case 'top':
        this.set({top: value});
        break;

      case 'radius':
        this.set({radius: value});
        break;
    }
    this.canvas.renderAll();
  }

  getAreaCoords() {
    return [
      Math.floor(this.left + this.getRadiusX()),
      Math.floor(this.top + this.getRadiusX()),
      Math.floor(this.getRadiusX())
    ].join(',');
  }
}

class Poly extends Aggregation(fabric.Polygon, AreaFormElement) {
  name: string = 'poly';

  points: Array<any> = [];

  controls: Array<any> = [];

  constructor(points: Array<any>, options: AreaConfiguration) {
    super(points, options);
    this.on('moved', this.polygonMoved.bind(this));
  }

  updateFields() {
    this.getElement('#color').value = this.color;
    this.getElement('#alt').value = this.alt || '';
    this.getElement('.link').value = this.link || '';

    Object.entries(this.attributes).forEach((attribute) => {
      this.getElement('#' + attribute[0]).value = attribute[1] || '';
    });

    let parentElement = this.getElement('.positionOptions');
    this.points.forEach((point: fabric.Point, index: number) => {
      point.id = point.id ? point.id : 'p' + this.id + '_' + index;

      if (!point.hasOwnProperty('element')) {
        point.element = this.getFormElement('#polyCoords', point.id);
        parentElement.append(point.element);
      }

      point.element.querySelector('#x' + point.id).value = point.x + this.left;
      point.element.querySelector('#y' + point.id).value = point.y + this.top;
    });
  }

  updateCanvas(event: Event) {
    let field = ((event.currentTarget || event.target) as HTMLInputElement),
      [, point] = field.id.split('_'),
      control = this.controls[parseInt(point)],
      x = control.getCenterPoint().x,
      y = control.getCenterPoint().y;

    if (field.id.indexOf('x') > -1) {
      x = parseInt(field.value);
    }
    if (field.id.indexOf('y') > -1) {
      y = parseInt(field.value);
    }

    control.set('left', x);
    control.set('top', y);
    control.setCoords();
    this.points[control.name] = {x: x, y: y};
    this.canvas.renderAll();
  }

  getAreaCoords() {
    let result = ([] as Array<number>);

    this.controls.forEach((control) => {
      let center = control.getCenterPoint();
      result.push(center.x);
      result.push(center.y);
    });

    return result.join(',');
  }

  addControls() {
    this.points.forEach((point: fabric.Object, index: number) => {
      this.addControl(this.controlConfig, point, index, 100000);
    });
  }

  addControl(areaConfig: AreaConfiguration, point: fabric.Object, index: number, newControlIndex: number) {
    let circle = new fabric.Circle({
      ...areaConfig,
      hasControls: false,
      radius: 5,
      fill: areaConfig.cornerColor,
      stroke: areaConfig.cornerStrokeColor,
      originX: 'center',
      originY: 'center',
      name: index,
      polygon: this,
      point: point,
      type: 'control',
      opacity: this.controls.length === 0 ? 0 : this.controls[0].opacity,

      // set control position relative to polygon
      left: this.left + point.x,
      top: this.top + point.y,
    });
    circle.on('moved', this.pointMoved.bind(this));

    point.control = circle;

    this.controls = Poly.addElementToArrayWithPosition(this.controls, circle, newControlIndex);
    this.canvas.add(circle);
    this.canvas.renderAll();
  }

  pointMoved(event: FabricEvent) {
    let control = (event.target as fabric.Object),
      id = 'p' + control.polygon.id + '_' + control.name,
      center = control.getCenterPoint();

    this.getElement('#x' + id).value = center.x;
    this.getElement('#y' + id).value = center.y;
  }

  polygonMoved() {
    this.points.forEach((point: fabric.Object) => {
      this.getElement('#x' + point.id).value = this.left + point.x;
      this.getElement('#y' + point.id).value = this.top + point.y;
    });
  }

  addPointBeforeAction(event: Event) {
    let direction = AreaFormElement.before,
      index = this.points.length,
      parentElement = this.getElement('.positionOptions'),
      [point, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction);

    parentElement.insertBefore(element, currentPoint.element);

    this.points = Poly.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
    this.addControl(this.editor.areaConfig, point, index, currentPointIndex + direction);
  }

  addPointAfterAction(event: Event) {
    let direction = AreaFormElement.after,
      index = this.points.length,
      parentElement = this.getElement('.positionOptions'),
      [point, element, currentPointIndex, currentPoint] = this.getPointElementAndCurrentPoint(event, direction);

    if (currentPoint.element.nextSibling) {
      parentElement.insertBefore(element, currentPoint.element.nextSibling);
    } else {
      parentElement.append(element);
    }

    this.points = Poly.addElementToArrayWithPosition(this.points, point, currentPointIndex + direction);
    this.addControl(this.editor.areaConfig, point, index, currentPointIndex + direction);
  }

  getPointElementAndCurrentPoint(event: Event, direction: number) {
    let currentPointId = ((event.currentTarget as HTMLElement).parentNode.parentNode as HTMLElement).id,
      [currentPoint, nextPoint, currentPointIndex] = this.getCurrentAndNextPoint(currentPointId, direction),
      index = this.points.length,
      id = 'p' + this.id + '_' + index,
      element = this.getFormElement('#polyCoords', id),
      point = {
        x: Math.floor((currentPoint.x + nextPoint.x) / 2),
        y: Math.floor((currentPoint.y + nextPoint.y) / 2),
        id: id,
        element: element
      };

    element.querySelectorAll('.t3js-btn').forEach(this.buttonHandler.bind(this));

    element.querySelector('#x' + point.id).value = point.x;
    element.querySelector('#y' + point.id).value = point.y;

    return [point, element, currentPointIndex, currentPoint];
  }

  getCurrentAndNextPoint(currentPointId: string, direction: number) {
    let currentPointIndex = 0;

    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i].id === currentPointId) {
        break;
      }
      currentPointIndex++;
    }

    let nextPointIndex = currentPointIndex + direction;

    if (nextPointIndex < 0) {
      nextPointIndex = this.points.length - 1;
    }
    if (nextPointIndex >= this.points.length) {
      nextPointIndex = 0;
    }

    return [this.points[currentPointIndex], this.points[nextPointIndex], currentPointIndex, nextPointIndex];
  }

  removePointAction(event: Event) {
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

class AreaForm {
  areaZone: HTMLElement;

  element: HTMLElement;

  /**
   * Element needed to add inputs that act as target for browselink finalizeFunction target
   */
  fauxForm: HTMLFormElement;

  editor: AreaEditor;

  constructor(formElement: string, editor: AreaEditor) {
    this.element = editor.document.querySelector(formElement);
    this.areaZone = this.element.querySelector('#areaZone');
    this.editor = editor;

    this.addFauxFormForLinkBrowser(this.editor.browseLink);
  }

  destroy() {
    this.removeFauxForm();
  }

  initializeArrows() {
    this.editor.areas.forEach((area) => {
      area.initializeArrows();
    });
  }

  moveArea(area: Rect|Circle|Poly, offset: number) {
    let index = this.editor.areas.indexOf(area),
      newIndex = index + offset,
      parent = area.element.parentNode;

    if (newIndex > -1 && newIndex < this.editor.areas.length) {
      let removedArea = this.editor.areas.splice(index, 1)[0];
      this.editor.areas.splice(newIndex, 0, removedArea);

      parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
    }

    this.initializeArrows();
  }

  openLinkBrowser(link: HTMLElement, area: AreaFormElement) {
    link.blur();

    let data = {
      ...this.editor.browseLink,
      objectId: area.id,
      itemName: 'link' + area.id,
      currentValue: area.getLink()
    };

    $.ajax({
      url: this.editor.browseLinkUrlAjaxUrl,
      context: area,
      data: data
    }).done((response: {url: string}) => {
      let vHWin = window.open(
        response.url,
        '',
        'height=600,width=500,status=0,menubar=0,scrollbars=1'
      );
      vHWin.focus()
    });
  }

  /**
   * Triggers change event after faux field was changed by browselink
   */
  addFauxFormForLinkBrowser(configuration: BrowseLinkConfiguration) {
    if (top.document !== this.editor.fauxFormDocument) {
      this.fauxForm = this.editor.fauxFormDocument.createElement('form');
      this.fauxForm.setAttribute('name', configuration.formName);

      let fauxFormContainer = this.editor.fauxFormDocument.querySelector('#fauxFormContainer');
      while (fauxFormContainer.firstChild) {
        fauxFormContainer.removeChild(fauxFormContainer.firstChild);
      }
      fauxFormContainer.appendChild(this.fauxForm);
    }
  }

  removeFauxForm() {
    if (this.fauxForm) {
      this.fauxForm.remove();
    }
  }

  syncAreaLinkValue(id: string) {
    this.editor.areas.forEach((area) => {
      if (area.id === parseInt(id)) {
        area.link = (area.getElement('.link') as HTMLInputElement).value;
      }
    });
  }
}

export default class AreaEditor {
  areaConfig = {
    cornerColor: '#eee',
    cornerStrokeColor: '#bbb',
    cornerSize: 10,
    cornerStyle: 'circle',
    hasBorders: false,
    hasRotatingPoint: false,
    transparentCorners: false
  };

  document: Document;

  fauxFormDocument: Document;

  browseLinkUrlAjaxUrl: string = '';

  preview: boolean = true;

  browseLink: BrowseLinkConfiguration;

  areas: Array<Rect|Circle|Poly> = [];

  form: AreaForm;

  canvas: fabric.Canvas;

  [property: string]: any;

  constructor(options: EditorOptions, canvas: HTMLElement, formSelector: string, document: Document) {
    this.setOptions(options);

    this.document = document;
    this.preview = formSelector === '';

    this.initializeCanvas(canvas, options);

    if (!this.preview) {
      this.form = new AreaForm(formSelector, this);
    }
  }

  setOptions(options: object) {
    Object.entries(options).forEach((option) => {
      this[option[0]] = option[1];
    });
  }

  setScale(scaling: number) {
    this.canvas.setZoom(this.canvas.getZoom() * (scaling ? scaling : 1));
  }

  initializeCanvas(canvas: HTMLElement, options: EditorOptions) {
    this.canvas = new fabric.Canvas(canvas, {
      ...options.canvas,
      selection: false,
      preserveObjectStacking: true,
      hoverCursor: this.preview ? 'default' : 'move',
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

  initializeAreas(areas: Array<AreaConfiguration>) {
    areas = areas || [];
    areas.forEach((area: AreaConfiguration) => {
      area.color = AreaEditor.getRandomColor(area.color);
      let areaElement,
          configuration = {
            ...area,
            ...this.areaConfig,
            selectable: !this.preview,
            hasControls: !this.preview,
            stroke: area.color,
            strokeWidth: 1,
            fill: AreaEditor.hexToRgbA(area.color, 0.3)
          };

      switch (configuration.shape) {
        case 'rect':
          areaElement = this.addRectangle(configuration);
          break;

        case 'circle':
          areaElement = this.addCircle(configuration);
          break;

        case 'poly':
          areaElement = this.addPolygon(configuration);
          break;
      }

      area.editor = this;
      this.areas.push(areaElement);
      if (this.form) {
        areaElement.addForm(this.form);
      }
    });
  }

  removeAllAreas() {
    this.areas.forEach((area) => { this.deleteArea(area); });
  }

  addRectangle(configuration: AreaConfiguration) {
    let [left, top, right, bottom] = configuration.coords.split(','),
      area = new Rect({
        ...configuration,
        left: parseInt(left),
        top: parseInt(top),
        width: parseInt(right) - parseInt(left),
        height: parseInt(bottom) - parseInt(top),
      });

    this.canvas.add(area);
    return area;
  }

  addCircle(configuration: AreaConfiguration) {
    let [left, top, radius] = configuration.coords.split(','),
      area = new Circle({
        ...configuration,
        left: parseInt(left) - parseInt(radius),
        top: parseInt(top) - parseInt(radius),
        radius: parseInt(radius),
      });

    // disable control points as these would stretch the circle
    // to an ellipse which is not possible in html areas
    area.setControlVisible('ml', false);
    area.setControlVisible('mt', false);
    area.setControlVisible('mr', false);
    area.setControlVisible('mb', false);

    this.canvas.add(area);
    return area;
  }

  addPolygon(configuration: AreaConfiguration) {
    let options = {
        ...configuration,
        selectable: true,
        hasControls: false,
        objectCaching: false,
        controlConfig: this.areaConfig,
      },
      points = [],
      coordsXY = options.coords.split(','),
      left = 100000,
      top = 100000,
      i = 0;

    if (coordsXY.length % 2) {
      throw new Error('Bad coords count');
    }

    // first get all coordinates and create point of odd even numbers
    // and get top and left corner of polygon
    for (; i < coordsXY.length; i = i + 2) {
      let xy = {
        x: parseInt(coordsXY[i]),
        y: parseInt(coordsXY[i + 1])
      };
      points.push(xy);

      left = Math.min(left, xy.x);
      top = Math.min(top, xy.y);
    }
    options.left = left;
    options.top = top;

    // reduce point x/y values by top/left values
    points.forEach((point) => {
      point.x = point.x - options.left;
      point.y = point.y - options.top;
    });

    let area = new Poly(points, options);

    this.canvas.add(area);
    if (this.form) {
      area.addControls();
    }
    return area;
  }

  triggerLinkChanged(id: string) {
    let selector = 'form[name="' + this.browseLink.formName + '"] [data-formengine-input-name="link' + id + '"]',
      field = this.fauxFormDocument.querySelector(selector),
      event = this.fauxFormDocument.createEvent('HTMLEvents');
    event.initEvent('change', false, true);
    field.dispatchEvent(event);
  }

  deleteArea(area: Rect|Circle|Poly) {
    let areas = ([] as Array<Rect|Circle|Poly>);
    this.areas.forEach((currentArea) => {
      if (area !== currentArea) {
        areas.push(currentArea);
      }
    });
    this.areas = areas;
    this.canvas.remove(area);
    area = null;
  }

  getMapData() {
    let areas = ([] as Array<object>);

    this.areas.forEach((area) => {
      areas.push(area.getMapData());
    });

    return JSON.stringify(areas);
  }

  static getRandomColor(color: string) {
    if (color === undefined) {
      let r = (Math.floor(Math.random() * 5) * 3).toString(16),
        g = (Math.floor(Math.random() * 5) * 3).toString(16),
        b = (Math.floor(Math.random() * 5) * 3).toString(16);
      color = '#' + r + r + g + g + b + b;
    }
    return color;
  }

  static hexToRgbA(hex: string, alpha: number) {
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
}
