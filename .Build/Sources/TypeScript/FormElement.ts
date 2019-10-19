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

import * as $ from 'jquery';
// @ts-ignore
import * as AreaEditor from './AreaEditor';

class FormElement {
  private formElement: JQuery;

  private areaEditor: AreaEditor;

  constructor(fieldSelector: string) {
    this.initializeFormElement(fieldSelector);
    this.initializeAreaEditor();
    this.initializeEvents();
    this.initializeAreas(fieldSelector);
  }

  private initializeFormElement(fieldSelector: string) {
    this.formElement = $(fieldSelector + '-canvas').eq(0);
  }

  private initializeAreaEditor() {
    let image = this.formElement.find('.image'),
      editorOptions = {
        canvas: {
          width: parseInt(image.css('width')),
          height: parseInt(image.css('height')),
          top: parseInt(image.css('height')) * -1,
        },
      };

    this.areaEditor = new AreaEditor(editorOptions, this.formElement.find('#canvas')[0], '', window.document);
  }

  private initializeEvents() {
    this.formElement.find('input[type=hidden]').on('imagemap:changed', this.fieldChangedHandler.bind(this));
  }

  private initializeAreas(fieldSelector: string) {
    // @todo remove .areas to use all values
    let areas = $(fieldSelector).eq(0).val();
    this.areaEditor.initializeAreas(JSON.parse(areas).areas);
  }

  private fieldChangedHandler(event: JQueryEventObject) {
    let $field = $(event.currentTarget);
    let request = $.ajax({
      url: window.TYPO3.settings.ajaxUrls.imagemap_preview_rerender,
      method: 'POST',
      data: {
        P: {
          itemFormElName: $field.attr('name'),
          tableName: $field.data('tablename'),
          fieldName: $field.data('fieldname'),
          uid: $field.data('uid'),
          value: $field.val()
        }
      }
    });
    request.done((data, textStatus) => {
      if (textStatus === 'success') {
        this.formElement.find('.modifiedState').css('display', 'block');
        this.areaEditor.removeAllAreas();
        this.areaEditor.initializeAreas(data.areas);
      }
    });
  }
}

export = FormElement;
