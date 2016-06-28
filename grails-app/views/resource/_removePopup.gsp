<r:require modules="resourceKnockout,attachDocuments"/>
<!-- ko stopBinding: true -->
<div id="removeDocument" class="modal fade" style="display:none;">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title" id="title">Confirm Remove</h4>
            </div>
            <div class="modal-body">
                <form class="form-horizontal validationContainer" id="removeConfirmationForm">
                    <span>Are you sure you want to remove resource '</span><span data-bind="text: name"> </span><span>'?</span>
                </form>
            </div>
            <div class="modal-footer control-group">
                <div class="controls">
                    <button type="button" class="btn btn-success"
                            data-bind="click:doRemove" title="Click Yes to remove.">Yes</button>
                    <button class="btn" data-dismiss="modal" title="Click No to go back." data-bind="click:cancelRemove">No</button>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- /ko -->
