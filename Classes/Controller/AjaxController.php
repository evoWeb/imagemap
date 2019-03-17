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

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Http\Response;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class AjaxController
{
    /**
     * Processes the data send via ajax
     *
     * @param ServerRequestInterface $request
     *
     * @return ResponseInterface
     */
    public function rerenderPreviewAction(ServerRequestInterface $request): ResponseInterface
    {
        $response = new Response('php://temp', 200, ['Content-Type' => 'application/json; charset=utf-8']);
        $parameters = $request->getParsedBody()['P'];
        $this->getBackendUser()->setAndSaveSessionData('imagemap.value', $parameters['value']);

        try {
            /** @var \Evoweb\Imagemap\Domain\Model\Data $data */
            $data = GeneralUtility::makeInstance(
                \Evoweb\Imagemap\Domain\Model\Data::class,
                $parameters['tableName'],
                $parameters['fieldName'],
                $parameters['uid'],
                $parameters['value']
            );
            $data->setMap($parameters['value']);

            $config = $GLOBALS['TCA'][$parameters['tableName']]['columns'][$parameters['fieldName']];
            $data->setFieldConf($config);

            $content = '';
            if ($data->hasValidImageFile()) {
                $content = \json_encode($data->getMap());
            }
            $response->getBody()->write($content);
        } catch (\Exception $e) {
        }

        return $response;
    }

    /**
     * Processes the data send via ajax
     *
     * @param ServerRequestInterface $request
     *
     * @return ResponseInterface
     */
    public function browselinkUrlAction(ServerRequestInterface $request): ResponseInterface
    {
        $parameters = $request->getQueryParams();
        $linkParameters = [
            'act' => strpos($parameters['currentValue'], 'http') !== false ? 'url' : 'page',
            'mode' => 'wizard',
            'field' => $parameters['itemName'],
            'P' => [
                'returnUrl' => $parameters['returnUrl'],
                'formName' => $parameters['formName'],
                'itemName' => $parameters['itemName'],
                'currentValue' => $parameters['currentValue'],
                'pid' => $parameters['pid'],
                'fieldChangeFunc' => [
                    'focus' => 'focus()',
                    'callback' => 'imagemap.areaEditor.triggerLinkChanged("' . $parameters['objectId'] . '")'
                ]
            ]
        ];
        $linkParameters['P']['fieldChangeFuncHash'] = GeneralUtility::hmac(
            serialize($linkParameters['P']['fieldChangeFunc'])
        );

        $uriBuilder = GeneralUtility::makeInstance(UriBuilder::class);
        $response = new Response('php://temp', 200, ['Content-Type' => 'application/json; charset=utf-8']);
        $response->getBody()->write(\json_encode([
            'url' => (string)$uriBuilder->buildUriFromRoute('wizard_link', $linkParameters)
        ]));

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
}
