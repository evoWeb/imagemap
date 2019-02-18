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
        $id = 'imagemap' . GeneralUtility::shortMD5(rand(1, 100000));

        $existingFields = $data->listAreas(
            "canvasObject.addArea(new area##shape##Class(),'##coords##','##alt##','##link##','##color##',0);" . LF
        );

        $resultArray['requireJsModules']['imagemapFormElement'] = [
            'TYPO3/CMS/Imagemap/FormElement' => 'function(canvasObject) {
                jQuery(document).ready(function() {
                    canvasObject.init(
                        \'' . $id . '-canvas\',
                        \''. $data->getThumbnailScale('previewImageMaxWH', 300) . '\'
                    );
                    ' . $existingFields . '
                });
            }'
        ];

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
