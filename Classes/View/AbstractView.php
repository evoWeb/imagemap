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

use TYPO3\CMS\Core\Imaging\IconFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;

abstract class AbstractView
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
     * @var \Evoweb\Imagemap\Domain\Model\DataObject
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

    public function getId(): string
    {
        return $this->id;
    }

    /**
     * Sets the relates Data-Model-Object
     *
     * @param \Evoweb\Imagemap\Domain\Model\DataObject Data-Object
     */
    public function setData(\Evoweb\Imagemap\Domain\Model\DataObject $data)
    {
        $this->data = $data;
    }

    /**
     * Collect required Javascript-Resoucres
     *
     * @param String Filename
     */
    protected function addExternalJS($file)
    {
        if (!in_array($file, $this->jsFiles)) {
            $this->jsFiles[] = $file;
        }
    }

    /**
     * Collect required Inline-Javascript.
     *
     * @param String Javascript-Block
     */
    protected function addInlineJS($js)
    {
        $this->inlineJs .= LF . LF . $js;
    }

    /**
     * Collect required CSS-Resoucres
     *
     * @param String Filename
     */
    protected function addExternalCSS($file)
    {
        if (!in_array($file, $this->cssFiles)) {
            $this->cssFiles[] = $file;
        }
    }

    protected function getExternalJSIncludes()
    {
        $extPath = \Evoweb\Imagemap\Domain\Model\Typo3Env::getExtBackPath('imagemap');
        $ret = '';
        if (is_array($this->jsFiles)) {
            foreach ($this->jsFiles as $file) {
                $ret .= LF . '<script type="text/javascript" src="' . $extPath . $file . '"></script>';
            }
        }
        return $ret;
    }

    protected function getInlineJSIncludes()
    {
        return trim($this->inlineJs) ? ('<script type="text/javascript">' . trim($this->inlineJs) . '</script>') : '';
    }

    protected function getExternalCSSIncludes()
    {
        $backPath = \Evoweb\Imagemap\Domain\Model\Typo3Env::getBackPath();
        $extPath = str_replace(PATH_site, '', \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath('imagemap'));
        $ret = '';
        if (is_array($this->cssFiles)) {
            foreach ($this->cssFiles as $file) {
                $ret .= LF . '<link rel="stylesheet" type="text/css" href="' . $backPath . $extPath . $file . '" />';
            }
        }
        return $ret;
    }

    protected function renderTemplate($file)
    {
        ob_start();
        include \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath(
            'imagemap',
            'Resources/Private/Templates/' . $file
        );
        $ret = ob_get_contents();
        ob_end_clean();
        return $ret;
    }

    protected function getAjaxURL($script)
    {
        return \Evoweb\Imagemap\Domain\Model\Typo3Env::getExtBackPath('imagemap') . $script;
    }

    protected function getLL($label, $printIt = false)
    {
        $value = $this->getLanguageService()->getLL($label);
        if ($printIt) {
            echo $value;
        }
        return $value;
    }

    /**
     * Create a img-tag with a TYPO3-Skinicon
     *
     * @param string $identifier of the TYPO3-icon
     * @param string attr additional required attributes
     *
     * @return string HTML-img-tag
     */
    protected function getIcon($identifier, $attr = '')
    {
        /** @var IconFactory $iconFactory */
        $iconFactory = GeneralUtility::makeInstance(IconFactory::class);
        $icon = $iconFactory->getIcon($identifier);
        $icon->setSize(\TYPO3\CMS\Core\Imaging\Icon::SIZE_SMALL);
        return '<span ' . $attr . '>' . $icon->render() . '</span>';
    }

    /**
     *   Determine path to the view-templates
     *   Just a shortcut to reduce the code within the view's
     *
     * @return string      relative path to the template folder
     */
    protected function getTemplateSubpath()
    {
        return \Evoweb\Imagemap\Domain\Model\Typo3Env::getExtBackPath('imagemap')
            . 'Resources/Private/Templates/';
    }

    /**
     * Returns an instance of LanguageService
     *
     * @return \TYPO3\CMS\Core\Localization\LanguageService
     */
    protected function getLanguageService()
    {
        return $GLOBALS['LANG'];
    }
}
