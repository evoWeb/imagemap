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
import Modal = require('TYPO3/CMS/Backend/Modal');

import { AreaEditor } from './AreaEditor';
import { FormElementAbstract } from './FormElementAbstract';

export class AreaForm {
  public areaZone: HTMLElement;

  public element: HTMLElement;

  protected editor: AreaEditor;

  /**
   * Element needed to add inputs that act as target for browselink finalizeFunction target
   */
  public fauxForm: HTMLFormElement;

  constructor(formSelector: string, editor: AreaEditor) {
    this.element = editor.document.querySelector(formSelector);
    this.areaZone = this.element.querySelector('#areaZone');
    this.editor = editor;

    this.addFauxFormForLinkBrowser();
  }

  public destroy() {
    this.removeFauxForm();
  }

  public updateArrowsState() {
    this.editor.areaForms.forEach((area) => {
      area.updateArrowsState();
    });
  }

  public addArea(area: FormElementAbstract) {
    area.form = this;
    area.postAddToForm();
  }

  public moveArea(area: FormElementAbstract, offset: number) {
    let index = this.editor.areaForms.indexOf(area),
      newIndex = index + offset,
      parent = area.element.parentNode;

    if (newIndex > -1 && newIndex < this.editor.areaForms.length) {
      let removedArea = this.editor.areaForms.splice(index, 1)[0];
      this.editor.areaForms.splice(newIndex, 0, removedArea);

      parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
    }

    this.updateArrowsState();
  }

  public openLinkBrowser(link: HTMLElement, area: FormElementAbstract) {
    link.blur();

    let data = new FormData(),
      request = new XMLHttpRequest();

    data.append('P[areaId]', area.id.toString());
    data.append('P[formName]', 'areasForm');
    data.append('P[itemFormElName]', 'href' + area.id);
    data.append('P[currentValue]', area.getLink());

    request.open('POST', window.TYPO3.settings.ajaxUrls.imagemap_browselink_url);
    request.onreadystatechange = this.fetchBrowseLinkCallback.bind({
      request: request,
      areaForm: this,
      area: area
    });
    request.send(data);
  }

  protected fetchBrowseLinkCallback(this: {request: XMLHttpRequest, areaForm: AreaForm, area: FormElementAbstract}) {
    if (this.request.readyState === 4 && this.request.status === 200) {
      let data = JSON.parse(this.request.responseText),
        url = data.url
          + '&P[currentValue]=' + encodeURIComponent(this.area.getFieldValue('.href'))
          + '&P[currentSelectedValues]=' + encodeURIComponent(this.area.getFieldValue('.href'));

      if (
        window.hasOwnProperty('TBE_EDITOR')
        && window.TBE_EDITOR.hasOwnProperty('doSaveFieldName')
        && window.TBE_EDITOR.doSaveFieldName === 'doSave'
      ) {
        // @todo remove once TYPO3 9.x support gets removed
        let vHWin = window.open(
          url,
          '',
          'height=600,width=500,status=0,menubar=0,scrollbars=1'
        );
        vHWin.focus()
      } else {
        Modal.advanced({
          type: Modal.types.iframe,
          content: url,
          size: Modal.sizes.large,
        });
      }
    }
  }

  /**
   * Create form element that is reachable for LinkBrowser.finalizeFunction
   */
  protected addFauxFormForLinkBrowser() {
    if (top.document !== this.editor.fauxFormDocument) {
      if (!(this.fauxForm = this.editor.fauxFormDocument.querySelector(this.editor.formSelector))) {
        this.fauxForm = this.editor.fauxFormDocument.createElement('form');
        this.fauxForm.setAttribute('name', 'areasForm');
        this.fauxForm.setAttribute('id', 'fauxForm');
        this.editor.fauxFormDocument.body.appendChild(this.fauxForm);
      }

      // empty previously created fauxForm
      while (this.fauxForm.firstChild) {
        this.fauxForm.removeChild(this.fauxForm.firstChild);
      }
    }
  }

  protected removeFauxForm() {
    if (this.fauxForm) {
      this.fauxForm.remove();
    }
  }
}
