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

use TYPO3\CMS\Core\Utility\GeneralUtility;

class PopupController
{
    /**
     * ModuleTemplate object
     *
     * @var \TYPO3\CMS\Backend\Template\ModuleTemplate
     */
    protected $moduleTemplate;

    /**
     * @var \TYPO3\CMS\Backend\View\BackendTemplateView
     */
    protected $view;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->getLanguageService()->includeLLFile('EXT:imagemap/Resources/Private/Language/locallang.xlf');

        $this->moduleTemplate = GeneralUtility::makeInstance(\TYPO3\CMS\Backend\Template\ModuleTemplate::class);

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

        $pageRenderer = $this->moduleTemplate->getPageRenderer();
        $pageRenderer->loadRequireJsModule('TYPO3/CMS/Imagemap/Wizard');
        $pageRenderer->addJsFile('EXT:core/Resources/Public/JavaScript/Contrib/jquery/jquery.min.js');
        $pageRenderer->addJsFile('EXT:imagemap/Resources/Public/JavaScript/jquery.base64.js');
        $pageRenderer->addJsFile('EXT:imagemap/Resources/Public/JavaScript/wizard.all.js.ycomp.js');
        $pageRenderer->addCssFile('EXT:imagemap/Resources/Public/Stylesheets/imagemap.css');
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

        try {
            $data = GeneralUtility::makeInstance(
                \Evoweb\Imagemap\Domain\Model\DataObject::class,
                $parameters['table'],
                $parameters['field'],
                $parameters['uid'],
                $GLOBALS['BE_USER']->getSessionData('imagemap.value')
            );
            $this->view->assign('data', $data);
            $this->view->assign('scaleFactor', $data->getEnvironment()->getExtConfValue('imageMaxWH', 700));
            $this->view->assign('formName', 'imagemap' . GeneralUtility::shortMD5(rand(1, 100000)));
            $this->view->assign('returnUrl', GeneralUtility::linkThisScript());
        } catch (\Exception $e) {
        }

        // Setting field-change functions:
        $fieldChangeFunctions = '';
        if (isset($parameters['fieldChangeFunc']) && is_array($parameters['fieldChangeFunc'])) {
            unset($parameters['fieldChangeFunc']['alert']);
            foreach ($parameters['fieldChangeFunc'] as $fieldChangeFunction) {
                $fieldChangeFunctions .= 'parent.opener.' . $fieldChangeFunction;
            }
        }

        $this->moduleTemplate->addJavaScriptCode(
            'popup_checkreference',
            '
            var formName = \'' . $parameters['formName'] . '\',
                fieldName = \'' . $parameters['itemName'] . '\';

            function getParentField() {
                if (parent.opener 
                    && parent.opener.document 
                    && parent.opener.document[formName]
                    && parent.opener.document[formName][fieldName]) {
                    return parent.opener.document[formName][fieldName];
                } else {
                    close();
                }
            }

            function setValue(input) {
                var field = getParentField();
                if (field) {
                    field.value = input;
                    ' . $fieldChangeFunctions . '
                }
            }

            function getValue() {
                var field = getParentField();
                return field.value;
            }
            '
        );

        $this->moduleTemplate
            ->setTitle($this->getLanguageService()->getLL('imagemap.title'))
            ->header($this->getLanguageService()->getLL('imagemap.title'));

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
