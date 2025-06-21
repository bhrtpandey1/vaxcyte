/**
 * Created by Huzaifa on 7/30/2017.
 */

function onBeforeSubmit(type) {

    nlapiLogExecution('DEBUG', 'type', type);

    if (type == 'create' || type == 'edit' || type == 'copy') {

        var oldRequester = null, oldRecord = nlapiGetOldRecord();
        if (oldRecord)
            oldRequester = oldRecord.getFieldValue('entity');

        var newRequester = nlapiGetFieldValue('entity');
        var newSubmittingonBehalfof = nlapiGetFieldValue('custbody_submitting_on_behalf_of');

		nlapiLogExecution('DEBUG', 'newRequester', newRequester);
        if ((type == 'create' || type == 'edit' || type == 'copy')) {
		               //&& oldRequester != newRequester

            var lineItemCount = parseInt(nlapiGetLineItemCount('item'));
            nlapiLogExecution('DEBUG', 'lineItemCount', lineItemCount);
            for (var i = 1; i <= lineItemCount; i++) {  
                nlapiSelectLineItem('item', i);
              if (newSubmittingonBehalfof == null || newSubmittingonBehalfof === '') {
                nlapiLogExecution('DEBUG', 'Setting Requestor to:', newRequester);              // Added by JRose
                nlapiSetCurrentLineItemValue('item', 'custcol_requisition_requestor', newRequester, false, true);
              } else {
                nlapiLogExecution('DEBUG', 'Setting Requestor to:', newSubmittingonBehalfof);   // Added by JRose
                nlapiSetCurrentLineItemValue('item', 'custcol_requisition_requestor', newSubmittingonBehalfof, false, true);
              }
              nlapiCommitLineItem('item');
            }
        }
    }
}