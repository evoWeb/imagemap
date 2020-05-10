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
define(["require", "exports", "TYPO3/CMS/Backend/Modal"], function (require, exports, Modal) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AreaForm {
        constructor(formSelector, editor) {
            this.element = editor.document.querySelector(formSelector);
            this.areaZone = this.element.querySelector('#areaZone');
            this.editor = editor;
            this.addFauxFormForLinkBrowser();
        }
        destroy() {
            this.removeFauxForm();
        }
        updateArrowsState() {
            this.editor.areaForms.forEach((area) => {
                area.updateArrowsState();
            });
        }
        addArea(area) {
            area.form = this;
            area.postAddToForm();
        }
        moveArea(area, offset) {
            let index = this.editor.areaForms.indexOf(area), newIndex = index + offset, parent = area.element.parentNode;
            if (newIndex > -1 && newIndex < this.editor.areaForms.length) {
                let removedArea = this.editor.areaForms.splice(index, 1)[0];
                this.editor.areaForms.splice(newIndex, 0, removedArea);
                parent.childNodes[index][offset < 0 ? 'after' : 'before'](parent.childNodes[newIndex]);
            }
            this.updateArrowsState();
        }
        openLinkBrowser(link, area) {
            link.blur();
            let data = new FormData(), request = new XMLHttpRequest();
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
        fetchBrowseLinkCallback() {
            if (this.request.readyState === 4 && this.request.status === 200) {
                let data = JSON.parse(this.request.responseText), url = data.url
                    + '&P[currentValue]=' + encodeURIComponent(this.area.getFieldValue('.href'))
                    + '&P[currentSelectedValues]=' + encodeURIComponent(this.area.getFieldValue('.href'));
                if (window.hasOwnProperty('TBE_EDITOR')
                    && window.TBE_EDITOR.hasOwnProperty('doSaveFieldName')
                    && window.TBE_EDITOR.doSaveFieldName === 'doSave') {
                    // @todo remove once TYPO3 9.x support gets removed
                    let vHWin = window.open(url, '', 'height=600,width=500,status=0,menubar=0,scrollbars=1');
                    vHWin.focus();
                }
                else {
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
        addFauxFormForLinkBrowser() {
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
        removeFauxForm() {
            if (this.fauxForm) {
                this.fauxForm.remove();
            }
        }
    }
    exports.AreaForm = AreaForm;
});
