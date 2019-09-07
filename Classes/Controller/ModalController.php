<?php
declare(strict_types = 1);
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

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Http\Response;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\View\StandaloneView;

class ModalController
{
    /**
     * @var \TYPO3\CMS\Backend\View\BackendTemplateView
     */
    protected $templateView;

    public function __construct(StandaloneView $templateView = null)
    {
        $this->getLanguageService()->includeLLFile('EXT:imagemap/Resources/Private/Language/locallang.xlf');

        if (!$templateView) {
            $templateView = GeneralUtility::makeInstance(StandaloneView::class);
            $templateView->setTemplate('FormEngine/Modal');
            $templateView->setTemplateRootPaths(['EXT:imagemap/Resources/Private/Templates/']);
        }
        $this->templateView = $templateView;
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
        $parameters = $request->getParsedBody()['P'];

        if (isset($parameters['fieldChangeFunc']) && is_array($parameters['fieldChangeFunc'])) {
            unset($parameters['fieldChangeFunc']['alert']);
        }

        try {
            $record = BackendUtility::getRecord($parameters['tableName'], $parameters['uid']);
            $map = $record[$parameters['fieldName']];
            $maxWidth = $GLOBALS['TYPO3_CONF_VARS']['EXTENSIONS']['imagemap']['imageMaxWH'] ?? 800;

            $formName = 'imagemap' . GeneralUtility::shortMD5(rand(1, 100000));
            $this->templateView
                ->assign('parameters', $parameters)
                ->assign('configuration', \json_encode($this->getConfiguration($parameters, $record, $formName, $map)))
                ->assign('data', $map)
                ->assign('scaleFactor', $maxWidth / 1000)
                ->assign('formName', $formName);
        } catch (\Exception $exception) {
        }

        $response = new Response;
        $a = $this->templateView->render();
        $response->getBody()->write($a);

        return $response;
    }

    protected function getConfiguration(
        array $parameters,
        array $record,
        string $formName,
        string $map
    ): array {
        $browseLinkConfiguration = [
            'returnUrl' => GeneralUtility::linkThisScript(),
            'formName' => $formName,
            'tableName' => $parameters['tableName'],
            'fieldName' => $parameters['fieldName'],
            'pid' => $record['pid'],
        ];

        return [
            'formName' => $formName,
            'itemName' => $parameters['itemName'],
            'fieldChangeFunc' => $parameters['fieldChangeFunc'] ?? [],
            'existingAreas' => $map,
            'browseLink' => $browseLinkConfiguration
        ];
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
