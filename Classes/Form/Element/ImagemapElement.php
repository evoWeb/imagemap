<?php
declare(strict_types = 1);

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

use Evoweb\Imagemap\Domain\Model\Data;
use TYPO3\CMS\Core\Utility\ArrayUtility;
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

    public function render(): array
    {
        $this->getBackendUser()->setAndSaveSessionData('imagemap.value', null);

        /** @var Data $data */
        $data = GeneralUtility::makeInstance(
            Data::class,
            $this->data['tableName'],
            $this->data['fieldName'],
            (int)$this->data['databaseRow']['uid'],
            $this->data['parameterArray']['itemFormElValue']
        );
        $data->setFieldConf($this->data['parameterArray']['fieldConf']);

        $resultArray = $this->initializeResultArray();
        if (!$data->hasValidImageFile()) {
            $resultArray['html'] = $this->getLanguageService()->sL(
                'LLL:EXT:imagemap/Resources/Private/Language/locallang.xlf:imagemap.element.no_image'
            );
        } else {
            $resultArray = $this->renderElementWithControl($resultArray, $data);
        }

        return $resultArray;
    }

    protected function renderElementWithControl(array $resultArray, Data $data): array
    {
        $id = 'imagemap' . GeneralUtility::shortMD5(rand(1, 100000));

        $existingAreas = json_encode($data->getAreas());

        $resultArray['requireJsModules']['imagemapElement'] = 'TYPO3/CMS/Imagemap/FormElement';
        $resultArray['stylesheetFiles']['imagemapElement'] = 'EXT:imagemap/Resources/Public/Stylesheets/imagemap.css';

        $fieldControlResult = $this->renderFieldControl();
        $fieldControlHtml = $fieldControlResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldControlResult, false);

        $fieldWizardResult = $this->renderFieldWizard();
        $fieldWizardHtml = $fieldWizardResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldWizardResult, false);

        $mainFieldHtml = [];
        $mainFieldHtml[] = '<div class="form-control-wrap imagemap-control">';
        $mainFieldHtml[] =    '<div class="form-wizards-wrap">';
        $mainFieldHtml[] =      '<div class="form-wizards-element pictureWrap" id="' . $id . '">';
        $mainFieldHtml[] =        '<div id="' . $id . '-canvas" class="picture" data-thumbnail-scale="';
        $mainFieldHtml[] =          $data->getThumbnailScale('previewImageMaxWH', 400);
        $mainFieldHtml[] =          '" data-existing-areas=\'' . $existingAreas . '\'>';
        $mainFieldHtml[] =          '<div class="image">';
        $mainFieldHtml[] =            $data->renderThumbnail('previewImageMaxWH', 400);
        $mainFieldHtml[] =          '</div>';
        $mainFieldHtml[] =          '<canvas id="canvas" class="canvas"></canvas>';
        $mainFieldHtml[] =        '</div>';
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
            $mainFieldHtml[] =     $fieldWizardHtml;
            $mainFieldHtml[] = '</div>';
        }
        $mainFieldHtml[] =    '</div>';
        $mainFieldHtml[] =  '<input type="hidden" 
            name="' . $this->data['parameterArray']['itemFormElName'] . '" 
            value="' . htmlspecialchars($data->getCurrentData()) . '" />';
        $mainFieldHtml[] = '</div>';

        $html = implode(LF, $mainFieldHtml);

        $resultArray['html'] = '<div class="formengine-field-item t3js-formengine-field-item">' . $html . '</div>';
        return $resultArray;
    }

    /**
     * Override field control rendering to have a custom button
     *
     * @return array Result array
     */
    protected function renderFieldControl(): array
    {
        $options = $this->data;
        $fieldControl = $this->defaultFieldControl;
        $fieldControlFromTca = $options['parameterArray']['fieldConf']['config']['fieldControl'] ?? [];
        ArrayUtility::mergeRecursiveWithOverrule($fieldControl, $fieldControlFromTca);
        $options['renderType'] = 'imagemapPopup';
        $options['renderData']['fieldControl'] = $fieldControl;
        return $this->nodeFactory->create($options)->render();
    }

    /**
     * Returns an instance of Backend User Authentication
     *
     * @return \TYPO3\CMS\Core\Authentication\BackendUserAuthentication|null
     */
    protected function getBackendUser()
    {
        return $GLOBALS['BE_USER'] ?? null;
    }

    /**
     * Returns an instance of LanguageService
     *
     * @return \TYPO3\CMS\Core\Localization\LanguageService|null
     */
    protected function getLanguageService()
    {
        return $GLOBALS['LANG'] ?? null;
    }
}
