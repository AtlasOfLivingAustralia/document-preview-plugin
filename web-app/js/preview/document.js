/**
 * Document preview modes to content type 'map'
 * @type {{convert: string[], pdf: string[], image: string[], audio: string[], video: string[]}}
 */
var contentTypes = {
    convert: [
        'application/msword',
        'application/ms-excel',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
        'application/vnd.ms-word.document.macroEnabled.12',
        'application/vnd.ms-word.template.macroEnabled.12',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
        'application/vnd.ms-excel.sheet.macroEnabled.12',
        'application/vnd.ms-excel.template.macroEnabled.12',
        'application/vnd.ms-excel.addin.macroEnabled.12',
        'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.openxmlformats-officedocument.presentationml.template',
        'application/vnd.openxmlformats-officedocument.presentationml.slideshow',
        'application/vnd.ms-powerpoint.addin.macroEnabled.12',
        'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
        'application/vnd.ms-powerpoint.template.macroEnabled.12',
        'application/vnd.ms-powerpoint.slideshow.macroEnabled.12',
        'application/vnd.oasis.opendocument.chart',
        'application/vnd.oasis.opendocument.chart-template',
        //'application/vnd.oasis.opendocument.database',
        'application/vnd.oasis.opendocument.formula',
        'application/vnd.oasis.opendocument.formula-template',
        'application/vnd.oasis.opendocument.graphics',
        'application/vnd.oasis.opendocument.graphics-template',
        'application/vnd.oasis.opendocument.image',
        'application/vnd.oasis.opendocument.image-template',
        'application/vnd.oasis.opendocument.presentation',
        'application/vnd.oasis.opendocument.presentation-template',
        'application/vnd.oasis.opendocument.spreadsheet',
        'application/vnd.oasis.opendocument.spreadsheet-template',
        'application/vnd.oasis.opendocument.text',
        'application/vnd.oasis.opendocument.text-master',
        'application/vnd.oasis.opendocument.text-template',
        'application/vnd.oasis.opendocument.text-web',
        'text/html',
        'text/plain',
        'text/csv'
    ],
    pdf: [
        'application/pdf',
        'text/pdf'
    ],
    image: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp'
    ],
    audio: [
        'audio/webm',
        'audio/ogg',
        'audio/wave',
        'audio/wav',
        'audio/x-wav',
        'audio/x-pn-wav',
        'audio/mpeg',
        'audio/mp3',
        'audio/mp4'
    ],
    video: [
        'video/webm',
        'video/ogg',
        'application/ogg',
        'video/mp4'
    ]
};

/**
 * A view model to capture metadata about a document and manage progress / feedback as a file is uploaded.
 *
 * NOTE that we are attempting to use this same model for document records that have an associated file
 * and those that do not (eg deferral reason docs). The mechanisms for handling these two types (esp saving)
 * are not well integrated at this point.
 *
 * @param doc any existing details of the document.
 * @param owner an object containing key and value properties identifying the owning entity for the document. eg. {key:'projectId', value:'the_id_of_the_owning_project'}
 * @constructor
 */
function DocumentViewModel (doc, owner, settings) {
    var self = this;

    var defaults = {
        //Information is the default option.

        roles:  [{id:'embeddedAudio', name:'Embedded Audio'}, {id:'embeddedVideo', name:'Embedded Video'}, {id: 'information', name: 'Attached File'}],
        showSettings: true,
        thirdPartyDeclarationTextSelector:'#thirdPartyDeclarationText',
        imageLocation: '/images'
    };
    this.settings = $.extend({}, defaults, settings);

    // NOTE that attaching a file is optional, ie you can have a document record without a physical file
    this.filename = ko.observable(doc ? doc.filename : '');
    this.filesize = ko.observable(doc ? doc.filesize : '');
    this.name = ko.observable(doc.name);
    // the notes field can be used as a pseudo-document (eg a deferral reason) or just for additional metadata
    this.notes = ko.observable(doc.notes);
    this.filetypeImg = function () {
        return self.settings.imageLocation + '/filetypes/' + iconnameFromFilename(self.filename());
    };
    this.status = ko.observable(doc.status || 'active');
    this.attribution = ko.observable(doc ? doc.attribution : '');
    this.license = ko.observable(doc ? doc.license : '');
    this.type = ko.observable(doc.type);
    this.role = ko.observable(doc.role);
    this.roles = this.settings.roles;
    this.public = ko.observable(doc.public);
    this.url = doc.url;
    this.thumbnailUrl = doc.thumbnailUrl ? doc.thumbnailUrl : doc.url;
    this.documentId = doc.documentId;
    this.hasPreview = ko.observable(false);
    this.error = ko.observable();
    this.progress = ko.observable(0);
    this.complete = ko.observable(false);
    this.readOnly = doc && doc.readOnly ? doc.readOnly : false;
    this.contentType = ko.observable(doc ? doc.contentType : 'application/octet-stream');
    this.fileButtonText = ko.computed(function() {
        return (self.filename() ? "Change file" : "Attach file");
    });

    this.thirdPartyConsentDeclarationMade = ko.observable(doc.thirdPartyConsentDeclarationMade);
    this.thirdPartyConsentDeclarationText = null;
    this.embeddedVideo = ko.observable(doc.embeddedVideo);
    this.embeddedVideoVisible = ko.computed(function() {
        return (self.role() == 'embeddedVideo');
    });

    this.thirdPartyConsentDeclarationMade.subscribe(function(declarationMade) {
        // Record the text that the user agreed to (as it is an editable setting).
        if (declarationMade) {
            self.thirdPartyConsentDeclarationText = $(self.settings.thirdPartyDeclarationTextSelector).text();
        }
        else {
            self.thirdPartyConsentDeclarationText = null;
        }
        $("#thirdPartyConsentCheckbox").closest('form').validationEngine("updatePromptsPosition")
    });
    this.thirdPartyConsentDeclarationRequired = ko.computed(function() {
        return (self.type() == 'image' ||  self.role() == 'embeddedVideo')  && self.public();
    });
    this.thirdPartyConsentDeclarationRequired.subscribe(function(newValue) {
        if (newValue) {
            setTimeout(function() {$("#thirdPartyConsentCheckbox").validationEngine('validate');}, 100);
        }
    });
    this.fileReady = ko.computed(function() {
        return self.filename() && self.progress() === 0 && !self.error();
    });
    this.saveEnabled = ko.computed(function() {
        if (self.thirdPartyConsentDeclarationRequired() && !self.thirdPartyConsentDeclarationMade()) {
            return false;
        }
        else if(self.role() == 'embeddedVideo'){
            return buildiFrame(self.embeddedVideo()) != "" ;
        }

        return self.fileReady();
    });
    this.saveHelp = ko.computed(function() {
        if(self.role() == 'embeddedVideo' && !buildiFrame(self.embeddedVideo())){
            return 'Invalid embed video code';
        }
        else if(self.role() == 'embeddedVideo' && !self.saveEnabled()){
            return 'You must accept the Privacy Declaration before an embed video can be made viewable by everyone';
        }
        else if (!self.fileReady()) {
            return 'Attach a file using the "+ Attach file" button';
        }
        else if (!self.saveEnabled()) {
            return 'You must accept the Privacy Declaration before an image can be made viewable by everyone';
        }
        return '';
    });
    // make this support both the old key/value syntax and any set of props so we can define more than
    // one owner attribute
    if (owner !== undefined) {
        if (owner.key !== undefined) {
            self[owner.key] = owner.value;
        }
        for (var propName in owner) {
            if (owner.hasOwnProperty(propName) && propName !== 'key' && propName !== 'value') {
                self[propName] = owner[propName];
            }
        }
    }

    /**
     * Detaches an attached file and resets associated fields.
     */
    this.removeFile = function() {
        self.filename('');
        self.filesize('');
        self.hasPreview(false);
        self.error('');
        self.progress(0);
        self.complete(false);
        self.file = null;
    };
    // Callbacks from the file upload widget, these are attached manually (as opposed to a knockout binding).
    this.fileAttached = function(file) {
        self.filename(file.name);
        self.filesize(file.size);
        // Should be use just the mime type or include the mime type as well?
        if (file.type) {
            var type = file.type.split('/');
            if (type) {
                self.type(type[0]);
            }
        }
        else if (file.name) {

            var type = file.name.split('.').pop();

            var imageTypes = ['gif','jpeg', 'jpg', 'png', 'tif', 'tiff'];
            if ($.inArray(type.toLowerCase(), imageTypes) > -1) {
                self.type('image');
            }
            else {
                self.type('document');
            }
        }
    };
    this.filePreviewAvailable = function(file) {
        this.hasPreview(true);
    };
    this.uploadProgress = function(uploaded, total) {
        var progress = Math.round(uploaded/total*100);
        self.progress(progress);
    };
    this.fileUploaded = function(file) {
        self.complete(true);
        self.url = file.url;
        self.documentId = file.documentId;
        self.progress(100);
        setTimeout(self.close, 1000);
    };
    this.fileUploadFailed = function(error) {
        this.error(error);
    };

    /** Formatting function for the file name and file size */
    this.fileLabel = ko.computed(function() {
        var label = self.filename();
        if (self.filesize()) {
            label += ' ('+formatBytes(self.filesize())+')';
        }
        return label;
    });

    // This save method does not handle file uploads - it just deals with saving the doc record
    // - see below for the file upload save
    this.recordOnlySave = function (uploadUrl) {
        $.post(
            uploadUrl,
            {document:self.toJSONString()},
            function(result) {
                self.complete(true); // ??
                self.documentId = result.documentId;
            })
            .fail(function() {
                self.error('Error saving document record');
            });
    };

    this.toJSONString = function() {
        // These are not properties of the document object, just used by the view model.
        return JSON.stringify(self.modelForSaving());
    };

    this.modelForSaving = function() {
        return ko.mapping.toJS(self, {'ignore':['embeddedVideoVisible', 'iframe','helper', 'progress', 'hasPreview', 'error', 'fileLabel', 'file', 'complete', 'fileButtonText', 'roles', 'settings', 'thirdPartyConsentDeclarationRequired', 'saveEnabled', 'saveHelp', 'fileReady']});
    };

}


/**
 * Attaches the jquery.fileupload plugin to the element identified by the uiSelector parameter and
 * configures the callbacks to the appropriate methods of the supplied documentViewModel.
 * @param uploadUrl the URL to upload the document to.
 * @param documentViewModel The view model to attach to the file upload.
 * @param uiSelector the ui element to bind the file upload functionality to.
 * @param previewElementSelector selector for a ui element to attach an image preview when it is generated.
 */
function attachViewModelToFileUpload(uploadUrl, documentViewModel, uiSelector, previewElementSelector) {

    var fileUploadHelper;

    $(uiSelector).fileupload({
        url:uploadUrl,
        formData:function(form) {
            return [{name:'document', value:documentViewModel.toJSONString()}]
        },
        autoUpload:false,
        forceIframeTransport: true,
        getFilesFromResponse: function(data) { // This is to support file upload on pages that include the fileupload-ui which expects a return value containing an array of files.
            return data;
        }
    }).on('fileuploadadd', function(e, data) {
        fileUploadHelper = data;
        documentViewModel.fileAttached(data.files[0]);
    }).on('fileuploadprocessalways', function(e, data) {
        if (data.files[0].preview) {
            documentViewModel.filePreviewAvailable(data.files[0]);
            if (previewElementSelector !== undefined) {
                $(uiSelector).find(previewElementSelector).append(data.files[0].preview);
            }

        }
    }).on('fileuploadprogressall', function(e, data) {
        documentViewModel.uploadProgress(data.loaded, data.total);
    }).on('fileuploaddone', function(e, data) {
        var result;

        // Because of the iframe upload, the result will be returned as a query object wrapping a document containing
        // the text in a <pre></pre> block.  If the fileupload-ui script is included, the data will be extracted
        // before this callback is invoked, thus the check.*
        if (data.result instanceof jQuery) {
            var resultText = $('pre', data.result).text();
            result = JSON.parse(resultText);
        }
        else {
            result = data.result;
        }

        if (!result) {
            result = {};
            result.error = 'No response from server';
        }

        if (result.documentId) {
            documentViewModel.fileUploaded(result);
        }
        else {
            documentViewModel.fileUploadFailed(result.error);
        }

    }).on('fileuploadfail', function(e, data) {
        documentViewModel.fileUploadFailed(data.errorThrown);
    });



    // We are keeping the reference to the helper here rather than the view model as it doesn't serialize correctly
    // (i.e. calls to toJSON fail).
    documentViewModel.save = function() {
        if (documentViewModel.filename() && fileUploadHelper !== undefined) {
            fileUploadHelper.submit();
            fileUploadHelper = null;
        }
        else {
            // There is no file attachment but we can save the document anyway.
            $.post(
                uploadUrl,
                {document:documentViewModel.toJSONString()},
                function(result) {
                    var resp = JSON.parse(result).resp;
                    documentViewModel.fileUploaded(resp);
                })
                .fail(function() {
                    documentViewModel.fileUploadFailed('Error uploading document');
                });
        }
    }
}


/**
 * Creates a bootstrap modal from the supplied UI element to collect and upload a document and returns a
 * jquery Deferred promise to provide access to the uploaded Document.
 * @param uploadUrl the URL to upload the document to.
 * @param documentViewModel default model for the document.  can be used to populate role, etc.
 * @param modalSelector a selector identifying the ui element that contains the markup for the bootstrap modal dialog.
 * @param fileUploadSelector a selector identifying the ui element to attach the file upload functionality to.
 * @param previewSelector a selector identifying an element to attach a preview of the file to (optional)
 * @returns an instance of jQuery.Deferred - the uploaded document will be supplied to a chained 'done' function.
 */
function showDocumentAttachInModal(uploadUrl, documentViewModel, modalSelector, fileUploadSelector, previewSelector) {

    if (fileUploadSelector === undefined) {
        fileUploadSelector = '#attachDocument';
    }
    if (previewSelector === undefined) {
        previewSelector = '#preview';
    }
    var $fileUpload = $(fileUploadSelector);
    var $modal = $(modalSelector);

    attachViewModelToFileUpload(uploadUrl, documentViewModel, fileUploadSelector, previewSelector);

    // Used to communicate the result back to the calling process.
    var result = $.Deferred();

    // Decorate the model so it can handle the button presses and close the modal window.
    documentViewModel.cancel = function() {
        result.reject();
        closeModal();
    };
    documentViewModel.close = function() {
        result.resolve(ko.toJS(documentViewModel));
        closeModal();
    };

    // Close the modal and tidy up the bindings.
    var closeModal = function() {
        $modal.modal('hide');
        $modal.removeClass("in");
        $(".modal-backdrop").remove();
        $('body').removeClass('modal-open');
        $modal.hide();
        $fileUpload.find(previewSelector).empty();
        ko.cleanNode($fileUpload[0]);
    };

    ko.applyBindings(documentViewModel, $fileUpload[0]);

    // Do the binding from the model to the view?  Or assume done already?
    $modal.modal({backdrop:'static'});
    $modal.on('shown', function() {
        $modal.find('form').validationEngine({'custom_error_messages': {
            '#thirdPartyConsentCheckbox': {
                'required': {'message':'The privacy declaration is required for images viewable by everyone'}
            }
        }, 'autoPositionUpdate':true, promptPosition:'inline'});
    });

    return result;
}

function findDocumentByRole(documents, role) {
    for (var i=0; i<documents.length; i++) {
        var docRole = ko.utils.unwrapObservable(documents[i].role);
        var status = ko.utils.unwrapObservable(documents[i].status);

        if (docRole === role && status !== 'deleted') {
            return documents[i];
        }
    }
    return null;
};

function findDocumentById(documents, id) {
    if (documents) {
        for (var i=0; i<documents.length; i++) {
            var docId = ko.utils.unwrapObservable(documents[i].documentId);
            var status = ko.utils.unwrapObservable(documents[i].status);
            if (docId === id && status !== 'deleted') {
                return documents[i];
            }
        }
    }
    return null;
}

var DocModel = function (doc) {
    var self = this;
    this.name = doc.name;
    this.attribution = doc.attribution;
    this.filename = doc.filename;
    this.type = doc.type;
    this.url = doc.url;
    this.thumbnailUrl = doc.thumbnailUrl ? doc.thumbnailUrl : doc.url;
    this.filetypeImg = function () {
        return imageLocation + "/filetypes/" + iconnameFromFilename(self.filename);
    };
};
function DocListViewModel(documents, options) {
    var self = this;
    Documents.apply(self, [options]);

    var settings = {
        imageLocation:options.imageLocation,
        showSettings:false,
        };

    if( options['roles']) {
        settings.roles = options.roles;
    }

    self.documents($.map(documents, function(doc) { return new DocumentViewModel(doc, '',  settings)} ));
    self.documentTemplate = function(document) {
        var type = ko.utils.unwrapObservable(document.type);
        var prefix = type == 'image' ? 'image' : 'obj';
        var suffix = options.documentResourceAdmin ? 'DocEditTmpl' : 'DocTmpl';
        return prefix+suffix;
    };
    self.attachDocument = function() {
        showDocumentAttachInModal(options.documentUpdateUrl, new DocumentViewModel({role:'information'},{key:'parentId', value:options.parentId}, settings), '#attachDocument')
            .done(function(result){
                var newEntry = new DocumentViewModel(result, '',  settings);
                self.documents.push(newEntry);
                }
            );
    };
    self.editDocumentMetadata = function(document) {
        var url = options.documentUpdateUrl + "/" + document.documentId;
        showDocumentAttachInModal( url, document, '#attachDocument')
            .done(function(result){
                //window.location.reload(); // The display doesn't update properly otherwise.
            });
    };
    self.deleteDocument = function(document) {
        var url = options.documentDeleteUrl+'/'+document.documentId;
        $.post(url, {}, function() {self.documents.remove(document);});
    };
}


function iconnameFromFilename(filename) {
    if (filename === undefined) { return "_blank.png"; }
    var ext = filename.split('.').pop(),
        types = ['aac','ai','aiff','avi','bmp','c','cpp','css','dat','dmg','doc','dotx','dwg','dxf',
            'eps','exe','flv','gif','h','hpp','html','ics','iso','java','jpg','key','mid','mp3','mp4',
            'mpg','odf','ods','odt','otp','ots','ott','pdf','php','png','ppt','psd','py','qt','rar','rb',
            'rtf','sql','tga','tgz','tiff','tif','txt','wav','xls','xlsx'];
    ext = ext.toLowerCase();
    if (ext === 'docx') { ext = 'doc' }
    if ($.inArray(ext, types) >= 0) {
        return ext + '.png';
    } else {
        return "_blank.png";
    }
}

function Documents(options) {
    var self = this;

    self.documents = ko.observableArray();
    self.documentFilter = ko.observable('');
    self.documentFilterFieldOptions = [{ label: 'Name', fun: 'name'}, { label: 'Attribution', fun: 'attribution' }, { label: 'Type', fun: 'type' }];
    self.documentFilterField = ko.observable(self.documentFilterFieldOptions[0]);

    self.selectedDocument = ko.observable();

    function listContains(list, value) {
        return list.indexOf(value) > -1;
    }

    self.selectDocument = function(data) {
        self.selectedDocument(data);
        return true;
    };

    self.previewTemplate = ko.pureComputed(function() {
        var selectedDoc = self.selectedDocument();

        var val;
        if (selectedDoc) {
            var contentType = (selectedDoc.contentType() || 'application/octet-stream').toLowerCase().trim();
            var embeddedVideo = selectedDoc.embeddedVideo();
            if (embeddedVideo) {
                val = "xssViewer";
            } else if (listContains(contentTypes.convert.concat(contentTypes.audio, contentTypes.video, contentTypes.image, contentTypes.pdf), contentType)) {
                val = "iframeViewer";
            } else {
                val = "noPreviewViewer";
            }
        } else {
            val = "noViewer";
        }
        return val;
    });

    self.selectedDocumentFrameUrl = ko.computed(function() {
        var selectedDoc = self.selectedDocument();

        var val;
        if (selectedDoc) {
            var contentType = (selectedDoc.contentType() || 'application/octet-stream').toLowerCase().trim();
            //return (selectedDoc && selectedDoc.url) ? "https://docs.google.com/viewer?url="+encodeURIComponent(selectedDoc.url)+"&embedded=true" : '';

            if (listContains(contentTypes.pdf, contentType)) {
                val = options.pdfViewer + '?file=' + encodeURIComponent(selectedDoc.url);
            } else if (listContains(contentTypes.convert, contentType)) {

                // jq promises are fundamentally broken, so...
                val = $.Deferred(function(dfd) {
                    $.get(options.pdfgenUrl, {"file": selectedDoc.url }, $.noop, "json")
                        .promise()
                        .done(function(data) {
                            dfd.resolve(options.pdfViewer + '?file=' + encodeURIComponent(data.location));
                        })
                        .fail(function(jqXHR, textStatus, errorThrown) {
                            console.warn('get pdf failed', jqXHR, textStatus, errorThrown);
                            dfd.resolve(options.errorViewer || '');
                        })
                }).promise();
            } else if (listContains(contentTypes.image, contentType)) {
                val = options.imgViewer + '?file=' + encodeURIComponent(selectedDoc.url);
            } else if (listContains(contentTypes.video, contentType)) {
                val = options.videoViewer + '?file=' + encodeURIComponent(selectedDoc.url);
            } else if (listContains(contentTypes.audio, contentType)) {
                val = options.audioViewer + '?file=' + encodeURIComponent(selectedDoc.url);
            } else {
                //val = options.noViewer + '?file='+encodeURIComponent(selectedDoc.url);
                val = '';
            }
        } else {
            val = '';
        }
        return val;
    }).extend({async: ''});

    self.filteredDocuments = ko.pureComputed(function() {
        var lcFilter = self.documentFilter().trim().toLowerCase();
        var field = self.documentFilterField();
        return ko.utils.arrayFilter(self.documents(), function(doc) {
            return (doc[field.fun]() || '').toLowerCase().indexOf(lcFilter) !== -1;
        });
    });

    self.docViewerClass = ko.pureComputed(function() {
        return self.selectedDocument() ? 'span6': 'hidden';
    });

    self.docListClass = ko.pureComputed(function() {
        return self.selectedDocument() ? 'span6': 'span12';
    });

    self.showListItem = function(element, index, data) {
        var $elem = $(element);
        $elem.hide(); // element is visible after render, so hide it to animate it appearing.
        $elem.show(100);
    };

    self.hideListItem = function(element, index, data) {
        $(element).hide(100);
    };

    self.findDocumentByRole = function(documents, roleToFind) {
        for (var i=0; i<documents.length; i++) {
            var role = ko.utils.unwrapObservable(documents[i].role);
            var status = ko.utils.unwrapObservable(documents[i].status);
            if (role === roleToFind && status !== 'deleted') {
                return documents[i];
            }
        }
        return null;
    };

    self.links = ko.observableArray();
    self.findLinkByRole = function(links, roleToFind) {
        for (var i=0; i<links.length; i++) {
            var role = ko.utils.unwrapObservable(links[i].role);
            if (role === roleToFind) return links[i];
        }
        return null;
    };
    self.addLink = function(role, url) {
        self.links.push(new DocumentViewModel({
            role: role,
            url: url
        }));
    };
    self.fixLinkDocumentIds = function(existingLinks) {
        // match up the documentId for existing link roles
        var existingLength = existingLinks? existingLinks.length: 0;
        if (!existingLength) return;
        $.each(self.links(), function(i, link) {
            var role = ko.utils.unwrapObservable(link.role);
            for (i = 0; i < existingLength; i++)
                if (existingLinks[i].role === role) {
                    link.documentId = existingLinks[i].documentId;
                    return;
                }
        });
    };
    function pushLinkUrl(urls, links, role) {
        var link = self.findLinkByRole(links, role.role);
        if (link) urls.push({
            link: link,
            name: role.name,
            role: role.role,
            remove: function() {
                self.links.remove(link);
            },
            logo: function(dir) {
                return dir + "/" + role.role.toLowerCase() + ".png";
            }
        });
    }

    self.transients = {};

    self.transients.mobileApps = ko.pureComputed(function() {
        var urls = [], links = self.links();
        for (var i = 0; i < mobileAppRoles.length; i++)
            pushLinkUrl(urls, links, mobileAppRoles[i]);
        return urls;
    });
    self.transients.mobileAppsUnspecified = ko.pureComputed(function() {
        var apps = [], links = self.links();
        for (var i = 0; i < mobileAppRoles.length; i++)
            if (!self.findLinkByRole(links, mobileAppRoles[i].role))
                apps.push(mobileAppRoles[i]);
        return apps;
    });
    self.transients.mobileAppToAdd = ko.observable();
    self.transients.mobileAppToAdd.subscribe(function(role) {
        if (role) self.addLink(role, "");
    });
    self.transients.socialMedia = ko.pureComputed(function() {
        var urls = [], links = self.links();
        for (var i = 0; i < socialMediaRoles.length; i++)
            pushLinkUrl(urls, links, socialMediaRoles[i]);
        return urls;
    });
    self.transients.socialMediaUnspecified = ko.pureComputed(function() {
        var apps = [], links = self.links();
        for (var i = 0; i < socialMediaRoles.length; i++)
            if (!self.findLinkByRole(links, socialMediaRoles[i].role))
                apps.push(socialMediaRoles[i]);
        return apps;
    });
    self.transients.socialMediaToAdd = ko.observable();
    self.transients.socialMediaToAdd.subscribe(function(role) {
        if (role) self.addLink(role, "");
    });

    self.logoUrl = ko.pureComputed(function() {
        var logoDocument = self.findDocumentByRole(self.documents(), 'logo');
        return logoDocument ? (logoDocument.thumbnailUrl ? logoDocument.thumbnailUrl : logoDocument.url) : null;
    });

    self.logoAttributionText = ko.pureComputed(function() {
        var logoDocument = self.findDocumentByRole(self.documents(), 'logo');
        return logoDocument && logoDocument.attribution ? logoDocument.attribution() : null;
    });

    self.bannerUrl = ko.pureComputed(function() {
        var bannerDocument = self.findDocumentByRole(self.documents(), 'banner');
        return bannerDocument ? bannerDocument.url : null;
    });

    self.asBackgroundImage = function(url) {
        return url ? 'url('+url+')' : null;
    };

    self.mainImageUrl = ko.pureComputed(function() {
        var mainImageDocument = self.findDocumentByRole(self.documents(), 'mainImage');
        return mainImageDocument ? mainImageDocument.url : null;
    });

    self.mainImageAttributionText = ko.pureComputed(function() {
        var mainImageDocument = self.findDocumentByRole(self.documents(), 'mainImage');
        return mainImageDocument && mainImageDocument.attribution ? mainImageDocument.attribution() : null;
    });

    self.removeBannerImage = function() {
        self.deleteDocumentByRole('banner');
    };

    self.removeLogoImage = function() {
        self.deleteDocumentByRole('logo');
    };

    self.removeMainImage = function() {
        self.deleteDocumentByRole('mainImage');
    };

    // this supports display of the project's primary images
    self.primaryImages = ko.computed(function () {
        var pi = $.grep(self.documents(), function (doc) {
            return ko.utils.unwrapObservable(doc.isPrimaryProjectImage);
        });
        return pi.length > 0 ? pi : null;
    });


    self.embeddedVideos = ko.computed(function () {
        var ev = $.grep(self.documents(), function (doc) {
            var isPublic = ko.utils.unwrapObservable(doc.public);
            var embeddedVideo = ko.utils.unwrapObservable(doc.embeddedVideo);
            if(isPublic && embeddedVideo) {
                var iframe = buildiFrame(embeddedVideo);
                if(iframe){
                    doc.iframe = iframe;
                    return doc;
                }
            }
        });
        return ev.length > 0 ? ev : null;
    });

    self.deleteDocumentByRole = function(role) {
        var doc = self.findDocumentByRole(self.documents(), role);
        if (doc) {
            if (doc.documentId) {
                doc.status = 'deleted';
                self.documents.valueHasMutated(); // observableArrays don't fire events when contained objects are mutated.
            }
            else {
                self.documents.remove(doc);
            }
        }
    };

    self.ignore = ['documents', 'links', 'logoUrl', 'bannerUrl', 'mainImageUrl', 'primaryImages', 'embeddedVideos',
        'ignore', 'transients', 'documentFilter', 'documentFilterFieldOptions', 'documentFilterField',
        'previewTemplate', 'selectedDocumentFrameUrl', 'filteredDocuments','docViewerClass','docListClass',
        'mainImageAttributionText', 'logoAttributionText'];

}

/* From:
 * jQuery File Upload User Interface Plugin 6.8.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
function formatBytes(bytes) {
    if (typeof bytes !== 'number') {
        return '';
    }
    if (bytes >= 1000000000) {
        return (bytes / 1000000000).toFixed(2) + ' GB';
    }
    if (bytes >= 1000000) {
        return (bytes / 1000000).toFixed(2) + ' MB';
    }
    return (bytes / 1000).toFixed(2) + ' KB';
}

function buildiFrame(embeddedVideo){
    var html = $.parseHTML(embeddedVideo);
    var iframe = "";
    if(html){
        for(var i = 0; i < html.length; i++){
            var element = html[i];
            var attr = $(element).attr('src');
            if(typeof attr !== typeof undefined && attr !== false){
                var height =  element.getAttribute("height") ?  element.getAttribute("height") : "315";
                iframe = isUrlAndHostValid(attr)  ? '<iframe width="100%" src ="' +  attr + '" height = "' + height + '"/></iframe>' : "";
            }
            return iframe;
        }
    }

    return iframe;
}

function isUrlAndHostValid(url) {
    var allowedHost = ['fast.wistia.com','embed-ssl.ted.com', 'www.youtube.com', 'player.vimeo.com'];
    return (url && isUrlValid(url) && $.inArray(getHostName(url), allowedHost) > -1)
};

function isUrlValid(url) {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
};

function getHostName(href) {
    var l = document.createElement("a");
    l.href = href;
    return l.hostname;
};

// $(window).load(function () {
//     console.log('Before parsing');
//     //var documents = JSON.parse('${documents.toString()}');
//     //var documents = JSON.parse('\u005b\u007b\u0022filepath\u0022:\u00222016-04\u0022\u002c\u0022status\u0022:\u0022active\u0022\u002c\u0022labels\u0022:\u005b\u005d\u002c\u0022lastUpdated\u0022:\u00222016-04-14T04:41:36Z\u0022\u002c\u0022contentType\u0022:\u0022image\u002fpng\u0022\u002c\u0022type\u0022:\u0022image\u0022\u002c\u0022isPrimaryProjectImage\u0022:false\u002c\u0022url\u0022:\u0022https:\u002f\u002fecodata-test.ala.org.au\u002fuploads\u002f2016-04\u002fScreen%20Shot%202016-02-04%20at%2010.34.23%20PM.png\u0022\u002c\u0022thirdPartyConsentDeclarationMade\u0022:false\u002c\u0022id\u0022:\u0022570f1f80e4b0475d032c5bc2\u0022\u002c\u0022thirdPartyConsentDeclarationText\u0022:\u0022null\u0022\u002c\u0022filesize\u0022:83033\u002c\u0022readOnly\u0022:false\u002c\u0022thumbnailUrl\u0022:\u0022https:\u002f\u002fecodata-test.ala.org.au\u002fuploads\u002f2016-04\u002fthumb_Screen%20Shot%202016-02-04%20at%2010.34.23%20PM.png\u0022\u002c\u0022name\u0022:\u0022Test\u0022\u002c\u0022dateCreated\u0022:\u00222016-04-14T04:41:36Z\u0022\u002c\u0022filename\u0022:\u0022Screen Shot 2016-02-04 at 10.34.23 PM.png\u0022\u002c\u0022role\u0022:\u0022mdba\u0022\u002c\u0022systemId\u0022:\u0022mdba\u0022\u002c\u0022documentId\u0022:\u00225a9f0657-1fd8-410e-8726-de482d080d60\u0022\u002c\u0022isSciStarter\u0022:false\u007d\u002c\u007b\u0022filepath\u0022:\u00222016-04\u0022\u002c\u0022status\u0022:\u0022active\u0022\u002c\u0022labels\u0022:\u005b\u005d\u002c\u0022lastUpdated\u0022:\u00222016-04-14T05:34:03Z\u0022\u002c\u0022contentType\u0022:\u0022application\u002fmsword\u0022\u002c\u0022type\u0022:\u0022application\u0022\u002c\u0022isPrimaryProjectImage\u0022:false\u002c\u0022url\u0022:\u0022https:\u002f\u002fecodata-test.ala.org.au\u002fuploads\u002f2016-04\u002f0_Testing%20with%20a%20space.doc\u0022\u002c\u0022thirdPartyConsentDeclarationMade\u0022:false\u002c\u0022id\u0022:\u0022570f2bcbe4b0475d032c5bd4\u0022\u002c\u0022thirdPartyConsentDeclarationText\u0022:\u0022null\u0022\u002c\u0022filesize\u0022:21842\u002c\u0022readOnly\u0022:false\u002c\u0022name\u0022:\u0022Testing with a space\u0022\u002c\u0022dateCreated\u0022:\u00222016-04-14T05:34:03Z\u0022\u002c\u0022filename\u0022:\u00220_Testing with a space.doc\u0022\u002c\u0022role\u0022:\u0022mdba\u0022\u002c\u0022systemId\u0022:\u0022mdba\u0022\u002c\u0022documentId\u0022:\u00222a8e40ac-b523-4ce1-96a0-886eb89f8449\u0022\u002c\u0022isSciStarter\u0022:false\u007d\u002c\u007b\u0022filepath\u0022:\u00222016-04\u0022\u002c\u0022status\u0022:\u0022active\u0022\u002c\u0022labels\u0022:\u005b\u005d\u002c\u0022lastUpdated\u0022:\u00222016-04-14T07:16:09Z\u0022\u002c\u0022contentType\u0022:\u0022image\u002fjpeg\u0022\u002c\u0022type\u0022:\u0022image\u0022\u002c\u0022isPrimaryProjectImage\u0022:false\u002c\u0022url\u0022:\u0022https:\u002f\u002fecodata-test.ala.org.au\u002fuploads\u002f2016-04\u002fMDBA_AG_crest_RGB_inline_small.jpg\u0022\u002c\u0022thirdPartyConsentDeclarationMade\u0022:false\u002c\u0022id\u0022:\u0022570f43b8e4b0475d032c5bdc\u0022\u002c\u0022thirdPartyConsentDeclarationText\u0022:\u0022null\u0022\u002c\u0022filesize\u0022:37490\u002c\u0022readOnly\u0022:false\u002c\u0022thumbnailUrl\u0022:\u0022https:\u002f\u002fecodata-test.ala.org.au\u002fuploads\u002f2016-04\u002fthumb_MDBA_AG_crest_RGB_inline_small.jpg\u0022\u002c\u0022name\u0022:\u0022Test doc 2\u0022\u002c\u0022dateCreated\u0022:\u00222016-04-14T07:16:09Z\u0022\u002c\u0022filename\u0022:\u0022MDBA_AG_crest_RGB_inline_small.jpg\u0022\u002c\u0022role\u0022:\u0022mdba\u0022\u002c\u0022systemId\u0022:\u0022mdba\u0022\u002c\u0022documentId\u0022:\u002291e513a6-e8e3-4cde-b3d0-8e3ee0312d7c\u0022\u002c\u0022isSciStarter\u0022:false\u007d\u002c\u007b\u0022status\u0022:\u0022active\u0022\u002c\u0022labels\u0022:\u005b\u005d\u002c\u0022embeddedVideo\u0022:\u0022\u003ciframe width=\u005c\u0022560\u005c\u0022 height=\u005c\u0022315\u005c\u0022 src=\u005c\u0022https:\u002f\u002fwww.youtube.com\u002fembed\u002fSi4f4waKW-M\u005c\u0022 frameborder=\u005c\u00220\u005c\u0022 allowfullscreen\u003e\u003c\u005cu002fiframe\u003e\u0022\u002c\u0022lastUpdated\u0022:\u00222016-04-22T02:36:58Z\u0022\u002c\u0022isPrimaryProjectImage\u0022:false\u002c\u0022url\u0022:\u0022\u0022\u002c\u0022thirdPartyConsentDeclarationMade\u0022:false\u002c\u0022id\u0022:\u002257198e4ae4b0c7a05c99cc4a\u0022\u002c\u0022thirdPartyConsentDeclarationText\u0022:\u0022\u007b\u007d\u0022\u002c\u0022readOnly\u0022:false\u002c\u0022name\u0022:\u0022Basin Champions video 1\u0022\u002c\u0022dateCreated\u0022:\u00222016-04-22T02:36:58Z\u0022\u002c\u0022role\u0022:\u0022mdba\u0022\u002c\u0022systemId\u0022:\u0022mdba\u0022\u002c\u0022documentId\u0022:\u0022f2fc30aa-7cb6-45a0-ad73-cc6eff4750b8\u0022\u002c\u0022isSciStarter\u0022:false\u007d\u005d');
//
//     var docListViewModel = new DocListViewModel(options.documents || [], options);
//
//     console.log('-- Applying bindings');
//     try{
//         ko.applyBindings(docListViewModel, document.getElementById('resourceList'));
//     } catch (e)
//     {
//         log.warn(e);
//         log.warn("Is this double initialisation or something else");
//     }
//
//     console.log('-- Finished applying bindings');
// });