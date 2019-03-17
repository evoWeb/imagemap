<?php
declare(strict_types = 1);

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

namespace Evoweb\Imagemap\Form\Element;

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

    /**
     * @var \TYPO3\CMS\Fluid\View\StandaloneView
     */
    protected $templateView;

    public function __construct(\TYPO3\CMS\Backend\Form\NodeFactory $nodeFactory, array $data)
    {
        parent::__construct($nodeFactory, $data);

        $this->templateView = GeneralUtility::makeInstance(\TYPO3\CMS\Fluid\View\StandaloneView::class);
        $this->templateView->setTemplate('FormEngine/ImagemapElement');
        $this->templateView->setTemplateRootPaths(['EXT:imagemap/Resources/Private/Templates/']);
    }

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
        $resultArray['requireJsModules'][] = [
            'TYPO3/CMS/Imagemap/FormElement' => 'function (FormElement) { new FormElement(); }'
        ];
        $resultArray['stylesheetFiles']['imagemapElement'] = 'EXT:imagemap/Resources/Public/Stylesheets/imagemap.css';

        $fieldControlResult = $this->renderFieldControl();
        $fieldControlHtml = $fieldControlResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldControlResult, false);

        $fieldWizardResult = $this->renderFieldWizard();
        $fieldWizardHtml = $fieldWizardResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldWizardResult, false);

        $arguments = [
            'formEngine' => [
                'field' => [
                    'tablename' => $this->data['tableName'],
                    'fieldname' => $this->data['fieldName'],
                    'uid' => (int)$this->data['databaseRow']['uid'],
                    'value' => htmlspecialchars($data->getCurrentData()),
                    'name' => $this->data['parameterArray']['itemFormElName'],
                    'id' => 'imagemap' . GeneralUtility::shortMD5(rand(1, 100000)),
                    'existingAreas' => \json_encode($data->getMap()),
                ]
            ],
            'thumbnailScale' => $data->getThumbnailScale('previewImageMaxWH', 400),
            'thumbnail' => $data->renderThumbnail('previewImageMaxWH', 400),
            'fieldControlHtml' => $fieldControlHtml,
            'fieldWizardHtml' => $fieldWizardHtml,
        ];

        $this->templateView->assignMultiple($arguments);
        $resultArray['html'] = $this->templateView->render();

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
