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

use TYPO3\CMS\Backend\Routing\UriBuilder;
use TYPO3\CMS\Core\Utility\GeneralUtility;

class AjaxController
{
    /**
     * Processes the data send via ajax
     *
     * @param \TYPO3\CMS\Core\Http\ServerRequest $request
     * @param \TYPO3\CMS\Core\Http\Response $response
     *
     * @return \TYPO3\CMS\Core\Http\Response
     */
    public function tceformAction(
        \TYPO3\CMS\Core\Http\ServerRequest $request,
        \TYPO3\CMS\Core\Http\Response $response
    ) {
        $parameters = $request->getQueryParams()['P'];
        $config = $GLOBALS['TCA'][$parameters['tableName']]['columns'][$parameters['fieldName']]['config'];

        $view = GeneralUtility::makeInstance(\Evoweb\Imagemap\View\Tceform::class);
        $view->init();
        $view->setTCEForm(GeneralUtility::makeInstance(\TYPO3\CMS\Backend\Form\NodeFactory::class));
        $view->setFormName($parameters['itemFormElName']);
        $view->setWizardConf($config['fieldConf']['config']['wizards']);

        $GLOBALS['BE_USER']->setAndSaveSessionData('imagemap.value', $parameters['value']);

        try {
            $data = GeneralUtility::makeInstance(
                \Evoweb\Imagemap\Domain\Model\DataObject::class,
                $parameters['tableName'],
                $parameters['fieldName'],
                $parameters['uid'],
                $parameters['value']
            );
            $data->setFieldConf($config['fieldConf']);
            $view->setData($data);
        } catch (\Exception $e) {
        }

        $response->getBody()->write($view->renderContent());

        return $response;
    }

    /**
     * Processes the data send via ajax
     *
     * @param \TYPO3\CMS\Core\Http\ServerRequest $request
     * @param \TYPO3\CMS\Core\Http\Response $response
     *
     * @return \TYPO3\CMS\Core\Http\Response
     */
    public function browseLinkAction(
        \TYPO3\CMS\Core\Http\ServerRequest $request,
        \TYPO3\CMS\Core\Http\Response $response
    ) {
        $parameters = $request->getQueryParams();
        $linkParameters = [
            'act' => strpos($parameters['currentValue'], 'http') !== false ? 'url' : 'page',
            'mode' => 'wizard',
            'field' => $parameters['objectId'] . '_link',
            'P' => [
                'returnUrl' => $parameters['returnUrl'],
                'formName' => $parameters['formName'],
                'itemName' => $parameters['objectId'] . '_link',
                'currentValue' => $parameters['currentValue'],
                'pid' => $parameters['pid'],
                'fieldChangeFunc' => [
                    'focus' => 'focus()',
                    'callback' => 'imagemap.canvasObject.triggerAreaLinkUpdate("' . $parameters['objectId'] . '")'
                ]
            ]
        ];

        $uriBuilder = GeneralUtility::makeInstance(UriBuilder::class);
        $response->getBody()->write(json_encode([
            'url' => (string)$uriBuilder->buildUriFromRoute('wizard_link', $linkParameters)
        ]));

        return $response;
    }
}
