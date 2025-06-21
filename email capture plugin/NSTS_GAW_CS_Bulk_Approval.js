/**
* Copyright (c) 1998-2015 NetSuite, Inc.
* 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
* All Rights Reserved.
* 
* This software is the confidential and proprietary information of
* NetSuite, Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with NetSuite.
* 
* This script contains Client Script used in advanced Bulk approval
* 
* Version Type    Date            Author           Remarks
* 1.00    Create  3 Nov 2015     Jaime Villafuerte III
* 3.00    Update  3 Nov 2015     Dennis Geronimo
*/

function displayBulkApproval_OnPageInit()
{
    var stSelAct = nlapiGetFieldValue('custpage_bulk_select'); 
    
    if(stSelAct)
    {
        return true;
    }
    
    nlapiSetFieldValue('custpage_bulk_trantype','',false,true);
    nlapiSetFieldValue('custpage_bulk_trantypetxt','',false,true);
    nlapiSetFieldValue('custpage_bulk_tranno','',false,true);
    
    nlapiDisableField('custpage_bulk_trantype',true);
    nlapiDisableField('custpage_bulk_tranno',true);
    return true;
}

function bulkApprovalValidation_SaveRecord()
{
    var stSelAct = nlapiGetFieldValue('custpage_bulk_select'); 
    var SUBMIT = '1';
    var APPROVE = '2';
    var REJECT = '3';
    var SUPER = '4';
    

    var intErrorCount = 0;
    var arrErrors = [];
    var count = nlapiGetLineItemCount('custpage_bulk_sublist');
    var hasSelected = false;
    var arrSelCount = 0;
    
    
    var intMaxPage = nlapiGetFieldValue('custpage_bulk_curpage');
    intMaxPage = parseInt(intMaxPage);
    if(intMaxPage > 10000){
        arrErrors.push('Current Page should be less or equal 10,000');
        intErrorCount++;
    }
    
    
    for(var i=1; i<=count; i++)
    {
        var stSelected = nlapiGetLineItemValue('custpage_bulk_sublist','custpage_bulk_sub_select',i);
        if(stSelected=='T')
        {
            hasSelected = true;
            arrSelCount++;
            
            if(stSelAct == REJECT){
                var stReason =  nlapiGetLineItemValue('custpage_bulk_sublist','custpage_bulk_sub_reason',i);

                stReason = stReason.trim();
                console.log(stReason + " : " + isEmptyVariantVar(stReason));
                if(isEmptyVariantVar(stReason)){
                    arrErrors.push('Reason for Rejection is missing in line: ' + i);
                    intErrorCount++;
                }
            }
            
        }
    }
    
    if(!hasSelected)
    {
        //alert("Please select transaction to process");
        arrErrors.push('Please select transaction/s to process.');
        intErrorCount++;
    }
    
    if(arrSelCount > 50)
    {
        //alert("You are only allowed to process up to 50 transaction.");
        arrErrors.push('You are only allowed to process up to 50 transactions.');
        intErrorCount++;
    }
    
    if(intErrorCount>0){
        alert(arrErrors.join("\n"));
        return false;
    }
    
    return true;
}

jQuery(document.forms[0]).submit(function(){
    
    var stSelAct = nlapiGetFieldValue('custpage_bulk_select'); 
    var SUBMIT = '1';
    var APPROVE = '2';
    var REJECT = '3';
    var SUPER = '4';
    

    var intErrorCount = 0;
    var count = nlapiGetLineItemCount('custpage_bulk_sublist');
    var hasSelected = false;
    var arrSelCount = 0;
    
    var intMaxPage = nlapiGetFieldValue('custpage_bulk_curpage');
    intMaxPage = parseInt(intMaxPage);
    if(intMaxPage > 10000){
        intErrorCount++;
    }
    
    for(var i=1; i<=count; i++)
    {
        var stSelected = nlapiGetLineItemValue('custpage_bulk_sublist','custpage_bulk_sub_select',i);
        if(stSelected=='T')
        {
            hasSelected = true;
            arrSelCount++;
            
            if(stSelAct == REJECT){
                var stReason =  nlapiGetLineItemValue('custpage_bulk_sublist','custpage_bulk_sub_reason',i);

                stReason = stReason.trim();
                if(isEmptyVariantVar(stReason)){
                    intErrorCount++;
                }
            }
            
        }
    }
    
    if(!hasSelected)
    {

        intErrorCount++;
    }
    
    if(arrSelCount > 50)
    {
        intErrorCount++;
    }
    
    if(intErrorCount <= 0){
        disableAllButton();
    }

})


function displayOnAction_FieldChange(type, name, line) {
    if (name == 'custpage_bulk_select' || name == 'custpage_bulk_trantype' || name == 'custpage_bulk_tranno' || name == 'custpage_bulk_curpage') {
        nlapiSetFieldDisabled('submitter', true)
        nlapiDisableField("secondarysubmitter", true);
        jQuery("#tr_secondarysubmitter").attr("class", "pgBntG pgBntBDis")
        nlapiSetFieldDisabled('custpage_bulk_curpage',true);

                
        if (name != 'custpage_bulk_curpage') {
            nlapiSetFieldValue('custpage_bulk_curpage', 1, false);
        }
        
        if (name == 'custpage_bulk_trantype') {
            var stTranTypeTxt = nlapiGetFieldText('custpage_bulk_trantype');
            nlapiSetFieldValue('custpage_bulk_trantypetxt', stTranTypeTxt, false, true);
        } 

        
        nlapiSetFieldValue('custpage_bulk_action', 'SEARCH', false, true);
        window.ischanged = false;

        disableAllButton();
        if (name == 'custpage_bulk_select' || name == 'custpage_bulk_curpage') {
            nlapiSetFieldDisabled('custpage_bulk_curpage',false);
            nlapiSetFieldDisabled('custpage_search',true)
            nlapiDisableField("secondarycustpage_search", true);
            jQuery("#tr_secondarycustpage_search").attr("class","pgBntG pgBntBDis");
            
            if(name == 'custpage_bulk_curpage'){
                showSearchStatus("Page Navigation in Progress...");
            }else{
                showSearchStatus();
            }

            document.forms['main_form'].submit();
        }

        return true;

    }

    return true;
}

function execSearch(){
    showSearchStatus();
    nlapiSetFieldValue('custpage_bulk_action','');
    window.ischanged = false; 
    document.forms[0].submit();

    
    var intMaxPage = nlapiGetFieldValue('custpage_bulk_curpage');
    intMaxPage = parseInt(intMaxPage);
    if(intMaxPage > 10000){
        alert('Current Page should be less or equal 10,000');
        return;
    }
    
    disableAllButton();
}

function execReset(url){
    document.location= url;
    window.ischanged=false;
    disableAllButton();
}

function disableAllButton(){
    nlapiSetFieldDisabled('submitter',true)
    nlapiDisableField("secondarysubmitter", true);
    jQuery("#tr_secondarysubmitter").attr("class","pgBntG pgBntBDis")
    
    
    nlapiSetFieldDisabled('custpage_next',true);
    jQuery("#tdbody_custpage_next").attr("class","pgBntG pgBntBDis")
    jQuery("#tdbody_custpage_next").attr("style","display:none;");
    
    nlapiSetFieldDisabled('custpage_prev',true);
    jQuery("#tdbody_custpage_prev").attr("class","pgBntG pgBntBDis");
    jQuery("#tdbody_custpage_prev").attr("style","display:none;");
    
}

function gotoPage(page){
    showSearchStatus("Page Navigation in Progress...");
    nlapiSetFieldValue('custpage_bulk_curpage', page);
    nlapiSetFieldValue('custpage_bulk_action','');
    window.ischanged = false; 
    disableAllButton();
    document.forms[0].submit();

}


function isEmpty(stValue)
{
    if (isNullOrUndefined(stValue)){
        return true;
    }

    if (stValue == null){
        return true;
    }
    if(typeof stValue == 'number')
        stValue = stValue.toString();
    if (stValue.length == 0){
        return true;
    }
    if (stValue.trim() == 'null'){
        return true;
    }
    return false;
}

function isNullOrUndefined(value)
{
    if (value === null){
        return true;
    }

    if (value === undefined){
        return true;
    }
    
    if(isNaN(value)){
        return true;
    }
    return false;
}

function isEmptyVariantVar(value){
    if (value == null || value == 'null' || value == undefined || value == '' || value == "" || value.length <= 0) { return true; }
    return false;
}

function showSearchStatus(msg){
    msg = isEmptyVariantVar(msg)? 'Searching Transaction in Progress...': msg;
    var HC_MSG_PROCESSING = '<span style="background: #E6E65C; font-weight: bold; font-size: 15px; margin-bottom: 100px; padding: 5px; color: #333; line-height: 40px;">' + msg + '</span>';
    nlapiSetFieldValue("custpage_bulk_searchstatus", HC_MSG_PROCESSING);
}

