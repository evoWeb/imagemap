<?php
namespace Evoweb\Imagemap\View;

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

class Wizard extends AbstractView
{
    /**
     * @var array
     */
    protected $params = [];

    /**
     * @var string
     */
    protected $content = '';

    /**
     * Just initialize the View
     * fill internal variables etc...
     */
    public function init()
    {
        parent::init();
        $this->doc = GeneralUtility::makeInstance(\TYPO3\CMS\Backend\Template\DocumentTemplate::class);
        $this->doc->backPath = $GLOBALS['BACK_PATH'];
        $this->doc->docType = 'xhtml_trans';
        $this->doc->form = $this->getFormTag();
    }

    /**
     * Renders Content and prints it to the screen (or any active output buffer)
     */
    public function renderContent()
    {
        /** @var PageRenderer $pageRenderer */
        $pageRenderer = GeneralUtility::makeInstance(PageRenderer::class);
        $pageRenderer->loadRequireJsModule('jquery-ui/sortable');
        $pageRenderer->loadRequireJsModule('jquery-ui/draggable');
        $pageRenderer->addJsFile('EXT:core/Resources/Public/JavaScript/Contrib/jquery/jquery.min.js');
        $pageRenderer->addJsFile('EXT:imagemap/Resources/Public/JavaScript/jquery.base64.js');
        $pageRenderer->addJsFile('EXT:imagemap/Resources/Public/JavaScript/wizard.all.js.ycomp.js');
        $pageRenderer->addCssFile('EXT:imagemap/Resources/Public/Stylesheets/imagemap.css');

        $this->params = GeneralUtility::_GP('P');
        // Setting field-change functions:
        $fieldChangeFuncArr = $this->params['fieldChangeFunc'];
        $update = '';
        if (is_array($fieldChangeFuncArr)) {
            unset($fieldChangeFuncArr['alert']);
            foreach ($fieldChangeFuncArr as $v) {
                $update .= 'parent.opener.' . $v;
            }
        }

        $this->doc->JScode .= GeneralUtility::wrapJS('
            function checkReference() {
                if (parent.opener && parent.opener.document && parent.opener.document.'
            . $this->params['formName'] . ' && parent.opener.document.'
            . $this->params['formName'] . '["' . $this->params['itemName'] . '"]) {
                    return parent.opener.document.'
            . $this->params['formName'] . '["' . $this->params['itemName'] . '"];
                } else {
                    close();
                }
            }
              
            function setValue(input) {
                var field = checkReference();
                if (field) {
                    field.value = input;
                    ' . $update . '
                }
            }
              
            function getValue() {
                var field = checkReference();
                return field.value;
            }
        ');

        $this->content .= $this->doc->startPage($this->getLanguageService()->getLL('imagemap.title'));
        $this->content .=  '<h2 class="uppercase">' . $this->getLanguageService()->getLL('imagemap.title') . '</h2>'
            . $this->renderTemplate('wizard.php');
        $this->content .= $this->doc->endPage();
        $this->content = $this->insertMyStylesAndJs($this->content);

        echo $this->doc->insertStylesAndJS($this->content);
    }

    /**
     * Inserts the collected Resource-References to the Header
     *
     * @param string Content
     *
     * @return string
     */
    protected function insertMyStylesAndJs($content)
    {
        $content = str_replace(
            '<!--###POSTJSMARKER###-->',
            $this->getExternalJSIncludes() . '<!--###POSTJSMARKER###-->',
            $content
        );
        $content = str_replace(
            '<!--###POSTJSMARKER###-->',
            $this->getInlineJSIncludes() . '<!--###POSTJSMARKER###-->',
            $content
        );
        $content = str_replace(
            '<!--###POSTJSMARKER###-->',
            $this->getExternalCSSIncludes() . '<!--###POSTJSMARKER###-->',
            $content
        );
        return $content;
    }

    /**
     * Create a Wizard-Icon for the Link-Wizard
     *
     * @param string linkId ID for the id-attribute of the generated Link
     * @param string fieldName Name of the edited field
     * @param string fieldValue current value of the field (mostly a placeholder is used)
     * @param string updateCallback the Javascript-Callback in case of successful change
     *
     * @return string Generated HTML-link to the Link-Wizard
     */
    protected function linkWizardIcon($linkId, $fieldName, $fieldValue, $updateCallback = '')
    {
        $params = [
            'mode' => 'wizard',
            'field' => $fieldName,
            'P[returnUrl]' => GeneralUtility::linkThisScript(),
            'P[formName]' => $this->id,
            'P[itemName]' => $fieldName,
            'P[fieldChangeFunc][focus]' => 'focus()',
            'P[currentValue]' => $fieldValue,
            'P[pid]' => $this->params['pid'],
        ];

        if ($updateCallback) {
            $params['P[fieldChangeFunc][callback]'] = $updateCallback;
        }

        $link = GeneralUtility::linkThisUrl($this->doc->backPath . 'browse_links.php', $params);
        return '<a href="#" id="' . $linkId . '" onclick="this.blur(); vHWin=window.open(\''
            . $link . '\',\'\',\'height=600,width=500,status=0,menubar=0,scrollbars=1\');vHWin.focus();return false;">'
            . $this->getIcon(
                'extensions-imagemap-link',
                'alt="' . $this->getLL('imagemap.form.area.linkwizard')
                . '" title="' . $this->getLL('imagemap.form.area.linkwizard') . '"'
            ) . '</a>';
    }

    /**
     * Create a valid and unique form-tag
     *
     * @return string the HTML-form-tag
     */
    protected function getFormTag()
    {
        return '<form id="' . $this->getId() . '" name="' . $this->getId() . '">';
    }

    public function renderAttributesTemplate($inp)
    {
        $attrKeys = $this->data->getAttributeKeys();
        $ret = '';
        if (is_array($attrKeys)) {
            foreach ($attrKeys as $key) {
                $ret .= str_replace(
                    ['ATTRLABEL', 'ATTRNAME'],
                    [ucfirst($key), strtolower($key)],
                    $inp
                );
            }
        }
        return $ret;
    }

    public function getEmptyAttributeSet()
    {
        $attrKeys = $this->data->getAttributeKeys();
        $ret = [];
        foreach ($attrKeys as $key) {
            $ret[] = $key . ':\'\'';
        }
        return implode(',', $ret);
    }
}
