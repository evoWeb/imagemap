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

use Evoweb\Imagemap\Domain\Model\Data;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;
use TYPO3\CMS\Core\Http\Response;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\View\StandaloneView;

class WizardController
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
            $templateView->setTemplate('Imagemap/Wizard');
            $templateView->setTemplateRootPaths(
                array_merge(
                    $templateView->getTemplateRootPaths(),
                    ['EXT:imagemap/Resources/Private/Templates/']
                )
            );
            $templateView->setPartialRootPaths(
                array_merge(
                    $templateView->getPartialRootPaths(),
                    ['EXT:imagemap/Resources/Private/Partials/']
                )
            );
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
                ->assign('configuration', json_encode($this->getConfiguration($parameters, $data, $formName)))
                ->assign('data', $data)
                ->assign('scaleFactor', $data->getEnvironment()->getExtConfValue('imageMaxWH', 800) / 1000)
                ->assign('formName', $formName);
        } catch (\Exception $e) {
        }

        $response = new Response;
        $response->getBody()->write($this->templateView->render());

        return $response;
    }

    protected function getConfiguration(array $parameters, Data $data, string $formName): array
    {
        $browseLinkConfiguration = [
            'returnUrl' => GeneralUtility::linkThisScript(),
            'formName' => $formName,
            'tableName' => 'tt_content',
            'fieldName' => 'tx_imagemap_links',
            'pid' => $data->getRow()['pid'],
        ];

        $existingAreas = [];
        foreach ($data->getMap()['areas'] as $area) {
            $attributes = $area['attributes'];
            $existingArea = [
                'link' => $area['value'],
                'shape' => $attributes['shape'],
                'coords' => $attributes['coords'],
                'alt' => $attributes['alt'],
                'color' => $attributes['color'],
                'attributes' => []
            ];
            foreach ($data->getAttributeKeys() as $key) {
                $existingArea['attributes'][$key] = $attributes[$key];
            }
            $existingAreas[] = $existingArea;
        }

        return [
            'formName' => $formName,
            'itemName' => $parameters['itemName'],
            'fieldChangeFunc' => $parameters['fieldChangeFunc'] ?? [],
            'existingAreas' => $existingAreas,
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
