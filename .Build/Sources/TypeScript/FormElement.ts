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
import AreaEditor from './AreaEditor';

class FormElement {
  private previewRerenderAjaxUrl: string = '';

  private areaEditor: AreaEditor;

  private control: JQuery;

  private image: JQuery;

  private canvas: JQuery;

  constructor() {
    this.control = $('.imagemap-control:eq(0)');
    this.image = this.control.find('.image');
    this.canvas = this.control.find('.picture');
    this.previewRerenderAjaxUrl = window.TYPO3.settings.ajaxUrls.imagemap_preview_rerender;

    this.initialize();
  }

  private initialize() {
    this.initializeEvents();
    this.initializeAreaEditor(
      {
        canvas: {
          width: parseInt(this.image.css('width')),
          height: parseInt(this.image.css('height')),
          top: parseInt(this.image.css('height')) * -1,
        },
      },
      this.canvas.data('existingAreas')
    );
  }

  private initializeAreaEditor(editorOptions: EditorOptions, areas: Array<any>) {
    let canvas = (this.control.find('#canvas')[0] as HTMLElement);
    this.areaEditor = new AreaEditor(editorOptions, canvas, '', window.document);
    this.areaEditor.initializeAreas(areas);
  }

  private initializeEvents() {
    this.control
      .find('.imagemap-hidden-value')
      .on('imagemap:changed', this.imagemapChangedHandler.bind(this));
  }

  private imagemapChangedHandler(event: JQueryEventObject) {
    let $field = $(event.currentTarget);

    $.ajax({
      url: this.previewRerenderAjaxUrl,
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
    }).done((data, textStatus) => {
      if (textStatus === 'success') {
        this.control.find('.modifiedState').css('display', 'block');
        this.areaEditor.removeAllAreas();
        this.areaEditor.initializeAreas(data);
      }
    });
  }
}

export = FormElement;
