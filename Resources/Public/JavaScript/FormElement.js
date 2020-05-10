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
define(["require", "exports", "./AreaPreview"], function (require, exports, AreaPreview_1) {
    "use strict";
    class FormElement {
        constructor(fieldSelector) {
            this.initializeFormElement(fieldSelector);
            this.initializeAreaEditor();
            this.initializeEvents();
            this.renderAreas(this.hiddenInput.value);
        }
        initializeFormElement(fieldSelector) {
            this.hiddenInput = document.querySelector(fieldSelector);
            this.formElement = document.querySelector(fieldSelector + '-canvas');
        }
        initializeAreaEditor() {
            let image = this.formElement.querySelector('.image'), configurations = {
                canvas: {
                    width: image.offsetWidth,
                    height: image.offsetHeight,
                    top: image.offsetHeight * -1,
                },
            };
            this.areaPreview = new AreaPreview_1.AreaPreview(configurations, this.formElement.querySelector('#canvas'));
        }
        initializeEvents() {
            this.hiddenInput.addEventListener('imagemap:changed', this.fieldChangedHandler.bind(this));
        }
        fieldChangedHandler(event) {
            let field = event.currentTarget, data = new FormData(), request = new XMLHttpRequest();
            data.append('P[itemFormElName]', field.getAttribute('name'));
            data.append('P[tableName]', field.dataset.tablename);
            data.append('P[fieldName]', field.dataset.fieldname);
            data.append('P[uid]', field.dataset.uid);
            data.append('P[value]', field.value);
            request.open('POST', window.TYPO3.settings.ajaxUrls.imagemap_preview_rerender);
            request.onreadystatechange = this.previewRerenderCallback.bind({
                request: request,
                formElement: this
            });
            request.send(data);
        }
        previewRerenderCallback() {
            if (this.request.readyState === 4 && this.request.status === 200) {
                this.formElement.formElement.querySelector('.modifiedState').style.display = 'block';
                this.formElement.areaPreview.removeAreas();
                let data = JSON.parse(this.request.responseText);
                if (data !== null && data.length) {
                    this.formElement.areaPreview.renderAreas(data.areas);
                }
            }
        }
        renderAreas(areas) {
            if (areas.length) {
                this.areaPreview.renderAreas(JSON.parse(areas));
            }
        }
    }
    return FormElement;
});
