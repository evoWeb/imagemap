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
use TYPO3\CMS\Core\Imaging\ImageManipulation\Area;
use TYPO3\CMS\Core\Imaging\ImageManipulation\CropVariantCollection;
use TYPO3\CMS\Core\Imaging\ImageManipulation\InvalidConfigurationException;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\MathUtility;
use TYPO3\CMS\Core\Utility\StringUtility;
use TYPO3\CMS\Fluid\View\StandaloneView;

class ImagemapElement extends \TYPO3\CMS\Backend\Form\Element\AbstractFormElement
{
    /**
     * @var string
     */
    private $wizardRouteName = 'imagemap_modal';

    /**
     * Default element configuration
     *
     * @var array
     */
    protected static $defaultConfig = [
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

        $file = $this->getFile($this->data['databaseRow'], $config);
        if (!$file) {
            // Early return in case we do not find a file
            $resultArray['html'] = $this->getLanguageService()->sL(
                'LLL:EXT:imagemap/Resources/Private/Language/locallang.xlf:imagemap.element.no_image'
            );
            return $resultArray;
        }

        $config = $this->processConfiguration($config, $parameterArray['itemFormElValue'], $file);

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
                strtolower($file->getExtension()),
                GeneralUtility::trimExplode(',', strtolower($config['allowedExtensions'])),
                true
            ),
            'image' => $file,
            'formEngine' => [
                'field' => [
                    'value' => htmlspecialchars($this->data['databaseRow'][$this->data['fieldName']]),
                    'name' => $parameterArray['itemFormElName'],
                    'existingAreas' => $this->getExistingAreas(),
                ],
                'validation' => '[]'
            ],
            'config' => $config,
            'wizardUri' => $this->getWizardUri(),
            'wizardPayload' => \json_encode($this->getWizardPayload($parameterArray)),
            'previewUrl' => $this->getPreviewUrl($this->data['databaseRow'], $file),
        ];

        if ($arguments['isAllowedFileExtension']) {
            $resultArray['requireJsModules'][] = [
                'TYPO3/CMS/Imagemap/FormElement' => 'function (FormElement) { new FormElement(); }'
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

    protected function getFile(array $row, array $config):? File
    {
        $file = null;
        $fileUid = !empty($row[$config['fieldName']]) ? $row[$config['fieldName']] : null;
        if (is_array($fileUid) && isset($fileUid[0]['uid'])) {
            $fileUid = $fileUid[0]['uid'];
        }
        if (MathUtility::canBeInterpretedAsInteger($fileUid)) {
            try {
                $file = ResourceFactory::getInstance()->getFileReferenceObject($fileUid)->getOriginalFile();
            } catch (\InvalidArgumentException $e) {
            }
        } else {
            try {
                $fileRepository = GeneralUtility::makeInstance(\TYPO3\CMS\Core\Resource\FileRepository::class);
                $file = $fileRepository->findByRelation(
                    $config['tableName'],
                    $config['fieldName'],
                    $row['uid']
                )[0];
            } catch (\Throwable $e) {
            }
        }
        return $file;
    }

    protected function getPreviewUrl(array $databaseRow, File $file): string
    {
        $previewUrl = '';
        // Hook to generate a preview URL
        $hookParameters = [
            'databaseRow' => $databaseRow,
            'file' => $file,
            'previewUrl' => $previewUrl,
        ];
        $scOptions = $GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS'];
        foreach ($scOptions['Backend/Form/Element/ImageManipulationElement']['previewUrl'] ?? [] as $listener) {
            $previewUrl = GeneralUtility::callUserFunction($listener, $hookParameters, $this);
        }
        return $previewUrl;
    }

    /**
     * @param array $baseConfiguration
     * @return array
     * @throws InvalidConfigurationException
     */
    protected function populateConfiguration(array $baseConfiguration): array
    {
        $defaultConfig = self::$defaultConfig;

        // If ratios are set do not add default options
        if (isset($baseConfiguration['mapAreas'])) {
            unset($defaultConfig['mapAreas']);
        }

        $config = array_replace_recursive($defaultConfig, $baseConfiguration);

        if (!is_array($config['mapAreas'])) {
            throw new InvalidConfigurationException('Map areas configuration must be an array', 1485377267);
        }

        $mapAreas = [];
        foreach ($config['mapAreas'] as $id => $cropVariant) {
            // Ignore disabled crop variants
            if (!empty($cropVariant['disabled'])) {
                continue;
            }
            // Enforce a crop area (default is full image)
            if (empty($cropVariant['mapArea'])) {
                $cropVariant['mapArea'] = Area::createEmpty()->asArray();
            }
            $mapAreas[$id] = $cropVariant;
        }

        $config['mapAreas'] = $mapAreas;

        // By default we allow all image extensions that can be handled by the GFX functionality
        if ($config['allowedExtensions'] === null) {
            $config['allowedExtensions'] = $GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext'];
        }
        return $config;
    }

    /**
     * @param array $config
     * @param string $elementValue
     * @param File $file
     * @return array
     * @throws \TYPO3\CMS\Core\Imaging\ImageManipulation\InvalidConfigurationException
     */
    protected function processConfiguration(array $config, string &$elementValue, File $file): array
    {
        $mapAreaCollection = CropVariantCollection::create($elementValue, $config['mapAreas']);
        if (empty($config['readOnly']) && !empty($file->getProperty('width'))) {
            $mapAreaCollection = $mapAreaCollection->applyRatioRestrictionToSelectedCropArea($file);
            $elementValue = (string)$mapAreaCollection;
        }
        $config['mapAreas'] = $mapAreaCollection->asArray();
        $config['allowedExtensions'] = implode(
            ', ',
            GeneralUtility::trimExplode(',', $config['allowedExtensions'], true)
        );
        return $config;
    }

    protected function getWizardUri(): string
    {
        return (string)$this->uriBuilder->buildUriFromRoute($this->wizardRouteName);
    }

    protected function getWizardPayload(array $parameterArray): array
    {
        $uriArguments = [
            'P' => [
                'tableName' => $this->data['tableName'],
                'uid' => $this->data['databaseRow']['uid'],
                'pid' => $this->data['databaseRow']['pid'],
                'fieldName' => $this->data['fieldName'],
                'formName' => 'editform',
                'itemName' => $parameterArray['itemFormElName'],
                'hmac' => GeneralUtility::hmac('editform' . $parameterArray['itemFormElName'], 'wizard_js'),
                'fieldChangeFunc' => $parameterArray['fieldChangeFunc'],
                'fieldChangeFuncHash' => GeneralUtility::hmac(serialize($parameterArray['fieldChangeFunc'])),
            ],
        ];

        return $uriArguments;
    }

    protected function getExistingAreas(): string
    {
        return $this->data['databaseRow'][$this->data['fieldName']];
    }
}
