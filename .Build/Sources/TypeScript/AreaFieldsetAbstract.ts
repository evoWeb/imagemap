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
import { Object } from './vendor/Fabric';
import { AreaShapeFactory } from './AreaShapeFactory';
import { Editor } from './Editor';
import { AreaForm } from './AreaForm';

export abstract class AreaFieldsetAbstract {
  static before: number = -1;

  static after: number = 1;

  readonly id: number = 0;

  protected name: string = '';

  public element: HTMLElement;

  protected updateCanvasDelay: number = 0;

  public form: AreaForm;

  public editor: Editor;

  public shape: Object;

  protected attributes: {[k: string]: any} = {};

  protected configuration: {[k: string]: any} = {};

  [property: string]: any;

  constructor(attributes: AreaConfiguration, configuration: EditorConfigurations, shape: Object) {
    this.attributes = attributes;
    this.configuration = configuration;
    this.shape = shape;

    this.id = Object.__uid++;
  }

  public postAddToForm() {
    this.initializeElement();
    this.updateFields();
    this.initializeColorPicker();
    this.initializeEvents();
    this.addBrowselinkTargetInput();
  }

  protected initializeElement() {
    this.element = this.getFormElement(`#${this.name}Form`, this.id);
    this.form.element.append(this.element);
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
    this.shape.on('moved', this.updateFields.bind(this));
    this.shape.on('modified', this.updateFields.bind(this));

    this.getElements('.basicOptions .t3js-field').forEach((field: HTMLInputElement) => {
      field.addEventListener('keyup', this.updateProperties.bind(this));
    });
    this.getElements('.positionOptions .t3js-field').forEach((field: HTMLInputElement) => {
      field.addEventListener('input', this.fieldInputHandler.bind(this));
    });
    this.getElements('.t3js-btn').forEach(this.buttonEventHandler.bind(this));
  }

  protected abstract updateFields(): void;

  protected updateProperties(event: Event) {
    let field = (event.currentTarget as HTMLInputElement),
      property = field.id;

    this.attributes[property] = field.value;
  }

  protected fieldInputHandler(event: Event) {
    this.updateCanvasDelay = AreaFieldsetAbstract.wait(
      () => { this.updateCanvas(event); },
      500,
      this.updateCanvasDelay
    );
  }

  protected buttonEventHandler(button: HTMLElement) {
    let action: string = button.dataset.action + 'Action';
    button.removeEventListener('click', this[action]);
    button.addEventListener('click', this[action].bind(this));
  }

  public updateArrowsState() {
    let areasForm = this.form.element,
      upButton = this.getElement('[data-action="up"]'),
      downButton = this.getElement('[data-action="down"]');

    if (areasForm.firstChild !== this.element) {
      upButton.classList.remove('disabled');
    } else {
      upButton.classList.add('disabled');
    }

    if (areasForm.lastChild !== this.element) {
      downButton.classList.remove('disabled');
    } else {
      downButton.classList.add('disabled');
    }
  }

  protected abstract updateCanvas(event: Event): void;

  protected linkAction(event: Event) {
    this.form.openLinkBrowser((event.currentTarget as HTMLElement), this);
  }

  protected upAction() {
    this.form.moveArea(this, AreaFieldsetAbstract.before);
  }

  protected downAction() {
    this.form.moveArea(this, AreaFieldsetAbstract.after);
  }

  public deleteAction() {
    if (this.element) {
      this.element.remove();
    }

    this.removeBrowselinkTargetInput();
    this.form.updateArrowsState();
    this.form.editor.deleteArea(this);
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
    this.attributes.color = value;
    (this.getElement('.t3js-color-picker') as HTMLInputElement).value = this.attributes.color;
    this.shape.set('borderColor', this.attributes.color);
    this.shape.set('stroke', this.attributes.color);
    this.shape.set('fill', AreaShapeFactory.hexToRgbA(this.attributes.color, 0.2));
    this.form.editor.canvas.renderAll();
  }

  protected getFormElement(selector: string, id: number|string): HTMLElement {
    let template = this.form.editor.modalParent.querySelector(selector)
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

  public getData(): object {
    return this.attributes;
  }

  /**
   * Add an input as target for browselink which listens for changes and writes value to real field
   */
  protected addBrowselinkTargetInput() {
    if (this.form.browselinkTargetForm) {
      let browselinkTargetInput = this.form.editor.browselinkParent.createElement('input');
      browselinkTargetInput.setAttribute('id', 'href' + this.id);
      browselinkTargetInput.setAttribute('data-formengine-input-name', 'href' + this.id);
      browselinkTargetInput.setAttribute('value', this.attributes.href);
      browselinkTargetInput.onchange = this.changedBrowselinkTargetInput.bind(this);
      this.form.browselinkTargetForm.appendChild(browselinkTargetInput);
    }
  }

  protected removeBrowselinkTargetInput() {
    if (this.form && this.form.browselinkTargetForm !== null) {
      let field = this.form.browselinkTargetForm.querySelector('#href' + this.id);
      if (field) {
        field.remove();
      }
    }
  }

  protected changedBrowselinkTargetInput() {
    let field = (this.form.browselinkTargetForm.querySelector('#href' + this.id) as HTMLInputElement);
    this.attributes.href = field.value;
    this.updateFields();
  }

  static wait(callback: Function, delay: number, timer: number): number {
    clearTimeout(timer);
    return window.setTimeout(callback, delay);
  }
}
