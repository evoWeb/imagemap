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
import * as AreaEditor from './AreaManipulation';

class FormElement {
  readonly previewRerenderAjaxUrl: string = '';

  readonly control: JQuery;

  private image: JQuery;

  private areaManipulation: AreaEditor.AreaManipulation;

  constructor() {
    this.previewRerenderAjaxUrl = window.TYPO3.settings.ajaxUrls.imagemap_preview_rerender;
    this.control = $('.imagemap-control:eq(0)');
    this.image = this.control.find('.image');

    this.initializeEvents();
    this.initializeAreaManipulation();
  }

  private initializeEvents() {
    this.control
      .find('.imagemap-hidden-value')
      .on('imagemap:changed', this.imagemapChangedHandler.bind(this));
  }

  private initializeAreaManipulation() {
    this.areaManipulation = new AreaEditor.AreaManipulation(
      this.control[0],
      {
        canvas: {
          width: parseInt(this.image.css('width')),
          height: parseInt(this.image.css('height')),
        },
        canvasSelector: '#canvas',
      }
    );
    this.areaManipulation.initializeAreas(this.control.find('.picture').data('existingAreas'));
  }

  private imagemapChangedHandler(event: JQueryEventObject) {
    let $field = $(event.currentTarget);
    let request = $.ajax({
      url: this.previewRerenderAjaxUrl,
      method: 'POST',
      data: {
        arguments: {
          itemFormElName: $field.attr('name'),
          tableName: $field.data('tablename'),
          fieldName: $field.data('fieldname'),
          uid: $field.data('uid'),
          value: $field.val()
        }
      }
    });
    request.done(this.renderPreviewAreas.bind(this));
  }

  private renderPreviewAreas(data: Array<any>, textStatus: string) {
    if (textStatus === 'success') {
      this.control
        .find('.modifiedState')
        .css('display', 'block');
      this.areaManipulation.removeAllAreas();
      this.areaManipulation.initializeAreas(data);
    }
  }
}

export = FormElement;
