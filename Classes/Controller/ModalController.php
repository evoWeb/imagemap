<?php
declare(strict_types = 1);

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

namespace Evoweb\Imagemap\Controller;

use Evoweb\Imagemap\Domain\Model\Data;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
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
            /** @var Data $data */
            $data = GeneralUtility::makeInstance(
                Data::class,
                $parameters['tableName'],
                $parameters['fieldName'],
                $parameters['uid'],
                $this->getBackendUser()->getSessionData('imagemap.value')
            );
            $formName = 'imagemap' . GeneralUtility::shortMD5(rand(1, 100000));
            $this->templateView
                ->assign('parameters', $parameters)
                ->assign('configuration', \json_encode($this->getConfiguration($parameters, $data, $formName)))
                ->assign('data', $data)
                ->assign('scaleFactor', $data->getEnvironment()->getExtConfValue('imageMaxWH', 800) / 1000)
                ->assign('formName', $formName);
        } catch (\Exception $exception) {
        }

        $response = new Response;
        $a = $this->templateView->render();
        $response->getBody()->write($a);

        return $response;
    }

    protected function getConfiguration(array $parameters, Data $data, string $formName): array
    {
        $browseLinkConfiguration = [
            'returnUrl' => GeneralUtility::linkThisScript(),
            'formName' => $formName,
            'tableName' => $parameters['tableName'],
            'fieldName' => $parameters['fieldName'],
            'pid' => $data->getRow()['pid'],
        ];

        return [
            'formName' => $formName,
            'itemName' => $parameters['itemName'],
            'fieldChangeFunc' => $parameters['fieldChangeFunc'] ?? [],
            'existingAreas' => $data->getMap(),
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
