<?php

declare(strict_types=1);

namespace Evoweb\Imagemap\Controller;

/*
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
use TYPO3\CMS\Core\Http\JsonResponse;
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
        $response = new Response();
        $response->withHeader('Content-Type', 'application/json; charset=utf-8');

        try {
            $parameters = $request->getParsedBody()['arguments'];
            $record = BackendUtility::getRecord($parameters['tableName'], $parameters['uid']);
            $map = $record[$parameters['fieldName']];

            $content = \json_encode($map);
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
        $queryParams = $request->getQueryParams();

        $options = $GLOBALS['TCA'][$queryParams['tableName']]['columns'][
            $queryParams['fieldName']
            ]['config']['fieldControlOptions'] ?? [];

        $itemName = $queryParams['itemFormElName'];

        $linkBrowserArguments = [];
        if (isset($options['blindLinkOptions'])) {
            $linkBrowserArguments['blindLinkOptions'] = $options['blindLinkOptions'];
        }
        if (isset($options['blindLinkFields'])) {
            $linkBrowserArguments['blindLinkFields'] = $options['blindLinkFields'];
        }
        if (isset($options['allowedExtensions'])) {
            $linkBrowserArguments['allowedExtensions'] = $options['allowedExtensions'];
        }

        $urlParameters = [
            'P' => [
                'params' => $linkBrowserArguments,
                'table' => $queryParams['tableName'],
                'uid' => (int)$queryParams['uid'],
                'pid' => (int)$queryParams['pid'],
                'field' => $queryParams['fieldName'],
                'formName' => $queryParams['formName'],
                'itemName' => $itemName,
                'hmac' => GeneralUtility::hmac($itemName, 'wizard_js'),
                'fieldChangeFunc' => $queryParams['fieldChangeFunc'],
                'fieldChangeFuncHash' => GeneralUtility::hmac(serialize($queryParams['fieldChangeFunc'])),
            ],
        ];
        /** @var \TYPO3\CMS\Backend\Routing\UriBuilder $uriBuilder */
        $uriBuilder = GeneralUtility::makeInstance(\TYPO3\CMS\Backend\Routing\UriBuilder::class);
        $url = (string)$uriBuilder->buildUriFromRoute('wizard_link', $urlParameters);

        $response = new JsonResponse();
        $response->setPayload(['url' => $url]);

        return $response;
    }
}
