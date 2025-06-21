/**
* Copyright (c) 1998-2016 NetSuite, Inc.
* 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
* All Rights Reserved.
* 
* This software is the confidential and proprietary information of
* NetSuite, Inc. ("Confidential Information"). You shall not
* disclose such Confidential Information and shall use it only in
* accordance with the terms of the license agreement you entered into
* with NetSuite.
* 
* The scheduled script that uncheck give access on matched employee results on non production account
* 
* Version Type    Date              Author              Remarks
* 1.00    Create  1/28/2016         Rose Ann Ilagan     Initial Commit
*/


/**
* NSTS | GAW - Global Rule App Flow WA
* ustomscript_nsts_gaw_apprvl_flow_wa
* Returns details for the next approver
* @param (null)
* @return the object
* @type 
* @author:  Jaime Villafuerte
* @edited:  rilagan 03/12/2015
* @version 1.0
*/
var HC_EMAIL_TEMPLATE_SUMMARY_APPROVE_JE 		= 'custscript_nsts_gaw_apprv_jes';
var HC_EMAIL_RECIPIENT_SUMMARY_JE				= 'custscript_nsts_gaw_summ_je_email_recip';
var HC_APPROVE_SUCCESSFUL_STATUS 				= 'SUCCESSFUL';
var HC_APPROVE_ERROR_STATUS 					= 'ERROR';
var stEmailSender       						= nlapiGetContext().getPreference('custscript_nsts_gaw_email_sender');
var stRecipient       							= nlapiGetContext().getPreference('custscript_nsts_gaw_summ_je_email_recip');

function triggerWorkflow(type) {
	try{
		var stTransRecordType = nlapiGetContext().getSetting('SCRIPT', 'custscript_nsts_gawtrigrectype');
        var intRecordId = nlapiGetContext().getSetting('SCRIPT', 'custscript_nsts_gawtrigrecid');
        var stworkflow_id = nlapiGetContext().getSetting('SCRIPT', 'custscript_nsts_gawtrigwfid');
        var wact_gaw_submit_btn = nlapiGetContext().getSetting('SCRIPT', 'custscript_nsts_gawtrigsubmit');
        
        nlapiLogExecution("DEBUG", "triggerGawSubmitOnCSV", "stTransRecordType:" + stTransRecordType +" intRecordId:" + intRecordId + " stworkflow_id:" + stworkflow_id + " wact_gaw_submit_btn:" + wact_gaw_submit_btn);
        var stRes = nlapiTriggerWorkflow(stTransRecordType, intRecordId, stworkflow_id, wact_gaw_submit_btn);
	}catch(err){
		nlapiLogExecution('error','test',err.toString());
	}
}


function processAutoApproveJEs(type) {
	try{
		nlapiLogExecution('DEBUG','SCRIPT START','-------------------------------------------------------------');
		initializeMappingFields('journalentry');
		var objJEs = nlapiSearchRecord('transaction', SS_SYSTEM_GENERATED_JES);

    	var arrStatus = new Array();
    	var stRecordURL = '';
		for (var i = 0; i < objJEs.length; i++){
			var objResult = new Object();
			objResult.transactionnumber = objJEs[i].getValue('transactionnumber', null, 'GROUP');
			objResult.recordtype 		= objJEs[i].getValue('recordtype', null, 'GROUP');
			objResult.tranid 		= objJEs[i].getValue('tranid', null, 'GROUP');
			try{
				var stInternalId = objJEs[i].getValue('internalid', null, 'GROUP');
		        nlapiLogExecution('ERROR','objRec',objRec);
		        stRecordURL         = nlapiResolveURL('RECORD', 'journalentry', stInternalId);
				var objRec = approveJE(objJEs[i]);
				objResult.status = HC_APPROVE_SUCCESSFUL_STATUS;
				
		        nlapiLogExecution('ERROR','stRecordURL','stRecordURL: '+stRecordURL);
			}catch(error){
				objResult.details = error.toString();
				objResult.status = HC_APPROVE_ERROR_STATUS;
			}
			objResult.url = stRecordURL;
			isUsageLimitExceeded('Result no: '+i+ ': Internal ID: '+objResult.transactionnumber);
			arrStatus.push(objResult);
		}
		
		//Summarize Results
		var stContent = '';
		for (var i = 0; i < objJEs.length; i++){
			stContent = stContent + setTableEmailContent(arrStatus[i]);
			nlapiLogExecution('ERROR','CONTENT',setTableEmailContent(arrStatus[i]));
		}
		
		//Send Email Summary
        var stEmailTemplateId = nlapiGetContext().getPreference(HC_EMAIL_TEMPLATE_SUMMARY_APPROVE_JE);
        var stRecipient = nlapiGetContext().getPreference(HC_EMAIL_RECIPIENT_SUMMARY_JE);
        nlapiLogExecution('ERROR','TO SEND','stEmailSender: '+stEmailSender+ ' stRecipient: '+stRecipient+ ' stEmailTemplateId: '+stEmailTemplateId );
		if((stEmailSender) && (stEmailTemplateId) && (stRecipient)){
			try{
		    	var objSummaryEmailTemplate = nlapiLoadRecord('emailtemplate',stEmailTemplateId);
		        var stBody 					= objSummaryEmailTemplate.getFieldValue('content');
		        var stSubject 				= objSummaryEmailTemplate.getFieldValue('subject');
		        stBody    					= replaceAll('{tableSummary}',createEmailContent(stContent),stBody);
		        var tranrecord              = [];
		    	tranrecord['entity']   		= stEmailSender;
		    	var arrEmail 				= getArrayFromCommaSeparatedString(stRecipient);
	            nlapiLogExecution('ERROR','orig recip',JSON.stringify(arrEmail));
		    	var arrValidEmail			= [];
		        if(!isEmpty(arrEmail)){
		            for(var i=0;i<arrEmail.length;i++){
		                if(validateEmail(arrEmail[i])){
		                	arrValidEmail.push(arrEmail[i]);
		                }
		            }
		        }

	            nlapiLogExecution('ERROR','TO SEND',JSON.stringify(arrValidEmail));
		        if(arrValidEmail.length > 0){
		            nlapiSendEmail(stEmailSender, arrValidEmail, stSubject, stBody, null, null, tranrecord);
		            nlapiLogExecution('ERROR','SENT',JSON.stringify(arrValidEmail));
		        }
			}catch(error){
				defineError('Send Summary Email', error);
			}
		}else{
			 nlapiLogExecution('ERROR','ERROR ON SETUP','NO EMAIL SENDER/EMAIL TEMPLATE/VALID RECIPIENTS');
		}
	}catch(error){
		defineError('processAutoApproveJEs', error);
	}
	nlapiLogExecution('DEBUG','SCRIPT END','-------------------------------------------------------------');
}

/*
*Approve JE
*/
function approveJE(objJE){
	var objRec = null;
	var stInternalId 	= objJE.getValue('internalid', null, 'GROUP');
	var objConf 		= nlapiLoadConfiguration('accountingpreferences'); 
	var bJEApproval 	= objConf.getFieldValue('CUSTOMAPPROVALJOURNAL');
	var objRec 			= nlapiLoadRecord('journalentry', stInternalId);
		
	objRec.setFieldValue(FLD_APPROVAL_STATUS,HC_STATUS_APPROVED);
	if(bJEApproval == 'T'){
		objRec.setFieldValue('approvalstatus',HC_STATUS_APPROVED);
		nlapiSubmitRecord(objRec,false,true);
	}else{
		objRec.setFieldValue('approved','T');
		nlapiSubmitRecord(objRec,false,true);			
	}
	return objRec;
}


/*
*Get Usage Limit
*/
function isUsageLimitExceeded(stNote){

	try{		
		intCurrentUsage = parseInt(nlapiGetContext().getRemainingUsage());
		if (intCurrentUsage <= 1000)
		{ 
			var state = nlapiYieldScript();
			nlapiLogExecution('debug', 'Script yield','usage: '+intCurrentUsage+ ' status: '+state.status+ ' reason: '+state.reason+ 'stNote: '+stNote);
			if( state.status == 'FAILURE'){
				nlapiLogExecution('ERROR', 'Script yield error','usage: '+intCurrentUsage+ ' status: '+state.status+ ' reason: '+state.reason);
				return true;
			}
		}
		return false;
	}catch(error){
		nlapiLogExecution('error', 'isUsageLimitExceeded',error.toString());
	}
}

/*
*Get User entity ID
*/
function getUser(stId){
	var objEmp = nlapiLookupField('employee', stId, ['entityid']);
	var stName = objEmp['entityid'];
	return stName;
}


/**
* Set row html tag on sandbox email content
* @param 
* @returns {null} 
* @author Rose Ann Ilagan
* @version 1.0
*/
function setTableEmailContent(objResult){
	var stBgColor 	= '#ff0000';
	var stStatus	= objResult.status; 
	var stDetails	= objResult.details; 
	
	if(!stDetails)
		stDetails = '';
	if(stStatus == HC_APPROVE_SUCCESSFUL_STATUS){
		stBgColor = '#008000';
		stStatus = HC_APPROVE_SUCCESSFUL_STATUS;
	}
	if(stStatus == HC_APPROVE_ERROR_STATUS){
		stBgColor = 'ff0000';
		stStatus = HC_APPROVE_ERROR_STATUS;
	}
	return "<tr><td><a href='"+objResult.url+"'>"+objResult.transactionnumber+'</a></td><td>'+objResult.tranid+'</td><td bgcolor='+stBgColor+"><span style='color:white;'><b>"+objResult.status+'</b></span></td><td>'+stDetails+'</td></tr>';
}

/**
* Create  Email Content
* @param 
* @returns {null} 
* @author Rose Ann Ilagan
* @version 1.0
*/
function createEmailContent(details){
	var stContent = '';			
		stContent = '<table border="1" style="width:100%"><tr><th>Transaction Number</th><th>Entry Number</th><th>Status</th><th>Details</th></tr>'+details+'</table>';
	return stContent;
}


/**
 * Return unique array 
 */
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index; 
}

/**
 * Return array with non empty literals
 */
function onlyNonEmpty(e){ 
    if(!isEmpty(e))
        return e;
}

/**
 * Filter Array
 */
function getUniqueArray(arrStr){
    if(!isEmpty(arrStr)){
          var arrUniq = arrStr.filter(onlyUnique);
          if(!isEmpty(arrUniq)){
              var arrFinal = arrUniq.filter(onlyNonEmpty);
              if(!isEmpty(arrFinal)){
                  return arrFinal;
              }
          }
    }
    return null;
}

/**
 * Get array from comma separated string
 */
function getArrayFromCommaSeparatedString(stWord){
    if(!isEmpty(stWord)){
        var arrStr = stWord.split(',');
        var arrValidEmail = [];
        if(!isEmpty(arrStr)){
            for(var i=0;i<arrStr.length;i++){
                if(!isEmpty(arrStr[i])){
                    arrStr[i] = arrStr[i].toLowerCase();
                    arrStr[i] = arrStr[i].replace(/\s+/g, '');
                    
                }
            }
            return getUniqueArray(arrStr);
        }
    }
    return null;
}

/**
 * Validate Email Address
 */
function validateEmail(email) {     
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;    
    return re.test(email); 
}

/**
 * Get valid email addresses from array
 */
function getEmailAddress(arrStr){
    if(!isEmpty(arrStr)){
         var arrFinal = x.filter(
                        function(e){
                            if(validateEmail(e))
                                return e;
                        });
         if(!isEmpty(arrFinal)){
             return arrFinal;
         }
    }
    return null;
}

/**
* Check if object is empty
* @param {string/object type}
* @returns {Object} 
* @author Rose Ann Ilagan
* @version 1.0
*/
function isEmpty(value){
    if (value == null || value == 'null' || value == undefined || value == '' || value == "" || value.length <= 0) { return true; }
    return false;
}