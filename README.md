# document-preview-plugin
Grails plugin to assist with previewing stored documents.  (Extracted from BioCollect into a plugin.)

# Usage
See grails-app/views/resource/_list.gsp for a template than can be used to manage the creation and display of
Documents

The required parameters are:
updateController, updateAction: The controller and action to process create and update request
deleteController, deleteAction: The controller and action that will process delete requests
parentId: The value of property parentId for all new created documents
documents: A JSON array with all the documents to display.
documentResourceAdmin: a boolean property that enables/disables edit controls

If a different initialisation is required (such as via an angular controller), you can still use _list.gsp as a reference, you will need to call ALA.DocView.initDocView from your code.
 

# Status
[![Build Status](https://travis-ci.org/AtlasOfLivingAustralia/document-preview-plugin.svg?branch=master)](https://travis-ci.org/AtlasOfLivingAustralia/document-preview-plugin)

