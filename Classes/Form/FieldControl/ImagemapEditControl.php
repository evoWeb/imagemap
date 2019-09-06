<?php
declare(strict_types = 1);
namespace Evoweb\Imagemap\Form\FieldControl;

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

use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class ImagemapEditControl extends \TYPO3\CMS\Backend\Form\AbstractNode
{
    /**
     * @var string
     */
    protected $wizardRouteName = 'imagemap_modal';

    /**
     * @var \TYPO3\CMS\Fluid\View\StandaloneView
     */
    protected $templateView;

    /**
     * @var \TYPO3\CMS\Backend\Routing\UriBuilder
     */
    protected $uriBuilder;

    public function __construct(\TYPO3\CMS\Backend\Form\NodeFactory $nodeFactory, array $data)
    {
        parent::__construct($nodeFactory, $data);

        $this->uriBuilder = GeneralUtility::makeInstance(\TYPO3\CMS\Backend\Routing\UriBuilder::class);
    }

    /**
     * Edit area modal control
     *
     * @return array As defined by FieldControl class
     */
    public function render(): array
    {
        $options = $this->data['renderData']['fieldControl']['editControl']['options'];

        $languagePath = 'LLL:EXT:imagemap/Resources/Private/Language/locallang.xlf:';
        $languageService = $this->getLanguageService();

        $title = $options['title'] ?? $languagePath . 'imagemap.control.open.editor';

        $parameterArray = $this->data['parameterArray'];

        $urlParameters = [
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

        /** @var \TYPO3\CMS\Backend\Routing\UriBuilder $uriBuilder */
        $uriBuilder = GeneralUtility::makeInstance(\TYPO3\CMS\Backend\Routing\UriBuilder::class);
        $url = (string)$uriBuilder->buildUriFromRoute('imagemap_modal', $urlParameters);

        return [
            'iconIdentifier' => 'extensions-imagemap-poly',
            'title' => $title,
            'linkAttributes' => [
                'id' => \TYPO3\CMS\Core\Utility\StringUtility::getUniqueId('formengine-image-manipulation-'),
                'data-url' => $url,
                'data-payload' => \json_encode($this->getWizardPayload($this->data['parameterArray'])),
                'data-severity' => 'notice',
                'data-modal-title' => 'Area Editor',
                'data-button-addrect-text' => $languageService->sL($languagePath . 'imagemap.form.addrect'),
                'data-button-addcircle-text' => $languageService->sL($languagePath . 'imagemap.form.addcircle'),
                'data-button-addpoly-text' => $languageService->sL($languagePath . 'imagemap.form.addpoly'),
                'data-button-dismiss-text' => $languageService->sL($languagePath . 'imagemap.form.dismiss'),
                'data-button-save-text' => $languageService->sL($languagePath . 'imagemap.form.save'),
                'data-image-uid' => $this->data['databaseRow']['image'],
            ],
            'requireJsModules' => [
                ['TYPO3/CMS/Imagemap/EditControl' => 'function (EditControl) { new EditControl(); }']
            ]
        ];
    }

    protected function getWizardPayload(array $parameterArray): array
    {
        $uriArguments = [
            'P' => [
                'tableName' => $this->data['tableName'],
                'fieldName' => $this->data['fieldName'],
                'uid' => $this->data['databaseRow']['uid'],
                'pid' => $this->data['databaseRow']['pid'],
                'formName' => 'editform',
                'itemName' => $parameterArray['itemFormElName'],
                'hmac' => GeneralUtility::hmac('editform' . $parameterArray['itemFormElName'], 'wizard_js'),
                'fieldChangeFunc' => $parameterArray['fieldChangeFunc'],
                'fieldChangeFuncHash' => GeneralUtility::hmac(serialize($parameterArray['fieldChangeFunc'])),
            ],
        ];

        return $uriArguments;
    }

    /**
     * Returns an instance of LanguageService
     *
     * @return LanguageService
     */
    protected function getLanguageService()
    {
        return $GLOBALS['LANG'];
    }
}
