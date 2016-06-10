modules = {

    resourceLeaflet {
        dependsOn 'jquery'
        resource url: 'vendor/leaflet/0.7.3/leaflet.css'
        resource url: 'vendor/leaflet/0.7.3/leaflet.js'
    }

    resourceJqueryFileUpload {
        dependsOn 'jquery'
        dependsOn 'bootstrap3'
        dependsOn 'resourceJqueryUI'

        resource url: 'vendor/fileupload-9.0.0/jquery.fileupload-ui.css', disposition: 'head'
        resource url: 'vendor/fileupload-9.0.0/jquery.iframe-transport.js'
        resource url: 'vendor/fileupload-9.0.0/jquery.fileupload.js'
        resource url: 'vendor/fileupload-9.0.0/load-image.min.js'
        resource url: 'vendor/fileupload-9.0.0/jquery.fileupload-process.js'
        resource url: 'vendor/fileupload-9.0.0/jquery.fileupload-image.js'
        resource url: 'vendor/fileupload-9.0.0/jquery.fileupload-video.js'
        resource url: 'vendor/fileupload-9.0.0/jquery.fileupload-validate.js'
        resource url: 'vendor/fileupload-9.0.0/jquery.fileupload-audio.js'
        resource url: 'vendor/fileupload-9.0.0/locale.js'
        resource url: 'vendor/fileupload-9.0.0/cors/jquery.xdr-transport.js',
                wrapper: { s -> "<!--[if gte IE 8]>$s<![endif]-->" }
    }

    attachDocuments {
        dependsOn 'jquery'
        dependsOn 'bootstrap3'
        dependsOn 'resourceJqueryFileUpload'
        dependsOn 'resourceKnockout'
        resource url: 'js/preview/document.js'
    }

    resourceKnockout {
        resource url: 'vendor/knockoutjs/3.4.0/knockout-3.4.0.debug.js'
        resource url: 'vendor/knockoutjs/knockout.mapping-latest.js'
        resource url: 'js/preview/knockout-extenders.js'
    }

    resourceJqueryUI {
        resource url: 'vendor/jquery-ui/jquery-ui-1.11.2-no-autocomplete.js', disposition: 'head'
        resource url: '/vendor/jquery-ui/themes/smoothness/jquery-ui.css', attrs: [media: 'all'], disposition: 'head'
    }
}