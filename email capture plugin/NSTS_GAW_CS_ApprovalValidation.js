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
* This script contains client script functions used in general advanced approval workflow
* 
* Version Type    Date            Author           Remarks
* 1.00    Create  06 Mar 2014     Russell Fulling
* 1.01    Edit    29 May 2014     Jaime Villafuerte III/Dennis Geronimo
* 1.02    Edit    2 Mar 2015      Rose Ann Ilagan
*/

//**********************************************************************GLOBAL VARIABLE DECLARATION - STARTS HERE***************************************************//

//SAVED SEARCH
var SS_SEARCH_RULES = 'customsearch_nsts_gaw_rule_search';

//OTHER HARDCODED VALUES
var HC_DEBUG = true;
var HC_MSG_CONFIRM_SAVE = "The transaction amount has been changed.\n\n The approval process will be reset. \n Click Ok to continue or Cancel to abort the changes.";
var HC_LINE_APPRVR_MSG_CONFIRM_SAVE = "Some of the line approvers has been changed.\n\n The approval process will be reset. \n Click Ok to continue or Cancel to abort the changes.";


//for storage of values
var stSELECTED_APPROVAL_DELEGATE = '';
var stSELECTED_RULE_TYPE 		= '';

//SUITELET
var SCRIPT_SAVE_REC_SUITELET 	= 'customscript_nsts_gaw_transaverecord_sl';
var DEPLOY_SAVE_REC_SUITELET 	= 'customdeploy_nsts_gaw_transaverecord_sl';
var stOrigAmount_pageInit		= null;
var objRecSublistDetails 		= new Object();
//**********************************************************************GLOBAL VARIABLE DECLARATION - ENDS HERE*****************************************************//


/**
 * Save Record: NSTS | GAW - Global Validation CS
 * 				customscript_nsts_gaw_apvd_valdxn_cs
 * Validation upon save record
 * @param null
 * @returns {Boolean} True to continue save, false to abort save
 * @author Jaime Villafuerte
 * @version 1.0
 */
function validateTransactionSaveRecord()
{
    try{
	    var bretVal = true;
	    var stRecType = stTransRecordType;
	    if (!isEmpty(stRecType)){
	        stRecType = stRecType.toLowerCase();
	    }
	    switch (stRecType){
	        case REC_RULE_GRP:
	            bretVal = ruleGroupSaveRecord();
	            break;
	        case REC_APPROVAL_RULE:
	    	    bretVal = ruleSaveRecord();
	            break;
	        case 'employee':
	            bretVal = employeeSaveRecord();
	            break;
	        case 'journalentry':
	        	setTotalDebitAmountInJE();            
	            break;   
	        case 'intercompanyjournalentry':
	        	setTotalDebitAmountInJE();            
	            break;    
	        case 'purchaseorder':
	        	var stEmp = nlapiGetFieldValue('employee');
	        	var stReqFld = nlapiGetFieldValue(FLD_REQUESTOR);
	        	
	        	if (stEmp != stReqFld){
	        		nlapiSetFieldValue(FLD_REQUESTOR,stEmp,false);
	        	}
	        	break;      
	        case 'expensereport':
	        	var stEmp = nlapiGetFieldValue('entity');
	        	var stReqFld = nlapiGetFieldValue(FLD_REQUESTOR);
	        	
	        	if (stEmp != stReqFld){
	        		nlapiSetFieldValue(FLD_REQUESTOR,stEmp,false);
	        	}
	        	break;
	        
	        case null: //This is the SUITELET
	            bretVal = suiteletDelegateSaveRecord();
	            break; 
	    }
	    
	    if (bretVal && stRecType){
			bretVal = transactionSaveRecord(); 
		}
		
	    return (bretVal);
	}catch(error){
		defineError('validateTransactionSaveRecord',error);
		return false;
	}
}

/**
 * Post Sourcing:   NSTS | GAW - Global Validation - CS
 *                  customscript_nsts_gaw_apvd_valdxn_cs
 * Set department of requestor on vendor bills.
 * @param null
 * @returns{Void}
 * @author Rachelle Barcelona
 * @version 1.0
 */
function setDepartmentPostSourcing(type, name) {
    var stRecType = stTransRecordType;
    if (!isEmpty(stRecType)){
        stRecType = stRecType.toLowerCase();
    }
    if (stRecType === 'vendorbill' && name == 'entity'){
        var stRequestor = nlapiGetFieldValue(FLD_REQUESTOR);
        var stDepartment =  getRequestorDepartment(stRequestor);
        if(stRequestor != '') {
            nlapiSetFieldValue('department', stDepartment, false);
        }
    }
}

/**
 * Field Changed: 	NSTS | GAW - Global Validation - CS
 * 					customscript_nsts_gaw_apvd_valdxn_cs
 * Check all field changes
 * @param null
 * @returns{Boolean} True if valid, false if invalid
 * @author Jaime Villafuerte
 * @version 1.0
 */
function checkValueFieldChanged(type, name, linenum)
{
	try{
	    var stRecType = stTransRecordType;
	    if (!isEmpty(stRecType)){
	        stRecType = stRecType.toLowerCase();
	    }
	    if (stRecType === REC_APPROVAL_RULE){    	
	        if (name === FLD_RULES_MINAMT){
	        	var flMinAmount = nlapiGetFieldValue(FLD_RULES_MINAMT);
	            if (parseFloat(flMinAmount) < 0){
	            	alert('Minimum amount must be greater than or equal to 0.');
	                nlapiSetFieldValue(FLD_RULES_MINAMT, '0', false);
	            }
	        }
	        else if (name === FLD_RULES_APPRVR_TYPE){
	    	    var stType = nlapiGetFieldValue(name);
	            var stfld_custrecord_tsg_po_approver = FLD_RULES_APPRVR;
	            var stfld_custrecord_tsg_po_roleytype = FLD_RULES_ROLETYPE;
	            var stfld_custrecord_tsg_po_emailaddress = FLD_RULES_ROLE_EMAIL;
	            var stfld_custrecord_tsg_appr_on_record_fld = FLD_RULES_APPRVR_REC_FLD;
	            var stfld_custrecord_tsg_rec_on_tran_fld_id = FLD_RULES_TRANS_MAPPED_FLD_ID;
	            var stfld_custrecord_tsg_appr_on_rectype = FLD_RULES_APPRVR_REC_TYPE;

	            nlapiSetFieldMandatory(stfld_custrecord_tsg_po_approver, false);
	            nlapiSetFieldMandatory(stfld_custrecord_tsg_po_roleytype, false);

	            nlapiDisableField(stfld_custrecord_tsg_po_approver, false);
	            nlapiDisableField(stfld_custrecord_tsg_po_roleytype, false);
	            nlapiDisableField(stfld_custrecord_tsg_po_emailaddress, false);
	            
	            var stgrpid = nlapiGetFieldValue(FLD_RULES_RULE_GRP);
	            var recRulrGroup = (!isEmpty(stgrpid)) ? nlapiLoadRecord(REC_RULE_GRP, stgrpid) : null;
	            if (recRulrGroup){
	                var sttranType = recRulrGroup.getFieldValues(FLD_APP_RULE_GRP_TRAN_TYPE);
		    	    switch (sttranType)
	                {
	                    case '1': //Purchase Order
	                    case '2': //Vendor Bill
	                    case '7': //Requisition
	                    case '6': //Expense Report
	                        break; //Purchase Order
	                    default:
	                        if (stType == '5'){
	                            alert('Employee Hierarchy is not Applicable'); //+ recRulrGroup.getFieldText(FLD_APP_RULE_GRP_TRAN_TYPE));

	                            stSELECTED_RULE_TYPE = (stSELECTED_RULE_TYPE != '5') ? stSELECTED_RULE_TYPE : '';

	                            nlapiSetFieldValue(name, stSELECTED_RULE_TYPE, false);
	                        }
	                        else if (stType == '2'){
	                            alert('Supervisor Approval is not Applicable.');
	                            stSELECTED_RULE_TYPE = (stSELECTED_RULE_TYPE != '2') ? stSELECTED_RULE_TYPE : '';
	                            nlapiSetFieldValue(name, stSELECTED_RULE_TYPE, false);
	                        }                    	
	                        else if ((stType == '1')&&(sttranType == '5')){
	                            alert('Department Approval is not Applicable');
	                            stSELECTED_RULE_TYPE = (stSELECTED_RULE_TYPE != '1') ? stSELECTED_RULE_TYPE : '';
	                            nlapiSetFieldValue(name, stSELECTED_RULE_TYPE, false);
	                        }                    	
	                        else{
	                            stSELECTED_RULE_TYPE = stType;
	                        }
	                }
	            }
	            
	            if (stType!= '3'){
	            	nlapiDisableField(stfld_custrecord_tsg_po_approver, true);
	            	nlapiSetFieldValue(stfld_custrecord_tsg_po_approver, '');              
	                nlapiSetFieldMandatory(stfld_custrecord_tsg_po_emailaddress, false);
	            }
	            
	            if (stType != '4'){
	                nlapiDisableField(stfld_custrecord_tsg_po_roleytype, true);
	                nlapiDisableField(stfld_custrecord_tsg_po_emailaddress, true);
	                
	                nlapiSetFieldValue(stfld_custrecord_tsg_po_emailaddress, '');
	                nlapiSetFieldValue(stfld_custrecord_tsg_po_roleytype, '');

	                nlapiSetFieldMandatory(stfld_custrecord_tsg_po_roleytype, false);             
	                nlapiSetFieldMandatory(stfld_custrecord_tsg_po_emailaddress, false);
	            }
	            if (stType != '8'){
	            	nlapiDisableField(stfld_custrecord_tsg_appr_on_record_fld, true);
	                nlapiDisableField(stfld_custrecord_tsg_rec_on_tran_fld_id, true);
	                nlapiDisableField(stfld_custrecord_tsg_appr_on_rectype, true);

	                nlapiSetFieldValue(stfld_custrecord_tsg_appr_on_record_fld, '',false);
	                nlapiSetFieldValue(stfld_custrecord_tsg_rec_on_tran_fld_id, '',false);
	                nlapiSetFieldValue(stfld_custrecord_tsg_appr_on_rectype, '',false);
	                
	                nlapiSetFieldMandatory(stfld_custrecord_tsg_appr_on_record_fld, false);
	                nlapiSetFieldMandatory(stfld_custrecord_tsg_rec_on_tran_fld_id, false);
	                nlapiSetFieldMandatory(stfld_custrecord_tsg_appr_on_rectype, false);                
	            }
	            
	            if (stType != '11'){
	            	nlapiDisableField(FLD_RULES_LINE_APPROVER, true);
	                nlapiSetFieldValue(FLD_RULES_LINE_APPROVER, '',false);
	                nlapiSetFieldMandatory(FLD_RULES_LINE_APPROVER, false); 
	            	nlapiDisableField(FLD_RULES_SUBLIST, true);
	                nlapiSetFieldValue(FLD_RULES_SUBLIST, '',false);
	                nlapiSetFieldMandatory(FLD_RULES_SUBLIST, false);
					nlapiDisableField(FLD_RULES_MINAMT, false);               
	            }
	            if (stType != '10'){
	            	nlapiDisableField(FLD_RULES_MULT_EMP, true);
	                nlapiSetFieldValues(FLD_RULES_MULT_EMP, [],false);
	                nlapiSetFieldMandatory(FLD_RULES_MULT_EMP, false);      
					nlapiDisableField(FLD_RULES_MINAMT, false);         
	            }

	            switch (stType)
	            {
	            
	                case '1':   //Department Approver
	                    break;
	                case '2':   //Supervisor Approver
	                    break;
	                case '3':   //Employee
	                    nlapiSetFieldMandatory(stfld_custrecord_tsg_po_approver, true);
	                    break;
	                case '4':    //Role
	                    nlapiSetFieldMandatory(stfld_custrecord_tsg_po_roleytype, true);                                        
	                    //nlapiSetFieldMandatory(stfld_custrecord_tsg_po_emailaddress, true);                                        
	                    nlapiSetFieldValue(stfld_custrecord_tsg_po_approver, '');
	                    break;
	                case '5':    //Employee Hierarchy
						nlapiSetFieldValue(FLD_RULES_MINAMT, '0', false);
						nlapiDisableField(FLD_RULES_MINAMT, true);
					    break;
	                case '8':    //Dynamic Rule
	                	nlapiDisableField(stfld_custrecord_tsg_appr_on_record_fld, false);
	                    nlapiDisableField(stfld_custrecord_tsg_rec_on_tran_fld_id, false);
	                    nlapiDisableField(stfld_custrecord_tsg_appr_on_rectype, false);
	                    nlapiSetFieldMandatory(stfld_custrecord_tsg_appr_on_record_fld, true);
	                    nlapiSetFieldMandatory(stfld_custrecord_tsg_rec_on_tran_fld_id, true);
	                    nlapiSetFieldMandatory(stfld_custrecord_tsg_appr_on_rectype, true);
	                    break;
	                case '10':    //List of Approvers    
		            	nlapiDisableField(FLD_RULES_MULT_EMP, false);
		                nlapiSetFieldMandatory(FLD_RULES_MULT_EMP, true); 
						nlapiDisableField(FLD_RULES_MINAMT, true);
						nlapiSetFieldValue(FLD_RULES_MINAMT, '0', false);
		                break;
	                case '11':    //Line Approvers  
		            	nlapiDisableField(FLD_RULES_LINE_APPROVER, false);
		                nlapiSetFieldMandatory(FLD_RULES_LINE_APPROVER, true);
		            	nlapiDisableField(FLD_RULES_SUBLIST, false);
		                nlapiSetFieldMandatory(FLD_RULES_SUBLIST, true);  
						nlapiDisableField(FLD_RULES_MINAMT, true);
						nlapiSetFieldValue(FLD_RULES_MINAMT, '0', false);
	                    break;
	            }
	        }
	        else if (name == FLD_RULES_RULE_GRP){
	            stSELECTED_RULE_TYPE = '';
	            checkValueFieldChanged(type, FLD_RULES_APPRVR_TYPE, 0);
	        }
	    }
	    else if (stRecType == REC_RULE_GRP){
	        var stfld_custrecord_tsg_percent_tolerance = FLD_APP_RULE_GRP_PERCENT_TOL;
	        var stfld_custrecord_tsg_amt_tolerance = FLD_APP_RULE_GRP_AMT_TOL;

	        var stfld_custrecord_tsg_po_to_vb_var_amt = FLD_APP_RULE_GRP_PO_TO_VB_AMT;
	        var stfld_custrecord_tsg_po_to_vb_var_pct = FLD_APP_RULE_GRP_PO_TO_VB_PCT;

	        nlapiDisableField(stfld_custrecord_tsg_percent_tolerance, false);
	        nlapiDisableField(stfld_custrecord_tsg_amt_tolerance, false);

	        var flSetVal1_1 = parseFloat(nlapiGetFieldValue(stfld_custrecord_tsg_percent_tolerance));
	        var flSetVal1_2 = parseFloat(nlapiGetFieldValue(stfld_custrecord_tsg_amt_tolerance));

	        flSetVal1_1 = flSetVal1_1 ? flSetVal1_1 : 0;
	        flSetVal1_2 = flSetVal1_2 ? flSetVal1_2 : 0;

	        if (flSetVal1_1 > 0){
	            nlapiDisableField(stfld_custrecord_tsg_amt_tolerance, true);
	            nlapiSetFieldValue(stfld_custrecord_tsg_amt_tolerance, '', false);
	        }        
	        else if (flSetVal1_2 < 0){
	        	alert('Amount Tolerance must be greater than or equal to 0.');
	            nlapiSetFieldValue(stfld_custrecord_tsg_amt_tolerance, '', false);
	        }        
	        else if (flSetVal1_2 > 0){
	            nlapiDisableField(stfld_custrecord_tsg_percent_tolerance, true);
	            nlapiSetFieldValue(stfld_custrecord_tsg_percent_tolerance, '', false);
	        }

	        var stTranType = nlapiGetFieldValue(FLD_APP_RULE_GRP_TRAN_TYPE);
	        if (stTranType == '2'){
	            nlapiDisableField(stfld_custrecord_tsg_po_to_vb_var_amt, false);
	            nlapiDisableField(stfld_custrecord_tsg_po_to_vb_var_pct, false);

	            var flSetVal2_1 = parseFloat(nlapiGetFieldValue(stfld_custrecord_tsg_po_to_vb_var_amt));
	            var flSetVal2_2 = parseFloat(nlapiGetFieldValue(stfld_custrecord_tsg_po_to_vb_var_pct));

	            flSetVal2_1 = flSetVal2_1 ? flSetVal2_1 : 0;
	            flSetVal2_2 = flSetVal2_2 ? flSetVal2_2 : 0;
	            
	            if (flSetVal2_1 < 0)
	            {
	            	alert('PO TO VB VARIANCE AMOUNT must be greater than or equal to 0.');
	                nlapiSetFieldValue(stfld_custrecord_tsg_po_to_vb_var_amt, '', false);
	            }
	            else if (flSetVal2_1 > 0)
	            {
	                nlapiDisableField(stfld_custrecord_tsg_po_to_vb_var_pct, true);
	                nlapiSetFieldValue(stfld_custrecord_tsg_po_to_vb_var_pct, '', false);
	            }            
	            else if (flSetVal2_2 > 0)
	            {
	                nlapiDisableField(stfld_custrecord_tsg_po_to_vb_var_amt, true);
	                nlapiSetFieldValue(stfld_custrecord_tsg_po_to_vb_var_amt, '', false);
	            }
	        }
	        else{
	            nlapiDisableField(stfld_custrecord_tsg_po_to_vb_var_amt, true);
	            nlapiDisableField(stfld_custrecord_tsg_po_to_vb_var_pct, true);

	            nlapiSetFieldValue(stfld_custrecord_tsg_po_to_vb_var_amt, '', false);
	            nlapiSetFieldValue(stfld_custrecord_tsg_po_to_vb_var_pct, '', false);
	        }
	        //disable transaction type and subsidiary
	        
	        if (type == 'edit' && nlapiGetRecordId()){
	            nlapiDisableField(FLD_APP_RULE_GRP_SUBSD, true);
	            nlapiDisableField(FLD_APP_RULE_GRP_TRAN_TYPE, true);
	        }
	    }
	    else if (stRecType == 'employee'){
	        var stfld_custentity_tsg_delegate_from = FLD_DELEGATE_FROM;
	        var stfld_custentity_tsg_delegate_to = FLD_DELEGATE_TO;

	        if (name == FLD_APPROVAL_DELEGATE){
	            var id = nlapiGetRecordId();
	            var stTsgDelegateValue = nlapiGetFieldValue(name);

	            if (id == stTsgDelegateValue)
	            {
	                nlapiSetFieldValue(name, stSELECTED_APPROVAL_DELEGATE, false);               
	            } else
	            {
	                //Get the Previous Selected Approval Delegate
	                stSELECTED_APPROVAL_DELEGATE = stTsgDelegateValue;
	            }

	            stTsgDelegateValue = nlapiGetFieldValue(name);
	            if (isEmpty(stTsgDelegateValue)){            	
	            	nlapiDisableField(stfld_custentity_tsg_delegate_from, true);
	            	nlapiDisableField(stfld_custentity_tsg_delegate_to, true);
	            	
	                nlapiSetFieldMandatory(stfld_custentity_tsg_delegate_from, false);
	                nlapiSetFieldMandatory(stfld_custentity_tsg_delegate_to, false);

	                nlapiSetFieldValue(stfld_custentity_tsg_delegate_from, '', false);
	                nlapiSetFieldValue(stfld_custentity_tsg_delegate_to, '', false);
	            } else{            	
	            	nlapiDisableField(stfld_custentity_tsg_delegate_from, false);
	            	nlapiDisableField(stfld_custentity_tsg_delegate_to, false);
	            	
	                nlapiSetFieldMandatory(stfld_custentity_tsg_delegate_from, true);
	                nlapiSetFieldMandatory(stfld_custentity_tsg_delegate_to, true);
	            }
	        }
	    }
	    else if ((stRecType == "journalentry")||(stRecType == "intercompanyjournalentry")){
	        if (name == "approved"){
	            var stIsApprove = nlapiGetFieldValue(name);
	            if (stIsApprove == "T")
	            {
	                nlapiSetFieldValue(FLD_APPROVAL_STATUS, "2", false);
	            } else
	            {
	                nlapiSetFieldValue(FLD_APPROVAL_STATUS, "1", false);
	            }
	        }
	    }        
	    else if(stRecType == 'purchaseorder' || stRecType == 'vendorbill' || stRecType == 'expensereport'|| stRecType == 'purchaserequisition') {
	        var stRequestor = '';
	        if(name == FLD_REQUESTOR) {
	            stRequestor = nlapiGetFieldValue(FLD_REQUESTOR);
	            //alert('enter: '+stRequestor+ ' dept:'+nlapiLookupField('employee', stRequestor, 'department'));
	            if(stRequestor != '') {
	            	if(stRecType == 'purchaseorder'){
	            		nlapiSetFieldValue('employee', stRequestor,false,true);
	            		nlapiSetFieldValue('department', getRequestorDepartment(stRequestor),false);
	            	}
	            	if(stRecType == 'expensereport' || stRecType == 'purchaserequisition'){
	            		nlapiSetFieldValue('entity', stRequestor,false,true);
	            		nlapiSetFieldValue('department', getRequestorDepartment(stRequestor),false);
	            		//alert('dept: '+nlapiGetFieldValue('department'));
	            	}
	            	if(stRecType == 'vendorbill'){
	            		nlapiSetFieldValue('department', getRequestorDepartment(stRequestor),false);
	            		//alert('dept: '+nlapiGetFieldValue('department'));
	            	}
	            }
	            	 
	        }
	        /*
	         * 08/04/2017 hotfix
	         * Department sourcing on VB moved to post sourcing
	         */
//	        else if((name == 'entity')&&((stRecType == 'purchaseorder')||(stRecType == 'vendorbill'))) {
	        else if(name == 'entity' && stRecType == 'purchaseorder') {
	            stRequestor = nlapiGetFieldValue(FLD_REQUESTOR);
	            var dept =  getRequestorDepartment(stRequestor); 
	            //alert('enter: '+name+ ' dept:'+dept);
	            if(stRequestor != '') {
	                nlapiSetFieldValue('department', dept,true);
	            }
	            	 
	        }
	        else if(name == 'entity' && stRecType == 'expensereport') {
	            stRequestor = nlapiGetFieldValue('entity');
	            if(stRequestor != '') {
	            	nlapiSetFieldValue('department', getRequestorDepartment(stRequestor),false);
	            }
	        }       
	    }
	    else if (isEmpty(stRecType)){//this is the SUITELET
	    	if (name == 'custpage_tsg_delegate_'){

	            var stfld_custentity_tsg_delegate_from = 'custpage_tsg_delegate_from';
	            var stfld_custentity_tsg_delegate_to = 'custpage_tsg_delegate_to';

	            var id = nlapiGetUser();
	            var stTsgDelegateValue = nlapiGetFieldValue(name);

	            if (id == stTsgDelegateValue){
	                nlapiSetFieldValue(name, stSELECTED_APPROVAL_DELEGATE, false);
	                alert('Approval Delegate can\'t be the same as the Employee');
	            } else{
	                //Get the Previous Selected Approval Delegate
	                stSELECTED_APPROVAL_DELEGATE = stTsgDelegateValue;
	            }

	            var stTsgDelegateValue = nlapiGetFieldValue(name);
	            stTsgDelegateValue = nlapiGetFieldValue(name);
	            if (isEmpty(stTsgDelegateValue)){            	
	            	nlapiDisableField(stfld_custentity_tsg_delegate_from, true);
	            	nlapiDisableField(stfld_custentity_tsg_delegate_to, true);            	
	                nlapiSetFieldMandatory(stfld_custentity_tsg_delegate_from, false);
	                nlapiSetFieldMandatory(stfld_custentity_tsg_delegate_to, false);

	                nlapiSetFieldValue(stfld_custentity_tsg_delegate_from, '', false);
	                nlapiSetFieldValue(stfld_custentity_tsg_delegate_to, '', false);
	            } else{            	
	            	nlapiDisableField(stfld_custentity_tsg_delegate_from, false);
	            	nlapiDisableField(stfld_custentity_tsg_delegate_to, false);            	
	                nlapiSetFieldMandatory(stfld_custentity_tsg_delegate_from, true);
	                nlapiSetFieldMandatory(stfld_custentity_tsg_delegate_to, true);
	            }
	        }
	    }
	}catch(error){
		nlapiLogExecution('ERROR','checkValueFieldChanged',error.toString());
	}
}


/**
* Page Init: 	NSTS | GAW - Global Validation - CS
* 				customscript_nsts_gaw_apvd_valdxn_cs
* Initialized fields depending on record type
* @param {String} type access mode: create, copy, edit
* @returns {Void}
* @author Jaime Villafuerte
* @edited Rose Ann Ilagan
* @version 1.0
*/
function setDefaultValuesPageInit(type)
{ 
	try{
	    if(!type)
	    	return;
	    //Store Original Amount
	    if(FLD_TOTAL)
	    	stOrigAmount_pageInit = nlapiGetFieldValue(FLD_TOTAL);
	    
		//Set triggering of super approved state to false
		nlapiSetFieldValue(FLD_CUSTBODY_CLK_TRIG_SUBMIT, 'F', false, false);
		nlapiSetFieldValue(FLD_CUSTBODY_CLK_TRIG_SUPER, 'F', false, false);
		nlapiSetFieldValue(FLD_CUSTBODY_CLK_TRIG_APPROVE, 'F', false, false);
		nlapiSetFieldValue(FLD_CUSTBODY_CLK_TRIG_REJECT, 'F', false, false);
			
		//Check if in line approver type
		if(type == 'edit'){
			var stApproverType = nlapiGetFieldValue(FLD_APPRVR_TYPE);
			if(stApproverType == HC_APPRVL_TYPE_LINE_APPRVRS){
				getLineApproverRuleDetails();
			}
		}

	    if (type == 'copy'){
	    	nlapiSetFieldValue(FLD_CREATED_BY, nlapiGetUser() , false, true);
	    	nlapiSetFieldValue(FLD_REJECTION_REASON, '' , false, true);
	    	nlapiSetFieldValue(FLD_DELEGATE, 'F' , false, true);
	    	if(FLD_EMPLOYEE_VAL)
	    		nlapiSetFieldValue(FLD_EMPLOYEE_VAL, nlapiGetUser(), false, true);
	    	if(FLD_REQUESTOR)
	    		nlapiSetFieldValue(FLD_REQUESTOR, nlapiGetUser(), false, true);
	    }
	    try{
			if(type == 'copy'){
				nlapiSetFieldValues(FLD_NXT_APPRVRS, [],false);
				nlapiSetFieldValue(FLD_NXT_ROLE_APPRVRS, '',false);
				nlapiSetFieldValue(FLD_APPRVR_TYPE, null,false);
			}
		}catch(error){
			defineError('preventEditOnApprovedBeforeLoad set next approvers to null',error);
		}
	    var stRecType = stTransRecordType;
	    
	    if (!stRecType)
	    	return;
	    
	    if (!(isEmpty(stTransRecordType))){
	        stRecType = stRecType.toLowerCase();
	    }
	    
	    var name = '';
	    
	    if (stRecType === REC_APPROVAL_RULE){
	        name = FLD_RULES_APPRVR_TYPE;
	    }
	    else if (stRecType == REC_RULE_GRP){
	        name = FLD_APP_RULE_GRP_PERCENT_TOL;
	    }
	    else if (stRecType == 'employee'){    	
	        name = FLD_APPROVAL_DELEGATE;
	                
	        var stfld_custentity_tsg_delegate_from = FLD_DELEGATE_FROM;
	        var stfld_custentity_tsg_delegate_to = FLD_DELEGATE_TO;
	        var stApprovalDelegate = nlapiGetFieldValue(name);
	        if (!stApprovalDelegate){
	        	nlapiDisableField(stfld_custentity_tsg_delegate_from, true);
	        	nlapiDisableField(stfld_custentity_tsg_delegate_to, true);
	        }               	
	    }
	    else if (stRecType == 'purchaseorder' || stRecType == 'vendorbill' || stRecType == 'expensereport' || stRecType == 'purchaserequisition'){
	        //var APPROVED = 2;

	        if (type == 'copy'){
	            nlapiSetFieldValue(FLD_DELEGATE, 'F', false, true);
	            nlapiSetFieldValue('nextapprover', '', false, true);            
				if (nlapiGetFieldValue('approvalstatus') != 1)
					nlapiSetFieldValue('approvalstatus', '', false, true);
	            nlapiSetFieldValue(FLD_TRANS_ORG_AMT, '', false, true);   
	            
	        }       
	        else if(type == 'create'){
	            var stRequestor = '';
	            switch (stRecType) {
	                case 'purchaseorder':
	                    stRequestor = nlapiGetFieldValue(FLD_REQUESTOR);
	                    nlapiSetFieldValue('employee', nlapiGetUser(), false, true);
	                    nlapiSetFieldValue(FLD_REQUESTOR, nlapiGetUser(), false, true);
	                    //nlapiDisableField('employee', true);
	                    break;
	                case 'vendorbill':
	                    //stRequestor = nlapiGetFieldValue(FLD_REQUESTOR);
	                    stRequestor = nlapiGetUser();
	                    nlapiSetFieldValue(FLD_REQUESTOR, stRequestor, false, true);
	                    break;
	                case 'expensereport':
	                	var stRequestor = nlapiGetUser();
	                	var entity = nlapiGetFieldValue('entity');
	                	
	                	if(!entity){
	    	                nlapiSetFieldValue(FLD_REQUESTOR,stRequestor , false, true); 
	    	                nlapiSetFieldValue('entity',stRequestor , false, true);
	                	}else{
	                		 nlapiSetFieldValue(FLD_REQUESTOR,entity , false, true); 
	                		 stRequestor = entity;
	                	}
		                nlapiDisableField('entity', true);
	                	
	                    break;
	                case 'purchaserequisition':
	                	var stRequestor = nlapiGetUser();
	                	var entity = nlapiGetFieldValue('entity');
	                	
	                	if(!entity){
	    	                nlapiSetFieldValue(FLD_REQUESTOR,stRequestor , false, true); 
	    	                nlapiSetFieldValue('entity',stRequestor , false, true);
	                	}else{
	                		 nlapiSetFieldValue(FLD_REQUESTOR,entity , false, true); 
	                		 stRequestor = entity;
	                	}
		                nlapiDisableField('entity', true);
	                	
	                    break;
	                default:
	                    break;
	            }
	            
	            if(stRequestor != ''){
	            	
	                nlapiSetFieldValue('department', getRequestorDepartment(stRequestor));
	            }
	        }
	        //disable requestor field if employee
	        if(((stRecType == 'purchaseorder') ||(stRecType == 'expensereport'))&& (nlapiGetContext().getRoleCenter().toUpperCase() == 'EMPLOYEE')){
	        	nlapiDisableField(FLD_REQUESTOR, true);
	        }
	    }
	    else if (stRecType == 'salesorder'){
	        if (type == 'copy' || type=='create')
	        {
	            nlapiSetFieldValue(FLD_APPROVAL_STATUS, '1', false, true);
	            nlapiSetFieldValue(FLD_NEXT_APPROVER, '', false, true);
	            nlapiSetFieldValue('orderstatus', 'A', false, true);
	            nlapiSetFieldValue(FLD_TRANS_ORG_AMT, '', false, true);
	        }
	    }
	    else if ((stRecType == 'journalentry')||(stRecType == 'intercompanyjournalentry')){
	    	var stRequireApproval = nlapiGetContext().getPreference('JOURNALAPPROVALS');
	        if (type != 'edit' && stRequireApproval == 'T')
	        {
	        	var stCreatedFrom = nlapiGetFieldValue('createdfrom');
	        	if(!stCreatedFrom){
		            nlapiSetFieldValue('approved', 'F', false, true);
		            nlapiSetFieldValue(FLD_APPROVAL_STATUS, HC_STATUS_PENDING_APPROVAL, false, true);
	        	}else{
		            nlapiSetFieldValue(FLD_APPROVAL_STATUS, HC_STATUS_APPROVED, false, true);	
	        	}
	            nlapiSetFieldValue(FLD_NEXT_APPROVER, '', false, true);        		
	        }
	    }
	    else{
	        nlapiSetFieldValue(FLD_APPROVAL_STATUS, '1', false, true);
	        nlapiSetFieldValue(FLD_NEXT_APPROVER, '', false, true);
	        nlapiSetFieldValue(FLD_TRANS_ORG_AMT, '', false, true);
	    }
	        
	    if (!isEmpty(name)){
	    	checkValueFieldChanged(type, name, 0);
	    }
	}catch(error){
		defineError('setDefaultValuesPageInit',error);
	}    
    return true;
}


//***************************************************************************OTHER SUPPORTING FUNCTIONS - STARTS HERE**********************************************//

/**
* Validates rule group record upon save
* @param (null)
* @return (boolean) depending on success of action upon save record
* @type string
* @author Jaime Villafuerte
* @version 1.0
*/
function ruleGroupSaveRecord()
{
    var bretVal = true;
    var stfld_custrecord_tsg_tran_type = FLD_APP_RULE_GRP_TRAN_TYPE;
    var stfld_custrecord_tsg_subsidiary = FLD_APP_RULE_GRP_SUBSD;
    var stfld_internalid = 'id';
    var stfld_isinactive = FLD_APP_RULE_GRP_IS_INACTIVE;

    var stInternalidVal = nlapiGetFieldValue(stfld_internalid);

    var stTranTypeVal = nlapiGetFieldValue(stfld_custrecord_tsg_tran_type);
    var stSubsidiaryVal = nlapiGetFieldValue(stfld_custrecord_tsg_subsidiary);
    var stIsInactiveVal = nlapiGetFieldValue(stfld_isinactive);
        
    if (isEmpty(stSubsidiaryVal))
    	stSubsidiaryVal = '@NONE@';
    
    if (isEmpty(stTranTypeVal) || isEmpty(stSubsidiaryVal)|| (stIsInactiveVal == 'T')){
        return true;
    }
    
    var filters = new Array();    
    filters.push(new nlobjSearchFilter(stfld_custrecord_tsg_tran_type, null, 'anyof', stTranTypeVal));
    filters.push(new nlobjSearchFilter(stfld_custrecord_tsg_subsidiary, null, 'anyof', stSubsidiaryVal));
    filters.push(new nlobjSearchFilter(FLD_APP_RULE_GRP_IS_INACTIVE, null, 'is', "F"));

    if (!isEmpty(stInternalidVal)){
        filters.push(new nlobjSearchFilter('internalid', null, 'noneof', stInternalidVal));
    }

    var arrresults = nlapiSearchRecord(REC_RULE_GRP, null, filters);

    if (arrresults){
        bretVal = false;
        alert('Transaction type and subsidiary combination already exists.');
    }

    //to disble if vb to po tolerance
    checkValueFieldChanged('edit', REC_RULE_GRP, 0);
    return bretVal;
}


/**
* Validates rule list record upon save
* @param (null)
* @return (boolean) depending on success of action upon save record
* @type string
* @author Jaime Villafuerte
* @version 1.0
*/
function ruleSaveRecord()
{
    var bretVal = true;
    var stgrpid = nlapiGetFieldValue(FLD_RULES_RULE_GRP);
    var stInWorkflow = nlapiGetFieldValue(FLD_RULES_INC_IN_WF);
    var stSequence = nlapiGetFieldValue(FLD_RULES_SEQUENCE);
    var stApprovers = nlapiGetFieldValues(FLD_RULES_MULT_EMP);
    var arrfilters = new Array();
    var arrcolumns = new Array();
    var stRecordId = null;
    try{
    	stRecordId = nlapiGetRecordId();
    }catch(error){
    }
    
    //nlapiLogExecution('DEBUG', 'bmatch', 'stRecordId='+stRecordId+ ' stgrpid='+stgrpid+' stInWorkflow='+stInWorkflow + 'stSequence='+stSequence);
    if((stInWorkflow == 'T') && stgrpid){
        arrfilters.push(new nlobjSearchFilter(FLD_RULES_RULE_GRP, null, 'anyof', stgrpid));
        arrfilters.push(new nlobjSearchFilter(FLD_RULES_INC_IN_WF, null, 'is', 'T'));
        arrcolumns.push(new nlobjSearchColumn(FLD_RULES_SEQUENCE).setSort(true));
        var arrresults = (!isEmpty(stgrpid)) ? nlapiSearchRecord(REC_APPROVAL_RULE, null, arrfilters, arrcolumns) : null;
        var bmatch = false;
        if (arrresults)
        {
        	for(var i = 0; i < arrresults.length; i++){
        		if((arrresults[i].getValue(FLD_RULES_SEQUENCE) == stSequence)&&(arrresults[i].getId() != stRecordId)){
        			bmatch = true;
        			break;
        		}
        	}
        	if(bmatch){
        		alert('Sequence number already existing for the selected approval rule group.');
                bretVal = false;             
        	}
        }
    }

    
    var sttranType = nlapiGetFieldValue(FLD_RULES_APPRVR_TYPE);
    var intvalidationErr = 0;
    var stValidationErr = '';
    
    switch (sttranType){
        case '1':   //Department Approver
            break;
        case '3':   //Employee
            var stVal = nlapiGetFieldValue(FLD_RULES_APPRVR);
            if (isEmpty(stVal)){
                stValidationErr += (stValidationErr == '') ? 'Approver : Employee' : ',Approver : Employee';
                intvalidationErr++;
            }
            break;
        case '4':    //Role
            var stVal = nlapiGetFieldValue(FLD_RULES_ROLETYPE);
            if (isEmpty(stVal)){
                stValidationErr += (stValidationErr == '') ? 'Approver: Role' : ',Approver: Role';
                intvalidationErr++;
            }               
            break;
        case '5':    //Employee Hierarchy
            break;
        case '8':    //Dynamic Rule
            var stVal = nlapiGetFieldValue(FLD_RULES_APPRVR_REC_TYPE);
            if (isEmpty(stVal)){
                stValidationErr += (stValidationErr == '') ? 'APPROVER ON RECORD TYPE' : ',APPROVER ON RECORD TYPE';
                intvalidationErr++;
            }
            var stVal = nlapiGetFieldValue(FLD_RULES_APPRVR_REC_FLD);
            if (isEmpty(stVal)){
                stValidationErr += (stValidationErr == '') ? 'APPROVER ON RECORD FIELD' : ',APPROVER ON RECORD FIELD';
                intvalidationErr++;
            }
            var stVal = nlapiGetFieldValue(FLD_RULES_TRANS_MAPPED_FLD_ID);
            if (isEmpty(stVal)){
                stValidationErr += (stValidationErr == '') ? 'RECORD ON TRANSACTION FIELD ID' : ',RECORD ON TRANSACTION FIELD ID';
                intvalidationErr++;
            }            
            break;
        case '10':   //Parallel Approval: List of Approvers
            var stVal = nlapiGetFieldValues(FLD_RULES_MULT_EMP);
            if (checkMultiSelectLength(stVal) == 0){
                stValidationErr += (stValidationErr == '') ? 'MULTIPLE EMPLOYEE APPROVERS' : ',MULTIPLE EMPLOYEE APPROVERS';
                intvalidationErr++;
            }
            break;
        case '11':   //Parallel Approval: Line Approvers
            var stVal = nlapiGetFieldValue(FLD_RULES_LINE_APPROVER);
            if (isEmpty(stVal)){
                stValidationErr += (stValidationErr == '') ? 'LINE APPROVER' : ',LINE APPROVER';
                intvalidationErr++;
            }
            var stVal = nlapiGetFieldValue(FLD_RULES_SUBLIST);
            if (isEmpty(stVal)){
                stValidationErr += (stValidationErr == '') ? 'SUBLIST' : ',SUBLIST';
                intvalidationErr++;
            }
            break;
    }
    //add rule group
    var stVal = nlapiGetFieldValue(FLD_RULES_RULE_GRP);
    if (isEmpty(stVal))
    {
        stValidationErr += (stValidationErr == '') ? 'APPROVAL RULE GROUP' : ',APPROVAL RULE GROUP';
        intvalidationErr++;
    } 
    
    if (intvalidationErr > 0)
    {
        bretVal = false;
        alert('Please enter value(s) for: ' + stValidationErr);
    }
    var stVal = nlapiGetFieldValues(FLD_RULES_MULT_EMP);
    if (checkMultiSelectLength(stVal) > HC_MAX_RULE_APPROVER){

        alert('Maximum employee approvers is '+HC_MAX_RULE_APPROVER+ '.');
        bretVal = false;
    }
    return bretVal;
}


/**
* Validates employee record upon save
* @param (null)
* @return (boolean) depending on success of action upon save record
* @type null
* @author Jaime Villafuerte
* @version 1.0
*/
function employeeSaveRecord()
{
    var bretVal = true;
    var stfld_custentity_tsg_delegate_from = FLD_DELEGATE_FROM;
    var stfld_custentity_tsg_delegate_to = FLD_DELEGATE_TO;

    var stTsgDelegateValue = nlapiGetFieldValue(FLD_APPROVAL_DELEGATE);
    if (!isEmpty(stTsgDelegateValue)){
        var stDeleFromValue = nlapiGetFieldValue(stfld_custentity_tsg_delegate_from);
        var stDeleToValue = nlapiGetFieldValue(stfld_custentity_tsg_delegate_to);
        var errorCount = 0;
        var errorMessage = '';

        if (isEmpty(stDeleFromValue)){
            errorCount++;
            errorMessage += 'Delegate From';
        }
        if (isEmpty(stDeleToValue)){
            errorCount++;
            errorMessage += ',Delegate To';
        }

        if (!isEmpty(stDeleFromValue) && !isEmpty(stDeleToValue)){
            var dtFrom = nlapiStringToDate(stDeleFromValue);
            var dtTo = nlapiStringToDate(stDeleToValue);

            if (dtFrom > dtTo)
            {
                bretVal = false;
                nlapiSetFieldValue(stfld_custentity_tsg_delegate_to, '', false);
                alert('Invalid Delegate Date Range Value');
            }
        }

        if (errorCount > 0){
            bretVal = false;
            alert('Please enter value(s) for: ' + errorMessage);
        }
    }
    return (bretVal);
}


/**
* Validates suitelet delegate form upon save
* @param (null)
* @return (boolean) depending on success of action upon save record
* @type null
* @author Jaime Villafuerte
* @version 1.0
*/
function suiteletDelegateSaveRecord()
{
    var bretVal = true;

    var stfld_custentity_tsg_delegate_from = 'custpage_tsg_delegate_from';
    var stfld_custentity_tsg_delegate_to = 'custpage_tsg_delegate_to';

    
    var stTsgDelegateValue = nlapiGetFieldValue('custpage_tsg_delegate_');
    if (!isEmpty(stTsgDelegateValue)){
        var stDeleFromValue = nlapiGetFieldValue(stfld_custentity_tsg_delegate_from);
        var stDeleToValue = nlapiGetFieldValue(stfld_custentity_tsg_delegate_to);
        var errorCount = 0;
        var errorMessage = '';

        if (isEmpty(stDeleFromValue)){
            errorCount++;
            errorMessage += 'Delegate From';
        }
        if (isEmpty(stDeleToValue)){
            errorCount++;
            errorMessage += ',Delegate To';
        }

        if (!isEmpty(stDeleFromValue) && !isEmpty(stDeleToValue)){
            var dtFrom = nlapiStringToDate(stDeleFromValue);
            var dtTo = nlapiStringToDate(stDeleToValue);

            if (dtFrom > dtTo)
            {
                bretVal = false;
                nlapiSetFieldValue(stfld_custentity_tsg_delegate_to, '', false);
                alert('Invalid Delegate Date Range Value');
            }
        }

        if (errorCount > 0){
            bretVal = false;
            alert('Please enter value(s) for: ' + errorMessage);
        }
    }
    return (bretVal);
}


/**
* Upon save, checks if transaction new total and old total is within rule limit
* @param (null)
* @return (boolean) depends on action status upon submit
* @type null
* @author Jaime Villafuerte
* @version 1.0
*/
function transactionSaveRecord()
{

	
	var stOrigAmt = nlapiGetFieldValue(FLD_TRANS_ORG_AMT);
	var stApprvlStatus = null;
	if(FLD_APPROVAL_STATUS)
		stApprvlStatus = nlapiGetFieldValue(FLD_APPROVAL_STATUS);
    if(!nlapiGetRecordId() || !stOrigAmt){
        return true;
    }
	//Check if amount change over tolerance limit
	
	var bAmountWithinLimit = true;
	var status = nlapiGetFieldValue('status');
	
	if(status){
		status = status.trim().toLowerCase();
		if(status == 'cancelled')
			return true;
	}

	//Set false on resetting workflow
	nlapiSetFieldValue(FLD_CUSTBODY_RESET_WORKFLOW,'dontreset',false);
	if(stApprvlStatus == HC_STATUS_PENDING_APPROVAL){
		bAmountWithinLimit = checkToleranceChanged();		
		if(!bAmountWithinLimit){
			return bAmountWithinLimit;
		}else{
			//Check if any of the line approvers have changed if current rule is parallel approval line approvers
			var stApproverType = nlapiGetFieldValue(FLD_APPRVR_TYPE);	
			if(stApproverType == HC_APPRVL_TYPE_LINE_APPRVRS){
				//Get Rule group line approvers
				var bLineApproversChanged = checkIfLineApproversChanged();
				if(!bLineApproversChanged)
					return true;
				else{				
					bLineApproversChanged = confirm(HC_LINE_APPRVR_MSG_CONFIRM_SAVE);
					nlapiSetFieldValue(FLD_CUSTBODY_RESET_WORKFLOW,'reset',false);							
					return bLineApproversChanged;
				}
			}
		}
	}
    return true;
}

function getLineApproverRuleDetails(){
	try{	
		var arrAppList   	= getLastSequenceCreated();
		var intLastSeq      = arrAppList[0].getValue(FLD_LIST_RULE_SEQ);
		var stSubsidiary	= nlapiGetFieldValue('subsidiary');
		var bChangedApprover = false;
		var arrApprovalrules 	= null;
		var stSublist 			= null;
		var stLineApprover		= null;
		if(intLastSeq){
			intLastSeq       		= Math.floor(intLastSeq);
			try{
				arrApprovalrules 	= searchApprovalRules(stTransRecordType, stSubsidiary, intLastSeq);
				stSublist 			= arrApprovalrules[0].getValue(FLD_RULES_SUBLIST, FLD_RULES_RULE_GRP);
				stLineApprover		= arrApprovalrules[0].getValue(FLD_RULES_LINE_APPROVER, FLD_RULES_RULE_GRP);
			}catch(error){				
				//Get rule group details when role is not administrator
				var stTranTypeId 	= getTranRecType(stTransRecordType);
				var stUrl 			= nlapiResolveURL('SUITELET', SCRIPT_SAVE_REC_SUITELET, DEPLOY_SAVE_REC_SUITELET);
					stUrl 			= stUrl + '&subsidiary=' + stSubsidiary + '&id=' + stTranTypeId+'&intLastSeq='+intLastSeq;  
				var objResponse 	= nlapiRequestURL(stUrl, null, null, null );
				var stResponse 		= objResponse.getBody();
				//ID not dynamic due to array malformed when response is from suitelet
				if(stResponse != 'error'){
					var arrRes = JSON.parse(stResponse);
					stSublist = arrRes[0].columns.custrecord_nsts_gaw_sublist;
					stLineApprover = arrRes[0].columns.custrecord_nsts_gaw_line_apprvr;
				}
			}
			if(!(stSublist && stLineApprover))
				return null;
			else{
				stSublist = stSublist.toLowerCase().trim();
				stLineApprover = stLineApprover.toLowerCase().trim();
				objRecSublistDetails['sublist'] = stSublist;
				objRecSublistDetails['approverField'] = stLineApprover;
				objRecSublistDetails['count'] = nlapiGetLineItemCount(stSublist);
				
				if(objRecSublistDetails['count'] && objRecSublistDetails['count'] > 0){
					objRecSublistDetails['lines'] = new Object();
					for(var i=0;i<objRecSublistDetails['count'];i++){
						var intLine = nlapiGetLineItemValue(stSublist,'line',i+1 );
						var stApprover = nlapiGetLineItemValue(stSublist,stLineApprover,i+1 );
						objRecSublistDetails['lines'][intLine] = stApprover;
					}
				}
			}
		}  
	}catch(error){
		defineError('getLineApproverRuleDetails',error);
	}   
}

function checkIfLineApproversChanged(){
	var bChangedApprover = false;
	try{	
		if(objRecSublistDetails){
			var stSublist = objRecSublistDetails['sublist'];
			var stLineApprover = objRecSublistDetails['approverField'];
		
			if(!(stSublist && stLineApprover))
				return false
			var oldItemCount = objRecSublistDetails['count'];
			var newItemCount = nlapiGetLineItemCount(stSublist);
			var lineCount = oldItemCount > newItemCount ? oldItemCount:newItemCount;
			
			for(var cnt=0;cnt<lineCount;cnt++){
				var intLine = nlapiGetLineItemValue(stSublist,'line',cnt+1 );
				var oldApprover = objRecSublistDetails['lines'][intLine];
				var newApprover = nlapiGetLineItemValue(stSublist,stLineApprover,cnt+1);
				if(isEmpty(oldApprover))
					oldApprover = null;
				if(isEmpty(newApprover))
					newApprover = null;
				if(oldApprover != newApprover){
					return true;						
				}						
			}			
		}		  
	}catch(error){
		defineError('checkIfLineApproversChanged',error);
	}   
	return bChangedApprover;
}
function checkToleranceChanged(){

	var fOldTotal = nlapiGetFieldValue(FLD_TRANS_ORG_AMT);
	var fNewTotal = null;		
		fNewTotal = nlapiGetFieldValue(FLD_TOTAL);

	var stTranCurrency 	= nlapiGetFieldValue('currency');	
	var fTolPct 		= null;
	var fTolAmt 		= null;
	var stGrpCurrency 	= null;
	var stUseTranDate 	= null;
	var bisWithin		= true;
	//Return true if not in edit mode
    if(!nlapiGetRecordId() || !fOldTotal){
        return true;
    }		
	//If new amount is equal to old amount, return true
	if(stOrigAmount_pageInit == fNewTotal)
		return true;
	
	var stSubsidiary 	= nlapiGetFieldValue('subsidiary');
	
    var stTranTypeId 	= getTranRecType(stTransRecordType);
    var arrRes 			= null;
    
	/*** Get Approval Rule Group Details (tolerance amount/percent) **/
	try{
		//Get the rule group details to check if amount is within tolerance percent/amount of the rule group
		var arrCol = [new nlobjSearchColumn(FLD_APP_RULE_GRP_PERCENT_TOL),
					  new nlobjSearchColumn(FLD_APP_RULE_GRP_AMT_TOL),
					  new nlobjSearchColumn(FLD_APP_RULE_GRP_PO_TO_VB_AMT),
					  new nlobjSearchColumn(FLD_APP_RULE_GRP_PO_TO_VB_PCT),
					  new nlobjSearchColumn(FLD_APP_RULE_GRP_SUBSD),
					  new nlobjSearchColumn(FLD_APP_RULE_GRP_TRAN_TYPE),
	                  new nlobjSearchColumn(FLD_APP_RULE_GRP_DEF_CURR),
	                  new nlobjSearchColumn(FLD_APP_RULE_GRP_USE_EXC_RATE)];
		var arrFil = [new nlobjSearchFilter(FLD_APP_RULE_GRP_TRAN_TYPE, null, 'anyof', stTranTypeId),
					  new nlobjSearchFilter(FLD_APP_RULE_GRP_IS_INACTIVE, null, 'is', 'F')];
		
		if(stSubsidiary)
			arrFil.push(new nlobjSearchFilter(FLD_APP_RULE_GRP_SUBSD, null, 'anyof', stSubsidiary));
		
		arrRes = nlapiSearchRecord(REC_RULE_GRP, null, arrFil, arrCol);

		if (!arrRes){
			var arrFil = [new nlobjSearchFilter(FLD_APP_RULE_GRP_TRAN_TYPE, null, 'anyof', stTranTypeId),
						  new nlobjSearchFilter(FLD_APP_RULE_GRP_IS_INACTIVE, null, 'is', 'F')];
			arrRes = nlapiSearchRecord(REC_RULE_GRP, null, arrFil, arrCol);
		}
		if (arrRes){
			fTolPct = arrRes[0].getValue(FLD_APP_RULE_GRP_PERCENT_TOL);
			fTolAmt = arrRes[0].getValue(FLD_APP_RULE_GRP_AMT_TOL);
			stGrpCurrency = arrRes[0].getValue(FLD_APP_RULE_GRP_DEF_CURR);
			stUseTranDate = arrRes[0].getValue(FLD_APP_RULE_GRP_USE_EXC_RATE);	
		}
	}catch(error){	
		
		//If user role does not have access to the rule group, get the rule group details via suitelet
		try{
			var stUrl = nlapiResolveURL('SUITELET', SCRIPT_SAVE_REC_SUITELET, DEPLOY_SAVE_REC_SUITELET);
			var stUrl = stUrl + '&subsidiary=' + stSubsidiary + '&id=' + stTranTypeId;  
			var objResponse = nlapiRequestURL(stUrl, null, null, null );
			var stResponse = objResponse.getBody();
            //ID not dynamic due to array malformed when response is from suitelet
			if(stResponse != 'error'){
				var arrRes = JSON.parse(stResponse);
				fTolPct = arrRes[0].columns.custrecord_nsts_gaw_percent_tolerance;
				fTolAmt = arrRes[0].columns.custrecord_nsts_gaw_amt_tolerance;
				stGrpCurrency = arrRes[0].columns.custrecord_nsts_gaw_rulegrp_def_currency;
				stUseTranDate = arrRes[0].columns.custrecord_nsts_gaw_use_currdt_exch_rate;
			}
		}catch(error){		
			defineError('checkToleranceChanged',error);
		}
	}	
	
	/***Check if amount is within tolerance amount/percent **/
	try{
					
		if(fTolPct || fTolAmt){				
			if (fTolPct){
				if(!isNaN(parseFloat(fTolPct))){
					fTolPct = parseFloat(fTolPct) / 100;
					bisWithin = (Math.abs((fNewTotal - fOldTotal)) / fOldTotal) <= fTolPct;				
				}
			}
			if (fTolAmt){
				if(!isNaN(parseFloat(fTolAmt))){				
					fTolAmt = parseFloat(fTolAmt);
					if (stUseTranDate && stTranCurrency && (stGrpCurrency != stTranCurrency)){
						fNewTotal = currencyConversion(fNewTotal, stTranCurrency, stGrpCurrency, stUseTranDate);   
						fOldTotal = currencyConversion(fOldTotal, stTranCurrency, stGrpCurrency, stUseTranDate);   
					}
					bisWithin = Math.abs((fNewTotal - fOldTotal)) <= fTolAmt;
				}
			}
			if (!bisWithin){
				bisWithin = confirm(HC_MSG_CONFIRM_SAVE);
				nlapiSetFieldValue(FLD_CUSTBODY_RESET_WORKFLOW,'reset',false);
				return bisWithin;
			}
		} 	
	}catch(error){
		defineError('checkToleranceChanged',error);
	}
	return bisWithin;
}
/**
* Logs error/debug details
* @param (string log type, string title, string details of error or debug) 
* @return (void) 
* @type null
* @author Jaime Villafuerte
* @version 1.0
*/
function log(logType, title, details)
{
    if (HC_DEBUG){
        nlapiLogExecution(logType, title, details);
    }
}


/**
* Checks if object is null or empty
* @param (object) 
* @return (boolean) true if null or empty else false 
* @type null
* @author Jaime Villafuerte
* @version 1.0
*/
function isEmpty(value)
{
    if (value == null || value == undefined || value == ''){
        return true;
    }

    return false;
}


/**
* Get Debit Total
* @param {string type}
* @returns {Void} 
* @author Jaime Villafuerte
* @edited Rose Ann Ilagan
* @version 1.0
*/
function setTotalDebitAmountInJE()
{
    var fTotDebPrev = nlapiGetFieldValue(FLD_TOTAL_DEBIT_AMT);
    var fTotalAmt = 0.00;
    var intlineNum= nlapiGetLineItemCount('line');
    var fldebitLineAmt = 0;
    
    intlineNum = (intlineNum) ? intlineNum : 1; 
    
    for(var i=1; i<= intlineNum; i++){
    	fldebitLineAmt = nlapiGetLineItemValue('line', 'debit', i);
	    fldebitLineAmt = (fldebitLineAmt) ? parseFloat(fldebitLineAmt) : 0;            
        fTotalAmt += fldebitLineAmt;            		
    }
    //set transaction total debit amount based on currency selected
    nlapiSetFieldValue(FLD_TRANS_DEBIT_AMT,fTotalAmt);	  
    //set total debit amount base currency
    var rate = nlapiGetFieldValue('exchangerate');	    
    fTotalAmt = fTotalAmt * rate;
    nlapiSetFieldValue(FLD_TOTAL_DEBIT_AMT,fTotalAmt.toFixed(2));	    
    return fTotalAmt;	
}
/**
* Process Cloaking
* @param {string type}
* @returns {Void} 
* @author Jaime Villafuerte
* @edited Rose Ann Ilagan
* @version 1.0
*/
function processCloaking(actiontype){
    try{

        var stTransRecordType = nlapiGetRecordType();
        var CUSTOMSCRIPT_SL_CLOAKING_SCRIPTID = 'customscript_nsts_gaw_cloaking_sl';
        var CUSTOMDEPLOY_SL_CLOAKING_SCRIPTID = 'customdeploy_nsts_gaw_cloaking_sl';
        var savedSearchWithGroup = 'customsearch_nsts_gaw_dashboard_srch_owa';
        var savedSearchWithGroupNonOW = 'customsearch_nsts_gaw_dashboard_srch';
        var savedSearchWithNoGroup = 'customsearch_nsts_gaw_dashboard_srch_o_3';
        var savedSearchWithNoGroupNonOW = 'customsearch_nsts_gaw_dashboard_srch_o_2';
        if (stTransRecordType){
            stTransRecordType = stTransRecordType.toUpperCase();
            if (stTransRecordType == 'INTERCOMPANYJOURNALENTRY'){
    			stTransRecordType 		= 'JOURNALENTRY';
    		}
        }
        
        var stTranId = nlapiGetRecordId();

        var stURL = nlapiResolveURL("SUITELET", CUSTOMSCRIPT_SL_CLOAKING_SCRIPTID, CUSTOMDEPLOY_SL_CLOAKING_SCRIPTID);
        
        var objURLParam = {};
        objURLParam[SL_PARAM_CLK_ACTIONTYPE] 	= actiontype;
        objURLParam[SL_PARAM_CLK_RECORDTYPE] 	= stTransRecordType;
        objURLParam[SL_PARAM_CLK_TXNID]    		= nlapiGetRecordId();
        
        nlapiRequestURL(stURL ,objURLParam, null, function (response){
            console.log(response);
        }, "POST");
    	var stSavedSearchID = savedSearchWithNoGroup;	
    	var stCloakRedirect = nlapiGetContext().getSetting("SCRIPT", SPARAM_CLOAK_REDIRECT);
    	
    	//redirect to next transaction
    	var arrRes = null;
    	try{
        	stSavedSearchID = savedSearchWithNoGroup;
    		arrRes = nlapiSearchRecord(stTransRecordType, stSavedSearchID,[new nlobjSearchFilter('internalid', null, 'noneof', stTranId)]);
    	}catch(error){
        	stSavedSearchID = savedSearchWithNoGroupNonOW;
        	arrRes = nlapiSearchRecord(stTransRecordType, stSavedSearchID,[new nlobjSearchFilter('internalid', null, 'noneof', stTranId)]);
    	}
    	var arrRes = nlapiSearchRecord(stTransRecordType, stSavedSearchID,[new nlobjSearchFilter('internalid', null, 'noneof', stTranId)]);
    	var stURL = nlapiResolveURL('record', stTransRecordType, nlapiGetRecordId());
    	if(arrRes){
    		if(arrRes.length > 0){
    			if(stCloakRedirect == '1'){
    				alert('This current transaction will be processed. The screen will be redirected to the next transaction that is pending your approval.');
    				stURL = nlapiResolveURL('record', arrRes[0].getRecordType(), arrRes[0].getId());
            		document.location.href=stURL;
    			}else{
    				alert('This current transaction will be processed. The screen will be redirected to the list of transactions that are pending your approval.');
    	        	try{
    	            	stSavedSearchID = savedSearchWithGroup;
    	        		arrRes = nlapiSearchRecord(stTransRecordType, stSavedSearchID,[new nlobjSearchFilter('internalid', null, 'noneof', stTranId)]);
    	        	}catch(error){
    	            	stSavedSearchID = savedSearchWithGroupNonOW;
    	        	}
    	    		document.location.href='/app/common/search/searchresults.nl?searchid='+stSavedSearchID; 				
    			}
    		}
    	}else{
			if(stCloakRedirect == '1')
				alert('This current transaction will be processed. The screen will be redirected to the next transaction that is pending your approval.');
			else 
				alert('This current transaction will be processed. The screen will be redirected to the list of transactions that are pending your approval.');
			try{
            	stSavedSearchID = savedSearchWithGroup;
        		arrRes = nlapiSearchRecord(stTransRecordType, stSavedSearchID,[new nlobjSearchFilter('internalid', null, 'noneof', stTranId)]);
        	}catch(error){
            	stSavedSearchID = savedSearchWithGroupNonOW;
        	}
        	document.location.href='/app/common/search/searchresults.nl?searchid='+stSavedSearchID;
    	}
    }catch(error){
    	defineError('processCloaking',error)
    }
}
/**
* Process Cloaking
* @param {string type}
* @returns {Void} 
* @author Jaime Villafuerte
* @edited Rose Ann Ilagan
* @version 1.0
*/
function getRequestorDepartment(stRequestor){
	try{
		var stCreator = nlapiGetFieldValue(FLD_CREATED_BY);
		var stDept = null;
		if(stCreator == stRequestor)
			stDept = nlapiGetContext().getDepartment();
		else
			stDept = nlapiLookupField('employee', stRequestor, 'department');
		
		if(stDept){
			if(stDept == '0' || stDept == 0)
				return null;
		}
		return stDept;
	}catch(error){
		return null;
	}
}