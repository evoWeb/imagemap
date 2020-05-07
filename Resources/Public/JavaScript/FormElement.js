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
define(["require", "exports", "jquery", "./AreaEditor"], function (require, exports, $, AreaEditor) {
    "use strict";
    var FormElement = /** @class */ (function () {
        function FormElement(fieldSelector) {
            this.initializeFormElement(fieldSelector);
            this.initializeAreaEditor();
            this.initializeEvents();
            this.initializeAreas(fieldSelector);
        }
        FormElement.prototype.initializeFormElement = function (fieldSelector) {
            this.formElement = $(fieldSelector + '-canvas').eq(0);
        };
        FormElement.prototype.initializeAreaEditor = function () {
            var image = this.formElement.find('.image'), editorOptions = {
                canvas: {
                    width: parseInt(image.css('width')),
                    height: parseInt(image.css('height')),
                    top: parseInt(image.css('height')) * -1,
                },
            };
            this.areaEditor = new AreaEditor(editorOptions, this.formElement.find('#canvas')[0], '', window.document);
        };
        FormElement.prototype.initializeEvents = function () {
            this.formElement.find('input[type=hidden]').on('imagemap:changed', this.fieldChangedHandler.bind(this));
        };
        FormElement.prototype.initializeAreas = function (fieldSelector) {
            // @todo remove .areas to use all values
            var areas = $(fieldSelector).eq(0).val();
            if (areas.length) {
              this.areaEditor.initializeAreas(JSON.parse(areas).areas);
            }
        };
        FormElement.prototype.fieldChangedHandler = function (event) {
            var _this = this;
            var $field = $(event.currentTarget);
            var request = $.ajax({
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
            request.done(function (data, textStatus) {
                if (textStatus === 'success') {
                    _this.formElement.find('.modifiedState').css('display', 'block');
                    _this.areaEditor.removeAllAreas();
                    _this.areaEditor.initializeAreas(data.areas);
                }
            });
        };
        return FormElement;
    }());
    return FormElement;
});
