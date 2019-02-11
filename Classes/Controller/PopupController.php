<?php
namespace Evoweb\Imagemap\Controller;

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

use TYPO3\CMS\Backend\Template\ModuleTemplate;
use TYPO3\CMS\Backend\View\BackendTemplateView;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class PopupController
{
    /**
     * Page Id for which to make the listing
     *
     * @var int
     */
    protected $id;

    /**
     * ModuleTemplate object
     *
     * @var ModuleTemplate
     */
    protected $moduleTemplate;

    /**
     * @var BackendTemplateView
     */
    protected $view;

    /**
     * @var \Evoweb\Imagemap\Domain\Model\DataObject
     */
    protected $data;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->moduleTemplate = GeneralUtility::makeInstance(ModuleTemplate::class);
        $this->view = $this->moduleTemplate->getView();
        $this->view->setTemplate('Popup/Module');
        $this->view->setTemplateRootPaths(array_merge(
            $this->view->getTemplateRootPaths(),
            ['EXT:imagemap/Resources/Private/Templates/']
        ));
        $this->view->setPartialRootPaths(array_merge(
            $this->view->getPartialRootPaths(),
            ['EXT:imagemap/Resources/Private/Partials/']
        ));

        $this->getLanguageService()->includeLLFile('EXT:imagemap/Resources/Private/Language/locallang.xlf');
        $this->moduleTemplate->getPageRenderer()->loadRequireJsModule('jquery-ui/sortable');
        $this->moduleTemplate->getPageRenderer()->loadRequireJsModule('jquery-ui/draggable');
        $this->moduleTemplate->getPageRenderer()->addJsFile(
            'EXT:core/Resources/Public/JavaScript/Contrib/jquery/jquery.min.js'
        );
        $this->moduleTemplate->getPageRenderer()->addJsFile(
            'EXT:imagemap/Resources/Public/JavaScript/jquery.base64.js'
        );
        $this->moduleTemplate->getPageRenderer()->addJsFile(
            'EXT:imagemap/Resources/Public/JavaScript/wizard.all.js.ycomp.js'
        );
        $this->moduleTemplate->getPageRenderer()->addCssFile('EXT:imagemap/Resources/Public/Stylesheets/imagemap.css');
        $this->id = 'imagemap' . GeneralUtility::shortMD5(rand(1, 100000));
    }

    /**
     * Default action just renders the Wizard with the default view.
     *
     * @param \TYPO3\CMS\Core\Http\ServerRequest $request
     * @param \TYPO3\CMS\Core\Http\Response $response
     *
     * @return \TYPO3\CMS\Core\Http\Response
     */
    public function mainAction(
        \TYPO3\CMS\Core\Http\ServerRequest $request,
        \TYPO3\CMS\Core\Http\Response $response
    ) {
        $parameters = $request->getQueryParams()['P'];
        $currentValue = $GLOBALS['BE_USER']->getSessionData('imagemap.value');

        try {
            $this->data = GeneralUtility::makeInstance(
                \Evoweb\Imagemap\Domain\Model\DataObject::class,
                $parameters['table'],
                $parameters['field'],
                $parameters['uid'],
                $currentValue
            );
            $this->view->assign('data', $this->data);

            $existingFields = $this->data->listAreas(
                "\tcanvasObject.addArea(new area##shape##Class(), '##coords##', '##alt##',"
                . " '##link##', '##color##', 0, {##attributes##});"
            );
            $this->view->assign('existingFields', $existingFields);

            $scaleFactor = GeneralUtility::makeInstance(\Evoweb\Imagemap\Domain\Model\Typo3Env::class)
                ->getExtConfValue('imageMaxWH', 700);
            $this->view->assign('scaleFactor', $scaleFactor);

            $this->view->assign('emptyAttributeSet', $this->data->emptyAttributeSet());
            $this->view->assign('image', $this->data->renderImage());
            $this->view->assign('attributeKeys', $this->data->getAttributeKeys());
            $this->view->assign('formName', $this->id);
            $this->view->assign('returnUrl', GeneralUtility::linkThisScript());
        } catch (\Exception $e) {
        }

        // Setting field-change functions:
        $fieldChangeFuncArr = $parameters['fieldChangeFunc'];
        $update = '';
        if (is_array($fieldChangeFuncArr)) {
            unset($fieldChangeFuncArr['alert']);
            foreach ($fieldChangeFuncArr as $v) {
                $update .= 'parent.opener.' . $v;
            }
        }

        $this->moduleTemplate->addJavaScriptCode(
            'popup_checkreference',
            '
            function checkReference() {
                if (parent.opener && parent.opener.document && parent.opener.document.'
            . $parameters['formName'] . ' && parent.opener.document.'
            . $parameters['formName'] . '["' . $parameters['itemName'] . '"]) {
                    return parent.opener.document.'
            . $parameters['formName'] . '["' . $parameters['itemName'] . '"];
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
            '
        );

        $this->moduleTemplate->header($this->getLanguageService()->getLL('imagemap.title'));
        $this->moduleTemplate->setTitle($this->getLanguageService()->getLL('imagemap.title'));

        $response->getBody()->write($this->moduleTemplate->renderContent());
        return $response;
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
