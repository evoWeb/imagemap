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

use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Resource\FileReference;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\MathUtility;
use TYPO3\CMS\Core\Utility\StringUtility;
use TYPO3\CMS\Extbase\Utility\LocalizationUtility;
use TYPO3\CMS\Fluid\View\StandaloneView;

class ImagemapElement extends \TYPO3\CMS\Backend\Form\Element\AbstractFormElement
{
    /**
     * @var string
     */
    private $wizardRouteName = 'ajax_wizard_imagemap_area';

    /**
     * Default element configuration
     *
     * @var array
     */
    public static $defaultConfig = [
        'tableName' => 'tt_content',
        'fieldName' => 'image',
        // default: $GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext']
        'allowedExtensions' => null,
        'mapAreas' => [
            'default' => [
             ]
        ]
    ];

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
     * @var StandaloneView
     */
    protected $templateView;

    /**
     * @var UriBuilder
     */
    protected $uriBuilder;

    public function __construct(\TYPO3\CMS\Backend\Form\NodeFactory $nodeFactory, array $data)
    {
        parent::__construct($nodeFactory, $data);
        // Would be great, if we could inject the view here, but since the constructor is in the interface, we can't
        $this->templateView = GeneralUtility::makeInstance(StandaloneView::class);
        $this->templateView->setLayoutRootPaths(['EXT:imagemap/Resources/Private/Layouts/']);
        $this->templateView->setTemplatePathAndFilename(
            'EXT:imagemap/Resources/Private/Templates/FormEngine/ImagemapElement.html'
        );
        $this->uriBuilder = GeneralUtility::makeInstance(UriBuilder::class);
    }

    public function render(): array
    {
        $resultArray = $this->initializeResultArray();
        $parameterArray = $this->data['parameterArray'];
        $config = $this->populateConfiguration($parameterArray['fieldConf']['config']);

        $fileReference = $this->getFileReference($this->data['databaseRow'], $config);
        if (!$fileReference) {
            // Early return in case we do not find a file
            $resultArray['html'] = LocalizationUtility::translate('imagemap.element.no_image', 'imagemap');
            return $resultArray;
        }

        $config = $this->processConfiguration($config, $parameterArray['itemFormElValue']);

        $fieldInformationResult = $this->renderFieldInformation();
        $fieldInformationHtml = $fieldInformationResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldInformationResult, false);

        $fieldControlResult = $this->renderFieldControl();
        $fieldControlHtml = $fieldControlResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldControlResult, false);

        $fieldWizardResult = $this->renderFieldWizard();
        $fieldWizardHtml = $fieldWizardResult['html'];
        $resultArray = $this->mergeChildReturnIntoExistingResult($resultArray, $fieldWizardResult, false);

        $arguments = [
            'fieldInformation' => $fieldInformationHtml,
            'fieldControl' => $fieldControlHtml,
            'fieldWizard' => $fieldWizardHtml,
            'isAllowedFileExtension' => in_array(
                strtolower($fileReference->getOriginalFile()->getExtension()),
                GeneralUtility::trimExplode(',', strtolower($config['allowedExtensions'])),
                true
            ),
            'image' => $fileReference,
            'maxWidth' => $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['imagemap']['previewImageMaxWH'] ?? 400,
            'formEngine' => [
                'field' => [
                    'value' => htmlspecialchars(trim($this->data['databaseRow'][$this->data['fieldName']])),
                    'name' => $parameterArray['itemFormElName'],
                    'existingAreas' => $this->getExistingAreas(),
                ],
                'validation' => '[]'
            ],
            'config' => $config,
            'wizardUri' => $this->getWizardUri(),
            'wizardPayload' => \json_encode($this->getWizardPayload($fileReference)),
        ];

        if ($arguments['isAllowedFileExtension']) {
            $resultArray['requireJsModules'][] = [
                'TYPO3/CMS/Imagemap/FormElement' => 'function (FormElement) { new FormElement(); }',
            ];
            $resultArray['requireJsModules'][] = [
                'TYPO3/CMS/Imagemap/EditControl' => 'function (EditControl) { new EditControl(); }',
            ];
            $arguments['formEngine']['field']['id'] = StringUtility::getUniqueId('formengine-image-manipulation-');
            if (GeneralUtility::inList($config['eval'], 'required')) {
                $arguments['formEngine']['validation'] = $this->getValidationDataAsJsonString(['required' => true]);
            }
        }
        $this->templateView->assignMultiple($arguments);
        $resultArray['html'] = $this->templateView->render();

        return $resultArray;
    }

    protected function getFileReference(array $row, array $config):? FileReference
    {
        $fileReference = null;
        $fileUid = !empty($row[$config['fieldName']]) ? $row[$config['fieldName']] : null;
        if (is_array($fileUid) && isset($fileUid[0]['uid'])) {
            $fileUid = $fileUid[0]['uid'];
        }
        if (MathUtility::canBeInterpretedAsInteger($fileUid)) {
            try {
                $fileReference = ResourceFactory::getInstance()->getFileReferenceObject($fileUid);
            } catch (\throwable $e) {
            }
        } else {
            try {
                $fileRepository = GeneralUtility::makeInstance(\TYPO3\CMS\Core\Resource\FileRepository::class);
                $fileReference = $fileRepository->findByRelation(
                    $config['tableName'],
                    $config['fieldName'],
                    $row['uid']
                )[0];
            } catch (\Throwable $e) {
            }
        }
        return $fileReference;
    }

    protected function populateConfiguration(array $baseConfiguration): array
    {
        $defaultConfig = self::$defaultConfig;

        // If ratios are set do not add default options
        if (isset($baseConfiguration['mapAreas'])) {
            unset($defaultConfig['mapAreas']);
        }

        $config = array_replace_recursive($defaultConfig, $baseConfiguration);

        if (!is_array($config['mapAreas'])) {
            $config['mapAreas'] = [];
        }

        $mapAreas = [];
        foreach ($config['mapAreas'] as $id => $mapArea) {
            $mapAreas[$id] = $mapArea;
        }

        $config['mapAreas'] = $mapAreas;

        // By default we allow all image extensions that can be handled by the GFX functionality
        if ($config['allowedExtensions'] === null) {
            $config['allowedExtensions'] = $GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext'];
        }
        return $config;
    }

    protected function processConfiguration(array $config, string &$elementValue): array
    {
        $config['mapAreas'] = empty($elementValue) ? [] : json_decode($elementValue, true);
        $config['allowedExtensions'] = implode(
            ', ',
            GeneralUtility::trimExplode(',', $config['allowedExtensions'], true)
        );
        return $config;
    }

    protected function getWizardUri(): string
    {
        try {
            $url = (string)$this->uriBuilder->buildUriFromRoute($this->wizardRouteName);
        } catch (\throwable $e) {
        }
        return $url ?? '';
    }

    protected function getWizardPayload(FileReference $fileReference): array
    {
        $arguments = [
            'image' => $fileReference->getUid(),
            'tableName' => $this->data['tableName'],
            'fieldName' => $this->data['fieldName'],
            'uid' => $this->data['databaseRow']['uid']
        ];
        $uriArguments = [
            'arguments' => json_encode($arguments),
            'signature' => GeneralUtility::hmac(json_encode($arguments), $this->wizardRouteName)
        ];

        return $uriArguments;
    }

    protected function getExistingAreas(): string
    {
        return htmlspecialchars(trim($this->data['databaseRow'][$this->data['fieldName']]));
    }
}
