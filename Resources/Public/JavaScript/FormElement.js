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
define(["require", "exports", "jquery", "./AreaManipulation"], function (require, exports, $, AreaManipulation_1) {
    "use strict";
    var FormElement = /** @class */ (function () {
        function FormElement() {
            this.previewRerenderAjaxUrl = '';
            this.control = $('.imagemap-control:eq(0)');
            this.image = this.control.find('.image');
            this.previewRerenderAjaxUrl = window.TYPO3.settings.ajaxUrls.imagemap_preview_rerender;
            this.initializeEvents();
            this.initializeAreaEditor();
        }
        FormElement.prototype.initializeAreaEditor = function () {
            this.areaManipulation = new AreaManipulation_1.default(this.control[0], {
                canvas: {
                    width: parseInt(this.image.css('width')),
                    height: parseInt(this.image.css('height')),
                    top: parseInt(this.image.css('height')) * -1,
                },
                canvasSelector: '#canvas',
            });
            this.areaManipulation.initializeAreas(this.control.find('.picture').data('existingAreas'));
        };
        FormElement.prototype.initializeEvents = function () {
            this.control
                .find('.imagemap-hidden-value')
                .on('imagemap:changed', this.imagemapChangedHandler.bind(this));
        };
        FormElement.prototype.imagemapChangedHandler = function (event) {
            var _this = this;
            var $field = $(event.currentTarget);
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
            }).done(function (data, textStatus) {
                if (textStatus === 'success') {
                    _this.control
                        .find('.modifiedState')
                        .css('display', 'block');
                    _this.areaManipulation.removeAllAreas();
                    _this.areaManipulation.initializeAreas(data);
                }
            });
        };
        return FormElement;
    }());
    return FormElement;
});
