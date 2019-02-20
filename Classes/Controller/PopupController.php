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

use Evoweb\Imagemap\Domain\Model\DataObject;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Core\Http\Response;
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
        $pageRenderer->addCssFile('EXT:imagemap/Resources/Public/Stylesheets/imagemap.css');
    }

    /**
     * Default action just renders the Wizard with the default view.
     *
     * @param ServerRequestInterface $request
     *
     * @return ResponseInterface
     */
    public function mainAction(ServerRequestInterface $request): ResponseInterface
    {
        $parameters = $request->getQueryParams()['P'];

        if (isset($parameters['fieldChangeFunc']) && is_array($parameters['fieldChangeFunc'])) {
            unset($parameters['fieldChangeFunc']['alert']);
        }

        try {
            /** @var DataObject $data */
            $data = GeneralUtility::makeInstance(
                DataObject::class,
                $parameters['tableName'],
                $parameters['fieldName'],
                $parameters['uid'],
                $this->getBackendUser()->getSessionData('imagemap.value')
            );
            $this->moduleTemplate->getView()
                ->assign('parameters', $parameters)
                ->assign('data', $data)
                ->assign('scaleFactor', $data->getEnvironment()->getExtConfValue('imageMaxWH', 800))
                ->assign('formName', 'imagemap' . GeneralUtility::shortMD5(rand(1, 100000)))
                ->assign('returnUrl', GeneralUtility::linkThisScript());
        } catch (\Exception $e) {
        }

        $title = $this->getLanguageService()->getLL('imagemap.title');
        $this->moduleTemplate->setTitle($title)->header($title);

        $response = new Response;
        $response->getBody()->write($this->moduleTemplate->renderContent());

        return $response;
    }

    /**
     * Returns an instance of Backend User Authentication
     *
     * @return \TYPO3\CMS\Core\Authentication\BackendUserAuthentication|null
     */
    protected function getBackendUser()
    {
        return $GLOBALS['BE_USER'] ?? null;
    }

    /**
     * Returns an instance of LanguageService
     *
     * @return \TYPO3\CMS\Core\Localization\LanguageService|null
     */
    protected function getLanguageService()
    {
        return $GLOBALS['LANG'] ?? null;
    }
}
