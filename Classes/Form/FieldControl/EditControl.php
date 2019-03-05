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

use TYPO3\CMS\Core\Utility\GeneralUtility;

class EditControl extends \TYPO3\CMS\Backend\Form\Element\AbstractFormElement
{
    /**
     * @var string
     */
    protected $wizardRouteName = 'imagemap_wizard';

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

        $this->templateView = GeneralUtility::makeInstance(\TYPO3\CMS\Fluid\View\StandaloneView::class);
        $this->templateView->setTemplate('Imagemap/EditControl');
        $this->templateView->setTemplateRootPaths(array_merge(
            $this->templateView->getTemplateRootPaths(),
            ['EXT:imagemap/Resources/Private/Templates/']
        ));
        $this->templateView->setPartialRootPaths(array_merge(
            $this->templateView->getPartialRootPaths(),
            ['EXT:imagemap/Resources/Private/Partials/']
        ));

        $this->uriBuilder = GeneralUtility::makeInstance(\TYPO3\CMS\Backend\Routing\UriBuilder::class);
    }

    /**
     * Edit area modal control
     *
     * @return array As defined by FieldControl class
     */
    public function render(): array
    {
        $resultArray = $this->initializeResultArray();
        $options = $this->data['renderData']['fieldControl']['editControl']['options'];

        $parameterArray = $this->data['parameterArray'];

        $arguments = [
            'formEngine' => [
                'field' => [
                    'value' => $parameterArray['itemFormElValue'],
                    'name' => $parameterArray['itemFormElName'],
                    'id' => \TYPO3\CMS\Core\Utility\StringUtility::getUniqueId('formengine-image-manipulation-')
                ],
                'validation' => '[]'
            ],
            'title' => $options['title'] ?? 'LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:labels.edit',
            'wizardUri' => $this->getWizardUri(),
            'wizardPayload' => json_encode($this->getWizardPayload($parameterArray)),
        ];

        $resultArray['requireJsModules'][] = [
            'TYPO3/CMS/Imagemap/EditControl' => 'function (EditControl) { new EditControl(); }'
        ];

        $this->templateView->assignMultiple($arguments);
        $resultArray['html'] = $this->templateView->render();

        return $resultArray;
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
}
