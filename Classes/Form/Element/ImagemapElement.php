<?php

declare(strict_types=1);

namespace Evoweb\Imagemap\Form\Element;

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

use TYPO3\CMS\Backend\Form\Element\AbstractFormElement;
use TYPO3\CMS\Backend\Form\NodeFactory;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Resource\File;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\MathUtility;
use TYPO3\CMS\Core\Utility\StringUtility;
use TYPO3\CMS\Extbase\Utility\LocalizationUtility;
use TYPO3\CMS\Fluid\View\StandaloneView;

class ImagemapElement extends AbstractFormElement
{
    private string $wizardRouteName = 'ajax_wizard_imagemap_manipulation';

    /**
     * Default element configuration
     *
     * @var array
     */
    public static array $defaultConfig = [
        'tableName' => 'tt_content',
        'fieldName' => 'image',
        // default: $GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext']
        'allowedExtensions' => null,
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

    /**
     * @var object|\Psr\Log\LoggerAwareInterface|ResourceFactory
     */
    protected $resourceFactory;

    /**
     * @param NodeFactory $nodeFactory
     * @param array $data
     */
    public function __construct(NodeFactory $nodeFactory, array $data)
    {
        parent::__construct($nodeFactory, $data);
        // Would be great, if we could inject the view here, but since the constructor is in the interface, we can't
        $this->templateView = GeneralUtility::makeInstance(StandaloneView::class);
        $this->templateView->setLayoutRootPaths(['EXT:imagemap/Resources/Private/Layouts/']);
        $this->templateView->setPartialRootPaths(['EXT:imagemap/Resources/Private/Partials/']);
        $this->templateView->setTemplatePathAndFilename(
            'EXT:imagemap/Resources/Private/Templates/FormEngine/ImagemapElement.html'
        );
        $this->uriBuilder = GeneralUtility::makeInstance(UriBuilder::class);
        $this->resourceFactory = GeneralUtility::makeInstance(ResourceFactory::class);
    }

    public function render(): array
    {
        $resultArray = $this->initializeResultArray();
        $parameterArray = $this->data['parameterArray'];
        $config = $this->populateConfiguration($parameterArray['fieldConf']['config']);

        $elementValue = $parameterArray['itemFormElValue'];
        $file = $this->getFile($this->data['databaseRow'], $config['fieldName']);
        if (!$file) {
            // Early return in case we do not find a file
            $resultArray['html'] = '<br>' . LocalizationUtility::translate('imagemap.element.no_image', 'imagemap');
            return $resultArray;
        }

        $config = $this->processConfiguration($config);

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
                    'value' => $parameterArray['itemFormElValue'],
                    'name' => $parameterArray['itemFormElName'],
                    'tableName' => $this->data['tableName'],
                    'fieldName' => $this->data['fieldName'],
                    'uid' => $this->data['databaseRow']['uid'],
                    'pid' => $this->data['databaseRow']['pid'],
                    'mapAreas' => empty($elementValue) ? [] : json_decode($elementValue, true),
                ],
                'validation' => '[]'
            ],
            'config' => $config,
            'wizardUri' => $this->getWizardUri(),
            'wizardPayload' => \json_encode($this->getWizardPayload($file)),
        ];

        if ($arguments['isAllowedFileExtension']) {
            $fieldId = StringUtility::getUniqueId('imagemap-area-manipulation-');
            $resultArray['requireJsModules'][] = [
                'TYPO3/CMS/Imagemap/EditControl' =>
                    'function (ec) { window.iec = new ec("#' . $fieldId . '"); }',
            ];
            $resultArray['requireJsModules'][] = [
                'TYPO3/CMS/Imagemap/FormElement' =>
                    'function (fe) { window.ife = new fe("#' . $fieldId . '"); }',
            ];
            $arguments['formEngine']['field']['id'] = $fieldId;
            if (GeneralUtility::inList($config['eval'], 'required')) {
                $arguments['formEngine']['validation'] = $this->getValidationDataAsJsonString(['required' => true]);
            }
        }
        $this->templateView->assignMultiple($arguments);
        $resultArray['html'] = $this->templateView->render();

        return $resultArray;
    }

    /**
     * Get file object
     *
     * @param array $row
     * @param string $fieldName
     *
     * @return File|null
     */
    protected function getFile(array $row, string $fieldName): ?File
    {
        $file = null;
        $fileUid = !empty($row[$fieldName]) ? $row[$fieldName] : null;
        if (is_array($fileUid) && isset($fileUid[0]['uid'])) {
            $fileUid = $fileUid[0]['uid'];
        }
        if (MathUtility::canBeInterpretedAsInteger($fileUid)) {
            try {
                $fileReference = $this->resourceFactory->getFileReferenceObject($fileUid);
                $file = $fileReference ? $fileReference->getOriginalFile() : null;
                $file->updateProperties(['crop' => $fileReference->getProperty('crop')]);
            } catch (\InvalidArgumentException $e) {
            }
        }
        return $file;
    }

    /**
     * @param array $baseConfiguration
     *
     * @return array
     */
    protected function populateConfiguration(array $baseConfiguration): array
    {
        $defaultConfig = self::$defaultConfig;

        $config = array_replace_recursive($defaultConfig, $baseConfiguration);

        // By default we allow all image extensions that can be handled by the GFX functionality
        if ($config['allowedExtensions'] === null) {
            $config['allowedExtensions'] = $GLOBALS['TYPO3_CONF_VARS']['GFX']['imagefile_ext'];
        }
        return $config;
    }

    /**
     * @param array $config
     *
     * @return array
     */
    protected function processConfiguration(array $config): array
    {
        $config['allowedExtensions'] = implode(
            ', ',
            GeneralUtility::trimExplode(',', $config['allowedExtensions'], true)
        );
        return $config;
    }

    /**
     * @return string
     */
    protected function getWizardUri(): string
    {
        return (string)$this->uriBuilder->buildUriFromRoute($this->wizardRouteName);
    }

    /**
     * @param File $image
     *
     * @return array
     */
    protected function getWizardPayload(File $image): array
    {
        $arguments = [
            'image' => $image->getUid(),

            'tableName' => $this->data['tableName'],
            'fieldName' => $this->data['fieldName'],
            'uid' => $this->data['databaseRow']['uid'],
        ];

        return [
            'arguments' => json_encode($arguments),
            'signature' => GeneralUtility::hmac(json_encode($arguments), $this->wizardRouteName)
        ];
    }
}
