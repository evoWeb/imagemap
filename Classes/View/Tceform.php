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

class Tceform extends AbstractView
{
    protected $form;
    protected $formName;
    protected $wizardConf;

    public function setTCEForm($form)
    {
        $this->form = $form;
    }

    /**
     * Renders Content and prints it to the screen (or any active output buffer)
     *
     * @return string     the rendered form content
     */
    public function renderContent()
    {
        if (!$this->data->hasValidImageFile()) {
            $content = $GLOBALS['LANG']->sL('LLL:EXT:imagemap/Resources/Private/Language/locallang.xlf:form.no_image');
        } else {
            $content = $this->renderTemplate('tceform.php');
            $this->form->additionalCode_pre[] = $this->getExternalJSIncludes();
            $this->form->additionalCode_pre[] = $this->getInlineJSIncludes();
        }
        return $content;
    }

    public function setWizardConf($wConf)
    {
        $this->wizardConf = $wConf;
    }

    public function setFormName($name)
    {
        $this->formName = $name;
    }
}
