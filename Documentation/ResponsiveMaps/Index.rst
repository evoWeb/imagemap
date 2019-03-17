.. ==================================================
.. FOR YOUR INFORMATION
.. --------------------------------------------------
.. -*- coding: utf-8 -*- with BOM.

.. include:: ../Includes.txt
.. include:: Images.txt


Responsive imagemap
===================


Include jquery plugin:
----------------------

Include https://github.com/davidjbradshaw/image-map-resizer as it's needed to scale the areas as if images resize. To
trigger the behaviour the js method below needs to be called.

::

   $('map').imageMapResize();


In addition make the image containing 100% of its parent to have it rescale.

::

   img {
      max-width: 100%;
      height: auto;
   }


Consideration of touch devices:
-------------------------------

There is no hover in touch devices. Because of that it's well advised to have an accordion with all the
links in the map rendered with the alt/title-attribute as label, to make them visual to the user.
