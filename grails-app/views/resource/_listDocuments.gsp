<%@ page import="grails.converters.JSON" %>
<r:require modules="resourceKnockout,attachDocuments"/>
<div id="resourceList">
        <div class="row-fluid row-eq-height">
                <div class="col-sm-7">
                        <div class="form-inline ">
                                <div class="input-group text-left">
                                        <span class="input-group-addon btn-default"><i class="fa fa-filter"></i></span>
                                        <input type="text" class="form-control delegated-search-control"
                                               data-bind="textInput: documentFilter">

                                        <div class="input-group-btn">
                                                <button type="button" class="btn dropdown-toggle" data-toggle="dropdown">
                                                        <span data-bind="text: documentFilterField().label"></span>
                                                        <span class="caret"></span>
                                                </button>
                                                <ul class="dropdown-menu" data-bind="foreach: documentFilterFieldOptions">
                                                        <li><a data-bind="{ text: $data.label, click: $parent.documentFilterField }"></a></li>
                                                </ul>
                                        </div>
                                </div>
                        </div>

                        <p/>

                        <div class="well well-small fc-docs-list-well">
                                <!-- ko if: filteredDocuments().length == 0 -->
                                <p class="text-center">No documents</p>
                                <!-- /ko -->
                                <ul class="list-group nav nav-list fc-docs-list" data-bind="foreach: { data: filteredDocuments }">
                                        <li class="list-group-item pointer "
                                            data-bind="{ click: $parent.selectDocument, css: { active: $parent.selectedDocument() == $data } }">
                                                <div class="clearfix space-after media"
                                                     data-bind="template:$parent.documentTemplate($data)"></div>
                                        </li>
                                </ul>
                        </div>

                        <p/>
                        <g:if test="${documentResourceAdmin}"><button class="btn btn-default"
                                                                      data-bind="click:attachDocument">New Resource</button></g:if>
                </div>

        </div>

        <div class="row-fluid row-eq-height">
                <div class="col-sm-1"></div>
                <div class="col-sm-10">
                        <div class="fc-resource-preview-container" data-bind="{ template: { name: previewTemplate } }">
                        </div>
                </div>
                <div class="col-sm-1"></div>
        </div>
</div>

<script id="iframeViewer" type="text/html">
<div class="embed-responsive embed-responsive-16by9 col-xs-12 text-center">
        <iframe class="embed-responsive-item" data-bind="attr: {src: selectedDocumentFrameUrl}">
                <p>Your browser does not support iframes <i class="fa fa-frown-o"></i>.</p>
        </iframe>
</div>
</script>

<script id="xssViewer" type="text/html">
<div class="embed-responsive embed-responsive-16by9 col-xs-12 text-center"  data-bind="visible: selectedDocument().embeddedVideoVisible html: selectedDocument().embeddedVideo"></div>
<div class="embed-responsive embed-responsive-16by9 col-xs-12 text-center"  data-bind="visible: selectedDocument().embeddedAudioVisible html: selectedDocument().embeddedAudio"></div>
</script>

<script id="noPreviewViewer" type="text/html">
<div class="well fc-resource-preview-well">
        <p class="text-center">There is no preview available for this file.</p>
</div>
</script>

<script id="noViewer" type="text/html">
<div class="well fc-resource-preview-well">
        <p class="text-center">Select a document to preview it here.</p>
</div>
</script>

<g:render template="/resource/documentTemplate"></g:render>


