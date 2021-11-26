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
define(["require", "exports", "imagesloaded", "./Preview"], function (require, exports, ImagesLoaded, Preview_1) {
    "use strict";
    class FormElement {
        constructor(fieldSelector) {
            this.previewImageSelector = '.image';
            this.initializeFormElement(fieldSelector);
            this.waitForImageToBeLoaded();
            this.initializeEvents();
        }
        initializeFormElement(fieldSelector) {
            this.hiddenInput = document.querySelector(fieldSelector);
            this.formElement = document.querySelector(fieldSelector + '-canvas');
        }
        waitForImageToBeLoaded() {
            const image = this.formElement.querySelector(this.previewImageSelector);
            ImagesLoaded(image, () => {
                this.initializePreview(image);
                this.renderAreas(this.hiddenInput.value);
            });
        }
        initializePreview(image) {
            let configurations = {
                width: image.width,
                height: image.height
            };
            this.preview = new Preview_1.Preview(image.parentNode.querySelector('#canvas'), configurations);
        }
        initializeEvents() {
            this.hiddenInput.addEventListener('imagemap:changed', this.fieldChangedHandler.bind(this));
        }
        fieldChangedHandler() {
            this.preview.removeAreas();
            this.renderAreas(this.hiddenInput.value);
        }
        renderAreas(value) {
            if (value.length) {
                let areas = JSON.parse(value);
                if (areas !== undefined && areas.length) {
                    this.preview.renderAreas(areas);
                }
            }
        }
    }
    return FormElement;
});
