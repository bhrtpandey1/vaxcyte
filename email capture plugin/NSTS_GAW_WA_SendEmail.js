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
* This script contains workflow action used in generating and updating approver list or mainly the general approval workflow
* 
* Version Type    Date            Author                                Remarks
* 1.00    Create  06 Mar 2014     Russell Fulling
* 1.01    Edit    29 May 2014     Jaime Villafuerte III/Dennis Geronimo
* 1.02    Edit    2 Mar 2015      Rose Ann Ilagan
* 2.00    Edit    16 Mar 2015     Rachelle Ann Barcelona                Added TDD Enhancements
* 2.00    Edit    16 Mar 2015     Rose Ann Ilagan                       Optimize code and added email approval authentication
*/

//**********************************************************************GLOBAL VARIABLE DECLARATION - STARTS HERE**********************************************//

var stEmailSender       = nlapiGetContext().getPreference('custscript_nsts_gaw_email_sender');
var stInternalId        = nlapiGetRecordId();
var stBaseRecordType    = nlapiGetRecordType();
var stInternalId        = nlapiGetRecordId();
var stRecordUrl         = null;
var objPDFTrans         = null;
var stRuleResult        = nlapiGetContext().getSetting('SCRIPT', 'custscript_nsts_gaw_rule_app_param1');
var stApprvLink         = nlapiGetContext().getSetting('SCRIPT', 'custscript_nsts_gaw_apprv_link');
var stRejcLink          = nlapiGetContext().getSetting('SCRIPT', 'custscript_nsts_gaw_rej_link');
var stSendingEmailFor   = nlapiGetContext().getSetting('SCRIPT', 'custscript_nsts_sending_email_for');
var bOneWorld   		= nlapiGetContext().getSetting('SCRIPT', 'custscript_nsts_gaw_is_one_world_acct');


var pendingLineApprovals = '';
var pendingLineApprovals_OrgAprover = ''
if(stBaseRecordType)
    stBaseRecordType = stBaseRecordType.toUpperCase();

var CONTS_OTHER_PDF_TEMPLATE = null;

var stBaseRecordTypeLabel = getTransactionRecordTypeName(stBaseRecordType);



//**********************************************************************GLOBAL VARIABLE DECLARATION - ENDS HERE*****************************************************//

/**
* Workflow Action   : NSTS | GAW - Send Email Action WA
*                   : customscript_nsts_gaw_send_email_wa
* Send email action
* @param (null)
* @return string 
* @type null
* @author Rose Ann Ilagan
* @version 1.0
*/
function sendEmailAction(){
    var stLogTitle = 'SENDEMAILACTION';
    var bReturn = 'F';
    var bResult = false;
    
    if(stSendingEmailFor == "approve" || stSendingEmailFor == "reject"){
        sendEmailForApproveReject(stRuleResult);
        return "T";
    }
    
    
    try{
        if(stEmailSender){
            var objRecord           = JSON.parse(stRuleResult);         
            var objTrans            = JSON.parse(objRecord['trans']);
            var bEnablePlugin       = 'T';
            var stBundle            = nlapiGetContext().getSetting('SCRIPT', 'custscript_nsts_gaw_bundle_id');
            var stECPAddress        = null;
            stRecordUrl             = nlapiResolveURL('RECORD', stTransRecordType, stInternalId);
            var objLoadRecord		= nlapiLoadRecord(stTransRecordType,stInternalId);
            try{
                objPDFTrans			= nlapiPrintRecord('TRANSACTION', stInternalId, 'DEFAULT', null);
                var stPDFId			= objLoadRecord.getFieldValue('tranid');
                if(isEmptyVariantVar(stPDFId))
                	stPDFId			= objLoadRecord.getFieldValue('transactionnumber');
                objPDFTrans.setName(stTransRecordType+'_'+stPDFId +'.pdf');
            }catch(error){
                objPDFTrans = null;
                var objFileTemplate = null;
                if(isEmptyVariantVar(CONTS_OTHER_PDF_TEMPLATE)){
                    var arrfilters = [];
                    arrfilters.push(new nlobjSearchFilter("name", null, 'is', "NSTS - GAW VBJEIJE PDF template.html"));
                    arrfilters.push(new nlobjSearchFilter("description", null, "startswith", "[GAW_FILE]"));
                    
                    var arrRes = nlapiSearchRecord("file", null, arrfilters);
                    
                    if(!isEmptyVariantVar(arrRes)){
                        CONTS_OTHER_PDF_TEMPLATE = arrRes[0].getId();
                    }
                    
                }
                if(!isEmptyVariantVar(CONTS_OTHER_PDF_TEMPLATE)){
                    try{
                        objFileTemplate = nlapiLoadFile(CONTS_OTHER_PDF_TEMPLATE);
                        var stTemplate = objFileTemplate.getValue();
                        var objRenderer = nlapiCreateTemplateRenderer();
                        objRenderer.setTemplate(stTemplate);
                        objRenderer.addRecord('record',objLoadRecord);
                        stTemplate = objRenderer.renderToString()
                        
                        stTemplate = fixUrlString(stTemplate);
                        objPDFTrans = nlapiXMLToPDF(stTemplate);
                        var stPDFId			= objLoadRecord.getFieldValue('tranid');
                        if(isEmptyVariantVar(stPDFId))
                        	stPDFId			= objLoadRecord.getFieldValue('transactionnumber');
                        objPDFTrans.setName(stTransRecordType+'_'+stPDFId +'.pdf');
                    }catch(e){
                        objPDFTrans = null;
                    }

                    
                }else{
                    defineError('no pdf generatetd',error);
                }
            }
            
            if(stBundle == 'POVBER'){
                stECPAddress = nlapiGetContext().getPreference('custscript_nsts_gaw_ecp_address');
            }else{
                stECPAddress = nlapiGetContext().getPreference('custscript_nsts_gaw_ecp_address_so');
            }
            //force to email plugin
            bEnablePlugin == 'T';
            
            if(bEnablePlugin == 'T' && stECPAddress){
                //Send email with email capture enabled
                bResult = sendWithEmailCapture(stRuleResult,stECPAddress,objLoadRecord);
            }
            else{
                //Send email with no authentication
                //bResult = sendWithoutEmailCapture(stRuleResult,objTrans);
            }
            if(bResult)
                return 'T';
        }
    }catch(error){
        defineError('sendEmailAction',error);
        bReturn  = 'F';
    }
    return bReturn;
}
function sendWithEmailCapture(stRuleResult,stECPAddress,objLoadRecord){
    try{
        
        if(stRuleResult){
            var objRecord       = JSON.parse(stRuleResult);
            var objTrans        = JSON.parse(objRecord['trans']);
            var stApproverName  = '';
            var stApprover      = null;
            var stFirstname     = '';
            var stLastname      = '';
            var stRole          = null;
            var stRoleEmail     = null;
            var intApprovers    = 0;
            if(objTrans){
                var transNo     = objTrans['transno'];
                var stCreator   = objTrans['creator'];
                var stBody      = null;
                
                var stSubject   = HC_PENDING_APPROVAL_SUBJECT.replace('{type}',stBaseRecordType).replace('{typeLabel}',stBaseRecordTypeLabel).replace('{transactionnumber}',transNo);
                var stApproveLink    = 'mailto:{ecpaddress}?subject=APPROVED:%20{type}%20No.%20{transactionnumber}&body=Reason:';
                var stRejectLink     = 'mailto:{ecpaddress}?subject=REJECTED:%20{type}%20No.%20{transactionnumber}&body=Rejection reason is required. Kindly enter the rejection reason after the code.%0D%0AReason:';
                
                if(objRecord.lineApprover)
                    objRecord.lineApprover = objRecord.lineApprover.toLowerCase().trim();
                if(objRecord.sublist)
                    objRecord.sublist = objRecord.sublist.toLowerCase().trim();
                
                pendingLineApprovals = (isEmpty(pendingLineApprovals))? "" : pendingLineApprovals;
                pendingLineApprovals += "<#assign stlineapproverfield = '" + objRecord.lineApprover + "'>";
                pendingLineApprovals += "<#assign stsublist = '" + objRecord.sublist + "'>";
                pendingLineApprovals += "<#assign stapprovertype = '" + nlapiGetFieldText(FLD_APPRVR_TYPE) + "'>";
                
                pendingLineApprovals_orgAprover = "";
                var arrSrcAppRes = searchApprovers(stInternalId);
                
                //Get Email Template
                var stEmailTemplateId = nlapiGetContext().getSetting("SCRIPT", 'custscript_nsts_gaw_email_temp_penapprvl');
                var objLoadEmailTemplate = null;
                if(!isEmpty(stEmailTemplateId))
                	var objLoadEmailTemplate = nlapiLoadRecord('emailtemplate',stEmailTemplateId); 
                
                //Get All Approvers
                if(objRecord){
                    var arrApprovers    = getApprovers(stRuleResult);
                    if(arrApprovers){
                        intApprovers    = parseFloat(arrApprovers['no']);
                        var arrOrgApprover = [];
                        for(var i=0;i<intApprovers;i++){
                            stApprover      = arrApprovers[i]['id'];
                            stApproverName  = arrApprovers[i]['approverName'];
                            stEntityId  = arrApprovers[i]['entityid'];
                            stFirstname     = arrApprovers[i]['firstname'];
                            stLastname      = arrApprovers[i]['lastname'];
                            
                            pendingLineApprovals_orgAprover = "";
                            arrOrgApprover = [];
                            if(!isEmptyVariantVar(arrSrcAppRes)){
                                for (var intAprv = 0; intAprv < arrSrcAppRes.length; intAprv++) {
                                    var onjAprvRec = arrSrcAppRes[intAprv];
                                    if(onjAprvRec.getValue(FLD_LIST_TRAN_APPROVER) == stApprover && !isEmptyVariantVar(onjAprvRec.getValue(FLD_LIST_ORIG_APPRVR))){
                                        
                                        arrOrgApprover.push( "+" + onjAprvRec.getText(FLD_LIST_ORIG_APPRVR) + "+");
                                        //pendingLineApprovals_orgAprover = "<#assign storglineapprover = '" + onjAprvRec.getText(FLD_LIST_ORIG_APPRVR) + "'>";
                                    }
                                }
                            }
                            
                            pendingLineApprovals += "<#assign arrApproverInfo = ['" + stEntityId + "'?replace(' ',''),'" + stFirstname + "'?replace(' ',''),'" + stLastname + "'?replace(' ','')]>";                          
                            
                            pendingLineApprovals_orgAprover = "<#assign storglineapprover = " + JSON.stringify(arrOrgApprover) + ">";
                            nlapiLogExecution("ERROR", 'sendWithEmailCapture',"ORG Approver : " + pendingLineApprovals_orgAprover);

                            var objTranInfoPlaceHolder = {
                                    stBaseRecordType        : isEmptyReplaceWith(stBaseRecordType,''),
                                    stBaseRecordTypeLabel   : isEmptyReplaceWith(stBaseRecordTypeLabel,''),
                                    stInternalId            : isEmptyReplaceWith(stInternalId,''),
                                    stApproveLink           : isEmptyReplaceWith(stApproveLink,''),
                                    stRejectLink            : isEmptyReplaceWith(stRejectLink,''),
                                    stApproverName          : isEmptyReplaceWith(stApproverName,''),
                                    transNo                 : isEmptyReplaceWith(transNo,''),
                                    stECPAddress            : isEmptyReplaceWith(stECPAddress,''),
                                    stRecordUrl             : isEmptyReplaceWith(stRecordUrl,''),
                                    pendingLineApprovals    : pendingLineApprovals + pendingLineApprovals_orgAprover,
                                    stApprover              : isEmptyReplaceWith(stApprover,''),
                                    stFirstname             : isEmptyReplaceWith(stFirstname,''),
                                    stLastname             : isEmptyReplaceWith(stLastname,''),
                                    stRoleResult            : '',
                                    stEmailSender           : isEmptyReplaceWith(stEmailSender,''),
                                    stCreator               : isEmptyReplaceWith(stCreator,''),
                            }
                            
                            GetEmailTemplate(true, stBaseRecordType, objTranInfoPlaceHolder,objLoadRecord,objLoadEmailTemplate);
                            stSubject    = HC_PENDING_APPROVAL_SUBJECT;
                            
                            stBody          = HC_PENDING_APPROVAL_BODY_WITHECP;
                            
                             
                            //RECORD ATTACHMENT
                            var tranrecord                  = new Object();
                                tranrecord['transaction']   = stInternalId.toString();
                            var billAttachment = nlapiGetFieldValue('custbody_ap_invoice');
							var file = nlapiLoadFile(billAttachment);

                                
                            if(objRecord['type']== '11' || objRecord['type']== '10'){
                                if(objRecord['firstSequence'])
                                    nlapiSendEmail(stEmailSender, stApprover, stSubject, stBody, null, null, tranrecord, file);  //objPDFTrans)
                            }else
                                nlapiSendEmail(stEmailSender, stApprover, stSubject, stBody, null, null, tranrecord, file);  //objPDFTrans)
                            
                            
                        }
                        if(intApprovers > 0)
                            return true;
                    }else{
                        //GET role approvers
                        var stRoleResult    = getRole(stRuleResult);
                        var arrApprovers    = getRoleApprovers(stRuleResult,objTrans,stRoleResult);
                        if(arrApprovers){
                            var recipient   = null;
                            var bcc         = [];
                            for(var i=0;i<arrApprovers.length;i++){
                                if(i==0)
                                    recipient = arrApprovers[i];
                                else{
                                    bcc[i-1] = arrApprovers[i];
                                }
                            }
                            if(bcc.length == 0)
                                bcc = null;
                            
                            
                            var objTranInfoPlaceHolder = {
                                    stBaseRecordType        : isEmptyReplaceWith(stBaseRecordType,''),
                                    stBaseRecordTypeLabel   : isEmptyReplaceWith(stBaseRecordTypeLabel,''),
                                    stInternalId            : isEmptyReplaceWith(stInternalId,''),
                                    stApproveLink           : isEmptyReplaceWith(stApproveLink,''),
                                    stRejectLink            : isEmptyReplaceWith(stRejectLink,''),
                                    stApproverName          : isEmptyReplaceWith(stApproverName,''),
                                    transNo                 : isEmptyReplaceWith(transNo,''),
                                    stECPAddress            : isEmptyReplaceWith(stECPAddress,''),
                                    stRecordUrl             : isEmptyReplaceWith(stRecordUrl,''),
                                    pendingLineApprovals    : pendingLineApprovals,
                                    stApprover              : isEmptyReplaceWith(stApprover,''),
                                    stFirstname             : isEmptyReplaceWith(stFirstname,''),
                                    stLastname             : isEmptyReplaceWith(stLastname,''),
                                    stRoleResult            : '',
                                    stEmailSender           : isEmptyReplaceWith(stEmailSender,''),
                                    stCreator               : isEmptyReplaceWith(stCreator,''),
                            }
                             
                            GetEmailTemplate(true, stBaseRecordType, objTranInfoPlaceHolder,objLoadRecord,objLoadEmailTemplate);
                            stBody          = HC_PENDING_APPROVAL_BODY_WITHECP;
                            stSubject    = HC_PENDING_APPROVAL_SUBJECT;         
    
                            /*stBody          = replaceAll('{approveLink}', stApproveLink, HC_PENDING_APPROVAL_BODY_WITHECP)
                            stBody          = replaceAll('{rejectLink}', stRejectLink, stBody)
                            stBody          = replaceAll('{type}',stBaseRecordType,stBody);
                            stBody          = replaceAll('{typeLabel}',stBaseRecordTypeLabel,stBody);
                            stBody          = replaceAll(' {approverName}',stApproverName,stBody);
                            stBody          = replaceAll('{transactionnumber}',transNo,stBody);
                            stBody          = replaceAll('{ecpaddress}',stECPAddress,stBody);
                            stBody          = replaceAll('{recordUrl}',stRecordUrl,stBody);
                            stBody          = replaceAll('{pendingLines}','',stBody);*/
                            
                            var tranrecord                  = [];
                                tranrecord['transaction']   = stInternalId;
                                tranrecord['entity']        = stApprover;
                            
                            nlapiSendEmail(stEmailSender, recipient, stSubject, stBody, null, bcc, tranrecord, objPDFTrans);
                            return true;
                        }       
                    }
                }
            }
        }
    }catch(error){
        defineError('sendWithEmailCapture',error);
    }
    return false;
}


/**
function sendWithoutEmailCapture(stRuleResult,record){
    try{
        if(stRuleResult){
            var objRecord       = JSON.parse(stRuleResult);
            var objTrans        = JSON.parse(objRecord['trans']);
            var stApproverName  = '';
            var stApprover      = null;
            var stRole          = null;
            var stRoleEmail     = null;
            var intApprovers    = 0;
            if(objTrans){
                var transNo     = objTrans['transno'];
                var stCreator   = objTrans['creator'];
                var stBody      = null;
                
                var stSubject   = HC_PENDING_APPROVAL_SUBJECT.replace('{type}',stBaseRecordType).replace('{typeLabel}',stBaseRecordTypeLabel).replace('{transactionnumber}',transNo);
                 pendingLineApprovals = (isEmpty(pendingLineApprovals))? "" : pendingLineApprovals;
                    pendingLineApprovals += "<#assign stlineapproverfield = '" + objRecord.lineApprover + "'>";
                    pendingLineApprovals += "<#assign stsublist = '" + objRecord.sublist + "'>";

                pendingLineApprovals_orgAprover = "";
                var arrSrcAppRes = searchApprovers(stInternalId);
                
                //Get All Approvers
                if(objRecord){
                    var arrApprovers    = getApprovers(stRuleResult);
                    if(arrApprovers){
                        intApprovers    = arrApprovers['no'];
                        for(var i=0;i<intApprovers;i++){
                            stApprover      = arrApprovers[i]['id'];
                            stApproverName  = arrApprovers[i]['approverName'];
                            
                            if (!isEmptyVariantVar(arrSrcAppRes)) {
                                for (var intAprv = 0; intAprv < arrSrcAppRes.length; intAprv++) {
                                    var onjAprvRec = arrSrcAppRes[intAprv];
                                    if (onjAprvRec.getValue(FLD_LIST_TRAN_APPROVER) == stApprover) {
                                        pendingLineApprovals_orgAprover = "<#assign storglineapprover = '" + onjAprvRec.getText(FLD_LIST_ORIG_APPRVR) + "'>";
                                    }
                                }
                            }
                            
                            var objTranInfoPlaceHolder = {
                                    stBaseRecordType        : isEmptyReplaceWith(stBaseRecordType,''),
                                    stBaseRecordTypeLabel   : isEmptyReplaceWith(stBaseRecordTypeLabel,''),
                                    stInternalId            : isEmptyReplaceWith(stInternalId,''),
                                    stApproveLink           : isEmptyReplaceWith(stApprvLink,''),
                                    stRejectLink            : isEmptyReplaceWith(stRejcLink,''),
                                    stApproverName          : isEmptyReplaceWith(stApproverName,''),
                                    transNo                 : isEmptyReplaceWith(transNo,''),
                                    stECPAddress            : isEmptyReplaceWith(stECPAddress,''),
                                    stRecordUrl             : isEmptyReplaceWith(stRecordUrl,''),
                                    pendingLineApprovals    : pendingLineApprovals + pendingLineApprovals_orgAprover,
                                    stApprover              : isEmptyReplaceWith(stApprover,''),
                                    stRoleResult            : '',
                                    stEmailSender           : isEmptyReplaceWith(stEmailSender,''),
                                    stCreator               : isEmptyReplaceWith(stCreator,''),
                            }
                          
                            GetEmailTemplate(false, stBaseRecordType, objTranInfoPlaceHolder,objLoadRecord);
                            stBody          = HC_PENDING_APPROVAL_BODY_WITHECP;
                            stSubject    = HC_PENDING_APPROVAL_SUBJECT;
                            


                            //RECORD ATTACHMENT
                            var tranrecord                  = new Object();
                                tranrecord['transaction']   = stInternalId.toString();
                                
                            if(objRecord['type']== '11' || objRecord['type']== '10'){
                                if(objRecord['firstSequence'])
                                    nlapiSendEmail(stEmailSender, stApprover, stSubject, stBody, null, null, tranrecord, objPDFTrans);
                            }else
                                nlapiSendEmail(stEmailSender, stApprover, stSubject, stBody, null, null, tranrecord, objPDFTrans);                          
                        }
                        
                        if(intApprovers > 0)
                            return true;
                    }else{
                        //GET role approvers                        
                        var stRoleResult    = getRole(stRuleResult);
                        var arrApprovers    = getRoleApprovers(stRuleResult,objTrans,stRoleResult);
                        if(arrApprovers){
                            var recipient   = null;
                            var bcc         = [];
                            for(var i=0;i<arrApprovers.length;i++){
                                if(i==0)
                                    recipient = arrApprovers[i];
                                else{
                                    bcc[i-1] = arrApprovers[i];
                                }
                            }
                            if(bcc.length == 0)
                                bcc = null;
                                                
                               var objTranInfoPlaceHolder = {
                                        stBaseRecordType        : isEmptyReplaceWith(stBaseRecordType,''),
                                        stBaseRecordTypeLabel   : isEmptyReplaceWith(stBaseRecordTypeLabel,''),
                                        stInternalId            : isEmptyReplaceWith(stInternalId,''),
                                        stApproveLink           : isEmptyReplaceWith(stApprvLink,''),
                                        stRejectLink            : isEmptyReplaceWith(stRejcLink,''),
                                        stApproverName          : isEmptyReplaceWith(stApproverName,''),
                                        transNo                 : isEmptyReplaceWith(transNo,''),
                                        stECPAddress            : isEmptyReplaceWith(stECPAddress,''),
                                        stRecordUrl             : isEmptyReplaceWith(stRecordUrl,''),
                                        pendingLineApprovals    : pendingLineApprovals,
                                        stApprover              : isEmptyReplaceWith(stApprover,''),
                                        stRoleResult            : isEmptyReplaceWith(stRoleResult,''),
                                        stEmailSender           : isEmptyReplaceWith(stEmailSender,''),
                                        stCreator               : isEmptyReplaceWith(stCreator,''),
                                }
                              
                                GetEmailTemplate(false, stBaseRecordType, objTranInfoPlaceHolder,objLoadRecord);
                                stBody          = HC_PENDING_APPROVAL_BODY_WITHECP;
                                stSubject       = HC_PENDING_APPROVAL_SUBJECT;
                            
                            
                            stBody            = replaceAll('{type}',stBaseRecordType,HC_PENDING_APPROVAL_BODY_WITHOUTECP);
                            stBody          = replaceAll('{typeLabel}',stBaseRecordTypeLabel,stBody);
                            stBody          = replaceAll(' {approverName}','',stBody);
                            stBody          = replaceAll('{transactionnumber}',transNo,stBody);
                            stBody          = replaceAll('{approver}','',stBody);
                            stBody          = replaceAll('{id}',stInternalId,stBody);
                            stBody          = replaceAll('{role}',stRoleResult,stBody);
                            stBody          = replaceAll('{rejectLink}',stRejcLink,stBody);
                            stBody          = replaceAll('{approveLink}',stApprvLink,stBody);
                            stBody          = replaceAll('{emailSender}',stEmailSender,stBody);
                            stBody          = replaceAll('{creator}',record['creator'],stBody);
                            stBody          = replaceAll('{recordUrl}',stRecordUrl,stBody);
                            stBody          = replaceAll('{pendingLines}','',stBody);
                            
                            //RECORD ATTACHMENT
                            var tranrecord                  = [];
                                tranrecord['transaction']   = stInternalId;
                                tranrecord['entity']        = stApprover;
                            
                            nlapiSendEmail(stEmailSender, recipient, stSubject, stBody, null, bcc, tranrecord, objPDFTrans);
                            return true;
                        }       
                    }
                }
            }
        }
    }catch(error){
        defineError('sendWithoutEmailCapture',error);
    }
    return false;
}
*/
function getApprovers(stRuleResult){
    try{
        var objRecord   = JSON.parse(stRuleResult);
        var arrApprover = new Object();     
        var objTrans    = JSON.parse(objRecord['trans']);
        if(objRecord){
            var approver            = objRecord['id'];
            var arrChangedApprovers = objRecord['changedapprovers'];
            if(approver){
                var objFields       = objRecord['fields'];
                stApproverName      = objFields['firstname'] + ' '+objFields['lastname'];
                arrApprover['no']   = 1;
                arrApprover[0]              = new Object();
                arrApprover[0]['approverName']  = stApproverName;
                arrApprover[0]['id']            = approver;
            }else if(arrChangedApprovers){
                var arrRawApprover = getMultiApproverList(arrChangedApprovers);
                
                if(arrRawApprover.length > 0)
                    arrApprover['no']   = arrRawApprover.length;
                
                for(var i=0;i<arrRawApprover.length;i++){
                    var recApprover = nlapiLookupField('employee',arrRawApprover[i],['entityid','lastname','firstname']);
                    stApproverName      = recApprover['firstname']+ ' '+recApprover['lastname'];
                    arrApprover[i]                  = new Object();
                    arrApprover[i]['approverName']  = stApproverName;
                    arrApprover[i]['firstname']     = recApprover['firstname'];
                    arrApprover[i]['lastname']      = recApprover['lastname'];
                    arrApprover[i]['entityid']      = recApprover['entityid'];
                    arrApprover[i]['id']            = arrRawApprover[i];
                }
            }
            else if(objTrans && !arrApprover['no']){
                var stapprovers = objTrans['nextapprovers'];
                var arrRawApprover = getMultiApproverList(stapprovers);
                
                if(arrRawApprover.length > 0)
                    arrApprover['no']   = arrRawApprover.length;
                
                for(var i=0;i<arrRawApprover.length;i++){
                    var recApprover = nlapiLookupField('employee',arrRawApprover[i],['entityid','lastname','firstname']);
                    stApproverName      = recApprover['firstname'] + ' '+recApprover['lastname'];
                    arrApprover[i]                  = new Object();
                    arrApprover[i]['approverName']  = stApproverName;
                    arrApprover[i]['firstname']     = recApprover['firstname'];
                    arrApprover[i]['lastname']      = recApprover['lastname'];
                    arrApprover[i]['entityid']      = recApprover['entityid'];
                    arrApprover[i]['id']            = arrRawApprover[i];
                }
            }
            if(arrApprover['no'])
                return arrApprover;
            else
                return null;
        }
    }catch(error){
        //defineError('getApprovers',error);  
    }
}
function getRoleApprovers(stResult,record,stRoleResult){
    try{
        var objRecord       = JSON.parse(stResult);
        if(stRoleResult){               
            var arrRes = null;

            var arrCol = [new nlobjSearchColumn('email')];
            var arrFil = [  new nlobjSearchFilter('role', null, 'anyof', stRoleResult),
                            new nlobjSearchFilter('isinactive',null,'is','F')
                        ];
            if(bOneWorld == 'T')
            	arrFil.push(new nlobjSearchFilter('subsidiary',null, 'anyof',record['subsidiary']));
            	
            arrRes = nlapiSearchRecord('employee', null, arrFil, arrCol);
            var arrApprover =[];
            if(arrRes){
                for(var i=0;i<arrRes.length;i++){
                    arrApprover[i] = arrRes[i].getValue('email');
                }
                return arrApprover;
            }else
                return null;
            }
    }catch(error){
        defineError('getRoleApprovers',error);      
    }
    return null;
}
function attachLinePendingApproval(sublist,approver,user,objLoadRecord){

    var html = '';
    try{
        sublist = sublist.toLowerCase();
        approver = approver.toLowerCase();
        var rec = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());
        var itemCount = rec.getLineItemCount(sublist);
        var idx = 0;
        if(itemCount > 0){
            var fields = rec.getAllLineItemFields(sublist);

            for(var i=0;i<itemCount;i++){
                var stApprover = rec.getLineItemValue(sublist,approver,i+1);
                
                if(stApprover == user){
                    html = html+"<br/><b> PENDING LINE NO. "+(i+1)+ '</b><br/>';
                    for(var cnt=0;cnt<fields.length;cnt++){
                        var field = fields[cnt];
                        try{
                            
                            var label = (rec.getLineItemField(sublist,field,i+1)).getLabel();
                            if(label && field != approver){
                                var value = rec.getLineItemText(sublist,field,i+1);
                                if(!value)
                                    var value = rec.getLineItemValue(sublist,field,i+1);
                                if(value)
                                    html     = html + label+": "+value+"<br/>";
                            }
                        }catch(error){}
                        
                    }
                }
            }
        }
    }catch(error){
        defineError('attachLinePendingApproval',error);
    }
    return html;
}


function sendEmailForApproveReject(stRuleResult){
    
    var stLogTitle = "SENDEMAILFORAPPROVEREJECT";
    try{
        var stLogTitle = 'SENDEMAILFORAPPROVEREJECT';
        
        var stRequestor     = nlapiGetFieldValue(FLD_TRAN_REQUESTOR);
        var stRequestorText = nlapiGetFieldText(FLD_TRAN_REQUESTOR);
        var stCreator       = nlapiGetFieldValue(FLD_CREATED_BY);
        var stCreatorText   = nlapiGetFieldText(FLD_CREATED_BY);
        var transNo         = nlapiGetFieldValue("transactionnumber");
        var stOrigCreator   = null;
        
        if(!stCreator){ //Executed when context is xedit    
            var rec                 = nlapiLoadRecord(stTransRecordType, stInternalId);         
            stRequestor             = rec.getFieldValue(FLD_TRAN_REQUESTOR); 
            stRequestorText         = rec.getFieldText(FLD_TRAN_REQUESTOR); 
            stCreator               = rec.getFieldValue(FLD_CREATED_BY);
            stCreatorText           = rec.getFieldText(FLD_CREATED_BY);
            transNo                 = rec.getFieldValue("transactionnumber");
        }
        
        if(stRequestor != stCreator)
        	stOrigCreator = stCreator;
        stRecordUrl         = nlapiResolveURL('RECORD', stTransRecordType, stInternalId);
    
        var stEmailBody                 = GetEmailTemplateForApproveReject(stSendingEmailFor,stInternalId);
        var tranrecord                  = [];
        tranrecord['transaction']       = stInternalId;
        tranrecord['entity']            = stCreator;
        
        if(isEmpty(stRequestor)){
            stRequestor = stCreator;
            stCreator   = null;
        }
            
        var stBody      = stEmailBody.body;
        stBody          = replaceAll('{type}',stBaseRecordType,stBody);
        stBody          = replaceAll('{typeLabel}',stBaseRecordTypeLabel,stBody);
        stBody          = replaceAll('{transactionnumber}',transNo,stBody);
        stBody          = replaceAll('{id}',stInternalId,stBody);
        stBody          = replaceAll('{emailSender}',stEmailSender,stBody);
        stBody          = replaceAll('{creator}',stCreatorText,stBody);
        stBody          = replaceAll('{requestor}',stRequestorText,stBody);
        stBody          = replaceAll('{recordUrl}',stRecordUrl,stBody);
        stBody          = replaceAll('{rejectReason}',nlapiGetFieldValue(FLD_REJECTION_REASON),stBody);
        
        var stSubject      = stEmailBody.subject;
        stSubject          = replaceAll('{type}',stBaseRecordType,stSubject);
        stSubject          = replaceAll('{typeLabel}',stBaseRecordTypeLabel,stSubject);
        stSubject          = replaceAll('{transactionnumber}',transNo,stSubject);
        stSubject          = replaceAll('{id}',stInternalId,stSubject);
        stSubject          = replaceAll('{emailSender}',stEmailSender,stSubject);
        stSubject          = replaceAll('{creator}',stCreatorText,stSubject);
        stSubject          = replaceAll('{requestor}',stRequestorText,stSubject);
        stSubject          = replaceAll('{recordUrl}',stRecordUrl,stSubject);
        
        
        stEmailBody.subject = stSubject;
        stEmailBody.body = stBody;
        stBody          = replaceAll('{user}',stRequestorText,stBody);
        if(!isEmptyVariantVar(stRequestorText))
              nlapiSendEmail(stEmailSender, stRequestor, stSubject, stBody, null, null, tranrecord);
		  
		//Send to creator if different from requestor
        if(!isEmptyVariantVar(stCreatorText)){
        	stBody =  stEmailBody.body;
        	stBody = replaceAll('{user}',stCreatorText,stBody);
            tranrecord['entity']            = stOrigCreator;
            nlapiSendEmail(stEmailSender, stOrigCreator, stSubject, stBody, null, null, tranrecord);        	
        }
    }catch(e){
        nlapiLogExecution('error', stLogTitle, "ERROR: " + e);
    }
    
}

function isEmptyReplaceWith(str,value){
    return (isEmptyVariantVar(str))? value : str;
}

function fixUrlString(templateBody){
    ///src\s=\s".*?"/gi);
    
    var urlArr = templateBody.match(/src(\s*)?=(\s*)?".*?"/gi);

    if (!isEmpty(urlArr)) {
        urlArr.map(function(url) {
            var _url = url.replace(/src\s*=\s*"(.*?)"/gi,"$1");
            //Function.debug("fixUrlString url", "url:" + url + " _url:" + _url);
                templateBody = templateBody.replace(url, 'src="' + nlapiEscapeXML(_url) +'"');
        });
    }
    return templateBody;
};
