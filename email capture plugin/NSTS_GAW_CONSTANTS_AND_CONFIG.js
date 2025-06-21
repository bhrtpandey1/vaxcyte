//CUSTOM RECORD
var REC_APPROVAL_RULE 	= 'customrecord_nsts_gaw_approval_rules';
var REC_RULE_GRP 		= 'customrecord_nsts_gaw_app_rule_grp';
var REC_APPROVER_LIST 	= 'customrecord_nsts_gaw_approver_list';


//APPROVER LIST RECORD
var FLD_LIST_PO 					= 'custrecord_nsts_gaw_po_rec_type';
var FLD_LIST_TRAN_APPROVER 			= 'custrecord_nsts_gaw_tran_approver';
var FLD_LIST_APPROVER_ROLE 			= 'custrecord_nsts_gaw_approverrole';
var FLD_LIST_APPROVER_LINE_STATUS 	= 'custrecord_nsts_gaw_approverlinestatus';
var FLD_LIST_APPROVER_DATE 			= 'custrecord_nsts_gaw_list_date';
var FLD_LIST_HISTORICAL_REJECT 		= 'custrecord_nsts_gaw_hist_on_reject';
var FLD_LIST_REJECTION_REASON 		= 'custrecord_nsts_gaw_rej_reason';
var FLD_LIST_RULE_SEQ 				= 'custrecord_nsts_gaw_rulesequence';
var FLD_LIST_LAST_H 				= 'custrecord_nsts_gaw_last_hierarchy';
var FLD_LIST_RULE_NAME 				= 'custrecord_nsts_gaw_porulename';
var FLD_LIST_ORIG_APPRVR 			= 'custrecord_nsts_gaw_original_apprvr';
var FLD_LIST_APPROVED				= 'custrecord_nsts_gaw_is_approved';
var FLD_LIST_ROLE_EMAIL				= 'custrecord_nsts_gaw_apprvr_role_email';
var FLD_LIST_APPR_TRANS_TYPE		= 'custrecord_nsts_gaw_appr_list_trans_type';
var FLD_LIST_SUPER_APPROVED			= 'custrecord_nsts_gaw_super_approved';

//APPROVAL RULE GROUP
var FLD_APP_RULE_GRP_PERCENT_TOL 	= 'custrecord_nsts_gaw_percent_tolerance';
var FLD_APP_RULE_GRP_AMT_TOL 		= 'custrecord_nsts_gaw_amt_tolerance';
var FLD_APP_RULE_GRP_PO_TO_VB_AMT 	= 'custrecord_nsts_gaw_po_to_vb_var_amt';
var FLD_APP_RULE_GRP_PO_TO_VB_PCT 	= 'custrecord_nsts_gaw_po_to_vb_var_pct';
var FLD_APP_RULE_GRP_SUBSD 			= 'custrecord_nsts_gaw_rule_grp_subsidiary';
var FLD_APP_RULE_GRP_TRAN_TYPE 		= 'custrecord_nsts_gaw_rule_grp_tran_type';
var FLD_APP_RULE_GRP_DEF_CURR 		= 'custrecord_nsts_gaw_rulegrp_def_currency';
var FLD_APP_RULE_GRP_USE_EXC_RATE 	= 'custrecord_nsts_gaw_use_currdt_exch_rate';
var FLD_APP_RULE_GRP_IS_INACTIVE 	= 'custrecord_nsts_gaw_is_inactive';

//APPROVAL RULES
var FLD_RULES_SEQUENCE 				= 'custrecord_nsts_gaw_rule_sequence';
var FLD_RULES_RULE_GRP 				= 'custrecord_nsts_gaw_apprvl_rule_group';
var FLD_RULES_APPRVR_TYPE 			= 'custrecord_nsts_gaw_po_approvertype';
var FLD_RULES_APPRVR	 			= 'custrecord_nsts_gaw_po_approver';
var FLD_RULES_MINAMT				= 'custrecord_nsts_gaw_minamt';
var FLD_RULES_ROLETYPE				= 'custrecord_nsts_gaw_role_type';
var FLD_RULES_ROLE_EMAIL			= 'custrecord_nsts_gaw_email_address';
var FLD_RULES_APPRVR_REC_TYPE		= 'custrecord_nsts_gaw_appr_on_rectype';
var FLD_RULES_APPRVR_REC_FLD		= 'custrecord_nsts_gaw_appr_on_rec_fld';
var FLD_RULES_TRANS_MAPPED_FLD_ID	= 'custrecord_nsts_gaw_rec_on_tran_fld_id';
var FLD_RULES_INC_IN_WF				= 'custrecord_nsts_gaw_includeinworkflow';
var FLD_RULES_LINE_APPROVER			= 'custrecord_nsts_gaw_line_apprvr';
var FLD_RULES_SUBLIST				= 'custrecord_nsts_gaw_sublist';
var FLD_RULES_MULT_EMP				= 'custrecord_nsts_gaw_mult_employee';


//APPROVAL STATUS
var HC_STATUS_PENDING_APPROVAL = '1';
var HC_STATUS_APPROVED = '2';
var HC_STATUS_REJECTED = '3';
var HC_STATUS_INACTIVE = '4';

//APPROVAL ACTION VIA EMAIL
var HC_APPROVE_ACTION 	= '1';
var HC_REJECT_ACTION 	= '2';
var HC_SUBMIT_ACTION 	= '3';

//MAX NUMBER OF LINE/LIST APPROVERS
var HC_MAX_RULE_APPROVER = 9;

//Mapping Fields 
var FLD_APPROVAL_STATUS		= null;
var FLD_NEXT_APPROVER   	= null;
var FLD_TRAN_APPROVER   	= null;
var FLD_TRAN_LIMIT          = null;
var FLD_TRAN_APPROVER_LIMIT = null;
var FLD_EMPLOYEE            = null;
var FLD_TOTAL           	= null;
var FLD_REQUESTOR   		= null;
var FLD_EMPLOYEE_VAL    	= null;

var SL_PARAM_CLK_ACTIONTYPE         = 'actiontype';
var SL_PARAM_CLK_RECORDTYPE         = 'recordtype';
var SL_PARAM_CLK_TXNID              = 'id';

//TRANSACTION BODY FIELDS
var FLD_DELEGATE			= 'custbody_nsts_gaw_is_delegated';
var FLD_CREATED_BY 			= 'custbody_nsts_gaw_created_by';
var FLD_SUPER_APPROVED 		= 'custbody_nsts_gaw_superapp_approved';
var FLD_DEPT_APPRVR			= 'custrecord_nsts_gaw_deptapprover';
var FLD_TRANS_ORG_AMT		= 'custbody_nsts_gaw_trans_org_amt';
var FLD_TRAN_REQUESTOR		= 'custbody_nsts_gaw_tran_requestor';
var FLD_REJECTION_REASON 	= 'custbody_nsts_gaw_rejection_reason';
var FLD_TOTAL_DEBIT_AMT		= 'custbody_nsts_gaw_basetotal_debit_amt';
var FLD_TRANS_DEBIT_AMT		= 'custbody_nsts_gaw_total_debit_amt';
var FLD_APPROVAL_VIA_EMAIL 	= 'custbody_nsts_gaw_approval_action_email';
var FLD_NXT_APPRVRS 		= 'custbody_nsts_gaw_next_approvers';
var FLD_NXT_ROLE_APPRVRS 	= 'custbody_nsts_gaw_next_role_approvers';
var FLD_APPRVR_TYPE		 	= 'custbody_nsts_gaw_approver_type';

var FLD_CUSTBODY_CLK_TRIG_SUBMIT	= 'custbody_nsts_gaw_clk_trig_submit';
var FLD_CUSTBODY_CLK_TRIG_APPROVE   = 'custbody_nsts_gaw_clk_trig_approve';
var FLD_CUSTBODY_CLK_TRIG_REJECT    = 'custbody_nsts_gaw_clk_trig_reject';
var FLD_CUSTBODY_CLK_TRIG_SUPER		= 'custbody_nsts_gaw_trigger_super';
var FLD_CUSTBODY_CLOAKING_INPROG  	= 'custbody_nsts_gaw_clk_cloaking_inprog';
var FLD_CUSTBODY_RESET_WORKFLOW	  	= 'custbody_nsts_gaw_reset_workflow';

//ENTITY FIELDS
var FLD_APPROVAL_DELEGATE 	= 'custentity_nsts_gaw_delegate_emp';
var FLD_DELEGATE_FROM		= 'custentity_nsts_gaw_delegate_from';
var FLD_DELEGATE_TO			= 'custentity_nsts_gaw_delegate_to';

//Supported approval types
var HC_APPRVL_TYPE_DEPT 			= '1';
var HC_APPRVL_TYPE_SUPERVISOR 		= '2';
var HC_APPRVL_TYPE_EMPLOYEE   		= '3';
var HC_APPRVL_TYPE_ROLE      		= '4';
var HC_APPRVL_TYPE_EMP_H  			= '5';
var HC_APPRVL_TYPE_DYNAMIC      	= '8';
var HC_APPRVL_TYPE_LIST_APPRVRS     = '10';
var HC_APPRVL_TYPE_LINE_APPRVRS     = '11';

//Saved Searches
var SS_GET_NEXT_APPRVR = 'customsearch_nsts_gaw_get_next_approver';
var SS_SYSTEM_GENERATED_JES = 'customsearch_nsts_gaw_system_jes';

//Workflow Fields
var WFLW_GAW_POVBER 	= 'customworkflow_nsts_gaw_po_vb_er_iv_pr';
var WFLW_GAW_SOJE 		= 'customworkflow_nsts_gaw_other_trans';
var WACT_GAW_SUBMIT_BTN = '';

//Script Parameter Fields
var SPARAM_SUPER_APPROVER	= 'custscript_nsts_gaw_super_apprvr';
var SPARAM_EMAIL_SENDER		= 'custscript_nsts_gaw_email_sender';
var SPARAM_ECP_ADDR_PO		= 'custscript_nsts_gaw_ecp_address';
var SPARAM_ECP_ADDR_SO		= 'custscript_nsts_gaw_ecp_address_so';
var SPARAM_ENABLE_ECP		= 'custscript_nsts_gaw_enable_ecp';
var SPARAM_ENABLE_CLOAK		= 'custscript_nsts_gaw_enable_cloaking';
var SPARAM_TEMP_PENDING		= 'custscript_nsts_gaw_email_temp_penapprvl';
var SPARAM_TEMP_APPROVE		= 'custscript_nsts_gaw_email_temp_apprv';
var SPARAM_TEMP_REJECT		= 'custscript_nsts_gaw_email_temp_reject';
var SPARAM_CLOAK_REDIRECT	= 'custscript_nsts_gaw_cloak_redirect';

var stTransRecordType = nlapiGetRecordType();
if (stTransRecordType){
	stTransRecordType = stTransRecordType.toUpperCase();
	initializeMappingFields(stTransRecordType);
}

/**
* Initialize variables per transaction type
* @param (null)
* @return boolean
* @type boolean
* @author Rose Ann Ilagan
* @version 1.0
*/
function initializeMappingFields(recordType){
	try{
		if (recordType){
			recordType = recordType.toUpperCase();
		
			if (recordType == 'PURCHASEORDER'){
				FLD_APPROVAL_STATUS 	= 'approvalstatus';
				FLD_NEXT_APPROVER 		= FLD_NXT_APPRVRS;
				FLD_TRAN_APPROVER 		= 'purchaseorderapprover';
				FLD_TRAN_LIMIT 			= 'purchaseorderlimit';
				FLD_TRAN_APPROVER_LIMIT = 'purchaseorderapprovallimit';
				FLD_TOTAL 				= 'total';
				FLD_REQUESTOR 			= 'custbody_nsts_gaw_tran_requestor';
				WACT_GAW_SUBMIT_BTN 	= 'workflowaction_nsts_gaw_submit_po';
				FLD_EMPLOYEE 			= nlapiGetFieldValue(FLD_TRAN_REQUESTOR);
				FLD_EMPLOYEE_VAL 		= 'employee';
				stTransRecordType 		= 'PURCHASEORDER';
			}
			else if (recordType == 'VENDORBILL'){
				FLD_APPROVAL_STATUS 	= 'approvalstatus';
				FLD_NEXT_APPROVER 		= FLD_NXT_APPRVRS;
				FLD_TRAN_APPROVER 		= 'purchaseorderapprover';
				FLD_TRAN_LIMIT 			= 'purchaseorderlimit';
				FLD_TRAN_APPROVER_LIMIT = 'purchaseorderapprovallimit';
				FLD_REQUESTOR 			= 'custbody_nsts_gaw_tran_requestor';
				FLD_TOTAL 				= 'total';
				WACT_GAW_SUBMIT_BTN 	= 'workflowaction_nsts_gaw_submit_po';
				FLD_EMPLOYEE 			= nlapiGetFieldValue(FLD_TRAN_REQUESTOR);
				FLD_EMPLOYEE_VAL 		= FLD_TRAN_REQUESTOR;
				stTransRecordType 		= 'VENDORBILL';
			}
			else if (recordType == 'EXPENSEREPORT') {
				FLD_APPROVAL_STATUS		= 'approvalstatus';
				FLD_NEXT_APPROVER 		= FLD_NXT_APPRVRS;
				FLD_TRAN_APPROVER 		= 'approver';
				FLD_TRAN_LIMIT 			= 'expenselimit';
				FLD_TRAN_APPROVER_LIMIT = 'approvallimit';
				FLD_TOTAL 				= 'total';
				FLD_REQUESTOR 			= 'custbody_nsts_gaw_tran_requestor';
				FLD_EMPLOYEE_VAL 		= 'entity';
				WACT_GAW_SUBMIT_BTN 	= 'workflowaction_nsts_gaw_submit_po';
				FLD_EMPLOYEE 			= nlapiGetFieldValue('entity');
				FLD_EMPLOYEE_VAL 		= 'entity';
				stTransRecordType 		= 'EXPENSEREPORT';
			}
			else if (recordType == 'PURCHASEREQUISITION'){
				FLD_APPROVAL_STATUS 	= 'approvalstatus';
				FLD_NEXT_APPROVER 		= FLD_NXT_APPRVRS;
				FLD_TRAN_APPROVER 		= 'purchaseorderapprover';
				FLD_TRAN_LIMIT 			= 'purchaseorderlimit';
				FLD_TRAN_APPROVER_LIMIT = 'purchaseorderapprovallimit';
				FLD_TOTAL 				= 'estimatedtotal';
				FLD_REQUESTOR 			= 'custbody_nsts_gaw_tran_requestor';
				WACT_GAW_SUBMIT_BTN 	= 'workflowaction_nsts_gaw_submit_po';
				FLD_EMPLOYEE 			= nlapiGetFieldValue('entity');
				FLD_EMPLOYEE_VAL 		= 'entity';
				stTransRecordType 		= 'PURCHASEREQUISITION';
			}
			else if (recordType == 'SALESORDER'){
				FLD_APPROVAL_STATUS 	= 'custbody_nsts_gaw_apprvl_status';
				FLD_NEXT_APPROVER 		= FLD_NXT_APPRVRS;
				FLD_TRAN_LIMIT 			= null;    
				FLD_TOTAL 				= 'total';
				WACT_GAW_SUBMIT_BTN 	= 'workflowaction_nsts_gaw_submit_so';
				stTransRecordType 		= 'SALESORDER';
			}
			else if ((recordType == 'JOURNALENTRY')||(recordType == 'INTERCOMPANYJOURNALENTRY')){
				FLD_APPROVAL_STATUS 	= 'approvalstatus'; //Set to 'custbody_nsts_gaw_apprvl_status' if enabled on accounting preferences
				FLD_NEXT_APPROVER 		= FLD_NXT_APPRVRS;
				FLD_TRAN_LIMIT 			= null;
				FLD_TOTAL 				= 'custbody_nsts_gaw_total_debit_amt';
				WACT_GAW_SUBMIT_BTN 	= 'workflowaction_nsts_gaw_submit_po';//'workflowaction_nsts_gaw_submit_so' if enabled on accounting preferences
				stTransRecordType 		= 'JOURNALENTRY';
			}else{
				//FOR CUSTOMIZATION, ENTER TRANSACTION AND MAPPING FIELDS
			}
		}
	}catch(error){
		defineError('initializeMappingFields',error);
	}
}


/**
* Checks if account is one world
* @param (null)
* @return boolean
* @type boolean
* @author Rose Ann Ilagan
* @version 1.0
*/
function isOneWorld(){
	try{
		var companyInfo = nlapiLoadConfiguration('userpreferences');
		if (companyInfo.getField('SUBSIDIARY') == null)
			return 'F';
	}catch(error){
		defineError('isOneWorld',error);
		return 'T';
	}
	return 'T';
}

/**
* Checks if value is null or undefined
* @param (object)
* @return boolean
* @type boolean
* @author Jaime Villafuerte
* @version 1.0
*/
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

/**
* Checks if value is empty
* @param (object)
* @return boolean
* @type boolean
* @author Jaime Villafuerte
* @version 1.0
*/
function isEmpty(stValue)
{
    if (isNullOrUndefined(stValue)){
        return true;
    }
   /** if (typeof stValue != 'string' && getObjectName(stValue) != 'String'){
        throw nlapiCreateError('10000', 'isEmpty should be passed a string value.  The data type passed is ' + typeof stValue + ' whose class name is ' + getObjectName(stValue));
    }*/

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

/**
* Returns the object / class name of a given instance
* @param (object) a variable representing an instance of an object
* @return the class name of the object
* @type string
* @author Nestor M. Lim
* @version 1.0
*/
function getObjectName(object)
{
    if (isNullOrUndefined(object)){
        return object;
    }

    return /(\w+)\(/.exec(object.constructor.toString())[1];
}

/**
* Compare strings
* @param 3  strings
* @return null
* @type null
* @author Rose Ann A. Ilagan
* @version 1.0
*/
function compareVBMatch(stObj1, stObj2, stObj3){
	return ((stObj1 == stObj2)&&(stObj2 == stObj3)&&(stObj3 == stObj1))
}
/**
* Define error occurred
* @param string - function name and object - error
* @return null
* @type null
* @author Rose Ann A. Ilagan
* @version 1.0
*/
function defineError(functionName, error){
    if ( error instanceof nlobjError )
        nlapiLogExecution( 'ERROR', functionName, error.getCode() + '\n' + error.getDetails());
    else
        nlapiLogExecution( 'ERROR', functionName, error.toString());
}

/**
* Get Transaction URL
* @param (string type, string id)
* @return null
* @type null
* @author Rose Ann A. Ilagan
* @version 1.0
*/
function getTransURL(stTransType,stTransId)
{
	var objcontext 	= nlapiGetContext();
	var stEnv		= objcontext.getEnvironment();
	var url 		= null;
	/**if(stEnv)
		stEnv = stEnv.toLowerCase();
	if (stEnv == 'production'){
	    url = 'https://system.na1.netsuite.com'+nlapiResolveURL('record', stTransType, stTransId);
	}else if(stEnv == 'sandbox'){
	    url = 'https://system.sandbox.netsuite.com'+nlapiResolveURL('record', stTransType, stTransId);
	}else{
	    url = nlapiResolveURL('record', stTransType, stTransId);
	}*/
	url = nlapiResolveURL('record', stTransType, stTransId);
	return url;
}

/**
* GET EXCHANGE RATE
* @param (string currency and string transaction date)
* @return null
* @type null
* @author Rose Ann A. Ilagan
* @version 1.0
*/
function getExchangeRate(currency, stTranDate){
	try{
    	var compRec 	= nlapiLoadConfiguration("companyinformation");
    	baseCurrency 	= compRec.getFieldValue("basecurrency");
    	if(!baseCurrency)
    		return 1;
		var rate = nlapiExchangeRate(currency, baseCurrency, stTranDate);
		if(!rate)
			return 1;
		return rate;
	}catch(error){
		//defineError('getExchangeRate',error);
		return 1;
	}
}

/**
* GET ROLE APPROVER
* @param (string rule result)
* @return null
* @type null
* @author Rose Ann A. Ilagan
* @version 1.0
*/
function getRole(paramResult)
{
	try{
		if(paramResult){
			var objRecord = JSON.parse(paramResult);
			if(objRecord){
				var recAppList	= nlapiLoadRecord(REC_APPROVER_LIST, objRecord['approverList']['id']);
				var role = recAppList.getFieldValue(FLD_LIST_APPROVER_ROLE);//objRecord['approverList']['record'][FLD_LIST_APPROVER_ROLE]['internalid'];
				if(role)
					role = parseInt(role);
				if(role)
					return role;
			}
		}
	}catch(error){
		//defineError('getRole',error);
	}
	return null;
}

/**
* Remove User from list of Approvers
* @param (string user,object)
* @return null
* @type null
* @author Rose Ann A. Ilagan
* @version 1.0
*/
function removeUserFromNextApprovers(stUser,stApprovers)
{
	try{
		if(typeof stApprovers == 'object')
			var arrApprovers = stApprovers;
		else
			var arrApprovers = getMultiApproverList(stApprovers);
		var retApprovers = [];
		var idx=0;
		var bFound		 = false;
		for(var i=0;i<arrApprovers.length; i++){
			if(arrApprovers[i] != stUser){
				retApprovers[idx] = arrApprovers[i];
				idx++;
			}
		}
		return retApprovers;
	}catch(error){
		//defineError('getRole',error);
	}
	return false;
}

/**
* Check if employee is in list of approvers
* @param (string user,object)
* @return null
* @type null
* @author Rose Ann A. Ilagan
* @version 1.0
*/
function checkEmpApprover(stUser,stApprovers)
{
	try{
		if(typeof stApprovers == 'object')
			var arrApprovers = stApprovers;
		else
			var arrApprovers = getMultiApproverList(stApprovers);
		var retApprovers = [];
		var idx=0;
		var bFound		 = false;
		for(var i=0;i<arrApprovers.length; i++){
			if(arrApprovers[i] == stUser){
				return true;
			}
		}
	}catch(error){
		//defineError('checkEmpApprover',error);
	}
	return false;
}

/**
* GET NO OF APPROVERS/CHECK IF APPROVER LIST IS NULL
* @param (object)
* @return null
* @type null
* @author Rose Ann A. Ilagan
* @version 3.0
*/
function checkMultiSelectLength(stMultSel){
	try{
		if(typeof stMultSel == 'object'){
			return stMultSel.length;
		}else{
			var stParsedMultSel = getMultiApproverList(stMultSel);
			if(stParsedMultSel){
				return stParsedMultSel.length;
			}
		}
		return 0;
	}catch(error){
		//defineError('checkMultiSelectLength',error);
		return 0;
	}
}

/**
* GET ALL APPROVERS ID
* @param (object)
* @return null
* @type null
* @author Rose Ann A. Ilagan
* @version 3.0
*/
function getMultiApproverList(stMultSel){
	try{
		if(stMultSel){
			if(typeof stMultSel == 'object')
				return stMultSel;
			else
				return stMultSel.split(',');
		}
		return null;
	}catch(error){
		//defineError('getMultiApproverList',error);
		return null;
	}
}

/**
* Replace all occurences of a string
* @param (object)
* @return null
* @type null
* @author Rose Ann A. Ilagan
* @version 3.0
*/
function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

/**
* Get transaction record type internal id
* @param (string id)
* @return string internal id
* @type string
* @author Jaime Villafuerte
* @version 1.0
*/
function getTranRecType(trantypeid)
{
    var internalid = null;
    
    if (trantypeid.toLowerCase() == 'purchaseorder' || 
        trantypeid.toUpperCase() == 'PURCHASEORDER'){
        internalid = '1';
    }
    else if (trantypeid.toLowerCase() == 'vendorbill' || 
             trantypeid.toUpperCase() == 'VENDORBILL'){
        internalid = '2';
    }
    else if (trantypeid.toLowerCase() == 'salesorder' || 
             trantypeid.toUpperCase() == 'SALESORDER'){
        internalid = '3';
    }
    else if (trantypeid.toLowerCase() == 'invoice' || 
             trantypeid.toUpperCase() == 'INVOICE'){
        internalid = '4';
    }
    else if (trantypeid.toLowerCase() == 'journalentry' || 
             trantypeid.toUpperCase() == 'JOURNALENTRY'){
        internalid = '5';
    }
    else if (trantypeid.toLowerCase() == 'expensereport' || 
             trantypeid.toUpperCase() == 'EXPENSEREPORT'){
        internalid = '6';
    }
    else if (trantypeid.toLowerCase() == 'purchaserequisition' || 
             trantypeid.toUpperCase() == 'PURCHASEREQUISITION'){
        internalid = '7';
    }
    else if (trantypeid.toLowerCase() == 'intercompanyjournalentry' || 
            trantypeid.toUpperCase() == 'INTERCOMPANYJOURNALENTRY'){
       internalid = '8';
    }      
    return internalid;
}

/**
* Return unique array
* @param (object,object,object)
* @return null
* @type null
* @author Rose Ann A. Ilagan
* @version 3.0
*/
function onlyUnique(value, index, self) {      
	return self.indexOf(value) === index; 
}

/**
* Get Line Approvers
* @param (string list, string approver)
* @return null
* @type null
* @author Rose Ann A. Ilagan
* @version 3.0
*/
function getLineApprovers(item,approver){
	var arrApprovers = [];
	try{
		item = item.toLowerCase();
		approver = approver.toLowerCase();
		var rec = nlapiLoadRecord(nlapiGetRecordType(),nlapiGetRecordId());
		var itemCount = rec.getLineItemCount(item);
		var idx = 0;
		if(itemCount > 0){
			for(var i=0;i<itemCount;i++){
				var stApprover = rec.getLineItemValue(item,approver,i+1);
				if(stApprover){
					arrApprovers[idx] = stApprover;
					idx++;
				}
			}			
		}
	}catch(error){
		defineError('getLineApprovers',error);
	}
	if(arrApprovers){
		if(arrApprovers.length > 0)
			return arrApprovers.filter(onlyUnique);
	}
	return arrApprovers;
}
/**
* Get the last sequence in the recent approval list record
* @param (null)
* @return object details of approver list
* @type object
* @author Jaime Villafuerte
* @version 1.0
*/
function getLastSequenceCreated()
{
    var intLastSeq = null;
    var bLastHierarchy = null;
    var arrCol = [];
        arrCol.push(new nlobjSearchColumn(FLD_LIST_RULE_SEQ).setSort(true));
        arrCol.push(new nlobjSearchColumn(FLD_LIST_LAST_H));
        arrCol.push(new nlobjSearchColumn(FLD_LIST_TRAN_APPROVER));
        arrCol.push(new nlobjSearchColumn(FLD_LIST_ORIG_APPRVR));
        arrCol.push(new nlobjSearchColumn(FLD_LIST_RULE_NAME));
    var arrFil = [];
        arrFil.push(new nlobjSearchFilter(FLD_LIST_PO, null, 'is', nlapiGetRecordId()));
        arrFil.push(new nlobjSearchFilter(FLD_LIST_HISTORICAL_REJECT,null,'is','F'));
    var arrRes = nlapiSearchRecord(REC_APPROVER_LIST, null, arrFil, arrCol);
    
    return arrRes; //{sequence: intLastSeq, islast: bLastHierarchy};
}

/**
* Search approver list details given approver id and transaction id
* @param (string transaction id and approver id)
* @return object approver list details
* @type object
* @author Jaime Villafuerte
* @version 1.0
*/
function searchApprovers(idPO, idApprover)
{
    var arrFilters = new Array();
        arrFilters.push(new nlobjSearchFilter(FLD_LIST_PO, null, 'is', idPO));
        arrFilters.push(new nlobjSearchFilter(FLD_LIST_HISTORICAL_REJECT,null,'is','F'));
    
    if (!isEmpty(idApprover)){
    	arrFilters.push(new nlobjSearchFilter(FLD_LIST_TRAN_APPROVER, null, 'is', idApprover));
    }
    
    var arrFolumns = [];
    arrFolumns.push(new nlobjSearchColumn(FLD_LIST_TRAN_APPROVER));
    arrFolumns.push(new nlobjSearchColumn(FLD_LIST_ORIG_APPRVR));
    
    return nlapiSearchRecord(REC_APPROVER_LIST, SS_GET_NEXT_APPRVR, arrFilters, arrFolumns);
}

/**
* Replace string on array
* @param (object, object, object)
* @return object
* @type string
* @author Jaime Villafuerte
* @version 1.0
*/
function replaceOnArray(arr,value,replaceValue){
    if(isEmptyVariantVar(arr)){
        return arr;
    }

    if(arr instanceof Array){
        var valIndex = arr.indexOf(value);
        if(valIndex >= 0){
            arr[valIndex] = replaceValue;
        }
    }
    
    return arr;
}

/**
* Check if value is empty
* @param (object)
* @return boolean
* @type string
* @author Jaime Villafuerte
* @version 1.0
*/
function isEmptyVariantVar(value){
    if (value == null || value == 'null' || value == undefined || value == '' || value == "" || value.length <= 0) { return true; }
    return false;
}

/**
* Currency conversion between transaction date
* @param (float amount, string currency, string default currency, boolean use transaction date, string transaction date)
* @return float updated amount
* @type object
* @author Jaime Villafuerte
* @version 1.0
*/
function currencyConversion(amt, currency, defaultCurrency, userTransDate,stTranDate)
{    
    if(userTransDate != "T") {
        stTranDate = nlapiDateToString(new Date()); 
    }else{
		if(isEmptyVariantVar(stTranDate))
			stTranDate = nlapiGetFieldValue("trandate");
	}
    //var stTranDate = (userTransDate == "T") ? nlapiGetFieldValue("trandate") : nlapiDateToString(new Date());
    var baseCurrency = defaultCurrency;//grpCurrencyInfo.DEFAULT_CURRENCY;

    if (!isEmptyVariantVar(defaultCurrency)){
        if (currency != baseCurrency){
            var rate = nlapiExchangeRate(currency, baseCurrency, stTranDate);

            var targetCurrencyAmt = amt * rate
            return targetCurrencyAmt;
        }
    }
    return amt;
}