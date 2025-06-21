/*
 * Created by Tracy Alaburda on 11/3/2017	
 */

function onBeforeSubmit(type) {

    nlapiLogExecution('DEBUG', 'type', type);

    if (type == 'create' || type == 'edit' || type == 'copy') {

        var oldDepartment = null, oldRecord = nlapiGetOldRecord();
        if (oldRecord)
            oldDepartment = oldRecord.getFieldValue('department');

        var newDepartment = nlapiGetFieldValue('department');
        nlapiLogExecution('DEBUG', 'newDepartment', newDepartment);
        if ((type == 'create' || type == 'copy')
            || (type == 'edit' )) {  //&& oldDepartment != newDepartment

            var lineItemCount = parseInt(nlapiGetLineItemCount('item'));
            nlapiLogExecution('DEBUG', 'lineItemCount', lineItemCount);
            for (var i = 1; i <= lineItemCount; i++) {
                nlapiSelectLineItem('item', i);
                nlapiSetCurrentLineItemValue('item', 'department', newDepartment, false, true);
                nlapiCommitLineItem('item');
            }
        }
    }
}