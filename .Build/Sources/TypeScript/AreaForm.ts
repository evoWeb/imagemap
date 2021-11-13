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
import Modal = require('TYPO3/CMS/Backend/Modal');
// @ts-ignore
import * as Fabric from './vendor/Fabric.min';
import { AbstractFieldset } from './Shape/AbstractFieldset';

export class AreaForm {
  static width: number;

  static height: number;

  public element: HTMLElement;

  public canvas: Fabric.Canvas;

  private configuration: EditorConfiguration;

  public modalParent: Document;

  public browselinkParent: Document;

  public areaFieldsets: Array<AbstractFieldset> = [];

  private browselinkTargetFormSelector: string = '#browselinkTargetForm';

  /**
   * Element needed to add inputs that act as target for browselink finalizeFunction target
   */
  public browselinkTargetForm: HTMLFormElement;

  constructor(
    element: HTMLElement,
    canvas: Fabric.Canvas,
    configuration: EditorConfiguration,
    modalParent: Document,
    browselinkParent: Document
  ) {
    this.canvas = canvas;
    this.configuration = configuration;
    this.element = element;
    this.modalParent = modalParent;
    this.browselinkParent = browselinkParent;

    this.addBrowselinkTargetForm();
  }

  public destroy(): void {
    this.removeFauxForm();
  }

  public updateArrowsState(): void {
    this.areaFieldsets.forEach((area: AbstractFieldset) => {
      area.updateArrowsState();
    });
  }

  public addArea(area: AbstractFieldset): void {
    this.areaFieldsets.push(area);
    area.addForm(this);
    this.updateArrowsState();
  }

  public moveArea(area: AbstractFieldset, offset: number): void {
    let index = this.areaFieldsets.indexOf(area),
      newIndex = index + offset,
      parent = area.element.parentNode;

    if (newIndex > -1 && newIndex < this.areaFieldsets.length) {
      let removedArea = this.areaFieldsets.splice(index, 1)[0];
      this.areaFieldsets.splice(newIndex, 0, removedArea);

      parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
    }

    this.updateArrowsState();
  }

  public deleteArea(area: AbstractFieldset): void {
    let areaFieldsets: Array<AbstractFieldset> = [];
    this.areaFieldsets.forEach((currentArea: AbstractFieldset, index: number) => {
      if (area === currentArea) {
        if (currentArea.element) {
          currentArea.element.remove();
        }
        if (currentArea.area.canvasShape) {
          this.canvas.remove(currentArea.area.canvasShape);
          currentArea.area.canvasShape = null;
        }
        currentArea.removeBrowselinkTargetInput();
        delete(this.areaFieldsets[index]);
      } else {
        areaFieldsets.push(currentArea);
      }
    });
    this.areaFieldsets = areaFieldsets;
    this.updateArrowsState();
  }

  public openLinkBrowser(link: HTMLElement, fieldset: AbstractFieldset): void {
    link.blur();

    let data = new FormData(),
      request = new XMLHttpRequest();

    data.append('P[areaId]', fieldset.area.id.toString());
    data.append('P[formName]', 'areasForm');
    data.append('P[itemFormElName]', `href${fieldset.area.id}_target`);
    data.append('P[currentValue]', fieldset.area.areaData.href);
    data.append('P[tableName]', this.configuration.tableName);
    data.append('P[fieldName]', this.configuration.fieldName);
    data.append('P[uid]', this.configuration.uid.toString());
    data.append('P[pid]', this.configuration.pid.toString());

    request.open('POST', window.TYPO3.settings.ajaxUrls.imagemap_browselink_url);
    request.onreadystatechange = this.fetchBrowseLinkCallback.bind(fieldset);
    request.send(data);
  }

  private fetchBrowseLinkCallback(this: AbstractFieldset, e: ProgressEvent): void {
    let request = (e.target as XMLHttpRequest);
    if (request.readyState === 4 && request.status === 200) {
      let data = JSON.parse(request.responseText),
        url = data.url + '&P[currentValue]=' + encodeURIComponent(this.getFieldValue('.href'));

      Modal.advanced({
        type: Modal.types.iframe,
        content: url,
        size: Modal.sizes.large,
      });
    }
  }

  /**
   * Create form element that is reachable for LinkBrowser.finalizeFunction
   */
  private addBrowselinkTargetForm(): void {
    if (!(this.browselinkTargetForm = this.browselinkParent.querySelector(this.browselinkTargetFormSelector))) {
      this.browselinkTargetForm = this.browselinkParent.createElement('form');
      this.browselinkTargetForm.name = 'areasForm';
      this.browselinkTargetForm.id = 'browselinkTargetForm';
      this.browselinkParent.body.appendChild(this.browselinkTargetForm);
    }

    // empty previously created browselinkTargetForm
    while (this.browselinkTargetForm.firstChild) {
      this.browselinkTargetForm.removeChild(this.browselinkTargetForm.firstChild);
    }
  }

  private removeFauxForm(): void {
    if (this.browselinkTargetForm) {
      this.browselinkTargetForm.remove();
    }
  }

  public getMapData(): string {
    let areas: Area[] = [];

    this.areaFieldsets.forEach((areaFieldset: AbstractFieldset) => {
      areas.push(areaFieldset.area.getData());
    });

    return JSON.stringify(areas);
  }
}
