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
define(["require", "exports", "imagesloaded", "./AreaForm", "./Preview"], function (require, exports, ImagesLoaded, AreaForm_1, Preview_1) {
    "use strict";
    class FormElement {
        constructor(fieldSelector) {
            this.initializeFormElement(fieldSelector);
            this.initializePreview();
            this.initializeEvents();
        }
        initializeFormElement(fieldSelector) {
            this.hiddenInput = document.querySelector(fieldSelector);
            this.formElement = document.querySelector(fieldSelector + '-canvas');
        }
        initializePreview() {
            const image = this.formElement.querySelector('.image');
            ImagesLoaded(image, () => {
                setTimeout(() => {
                    AreaForm_1.AreaForm.width = image.width;
                    AreaForm_1.AreaForm.height = image.height;
                    this.preview = new Preview_1.Preview(this.formElement.querySelector('#canvas'));
                    this.renderAreas(this.hiddenInput.value);
                }, 100);
            });
        }
        initializeEvents() {
            this.hiddenInput.addEventListener('imagemap:changed', this.fieldChangedHandler.bind(this));
        }
        fieldChangedHandler() {
            this.preview.removeAreas();
            const image = this.formElement.querySelector('.image');
            AreaForm_1.AreaForm.width = image.width;
            AreaForm_1.AreaForm.height = image.height;
            this.renderAreas(this.hiddenInput.value);
        }
        renderAreas(areas) {
            if (areas.length) {
                this.preview.renderAreas(JSON.parse(areas));
            }
        }
    }
    return FormElement;
});
