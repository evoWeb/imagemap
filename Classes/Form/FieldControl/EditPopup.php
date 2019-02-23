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

class EditPopup extends \TYPO3\CMS\Backend\Form\AbstractNode
{
    /**
     * Edit popup control
     *
     * @return array As defined by FieldControl class
     */
    public function render(): array
    {
        $options = $this->data['renderData']['fieldControlOptions'];

        $title = $options['title'] ?? 'LLL:EXT:core/Resources/Private/Language/locallang_core.xlf:labels.edit';

        $parameterArray = $this->data['parameterArray'];
        $itemName = $parameterArray['itemFormElName'];
        $windowOpenParameters = $options['windowOpenParameters'] ??
            'height=800,width=600,status=0,menubar=0,scrollbars=1';

        $urlParameters = [
            'P' => [
                'tableName' => $this->data['tableName'],
                'fieldName' => $this->data['fieldName'],
                'uid' => $this->data['databaseRow']['uid'],
                'pid' => $this->data['databaseRow']['pid'],
                'formName' => 'editform',
                'itemName' => $itemName,
                'hmac' => GeneralUtility::hmac('editform' . $itemName, 'wizard_js'),
                'fieldChangeFunc' => $parameterArray['fieldChangeFunc'],
                'fieldChangeFuncHash' => GeneralUtility::hmac(serialize($parameterArray['fieldChangeFunc'])),
            ],
        ];
        /** @var \TYPO3\CMS\Backend\Routing\UriBuilder $uriBuilder */
        $uriBuilder = GeneralUtility::makeInstance(\TYPO3\CMS\Backend\Routing\UriBuilder::class);
        $url = (string)$uriBuilder->buildUriFromRoute('imagemap_wizard', $urlParameters);
        $onClick = [];
        $onClick[] = 'this.blur();';
        $onClick[] = 'vHWin=window.open(';
        $onClick[] =    GeneralUtility::quoteJSvalue($url);
        $onClick[] =    '+\'&P[currentValue]=\'+TBE_EDITOR.rawurlencode(';
        $onClick[] =        'document.editform[' . GeneralUtility::quoteJSvalue($itemName) . '].value';
        $onClick[] =    ')';
        $onClick[] =    '+\'&P[currentSelectedValues]=\'+TBE_EDITOR.curSelected(';
        $onClick[] =        GeneralUtility::quoteJSvalue($itemName);
        $onClick[] =    '),';
        $onClick[] =    '\'\',';
        $onClick[] =    GeneralUtility::quoteJSvalue($windowOpenParameters);
        $onClick[] = ');';
        $onClick[] = 'vHWin.focus();';
        $onClick[] = 'return false;';

        return [
            'iconIdentifier' => 'actions-open',
            'title' => $title,
            'linkAttributes' => [
                'onClick' => implode('', $onClick),
            ],
        ];
    }
}
