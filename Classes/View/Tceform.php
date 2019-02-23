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

use TYPO3\CMS\Core\Utility\GeneralUtility;

class Tceform
{
    /**
     * @var \TYPO3\CMS\Backend\Template\DocumentTemplate
     */
    protected $doc;

    /**
     * @var array
     */
    protected $jsFiles = [];

    /**
     * @var array
     */
    protected $cssFiles = [];

    /**
     * @var string
     */
    protected $inlineJs = '';

    /**
     * @var \Evoweb\Imagemap\Domain\Model\Data
     */
    protected $data;

    /**
     * @var string
     */
    protected $id = '';

    /**
     * Just initialize the View
     * fill internal variables etc...
     */
    public function init()
    {
        $this->getLanguageService()->includeLLFile('EXT:imagemap/Resources/Private/Language/locallang.xlf');
        $this->id = 'imagemap' . GeneralUtility::shortMD5(rand(1, 100000));
    }

    /**
     * Sets the relates Data-Model-Object
     *
     * @param \Evoweb\Imagemap\Domain\Model\Data Data-Object
     */
    public function setData(\Evoweb\Imagemap\Domain\Model\Data $data)
    {
        $this->data = $data;
    }

    /**
     * Returns an instance of LanguageService
     *
     * @return \TYPO3\CMS\Core\Localization\LanguageService
     */
    private function getLanguageService()
    {
        return $GLOBALS['LANG'];
    }

    /**
     * @var \TYPO3\CMS\Backend\Form\NodeFactory
     */
    protected $form;

    /**
     * @var string
     */
    protected $formName;

    /**
     * @var array
     */
    protected $wizardConf;

    /**
     * @param \TYPO3\CMS\Backend\Form\NodeFactory $form
     */
    public function setTCEForm($form)
    {
        $this->form = $form;
    }

    /**
     * @param string $name
     */
    public function setFormName($name)
    {
        $this->formName = $name;
    }

    /**
     * @param array $wizardConf
     */
    public function setWizardConf($wizardConf)
    {
        $this->wizardConf = $wizardConf;
    }

    /**
     * Renders Content and prints it to the screen (or any active output buffer)
     *
     * @return string the rendered form content
     */
    public function renderContent()
    {
        if (!$this->data->hasValidImageFile()) {
            $content = $GLOBALS['LANG']->sL('LLL:EXT:imagemap/Resources/Private/Language/locallang.xlf:form.no_image');
        } else {
            $content = 'output of tceform.php here';
        }
        return $content;
    }
}
