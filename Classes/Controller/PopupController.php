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
     * Default action just renders the Wizard with the default view.
     *
     * @param \TYPO3\CMS\Core\Http\ServerRequest $request
     * @param \TYPO3\CMS\Core\Http\Response $response
     *
     * @return \TYPO3\CMS\Core\Http\Response
     */
    public function wizardAction(
        \TYPO3\CMS\Core\Http\ServerRequest $request,
        \TYPO3\CMS\Core\Http\Response $response
    ) {
        $view = GeneralUtility::makeInstance(\Evoweb\Imagemap\View\Wizard::class);
        $view->init();

        $parameters = $request->getQueryParams()['P'];
        $currentValue = $GLOBALS['BE_USER']->getSessionData('imagemap.value');

        try {
            $data = GeneralUtility::makeInstance(
                \Evoweb\Imagemap\Domain\Model\DataObject::class,
                $parameters['table'],
                $parameters['field'],
                $parameters['uid'],
                $currentValue
            );
            $view->setData($data);
        } catch (\Exception $e) {
        }

        $response->getBody()->write($view->renderContent());
        return $response;
    }
}
