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
define(["require", "exports", "jquery", "./AreaEditor"], function (require, exports, $, AreaEditor_1) {
    "use strict";
    var FormElement = /** @class */ (function () {
        function FormElement() {
            this.control = $('.imagemap-control:eq(0)');
            this.image = this.control.find('.image img');
            this.canvas = this.control.find('.picture');
            this.initialize();
        }
        FormElement.prototype.initialize = function () {
            this.editorOptions = {
                canvas: {
                    width: parseInt(this.image.css('width')),
                    height: parseInt(this.image.css('height')),
                    top: parseInt(this.image.css('height')) * -1,
                },
                previewRerenderAjaxUrl: window.TYPO3.settings.ajaxUrls.imagemap_preview_rerender
            };
            this.initializeAreaEditor(this.editorOptions);
            this.initializeEvents();
            this.initializeScaleFactor(this.canvas.data('thumbnail-scale'));
            this.initializeAreas(this.canvas.data('existing-areas'));
        };
        FormElement.prototype.initializeAreaEditor = function (editorOptions) {
            var canvas = this.control.find('#canvas')[0];
            this.areaEditor = new AreaEditor_1.default(editorOptions, canvas, '', window.document);
        };
        FormElement.prototype.initializeScaleFactor = function (scaleFactor) {
            this.areaEditor.setScale(scaleFactor);
        };
        FormElement.prototype.initializeEvents = function () {
            this.control.find('input[type=hidden]').on('imagemap:changed', this.imagemapChangedHandler.bind(this));
        };
        FormElement.prototype.initializeAreas = function (areas) {
            this.areaEditor.initializeAreas(areas);
        };
        FormElement.prototype.imagemapChangedHandler = function (event) {
            var _this = this;
            var $field = $(event.currentTarget);
            $.ajax({
                url: this.editorOptions.previewRerenderAjaxUrl,
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
            }).done(function (data, textStatus) {
                if (textStatus === 'success') {
                    _this.control.find('.modifiedState').css('display', 'block');
                    _this.areaEditor.removeAllAreas();
                    _this.areaEditor.initializeAreas(data);
                }
            });
        };
        return FormElement;
    }());
    return FormElement;
});
