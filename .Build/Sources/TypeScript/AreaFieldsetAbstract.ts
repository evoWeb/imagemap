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

import * as $ from 'jquery';
// @ts-ignore
import * as fabric from './vendor/Fabric';
import { AreaShapeFactory } from './AreaShapeFactory';
import { Editor } from './Editor';
import { AreaForm } from './AreaForm';

export abstract class AreaFieldsetAbstract {
  static before: number = -1;

  static after: number = 1;

  public id: number = 0;

  protected name: string = '';

  public element: HTMLElement;

  protected eventDelay: number = 0;

  public form: AreaForm;

  public editor: Editor;

  public areaShape: fabric.Object;

  protected attributes: {[k: string]: any} = {};

  protected configuration: {[k: string]: any} = {};

  [property: string]: any;

  constructor(attributes: AreaConfiguration, configuration: EditorConfigurations, shape: fabric.Object) {
    this.attributes = attributes;
    this.configuration = configuration;
    this.areaShape = shape;
  }

  public postAddToForm() {
    this.id = fabric.Object.__uid++;

    this.initializeElement();
    this.updateFields();
    this.initializeColorPicker();
    this.initializeEvents();
    this.addFauxInput();
  }

  protected initializeElement() {
    this.element = this.getFormElement('#' + this.name + 'Form', this.id);
    this.form.areaZone.append(this.element);
    this.form.updateArrowsState();
  }

  protected initializeColorPicker() {
    ($(this.getElement('.t3js-color-picker')) as any).minicolors({
      format: 'hex',
      position: 'left',
      theme: 'default',
      changeDelay: 100,
      change: this.colorPickerAction.bind(this)
    });
  }

  protected initializeEvents() {
    this.areaShape.on('moved', this.updateFields.bind(this));
    this.areaShape.on('modified', this.updateFields.bind(this));

    this.getElements('.basicOptions .t3js-field').forEach((field: HTMLInputElement) => {
      field.addEventListener('keyup', this.updateProperties.bind(this));
    });
    this.getElements('.positionOptions .t3js-field').forEach((field: HTMLInputElement) => {
      field.addEventListener('input', this.fieldInputHandler.bind(this));
    });
    this.getElements('.t3js-btn').forEach(this.buttonEventHandler.bind(this));
  }

  protected fieldInputHandler(event: Event) {
    clearTimeout(this.eventDelay);
    this.eventDelay = AreaFieldsetAbstract.wait(() => { this.updateCanvas(event); }, 500);
  }

  protected buttonEventHandler(button: HTMLElement) {
    let action: string = button.dataset.action + 'Action';
    button.removeEventListener('click', this[action]);
    button.addEventListener('click', this[action].bind(this));
  }

  public updateArrowsState() {
    let areaZone = this.form.areaZone;
    this.getElement('[data-action="up"]').classList[areaZone.firstChild !== this.element ? 'remove' : 'add']('disabled');
    this.getElement('[data-action="down"]').classList[areaZone.lastChild !== this.element ? 'remove' : 'add']('disabled');
  }

  public updateFields() {
  }

  protected updateProperties(event: Event) {
    let field = (event.currentTarget as HTMLInputElement),
      property = field.id;
    if (field.classList.contains('href')) {
      this.attributes.href = field.value;
    } else if (this.attributes.hasOwnProperty(property)) {
      this.attributes[property] = field.value;
    }
  }

  protected updateCanvas(event: Event) {
  }

  protected linkAction(event: Event) {
    this.form.openLinkBrowser((event.currentTarget as HTMLElement), this);
  }

  protected upAction() {
    this.form.moveArea(this, AreaFieldsetAbstract.before);
  }

  protected downAction() {
    this.form.moveArea(this, AreaFieldsetAbstract.after);
  }

  protected deleteAction() {
    if (this.element) {
      this.element.remove();
    }
    if (this.form) {
      this.form.updateArrowsState();
    }
    this.removeFauxInput();
    this.editor.deleteArea(this);
  }

  protected expandAction() {
    this.showElement('.moreOptions');
    this.showElement('[data-action="collapse"]');
    this.hideElement('[data-action="expand"]');
  }

  protected collapseAction() {
    this.hideElement('.moreOptions');
    this.hideElement('[data-action="collapse"]');
    this.showElement('[data-action="expand"]');
  }

  protected undoAction() {
  }

  protected redoAction() {
  }

  protected colorPickerAction(value: string) {
    (this.getElement('.t3js-color-picker') as HTMLInputElement).value = value;
    this.areaShape.set('borderColor', value);
    this.areaShape.set('stroke', value);
    this.areaShape.set('fill', AreaShapeFactory.hexToRgbA(value, 0.2));
    this.editor.canvas.renderAll();
  }

  protected getFormElement(selector: string, id: number|string): HTMLElement {
    let template = this.form.element.querySelector(selector)
      .innerHTML.replace(new RegExp('_ID', 'g'), String(id ? id : this.id));
    return (new DOMParser()).parseFromString(template, 'text/html').body.firstChild as HTMLElement;
  }

  public getElement(selector: string): HTMLInputElement {
    return this.element.querySelector(selector);
  }

  protected getElements(selector: string) {
    return this.element.querySelectorAll(selector);
  }

  protected hideElement(selector: string) {
    this.getElement(selector).classList.add('hide');
  }

  protected showElement(selector: string) {
    this.getElement(selector).classList.remove('hide');
  }

  public getFieldValue(selector: string): string {
    return this.getElement(selector).value;
  }

  public abstract getData(): object;

  /**
   * Add faux input as target for browselink which listens for changes and writes value to real field
   */
  protected addFauxInput() {
    if (this.form.browselinkTargetForm) {
      let fauxInput = this.editor.browselinkParent.createElement('input');
      fauxInput.setAttribute('id', 'href' + this.id);
      fauxInput.setAttribute('data-formengine-input-name', 'href' + this.id);
      fauxInput.setAttribute('value', this.attributes.href);
      fauxInput.onchange = this.changedFauxInput.bind(this);
      this.form.browselinkTargetForm.appendChild(fauxInput);
    }
  }

  protected removeFauxInput() {
    if (this.form && this.form.browselinkTargetForm !== null) {
      let field = this.form.browselinkTargetForm.querySelector('#href' + this.id);
      if (field) {
        field.remove();
      }
    }
  }

  protected changedFauxInput() {
    let field = (this.form.browselinkTargetForm.querySelector('#href' + this.id) as HTMLInputElement);
    this.attributes.href = field.value;
    this.updateFields();
  }

  static wait(callback: Function, delay: number) {
    return window.setTimeout(callback, delay);
  }
}
