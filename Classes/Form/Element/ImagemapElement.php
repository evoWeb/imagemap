<?php
namespace Evoweb\Imagemap\Form\Element;

/**
 * This file is developed by evoWeb.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 */

use TYPO3\CMS\Core\Page\PageRenderer;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class ImagemapElement extends \TYPO3\CMS\Backend\Form\Element\AbstractFormElement
{
    /**
     * Default field wizards enabled for this element.
     *
     * @var array
     */
    protected $defaultFieldWizard = [
        'localizationStateSelector' => [
            'renderType' => 'localizationStateSelector',
        ],
        'otherLanguageContent' => [
            'renderType' => 'otherLanguageContent',
            'after' => [
                'localizationStateSelector'
            ],
        ],
        'defaultLanguageDifferences' => [
            'renderType' => 'defaultLanguageDifferences',
            'after' => [
                'otherLanguageContent',
            ],
        ],
    ];

    /**
     * @return array
     */
    public function render()
    {
        $GLOBALS['BE_USER']->setAndSaveSessionData('imagemap.value', null);

        $data = GeneralUtility::makeInstance(
            \Evoweb\Imagemap\Domain\Model\DataObject::class,
            $this->data['tableName'],
            $this->data['fieldName'],
            $this->data['databaseRow']['uid'],
            $this->data['parameterArray']['itemFormElValue']
        );
        $data->setFieldConf($this->data['parameterArray']['fieldConf']);

        $resultArray = $this->initializeResultArray();
        if (!$data->hasValidImageFile()) {
            $resultArray['html'] = $GLOBALS['LANG']->sL(
                'LLL:EXT:imagemap/Resources/Private/Language/locallang.xlf:form.no_image'
            );
        } else {
            $resultArray = $this->renderElementWithControl($resultArray, $data);
        }

        return $resultArray;
    }

    /**
     * @param array $resultArray
     * @param \Evoweb\Imagemap\Domain\Model\DataObject $data
     *
     * @return array
     */
    protected function renderElementWithControl($resultArray, $data)
    {
        /** @var PageRenderer $pageRenderer */
        $pageRenderer = GeneralUtility::makeInstance(PageRenderer::class);
        $pageRenderer->addJsFile('EXT:imagemap/Resources/Public/JavaScript/jquery.base64.js');
        $pageRenderer->addJsFile('EXT:imagemap/Resources/Public/JavaScript/JsGraphics.js');

        $resultArray['requireJsModules'] = [
            'jquery-ui/sortable',
            'jquery-ui/draggable'
        ];

        $id = 'imagemap' . GeneralUtility::shortMD5(rand(1, 100000));

        $existingFields = $data->listAreas(
            "\tcanvasObject.addArea(new area##shape##Class(),'##coords##','##alt##','##link##','##color##',0);" . LF
        );

        $pageRenderer->addJsInlineCode(
            'imagemapwizard_valueChanged',
            'function imagemapwizard_valueChanged(fieldId) {
    jQuery.ajax({
        url: \'../typo3conf/ext/imagemap/Classes/Module/Wizard.php\',
        global: false,
        type: \'POST\',
        success: function(data, textStatus) {
            if (textStatus == \'success\') {
                jQuery(fieldId).html(data);
            }
        },
        data: { 
            context: \'tceform\',
            P: {
                itemFormElName: field.name,
                table: \'' . $this->data['tableName'] . '\',
                field: \'' . $this->data['fieldName'] . '\',
                uid: ' . $this->data['databaseRow']['uid'] . ',
                value: field.value
            },
            config: \'' . addslashes(serialize($this->data['parameterArray']['fieldConf'])) . '\'
        }
    });
}'
        );

        $pageRenderer->addJsInlineCode(
            'imagemapwizard_ready',
            'jQuery(document).ready(function() {
    var canvasObject = new previewCanvasClass();
    canvasObject.init(\'' . $id . '-canvas\', \'' . $data->getThumbnailScale('previewImageMaxWH', 300) . '\');
    ' . $existingFields . '
    jQuery(\'.imagemap_wiz_message\')
        .css({top: (canvasObject.getMaxH() / 2 - 35) + \'px\', left: \'20px\'})
        .animate({left: \'60px\',opacity: \'show\'}, 750)
        .animate({left: \'60px\'}, 6000)
        .animate({left: \'20px\', opacity: \'hide\'}, 750);
    jQuery(\'.imagemap_wiz_message_close\').click(function() {
        jQuery(\'.imagemap_wiz_message\').animate(
            {left: \'20px\', opacity: \'hide\'},
            {duration: 250, queue: false}
        );
    });
});'
        );

        $fieldControlResult = $this->renderFieldControl();
        $fieldControlHtml = $fieldControlResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldControlResult, false);

        $fieldWizardResult = $this->renderFieldWizard();
        $fieldWizardHtml = $fieldWizardResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldWizardResult, false);

        $mainFieldHtml = [];
        $mainFieldHtml[] = '<div class="form-control-wrap" style="max-width: 300px">';
        $mainFieldHtml[] =    '<div class="form-wizards-wrap">';
        $mainFieldHtml[] =      '<div class="form-wizards-element">';
        $mainFieldHtml[] =          '
<div id="' . $id . '" style="position: relative">
    <div class="imagemap_wiz" style="padding: 5px; overflow: hidden; position: relative;">
        <div id="' . $id . '-canvas" style="position: relative; top: 0; left: 0; overflow: hidden;">
        ' . $data->renderThumbnail('previewImageMaxWH', 300) . '
        </div>
    </div>
</div>
        ';
        $mainFieldHtml[] =      '</div>';
        if (!empty($fieldControlHtml)) {
            $mainFieldHtml[] =      '<div class="form-wizards-items-aside">';
            $mainFieldHtml[] =          '<div class="btn-group">';
            $mainFieldHtml[] =              $fieldControlHtml;
            $mainFieldHtml[] =          '</div>';
            $mainFieldHtml[] =      '</div>';
        }
        if (!empty($fieldWizardHtml)) {
            $mainFieldHtml[] = '<div class="form-wizards-items-bottom">';
            $mainFieldHtml[] = $fieldWizardHtml;
            $mainFieldHtml[] = '</div>';
        }
        $mainFieldHtml[] =    '</div>';
        $mainFieldHtml[] = '</div>';

        $mainFieldHtml[] = '<input type="hidden" 
            name="' . $this->data['parameterArray']['itemFormElName'] . '" 
            value="' . htmlspecialchars($data->getCurrentData()) . '"
            onchange="' . 'imagemapwizard_valueChanged(\'#' . $id . '\');" />';
        $mainFieldHtml = implode(LF, $mainFieldHtml);
        $fullElement = $mainFieldHtml;

        $resultArray['html'] = '<div class="formengine-field-item t3js-formengine-field-item">'
            . $fullElement . '</div>';
        return $resultArray;
    }

    /**
     * Returns an instance of LanguageService
     *
     * @return \TYPO3\CMS\Core\Localization\LanguageService
     */
    protected function getLanguageService()
    {
        return $GLOBALS['LANG'];
    }
}
