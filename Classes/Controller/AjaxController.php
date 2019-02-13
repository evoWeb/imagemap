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
    public function tceformAjaxAction(
        \TYPO3\CMS\Core\Http\ServerRequest $request,
        \TYPO3\CMS\Core\Http\Response $response
    ) {
        $parameters = $request->getQueryParams()['P'];
        $parameters['fieldConf'] = unserialize(stripslashes($request->getQueryParams()['config']));

        $view = GeneralUtility::makeInstance(\Evoweb\Imagemap\View\Tceform::class);
        $view->init();
        $view->setTCEForm(GeneralUtility::makeInstance(\TYPO3\CMS\Backend\Form\NodeFactory::class));
        $view->setFormName($parameters['itemFormElName']);
        $view->setWizardConf($parameters['fieldConf']['config']['wizards']);

        $GLOBALS['BE_USER']->setAndSaveSessionData('imagemap.value', $parameters['value']);

        try {
            $data = GeneralUtility::makeInstance(
                \Evoweb\Imagemap\Domain\Model\DataObject::class,
                $parameters['table'],
                $parameters['field'],
                $parameters['uid'],
                $parameters['value']
            );
            $data->setFieldConf($parameters['fieldConf']);
            $view->setData($data);
        } catch (\Exception $e) {
        }

        $response->getBody()->write($view->renderContent());

        return $response;
    }
}