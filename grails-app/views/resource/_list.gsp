<html>
<head>
    <parameter name="returnUrlPath" value="${grailsApplication.config.grails.serverURL}"/>
    <r:require modules="resourceKnockout,attachDocuments"/>
</head>
<body>
    <h3>List</h3>
    <g:render template="/resource/attachDocument"/>
    <g:render template="/resource/listDocuments"/>
</body>

    <r:script disposition="head">
    console.log ('This  listDocuments.gsp Script');
    var options;
    $(window).load(function () {
        console.log ('Loading listDocuments config ');

        var documents = JSON.parse('${documents.toString()}');

        options = {
            imageLocation:"${resource(dir:'/images', plugin: 'document-preview-plugin')}",
            pdfgenUrl: "${createLink(controller: 'preview', action: 'pdfUrl')}",
            pdfViewer: "${createLink(controller: 'preview', action: 'viewer')}",
            imgViewer: "${createLink(controller: 'preview', action: 'imageviewer')}",
            audioViewer: "${createLink(controller: 'preview', action: 'audioviewer')}",
            videoViewer: "${createLink(controller: 'preview', action: 'videoviewer')}",
            errorViewer: "${createLink(controller: 'preview', action: 'error')}",
            documentUpdateUrl: '<g:createLink controller="${updateController}" action="${updateAction}"  />',
            documentDeleteUrl: '<g:createLink controller="${deleteController}" action="${deleteAction}"  />',
            parentId: '${parentId}',
            documents: documents,
            admin: ${documentResourceAdmin || false}
    }

        var docListViewModel = new DocListViewModel(documents || [], options);

        console.log('-- Applying bindings');
        try{
            ko.applyBindings(docListViewModel, document.getElementById('resourceList'));
        } catch (e)
        {
            log.warn(e);
            log.warn("Is this double initialisation or something else");
        }
        console.log('-- Finished applying bindings');
});

</r:script>

</html>

