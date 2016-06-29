modules = {

    resourceLeaflet {
        dependsOn 'jquery'
        resource url: [dir:'vendor/leaflet/0.7.3', file: 'leaflet.css', plugin:'document-preview-plugin' ]
        resource url: [dir:'vendor/leaflet/0.7.3', file: 'leaflet.js', plugin:'document-preview-plugin' ]
    }

    resourceJqueryFileUpload {
        dependsOn 'jquery'
        dependsOn 'bootstrap3'
        dependsOn 'resourceJqueryUI'

        resource url: [dir:'vendor/fileupload-9.0.0', file: 'jquery.fileupload-ui.css', plugin:'document-preview-plugin' ], disposition: 'head'
        resource url: [dir:'vendor/fileupload-9.0.0', file: 'jquery.iframe-transport.js', plugin:'document-preview-plugin' ]
        resource url: [dir:'vendor/fileupload-9.0.0', file: 'jquery.fileupload.js', plugin:'document-preview-plugin' ]
        resource url: [dir:'vendor/fileupload-9.0.0', file: 'load-image.min.js', plugin:'document-preview-plugin' ]
        resource url: [dir:'vendor/fileupload-9.0.0', file: 'jquery.fileupload-process.js', plugin:'document-preview-plugin' ]
        resource url: [dir:'vendor/fileupload-9.0.0', file: 'jquery.fileupload-image.js', plugin:'document-preview-plugin' ]
        resource url: [dir:'vendor/fileupload-9.0.0', file: 'jquery.fileupload-video.js', plugin:'document-preview-plugin' ]
        resource url: [dir:'vendor/fileupload-9.0.0', file: 'jquery.fileupload-validate.js', plugin:'document-preview-plugin' ]
        resource url: [dir:'vendor/fileupload-9.0.0', file: 'jquery.fileupload-audio.js', plugin:'document-preview-plugin' ]
        resource url: [dir:'vendor/fileupload-9.0.0', file: 'locale.js', plugin:'document-preview-plugin' ]
        resource url: [dir:'vendor/fileupload-9.0.0/cors', file: 'jquery.xdr-transport.js', plugin:'document-preview-plugin' ],
                wrapper: { s -> "<!--[if gte IE 8]>$s<![endif]-->" }
    }

    attachDocuments {
        dependsOn 'jquery'
        dependsOn 'bootstrap3'
        dependsOn 'resourceJqueryFileUpload'
        dependsOn 'resourcejqueryValidationEngine'
        dependsOn 'resourceKnockout'
        resource url: [dir:'css', file: 'document-preview.css', plugin:'document-preview-plugin' ], disposition: 'head'
        resource url: [dir:'js/preview', file: 'document.js', plugin:'document-preview-plugin' ]
    }

    resourceKnockout {
        resource url: [dir:'vendor/knockoutjs/3.4.0', file: 'knockout-3.4.0.debug.js', plugin:'document-preview-plugin' ]
        resource url: [dir:'vendor/knockoutjs', file: 'knockout.mapping-latest.js', plugin:'document-preview-plugin' ]
        resource url: [dir:'js/preview', file: 'knockout-extenders.js', plugin:'document-preview-plugin' ]
    }

    resourceJqueryUI {
        resource url: [dir:'vendor/jquery-ui/themes/smoothness', file: 'jquery-ui.css', plugin:'document-preview-plugin' ], attrs: [media: 'all'], disposition: 'head'
        resource url: [dir:'vendor/jquery-ui', file: 'jquery-ui-1.11.2-no-autocomplete.js', plugin:'document-preview-plugin' ]
    }
    resourcejqueryValidationEngine {
        resource url: [dir:'vendor/jquery.validationEngine', file: 'jquery.validationEngine.js', plugin:'document-preview-plugin' ]
        resource url: [dir:'vendor/jquery.validationEngine', file: 'jquery.validationEngine-en.js', plugin:'document-preview-plugin' ]
        resource url: [dir:'vendor/jquery.validationEngine', file: 'validationEngine.jquery.css', plugin:'document-preview-plugin' ]
    }
}
