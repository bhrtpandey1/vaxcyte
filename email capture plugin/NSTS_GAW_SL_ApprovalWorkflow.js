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
* This script contains suitelet used in general advanced approval workflow
* 
* Version Type    Date            Author           Remarks
* 1.00    Create  06 Mar 2014     Russell Fulling
* 1.01    Edit    29 May 2014     Jaime Villafuerte III/Dennis Geronimo
* 1.02    Edit    2 Mar 2015      Rose Ann Ilagan
* 2.00    Edit    16 Mar 2015     Rachelle Barcelona
*/
//**********************************************************************GLOBAL VARIABLE DECLARATION - STARTS HERE**********************************************//

//SCRIPTS
var SCRIPT_CS_FILE              = 'customscript_nsts_gaw_suitelet_valid_cs';
var SCRIPT_SL_DELEGATE          = 'customscript_nsts_gaw_apprvl_delegate_sl';
var SCRIPT_SL_EMPLOYEE_CENTER   = 'custscript_nsts_gaw_emp_center_url';
var SCRIPT_CS_APPVD_RULE_GROUP  = 'customscript_nsts_gaw_apvd_valdxn_cs';
var SCRIPT_GAW_IDS 				= ['customscript_nsts_gaw_apvd_valdxn_cs',
									 'customscript_nsts_gaw_csv_import_ue',
									 'customscript_nsts_gaw_set_cloaking_btns',
									 'customscript_nsts_gaw_apprvl_validxn_ue',
									 'customscript_nsts_gaw_prev_edit_ue',
									 'customscript_nsts_gaw_send_email_wa',
									 'customscript_nsts_gaw_glo_upd_apprvr_wa',
									 'customscript_nsts_gaw_check_user_approve',
									 'customscript_nsts_gaw_del_sched_wa',
									 'customscript_nsts_gaw_set_hist_rej_wa',
									 'customscript_nsts_gaw_needs_apprvl_wa',
									 'customscript_nsts_gaw_xedit_apprvd_wa',
									 'customscript_nsts_gaw_get_global_chkbox',
									 'customscript_nsts_gaw_set_super_app_wa',
									 'customscript_nsts_gaw_chk_apprvr_inac_wa',
									 'customscript_nsts_gaw_order_stat_wa',
									 'customscript_nsts_gaw_rem_apprvrs_wa',
									 'customscript_nsts_gaw_global_upd_wa',
									 'customscript_nsts_gaw_apprvl_flow_wa',
									 'customscript_nsts_gaw_check_tax_pd_wa',
									 'customscript_nsts_gaw_check_autoapprove',
									 'customscript_nsts_gaw_get_rec_type_wa',
									 'customscript_nsts_gaw_chck_last_seq_wa',
									 'customscript_nsts_gaw_vb_po_match_wa',
									 'customscript_nsts_gaw_get_appr_role_wa',
									 'customscript_nsts_gaw_check_tol_limt_wa',
									 'customscript_nsts_gaw_set_approvers',
									 'customscript_nsts_gaw_get_email_link',
									 'customscript_nsts_gaw_get_global_emp',
									 'customscript_nsts_gaw_get_global_emailwa'];
//CUSTOM GENERAL PREFERENCE
var FLD_SCRIPT_PARAM_ENABLE_CLOAKING = 'custscript_nsts_gaw_enable_cloaking';
//DEPLOYMENTS
var DEPLOY_SL_DELEGATE = 'customdeploy_nsts_gaw_apprvl_delegate_sl';


var stScript_saveComplete = "<script>alert('Employee Successfully Delegated');</script>";
var stScript_ButtonScripts = "<script>" +
        "function tsg_btnCancel(){" +
            "window.onbeforeunload=null;" +
            "var url = escape(nlapiResolveURL('SUITELET', '"+SCRIPT_SL_DELEGATE+"', '"+DEPLOY_SL_DELEGATE+"'));" +
            "window.location.href = url;" +
        "}" +
        "function tsg_btnBack(){" +
            "window.onbeforeunload=null;" +
            "var url = '<EmpCenter>';" +
            "window.location.href = url;" +
        "}" +
        "</script>";

//**********************************************************************GLOBAL VARIABLE DECLARATION - ENDS HERE*****************************************************//

/**
* Suitelet   : NSTS | GAW - Set Next Approver on Bulk
*              customscript_nsts_gaw_set_nxt_apprvrbulk
* Set the field nextapprover on the transaction when viewed from suitelet
* Returns null
* @param {nlobjRequest} request Request object
* @param {nlobjResponse} response Response object
* @returns {Void} Any output is written via response object
* @author Rose Ilagan
* @version 3.0
*/
function setNextApproverOnBulkApprove(request, response){

    var intRecordId = null;
    var intRecordId = null
	try{
        stTransRecordType = request.getParameter("recordtype");
        intRecordId = request.getParameter("recordid");
        var stAction = request.getParameter("action");
        var objRec = nlapiLoadRecord(stTransRecordType,intRecordId);
        if(objRec.getField('nextapprover') && (stAction == '2' || stAction == '3' || stAction == '4')){
        	nlapiSubmitField(stTransRecordType,intRecordId,['nextapprover'],[nlapiGetContext().getUser()]);
        }	
    }catch(error){
        defineError('setNextApproverOnBulkApprove',error);
    }
    nlapiSetRedirectURL('RECORD',stTransRecordType, intRecordId, null, null);
}
/**
* Suitelet   : NSTS | GAW CSV Import Trig (Call Submit)
*              customscript_nsts_gaw_csvtrigger_sl
* Trigger submit button upon csv import for PO Workflow
* Returns null
* @param {nlobjRequest} request Request object
* @param {nlobjResponse} response Response object
* @returns {Void} Any output is written via response object
* @author Dennis Geronimo
* @version 3.0
*/
function triggerGawSubmitOnCSV(request, response){
    try{

        var stTransRecordType = request.getParameter("recordtype");
        var intRecordId = request.getParameter("recordid");
        var stworkflow_id = request.getParameter("workflowid");
        var wact_gaw_submit_btn = request.getParameter("workflowsubmitbutton");
        
        nlapiLogExecution("DEBUG", "triggerGawSubmitOnCSV", "stTransRecordType:" + stTransRecordType +" intRecordId:" + intRecordId + " stworkflow_id:" + stworkflow_id + " wact_gaw_submit_btn:" + wact_gaw_submit_btn);
        var stRes = nlapiTriggerWorkflow(stTransRecordType, intRecordId, stworkflow_id, wact_gaw_submit_btn);
    }catch(error){
        defineError('triggerGawSubmitOnCSV',error);
    }
}

/**
* Suitelet   : NSTS | GAW - Gen Approval Delegate SL
*              customscript_nsts_gaw_apprvl_delegate_sl
* Lets user add a delegate approver
* Returns null
* @param {nlobjRequest} request Request object
* @param {nlobjResponse} response Response object
* @returns {Void} Any output is written via response object
* @author Jaime Villafuerte
* @version 1.0
*/
function suitelet_delegateApprover(request, response)
{
    try{
        var intEmployeeId = nlapiGetUser();

        var stApprovalDelegate = '';
        var stDelegateFrom = '';
        var stDelegateTo = '';

        var empCenter = nlapiGetContext().getSetting("SCRIPT", SCRIPT_SL_EMPLOYEE_CENTER);    
        stScript_ButtonScripts = stScript_ButtonScripts.replace("<EmpCenter>", empCenter);
        
        var arrFields = [FLD_APPROVAL_DELEGATE,FLD_DELEGATE_FROM,FLD_DELEGATE_TO];
        
        if (request.getMethod() == "POST"){        
            stApprovalDelegate = request.getParameter("custpage_tsg_delegate_");
            stDelegateFrom = request.getParameter("custpage_tsg_delegate_from");
            stDelegateTo = request.getParameter("custpage_tsg_delegate_to");
            var arrValues = [stApprovalDelegate, stDelegateFrom, stDelegateTo];
            nlapiSubmitField("employee", intEmployeeId, arrFields, arrValues);
        }

        var arrApprover = nlapiLookupField('employee',intEmployeeId,arrFields);
        stApprovalDelegate = arrApprover[FLD_APPROVAL_DELEGATE];
        stDelegateFrom = arrApprover[FLD_DELEGATE_FROM];
        stDelegateTo = arrApprover[FLD_DELEGATE_TO];
        
        var frm = nlapiCreateForm('Approval Delegate', false);
        frm.addField("script_buttons", "inlinehtml", "html").setDefaultValue(stScript_ButtonScripts);
        frm.addField("custpage_tsg_delegate_", "select", "Approval Delegate", "employee");//.setDefaultValue(stApprovalDelegate);
        
        var fldFrom = frm.addField("custpage_tsg_delegate_from", "date", "Delegate From");
        var fldTo = frm.addField("custpage_tsg_delegate_to", "date", "Delegate To");
       
        fldFrom.setDisplayType('disabled');
        fldTo.setDisplayType('disabled');
           
        var subList = frm.addSubList("custpage_tsg_employeedeligation", "staticlist", "Employee Delegation");
        var col1 = subList.addField("custpage_tsg_delegate", "select", "Delegate", "employee");
        subList.addField("custpage_tsg_delegatefrom", "text", "From").setDefaultValue(stDelegateFrom);
        subList.addField("custpage_tsg_delegateto", "text", "To").setDefaultValue(stDelegateTo);

        col1.setDefaultValue(stApprovalDelegate);
        col1.setDisplayType("inline");
        subList.setLineItemValue("custpage_tsg_delegate", 1, stApprovalDelegate);
        subList.setLineItemValue("custpage_tsg_delegatefrom", 1, stDelegateFrom);
        subList.setLineItemValue("custpage_tsg_delegateto", 1, stDelegateTo);

        frm.addSubmitButton("Submit");
        frm.addButton('custpage_tsg_cancel', "Cancel", "tsg_btnCancel();");
        frm.addButton('custpage_tsg_back', "Back to Home", 'tsg_btnBack();');

        if (request.getMethod() == "POST"){
            frm.addField("html", "inlinehtml", "html").setDefaultValue(stScript_saveComplete);
        }

        frm.setScript(SCRIPT_CS_APPVD_RULE_GROUP);
        response.writePage(frm);
    }catch(error){
        defineError('suitelet_delegateApprover',error);
    }
}

/**
* Suitelet   : NSTS | GAW - General Approval Reject SL
*              customscript_nsts_gaw_reject_upd_sl
* Lets user enter reason for rejecting transaction
* Returns the string record type
* @param {nlobjRequest} request Request object
* @param {nlobjResponse} response Response object
* @returns {Void} Any output is written via response object
* @author Jaime Villafuerte
* @version 1.0
*/
function suitelet_enterRejectionReason(request, response)
{
    try{
        var stTranId = request.getParameter('tranid');
        var stTranType = request.getParameter('trantype');
        var idCreator = request.getParameter('idCreator');
        var idAdmin = request.getParameter('idAdmin');
        var stApproverId = request.getParameter('approverId');
        var stApproverRole = request.getParameter('approverRole');
        var stApprovalViaEmail = request.getParameter('approvalViaEmail');
        var action = null;
        var sToday = nlapiDateToString(new Date(),'datetimetz');
        var form = nlapiCreateForm('Reject', true);
        
        if ((stTranType))
            stTranType = stTranType.toLowerCase();

        if (request.getMethod() == 'GET'){

            initializeMappingFields(stTranType);            
            var arrAppList = searchApprovers(stTranId,stApproverId);

            //GET APPROVAL STATUS OF TRANSACTION
            var record = nlapiLookupField(stTranType,stTranId,[FLD_APPROVAL_STATUS,'status']);
            var recordUrl =   getTransURL(stTranType, stTranId);
                
            //Check if transaction is still pending approval
            if ((!arrAppList) ||
                (record['status'].toLowerCase() == 'cancelled')){
                //No approver list or transaction is cancelled
                rejectError(form, response, recordUrl, stApprovalViaEmail);
            }else if((record[FLD_APPROVAL_STATUS] == HC_STATUS_APPROVED)||
                    ((record[FLD_APPROVAL_STATUS] == HC_STATUS_REJECTED))){
                //Approved or rejected transactions
                rejectError(form, response, recordUrl, stApprovalViaEmail);
            }else if(((record[FLD_APPROVAL_STATUS] == HC_STATUS_PENDING_APPROVAL)
                        &&(!((stApproverId == arrAppList[0].getValue(FLD_LIST_TRAN_APPROVER)) ||
                        (arrAppList[0].getValue(FLD_LIST_APPROVER_ROLE) == stApproverRole))))){
                //Pending approval transaction but different approver
                rejectError(form, response, recordUrl, stApprovalViaEmail);
            }else{
                //Show form for entering rejection reason if user is an approver
                var fld = form.addField('custpage_po_reason', 'textarea', 'Reason');
                fld.setMandatory(true);
                                
                fld = form.addField('custpage_tranid', 'text', '');
                fld.setDisplayType('hidden');
                fld.setDefaultValue(stTranId);
                fld = form.addField('custpage_trantype', 'text', '');
                fld.setDisplayType('hidden');
                fld.setDefaultValue(stTranType);
                fld = form.addField('custpage_id_creator', 'text', '');
                fld.setDisplayType('hidden');
                fld.setDefaultValue(idCreator);
                fld = form.addField('custpage_id_admin', 'text', '');
                fld.setDisplayType('hidden');
                fld.setDefaultValue(idAdmin);
                
                if (stApproverId){              
                    fld = form.addField('custpage_po_appr_id', 'text', '');
                    fld.setDisplayType('hidden');
                    fld.setDefaultValue(stApproverId);
                }
                if (stApproverRole){              
                    fld = form.addField('custpage_po_appr_role', 'text', '');
                    fld.setDisplayType('hidden');
                    fld.setDefaultValue(stApproverRole);
                }
                form.addSubmitButton('Reject');
                
                //Add cancel button if executed via user interface
                if(!stApprovalViaEmail){
                    form.addButton('custpage_cancel', 'Cancel', "window.close();");
                }            
                response.writePage(form);
            }       
        }
        else{
            var stReason = request.getParameter('custpage_po_reason');
            var stApprovalViaEmail = request.getParameter('custpage_po_appr_via_email');
            stApproverId = parseInt(request.getParameter('custpage_po_appr_id'));
            stApproverRole = parseInt(request.getParameter('custpage_po_appr_role'));
            var stReasonCode = '';
                
            stTranId = request.getParameter('custpage_tranid');
            stTranType = request.getParameter('custpage_trantype');
            idCreator = request.getParameter('custpage_id_creator');
            idAdmin = request.getParameter('custpage_id_admin');

            //Get Record Link
            var recordUrl =   getTransURL(stTranType, stTranId);//nlapiResolveURL('RECORD', stTranType, stTranId);
            
            //Initialize fields per transaction
            initializeMappingFields(stTranType);
            
            //Get current approver list
            var arrAppList = searchApprovers(stTranId,stApproverId); 
            
            if(nlapiGetContext().getUser() != '-4'){
                stApproverId = parseInt(nlapiGetContext().getUser());
                stApproverRole = parseInt(nlapiGetContext().getRole());
            }

            //Get Approval Status           
            var record = nlapiLookupField(stTranType,stTranId,[FLD_APPROVAL_STATUS,'tranid','transactionnumber']);
            
            if((!arrAppList)||
                (record[FLD_APPROVAL_STATUS] == HC_STATUS_REJECTED)||
                (record[FLD_APPROVAL_STATUS] == HC_STATUS_APPROVED)||((record[FLD_APPROVAL_STATUS] == HC_STATUS_PENDING_APPROVAL)
                &&(!((stApproverId == arrAppList[0].getValue(FLD_LIST_TRAN_APPROVER))
                ||(arrAppList[0].getValue(FLD_LIST_APPROVER_ROLE) == stApproverRole))))){

                rejectError(form, response, recordUrl, stApprovalViaEmail);
            }
            else{
                //UPDATE APPROVER LIST
                if (stApproverId){  
                    for(var icount=0;icount < arrAppList.length;icount++){         
                           nlapiSubmitField(REC_APPROVER_LIST, arrAppList[icount].getId(),  [FLD_LIST_APPROVER_LINE_STATUS, FLD_LIST_APPROVER_DATE, FLD_LIST_TRAN_APPROVER, FLD_LIST_REJECTION_REASON],
                                                                                            [HC_STATUS_REJECTED, sToday, stApproverId, stReason]);                      
                    }
                    
                }
                if (stApproverRole){  
                    nlapiSubmitField(REC_APPROVER_LIST, arrAppList[0].getId(),  [FLD_LIST_APPROVER_LINE_STATUS, FLD_LIST_APPROVER_DATE, FLD_LIST_APPROVER_ROLE, FLD_LIST_REJECTION_REASON], 
                                                                                    [HC_STATUS_REJECTED, sToday, stApproverRole, stReason]);                
                }
                
                //UPDATE TRANSACTION APPROVAL STATUS
                try{
                    nlapiSubmitField(stTranType, stTranId, [FLD_APPROVAL_STATUS, FLD_NXT_APPRVRS, FLD_REJECTION_REASON,FLD_APPROVAL_VIA_EMAIL,FLD_NXT_ROLE_APPRVRS], [HC_STATUS_REJECTED, null, stReason,HC_REJECT_ACTION,null]);                                                           
                }catch(error){
                    if(stTranType == 'journalentry')
                        nlapiSubmitField('intercompanyjournalentry', stTranId, [FLD_APPROVAL_STATUS, FLD_NXT_APPRVRS, FLD_REJECTION_REASON,FLD_APPROVAL_VIA_EMAIL,FLD_NXT_ROLE_APPRVRS], [HC_STATUS_REJECTED, null, stReason,HC_REJECT_ACTION,null]);                                                           
                
                }//Close window and redirect to transaction
                closeAndRedirect(form, stTranId, stTranType);
                response.writePage(form);
            }          
        }
    }
    catch (error)
    {
        defineError('Process Error', error);
    }
}


/**
* Suitelet   : NSTS | GAW - Transaction Save Record SL
*              customscript_nsts_gaw_transaverecord_sl
* Validate transaction upon save to users that  doesn't have an access to approval rule group
* @param {nlobjRequest} request Request object
* @param {nlobjResponse} response Response object
* @returns {Void} Any output is written via response object
* @author Rose Ann Ilagan
* @version 1.0
*/
function suitelet_getRuleGroupDetails(request, response)
{
    var stResponse = null;
    try{
        var stTranTypeId    = request.getParameter('id');
        var stSubsidiary    = request.getParameter('subsidiary');
        var intLastSeq      = request.getParameter('intLastSeq');   
       
        if(!stSubsidiary || stSubsidiary == 'null')
        	stSubsidiary = null;
        
        var arrRes = null;
        if(intLastSeq){
            intLastSeq = parseFloat(intLastSeq);
            if (intLastSeq == 0)
                intLastSeq = 1;
            var intLastSeq = (intLastSeq) ? intLastSeq : 0;
            
            var col = [new nlobjSearchColumn(FLD_RULES_APPRVR, FLD_RULES_RULE_GRP),
                       new nlobjSearchColumn(FLD_RULES_APPRVR_TYPE, FLD_RULES_RULE_GRP),
                       new nlobjSearchColumn(FLD_RULES_MINAMT, FLD_RULES_RULE_GRP),
                       new nlobjSearchColumn(FLD_RULES_SEQUENCE, FLD_RULES_RULE_GRP).setSort(),
                       new nlobjSearchColumn(FLD_RULES_ROLETYPE, FLD_RULES_RULE_GRP),
                       new nlobjSearchColumn(FLD_RULES_ROLE_EMAIL, FLD_RULES_RULE_GRP),
                       new nlobjSearchColumn(FLD_APP_RULE_GRP_DEF_CURR),
                       new nlobjSearchColumn(FLD_APP_RULE_GRP_USE_EXC_RATE),
                       new nlobjSearchColumn(FLD_RULES_APPRVR_REC_TYPE,FLD_RULES_RULE_GRP),      
                       new nlobjSearchColumn(FLD_RULES_APPRVR_REC_FLD,FLD_RULES_RULE_GRP),
                       new nlobjSearchColumn(FLD_RULES_TRANS_MAPPED_FLD_ID,FLD_RULES_RULE_GRP),
                       new nlobjSearchColumn(FLD_RULES_LINE_APPROVER,FLD_RULES_RULE_GRP),      
                       new nlobjSearchColumn(FLD_RULES_SUBLIST,FLD_RULES_RULE_GRP),
                       new nlobjSearchColumn(FLD_RULES_MULT_EMP,FLD_RULES_RULE_GRP)];
            
            var fil = [new nlobjSearchFilter(FLD_APP_RULE_GRP_TRAN_TYPE, null, 'anyof', stTranTypeId),
                       new nlobjSearchFilter(FLD_APP_RULE_GRP_IS_INACTIVE, null, 'is', 'F'),
                       new nlobjSearchFilter(FLD_RULES_INC_IN_WF, FLD_RULES_RULE_GRP, 'is', 'T'),
                       new nlobjSearchFilter(FLD_RULES_SEQUENCE,FLD_RULES_RULE_GRP,'greaterthanorequalto',intLastSeq)];
            
            if(stSubsidiary)
            	fil.push(new nlobjSearchFilter(FLD_APP_RULE_GRP_SUBSD, null, 'anyof', stSubsidiary));
            
            var arrRes = nlapiSearchRecord(REC_RULE_GRP, null, fil, col);
            
            if (!arrRes){
                var fil = [new nlobjSearchFilter(FLD_APP_RULE_GRP_TRAN_TYPE, null, 'anyof', stTranTypeId),
                           new nlobjSearchFilter(FLD_APP_RULE_GRP_SUBSD, null, 'anyof', '@NONE@'),
                           new nlobjSearchFilter(FLD_APP_RULE_GRP_IS_INACTIVE, null, 'is', 'F'),
                           new nlobjSearchFilter(FLD_RULES_INC_IN_WF, FLD_RULES_RULE_GRP, 'is', 'T'),
                           new nlobjSearchFilter(FLD_RULES_SEQUENCE,FLD_RULES_RULE_GRP,'greaterthanorequalto',intLastSeq)];
                var arrRes = nlapiSearchRecord(REC_RULE_GRP, null, fil, col);
            }
        }else{              
            var arrCol = [new nlobjSearchColumn(FLD_APP_RULE_GRP_PERCENT_TOL),
                          new nlobjSearchColumn(FLD_APP_RULE_GRP_AMT_TOL),
                          new nlobjSearchColumn(FLD_APP_RULE_GRP_DEF_CURR),
                          new nlobjSearchColumn(FLD_APP_RULE_GRP_USE_EXC_RATE)];
            var arrFil = [new nlobjSearchFilter(FLD_APP_RULE_GRP_TRAN_TYPE, null, 'anyof', stTranTypeId),
                          new nlobjSearchFilter(FLD_APP_RULE_GRP_IS_INACTIVE, null, 'is', 'F')];
            

            if(stSubsidiary)
            	arrFil.push(new nlobjSearchFilter(FLD_APP_RULE_GRP_SUBSD, null, 'anyof', stSubsidiary));
            
            arrRes = nlapiSearchRecord(REC_RULE_GRP, null, arrFil, arrCol);

            if (!arrRes){
                var arrFil = [new nlobjSearchFilter(FLD_APP_RULE_GRP_TRAN_TYPE, null, 'anyof', stTranTypeId),
                              new nlobjSearchFilter(FLD_APP_RULE_GRP_SUBSD, null, 'anyof',  '@NONE@'),
                              new nlobjSearchFilter(FLD_APP_RULE_GRP_IS_INACTIVE, null, 'is', 'F')];
                arrRes = nlapiSearchRecord(REC_RULE_GRP, null, arrFil, arrCol);
            }
        }
        if (arrRes){     
            response.write(JSON.stringify(arrRes));
        }else{
            response.write('error');
        }
    }
    catch(error)
    {
        defineError('suitelet_getRuleGroupDetails', error);
        response.write('error');
    }
}


/**
* Suitelet   : NSTS | GAW - Approval Via Email
*              customscript_nsts_gaw_apprv_via_email_sl
* Approve transaction via email; When no email capture is enabled:
* @param {nlobjRequest} request Request object
* @param {nlobjResponse} response Response object
* @returns {Void} Any output is written via response object
* @author Rose Ann Ilagan
* @version 1.0
*/

function suitelet_ApproveOnEmail(request, response)
{
    var stBeginHtml =  '<html><body><p>Approval Via Email</p>';
    var stParams = '';
    var stHtml = '';
    var stEndHtml =  '</body></html>';

    var sToday = nlapiDateToString(new Date(),'datetimetz');
    try{
        var stApproverId = request.getParameter('approverId');
        var stApproverRole = request.getParameter('approverRole');
        var stTransactionId = request.getParameter('tranId');
        var stTransactionType = request.getParameter('tranType');
        var stAdmin = request.getParameter('admin');
        var stAction = request.getParameter('action');

        initializeMappingFields(stTransactionType);
        

        //for transaction link
        var recordUrl =  getTransURL( stTransactionType, stTransactionId);  //nlapiResolveURL('RECORD', stTransactionType, stTransactionId);  
        
        //check if all parameters are defined
        if ((stApproverId || stApproverRole) && stTransactionId && stTransactionType && stAction){

            //load record
            var record = nlapiLookupField(stTransactionType,stTransactionId,['tranid',FLD_APPROVAL_STATUS,'status',FLD_APPRVR_TYPE,FLD_NXT_APPRVRS]);
            var stTranId =  record['tranid'];
            
            //get approval status
            var stApprovalStatus =  record[FLD_APPROVAL_STATUS];
            /** for debugging purposes*/
            //nlapiLogExecution('DEBUG', 'Record Successfully loaded', 'Parameters: '+
            //                                                        ' stApproverId: '+stApproverId+
            //                                                        ' stApproverRole: '+stApproverRole+
            //                                                        ' stTransactionId: '+stTransactionId+
            //                                                        ' stTransactionType: '+stTransactionType+
            //                                                        ' stAdmin: '+stAdmin+
            //                                                        ' stAction: '+stAction+
            //                                                        ' stTranId: '+stTranId+
            //                                                        ' stApprovalStatus: '+stApprovalStatus);                        

            if(stApprovalStatus == HC_STATUS_PENDING_APPROVAL && (record['status'].toLowerCase() != 'cancelled')){
                var arrApprovers = searchApprovers(stTransactionId,null);
                if(record[FLD_APPRVR_TYPE] == HC_APPRVL_TYPE_LIST_APPRVRS || record[FLD_APPRVR_TYPE] == HC_APPRVL_TYPE_LINE_APPRVRS){
                    var stNextApprovers = record[FLD_NXT_APPRVRS];
                    stNextApprovers     = getMultiApproverList(stNextApprovers);
                    if(checkEmpApprover(stApproverId,stNextApprovers)){
                        try{
                            var arrList = searchApprovers(stTransactionId,stApproverId);
                            if(arrList){     
                                //Update approver list
                                for(var icount=0;icount < arrList.length;icount++){
                                    var stAppListId = nlapiSubmitField(REC_APPROVER_LIST, arrList[icount].getId(),  [FLD_LIST_APPROVED, FLD_LIST_APPROVER_LINE_STATUS, FLD_LIST_APPROVER_DATE],['T', HC_STATUS_APPROVED,sToday]);                                       
                                }
                                stNextApprvrs = getMultiApproverList(stNextApprovers);
                                var remApprover = removeUserFromNextApprovers(stApproverId,stNextApprvrs);
                                stNextApprvrs = remApprover;
                                //Update transaction next approvers
                                var rec = nlapiLoadRecord(stTransactionType,stTransactionId);
                                rec.setFieldValues(FLD_NXT_APPRVRS,stNextApprvrs);
                                rec.setFieldValue(FLD_APPROVAL_VIA_EMAIL,HC_APPROVE_ACTION);
                                nlapiSubmitRecord(rec);
                            }
                            //nlapiSubmitField(stTransactionType, stTransactionId,[FLD_APPROVAL_STATUS, FLD_NEXT_APPROVER,FLD_APPROVAL_VIA_EMAIL], [HC_STATUS_PENDING_APPROVAL, null,HC_APPROVE_ACTION],true);                            
                        }catch(error){
                            defineError('suitelet_ApproveOnEmail', error);
                        }
                        stParams ='<p>You have successfully approved this transaction. Kindly login to '+"<a href='"+recordUrl+"'>view<a/>" +' the record. </p>';
                    }else{
                        stParams ="<p>You don't have permission to approve this transaction." + ' Kindly login to '+"<a href='"+recordUrl+"'>view<a/>" +' the record. </p>';
                    }
                }else if (arrApprovers){
                    var arrApproverRecId = arrApprovers[0].getId();
                    var dateToday = nlapiDateToString(new Date());
                    var arrApproverId =  arrApprovers[0].getValue(FLD_LIST_TRAN_APPROVER);
                    var arrApproverRole = arrApprovers[0].getValue(FLD_LIST_APPROVER_ROLE);

                   // var delegate = arrApprovers[0].getValue(FLD_DELEGATE);
                    var ruleSequence = arrApprovers[0].getValue(FLD_RULES_SEQUENCE);                                  
                   
                    if ((stApproverId == arrApproverId) ||
                        (arrApproverRole == stApproverRole)){                       
                        try{
                            nlapiSubmitField(stTransactionType, stTransactionId,[FLD_APPROVAL_STATUS, FLD_NEXT_APPROVER, FLD_DELEGATE,FLD_APPROVAL_VIA_EMAIL], [HC_STATUS_PENDING_APPROVAL, null, 'F',HC_APPROVE_ACTION],true);                            
                        }catch(error){
                            defineError('suitelet_ApproveOnEmail', error);
                            if(stTransactionType == 'journalentry'){
                                stTransactionType = 'intercompanyjournalentry';
                                nlapiSubmitField(stTransactionType, stTransactionId,[FLD_APPROVAL_STATUS, FLD_NEXT_APPROVER, FLD_DELEGATE,FLD_APPROVAL_VIA_EMAIL], [HC_STATUS_PENDING_APPROVAL, null, 'F',HC_APPROVE_ACTION],true);                                                            
                            }
                        }
                        stParams ='<p>You have successfully approved this transaction. Kindly login to '+"<a href='"+recordUrl+"'>view<a/>" +' the record. </p>';

                    }else{
                        stParams ="<p>You don't have permission to approve this transaction." + ' Kindly login to '+"<a href='"+recordUrl+"'>view<a/>" +' the record. </p>';
                    }
                }else{
                    stParams ="<p>There are no approver lists found for this transaction."+ ' Kindly login to '+"<a href='"+recordUrl+"'>view<a/>" +' the record. </p>';
                }                
            }else{
                stParams ="<p>You don't have permission to approve this transaction."+' Kindly login to view the record. </p>'+"<b><a href='"+recordUrl+"'>View Record<a/></b>";
            }
        }
        else{
            stParams = '<p>ERROR.</p>';
        }
    }catch(error){
        params = '<p>ERROR.</p>';
        defineError('suitelet_ApproveOnEmail', error);
    }
    stHtml = stBeginHtml+stParams+stEndHtml;
    response.write( stHtml ); 
}
/**
* Suitelet   : NSTS | GAW - Deploy/Undeploy Scripts
*              customscript_nsts_gaw_deploy
* This Function deploy/undeploy GAW scripts
* @param {nlobjRequest} request Request object
* @param {nlobjResponse} response Response object
* @returns {Void} Any output is written via response object
* @author Rose Ann Ilagan
* @version 1.0
*/

function getAllGAWScripts(){
	var arrScriptIds = [];
	try{
		var fil = 	[new nlobjSearchFilter('scriptid', null, 'startswith', 'customscript_nsts_gaw'),
		          	new nlobjSearchFilter('isinactive', null, 'is', 'F')];
		var res = nlapiSearchRecord('script', null, fil,[new nlobjSearchColumn('name'), new nlobjSearchColumn('scripttype'), new nlobjSearchColumn('scriptid')]);
		for(var i=0; i<res.length; i++){
			var stScriptId = res[i].getId();
			arrScriptIds.push(parseInt(stScriptId));
		}
	}catch(error){
        
	}
	return arrScriptIds;
}

function suitelet_deployScript(request, response){
    var stRecordType 	= request.getParameter("custpage_rectype");
    var stDeploy 		= request.getParameter("custpage_deployaction");
	var stDesc = "<p>Please set the record type and the deploy action. <br/> For the 'recordtype' parameter, specify the base record type of the transaction. Example: 'purchaseorder','journalentry','intercompanyjournalentry','expensereport' etc<br/>";
	var stRet 			= '';
	var arrUEScripts 	= [];
	var arrCSScripts 	= [];
	var arrWAScripts 	= [];
	//Create Form
	var frm = nlapiCreateForm('Deploy/Undeploy GAW Scripts', false);
	
	if(stRecordType){
		stRecordType = stRecordType.trim();
		if(stRecordType.length <= 0){
			stRecordType = null;
		}
	}
	
	/******************************Show Form******************************************************************/
	var objFld = frm.addField("desc1", "inlinehtml","html").setBreakType('startcol').setDefaultValue(stDesc);
		nlapiLogExecution('error','obj',objFld);
		//objDesc.setLayoutType('outside','startrow');
		frm.addField("custpage_rectype", "text", "Record Type ID");
		var objDeploy = frm.addField("custpage_deployaction", "select", "Deploy Action");
		objDeploy.addSelectOption('1', 'Deploy');
		objDeploy.addSelectOption('2', 'Undeploy');
		frm.addSubmitButton("Submit");
	/**********************************************************************************************************/
	
	if(!stRecordType){		
		response.writePage(frm);
		return null;
	}
	//Set Record Type to Upper Case
	stRecordType = stRecordType.toUpperCase();
	
	//Deploy All Scripts
	try{
		//*****************************************Deploy scripts by searching all script deployments and setting it to active***************************************/
		var fil = 	[new nlobjSearchFilter('scriptid', null,  'startswith', 'customdeploy_nsts_gaw'),                    
					new nlobjSearchFilter('recordtype', null, 'anyof', stRecordType)];
		var res = nlapiSearchRecord('scriptdeployment', null, fil, [new nlobjSearchColumn('name', 'script'),new nlobjSearchColumn('scripttype', 'script'),new nlobjSearchColumn('scriptid', 'script'),new nlobjSearchColumn('script')]);
		
		var stDeployText = 'undeployed';
		if(stDeploy == '1')
			stDeployText = 'deployed';
		stRet = stRet + "<br/><p><b>Kindly check status of the following scripts that are successfully "+stDeployText+" to the record type '"+stRecordType+"'. </b></p><br/>";
		stRet = stRet + "<table border='1' style='width:100%'><tr><td><b>Script Name</b></td><td><b>Status</b></td><td><b>Details</b></td></tr>";
		var bCreateDep = false;
		var stError = '';
		var arrScriptIdsDeployed = [];
		if(res){
			for(var i=0; i<res.length; i++){
				var stScriptName = res[i].getValue('name','script');
				var stScriptCustId = res[i].getValue('scriptid','script');
				var stScriptType = res[i].getValue('scripttype','script').toUpperCase();
				try{
					if(stDeploy == '1')						
						nlapiSubmitField('scriptdeployment', res[i].getId(), ['isdeployed','status','loglevel','runasrole','allroles'],
																			['T','RELEASED', 'ERROR','3', 'T', 'T']);
					else
						nlapiSubmitField('scriptdeployment', res[i].getId(), ['isdeployed'], ['F']);
					arrScriptIdsDeployed.push(parseInt(res[i].getValue('script')));
				}catch(error){
					stError = error.toString();
				}
				var stDetails = '';
				if(stError){
					stDetails =  "<tr><td>"+stScriptName+"</td><td>ERROR</td><td>"+stError+"</td></tr>";
				}else{
					stDetails = "<tr><td>"+stScriptName+"</td><td>SUCCESSFUL</td><td></td></tr>";				
				}
				//Add to Array
				if(stScriptType == 'USEREVENT' && !isEmptyVariantVar(stDetails))
					arrUEScripts.push(stDetails);
				else if(stScriptType == 'CLIENT' && !isEmptyVariantVar(stDetails))
					arrCSScripts.push(stDetails);
				else if(stScriptType == 'ACTION' && !isEmptyVariantVar(stDetails))
					arrWAScripts.push(stDetails);
					
			}		
		}else{
			//If no GAW scripts found, set Flag to create script deployments
			bCreateDep = true;
		}
		//*****************************************************************************************************************************************************************
		
		var arrGAWScripts = getAllGAWScripts();
		Array.prototype.diff = function(a) {
		    return this.filter(function(i) {return a.indexOf(i) < 0;});
		};
		var arrToDeployScripts = [];
		if(!bCreateDep && !isEmptyVariantVar(arrGAWScripts)){
			if(arrScriptIdsDeployed.length > arrGAWScripts.length)
				arrToDeployScripts = arrScriptIdsDeployed.diff(arrGAWScripts);
			else 
				arrToDeployScripts = arrGAWScripts.diff(arrScriptIdsDeployed);
			
			
		}

		//************************CReate Script Deployments for specified recordtype**************************************************************************************
		if((bCreateDep || !isEmptyVariantVar(arrToDeployScripts)) && stDeploy == '1'){
			var fil = null;
			if(bCreateDep){
				fil = 	[new nlobjSearchFilter('scriptid', null, 'startswith', 'customscript_nsts_gaw'),
			     		new nlobjSearchFilter('isinactive', null, 'is', 'F')];
			}else{
				fil = 	[new nlobjSearchFilter('internalid', null, 'anyof', arrToDeployScripts),
				         new nlobjSearchFilter('isinactive', null, 'is', 'F')];
			}
			var res = nlapiSearchRecord('script', null, fil,[new nlobjSearchColumn('name'), new nlobjSearchColumn('scripttype'), new nlobjSearchColumn('scriptid')]);		
			if(res){
				for(var i=0; i<res.length; i++){
					stError = '';
					var stScriptName = res[i].getValue('name');
					var stScriptType = res[i].getValue('scripttype');
					var stCustScriptId = res[i].getValue('scriptid');
					
					if(!(stScriptType))
						stScriptType = stScriptType.toUpperCase();
					
					if(!(stCustScriptId))
						stCustScriptId = stCustScriptId.toLowerCase();
					
					var stStatus = null;
					try{
						if(stScriptType == 'ACTION' || stScriptType == 'USEREVENT' || stScriptType == 'CLIENT'){
							if(stCustScriptId.toLowerCase() != 'customscript_nsts_gaw_suitelet_valid_cs' && stCustScriptId.toLowerCase() != 'customscript_nsts_gaw_adv_bulk_client'){
								var rec = nlapiCreateRecord('scriptdeployment', {'script':res[i].getId()});
					            rec.setFieldValue('recordtype', stRecordType);
					            rec.setFieldValue('status', 'RELEASED');
					            rec.setFieldValue('loglevel', 'ERROR');
					            rec.setFieldValue('runasrole', '3');
					            rec.setFieldValue('isdeployed', 'T');
					            rec.setFieldValue('allroles', 'T');
					            rec.setFieldValue('allemployees', 'T');
					            rec.setFieldValue('scriptid', '_nsts_gaw_'+ new Date().getTime());
					            var id = nlapiSubmitRecord(rec);	
					            stStatus = true;
							}						
						}else{
							stStatus = false;
						}
					}catch(error){
						stError = error.toString();
						stStatus = false;
					}
					var stDetails = '';
					if(stError){
						stDetails = "<tr><td>"+stScriptName+"</td><td>ERROR</td><td>"+stError+"</td></tr>";
					}else{
						if(stStatus)
							stDetails = "<tr><td>"+stScriptName+"</td><td>SUCCESSFUL</td><td></td></tr>";				
					}

					//Add to Array
					if(stScriptType == 'USEREVENT' && !isEmptyVariantVar(stDetails))
						arrUEScripts.push(stDetails);
					else if(stScriptType == 'CLIENT' && !isEmptyVariantVar(stDetails))
						arrCSScripts.push(stDetails);
					else if(stScriptType == 'ACTION' && !isEmptyVariantVar(stDetails))
						arrWAScripts.push(stDetails);
				}
			}
		}
		
		//Output all Scripts Deployed
		stRet = stRet + "<tr><td colspan=3><b>"+arrUEScripts.length+" USER EVENT SCRIPTS</b></td></tr>";		
		for(var i=0; i< arrUEScripts.length;i++){
			stRet = stRet + arrUEScripts[i];	
		}
		stRet = stRet + "<tr><td colspan=3><b>"+arrCSScripts.length+" CLIENT SCRIPTS</b></td></tr>";		
		for(var i=0; i< arrCSScripts.length;i++){
			stRet = stRet + arrCSScripts[i];	
		}
		stRet = stRet + "<tr><td colspan=3><b>"+arrWAScripts.length+" WORKFLOW ACTION SCRIPTS</b></td></tr>";		
		for(var i=0; i< arrWAScripts.length;i++){
			stRet = stRet + arrWAScripts[i];	
		}
		stRet = stRet + '</table>';
		frm.addField("desc", "inlinehtml", "html").setDefaultValue(stRet);
	}catch(error){
        defineError('deployscripts', error);	
		frm.addField("desc", "inlinehtml", "html").setDefaultValue("<p>Please set the 'recordtype' and 'deployScript' parameter. <br/>For the 'deployScript' parameter, specify true to deploy and false to undeploy. For the 'recordtype' parameter, specify the base record type of the transaction. <br/>Example: https://system.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=1832&deploy=1&recordtype=<b>purchaseorder</b>&deployScript=<b>true</b></p>");
		response.writePage(frm);
	}
	response.writePage(frm);
}
//***************************************************************************OTHER SUPPORTING FUNCTIONS - STARTS HERE**********************************************//

/**
* Close suitelet form and redirect
* @param (object form, string record id, string record type)
* @return null
* @type object
* @author Jaime Villafuerte
* @version 1.0
*/
function closeAndRedirect(form, recordId, recType)
{
    var url = null;
        url = getTransURL( recType, recordId);
    
    var scriptFld = form.addField("scripttxt", "inlinehtml");
    
    if (nlapiGetContext().name == '-System-'){ //if approved via email
        scriptFld.setDefaultValue(
                "<script language='javascript'>" +
                "window.location='" + url + "';" +
                "window.ischanged = false;" +
                "</script>"
            );
    }else{
        scriptFld.setDefaultValue(
                "<script language='javascript'>" +
                "window.opener.location='"+url+"';" +
                "window.ischanged = false;" +
                "window.close();" + 
                "</script>"
         );     
    }
}
/**
* Show error on rejection
* @param (object form, string record id, string record type)
* @return null
* @type object
* @author Jaime Villafuerte
* @version 1.0
*/
function rejectError(form, response, url, stApproveViaEmail){
    form.addField('custpage_error', 'label','You do not have permission to reject this transaction.');
    
    var msg =   '<html>'+
                    '<body><p>Reject Via Email</p>'+
                        '<p>Error: Transaction has already been approved or rejected.' + 
                        ' Kindly login to '+"<a href='"+url+"'>view<a/>" +' the record. </p>'+
                    '</body>'+
                '</html>';          
    
    //Add close button if executed via user interface
    if(!stApproveViaEmail){
        form.addButton('custpage_close', 'Close', "window.opener.location='"+url+"';window.ischanged = false;window.close();");
        response.writePage(form); 
    }else{
        //Show message if via email
        response.write(msg); 
    }
}
/*
 * ============================================================
 *      #CLOAKING DECLARATION
 * ============================================================
*/
/**
 * This Function will handle the cloaking Functionality
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet_Cloaking(request, response)
{
    try{

        var stLogTitle   = 'SUITELETCLOAKING';
        var stActionType = request.getParameter(SL_PARAM_CLK_ACTIONTYPE);
        var stRecType    = request.getParameter(SL_PARAM_CLK_RECORDTYPE);
        var stId         = request.getParameter(SL_PARAM_CLK_TXNID);
        var stcurrentUser = nlapiGetContext().getUser();
        var stcurrentRole = nlapiGetContext().getRole();
        //initializeMappingFields(stRecType);

        var rec = nlapiLoadRecord(stRecType,stId);
        var stApprovedEmail = rec.getFieldValue(FLD_APPROVAL_VIA_EMAIL);
        var stTrigApprove   = rec.getFieldValue(FLD_CUSTBODY_CLK_TRIG_APPROVE);
        var stTrigSubmit    = rec.getFieldValue(FLD_CUSTBODY_CLK_TRIG_SUBMIT);
        var stTrigSuper     = rec.getFieldValue(FLD_CUSTBODY_CLK_TRIG_SUPER);
        var stNextApprovers     = rec.getFieldValues(FLD_NXT_APPRVRS);
        var stRoleApprover      = rec.getFieldValue(FLD_NXT_ROLE_APPRVRS);
        

        if(stApprovedEmail == 'T' ||
            stTrigApprove == 'T' || 
            stTrigSubmit == 'T' ||
            stTrigSuper == 'T'){
            rec.setFieldValue(FLD_CUSTBODY_CLK_TRIG_SUBMIT,'F');
            rec.setFieldValue(FLD_CUSTBODY_CLK_TRIG_APPROVE,'F');
            rec.setFieldValue(FLD_CUSTBODY_CLK_TRIG_REJECT,'F');
            stId = nlapiSubmitRecord(rec,false,true);
            response.write('IN PROCESS');
            return;
        }
        if(stActionType == HC_SUBMIT_ACTION)
        {
            rec.setFieldValue(FLD_CUSTBODY_CLK_TRIG_SUBMIT,'T');
            rec.setFieldValue(FLD_CUSTBODY_CLK_TRIG_APPROVE,'F');
            rec.setFieldValue(FLD_CUSTBODY_CLK_TRIG_REJECT,'F');
            //rec.setFieldValue(FLD_CUSTBODY_CLOAKING_INPROG,'T');
            stId = nlapiSubmitRecord(rec,false,true);
            response.write('SUBMIT');
        }
        else if(stActionType == HC_APPROVE_ACTION)
        {
            if((checkEmpApprover(stcurrentUser,stNextApprovers))||(stcurrentRole == stRoleApprover)){               
                rec.setFieldValue(FLD_CUSTBODY_CLK_TRIG_SUBMIT,'F');
                rec.setFieldValue(FLD_CUSTBODY_CLK_TRIG_APPROVE,'T');
                rec.setFieldValue(FLD_CUSTBODY_CLK_TRIG_REJECT,'F');
                //rec.setFieldValue(FLD_CUSTBODY_CLOAKING_INPROG,'T');
                stId = nlapiSubmitRecord(rec,false,true);
                response.write('APPROVE');  
            }
        }
        response.write('CLOAKING');
    }catch(error){
        defineError('suitelet_Cloaking',error);
    }
} 