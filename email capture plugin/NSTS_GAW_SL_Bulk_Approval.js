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
* This script contains User Event used in advanced Bulk approval
* 
* Version Type    Date            Author           Remarks
* 1.00    Create  3 Nov 2015     Jaime Villafuerte III
* 1.01    Update  3 Nov 2015     Dennis Geronimo
*/

var FLD_CUSTBODY_CLK_TRIG_SUBMIT            = 'custbody_nsts_gaw_clk_trig_submit';
var FLD_CUSTBODY_CLK_TRIG_APPROVE           = 'custbody_nsts_gaw_clk_trig_approve';
var FLD_CUSTBODY_CLK_TRIG_REJECT            = 'custbody_nsts_gaw_clk_trig_reject';
var FLD_CUSTBODY_CLK_TRIG_SUPER             = 'custbody_nsts_gaw_trigger_super';
var SS_ADVANCE_BULK_APPROVAL                = 'customsearch_nsts_gaw_adv_bulk_approval';
var SS_ADVANCE_BULK_APPROVAL_SUBMIT         = 'customsearch_nsts_gaw_adv_bulk_aprv_sbmt';
var SS_ADVANCE_BULK_APPROVAL_SUBMIT_SUPERAPROVER    = 'customsearch_nsts_gaw_adv_blk_aprv_sbtsp'
    
var INT_TXNPERPAGE  = nlapiGetContext().getSetting('SCRIPT','custscript_nsts_gaw_blkapvl_txncnt_page');
INT_TXNPERPAGE = parseInt(INT_TXNPERPAGE);
INT_TXNPERPAGE = (INT_TXNPERPAGE <=0)? 10 : INT_TXNPERPAGE;

if(isOneWorld() == 'F'){
    SS_ADVANCE_BULK_APPROVAL = 'customsearch_nsts_gaw_adv_blk_aprvl_n_ow';
}

var stRequisitionEnabled = false;
var objRequisitionEstimateTotal = null;

try{
	var companyInfo = nlapiLoadConfiguration('companyfeatures');
	if(companyInfo.getFieldValue('requisitions') == 'T'){

		stRequisitionEnabled = true;
	    var objColRequisitionEstimateTotal = new Array();      
	    var objCol = new nlobjSearchColumn('formulanumeric', null, 'MAX');
	    objCol.setFormula('case when {estimatedamount.id} > 0 then {estimatedamount.id} else null end');
	    objCol.setLabel('Estimated Total');
	    objColRequisitionEstimateTotal.push(objCol);  
	}
}catch(error){
	defineError('getRequisitionFeature',error);
}
/**
* @param {nlobjRequest} request Request object
* @param {nlobjResponse} response Response object
* @returns {Void} Any output is written via response object
*/
function advanceBulkApprovalSuitelet(request,response)
{
    var stAction = request.getParameter('custpage_bulk_action');
    
    var form = '';
    
    if(stAction=='SEARCH')
    {       
        form = bulkApprovalDisplay(request);
    }
    else if(stAction=='PROCESS')
    {
        form = bulkApprovalSubmit(request);
    }
    else
    {
        form = bulkApprovalDisplay(request);
    }
    response.writePage(form);
}


/**
* @param {nlobjRequest} request Request object
* @returns {Void} Any output is written via response object
*/
function bulkApprovalDisplay(request)
{
    var contex = nlapiGetContext();

    var STSUPERAPPROVER = contex.getSetting('SCRIPT','custscript_nsts_gaw_super_apprvr');    
    var stLogTitle = "BULKAPPROVALDISPLAY";
    //set the form
    var form = nlapiCreateForm('Bulk Approval',false);
        form.setScript('customscript_nsts_gaw_adv_bulk_client');
    
    var stType      = request.getParameter('custpage_bulk_trantype');
    var stTypeTxt   = request.getParameter('custpage_bulk_trantypetxt');
    var stTranNo    = request.getParameter('custpage_bulk_tranno');
    var stSelAct    = request.getParameter('custpage_bulk_select');
    var intCurPage  = request.getParameter('custpage_bulk_curpage');
    
    intCurPage       = (isEmptyVariantVar(intCurPage) || parseInt(intCurPage)<=0) ? 1: parseInt(intCurPage);
    
    var objFld = form.addField('custpage_bulk_searchstatus','inlinehtml').setLayoutType('outsideabove', 'startrow').setDefaultValue('');    
    
    var actionGroup = form.addFieldGroup('custpage_bulk_action_group','Action Filter');
    objFld = form.addField('custpage_bulk_select','select','Action',null,'custpage_bulk_action_group');
    objFld.addSelectOption('','');
    objFld.addSelectOption('1','SUBMIT');
    objFld.addSelectOption('2','APPROVE');
    objFld.addSelectOption('3','REJECT');
    
    //only show the super approver capability when it is the super-approver set on the general preference
    if(STSUPERAPPROVER == nlapiGetUser()){
        objFld.addSelectOption('4','SUPER APPROVE');
    }

    actionGroup.setShowBorder(true);
    
    //filter group
    var filterGroup = form.addFieldGroup('custpage_bulk_filter_group','Search Filters');    
    
    objFld.setDefaultValue(stSelAct);
    objFld.setMandatory(true);
    
    objFld = form.addField('custpage_bulk_trantype','select','Transaction Type','customlist_nsts_gaw_wf_supp_types','custpage_bulk_filter_group');
    objFld.setDefaultValue(stType);
    
    objFld = form.addField('custpage_bulk_trantypetxt','text','',null,'custpage_bulk_filter_group');
    objFld.setDefaultValue(stTypeTxt);
    objFld.setDisplayType('hidden');
    
    objFld = form.addField('custpage_bulk_tranno','text','Transaction No.',null,'custpage_bulk_filter_group');
    objFld.setDefaultValue(stTranNo);
    
    objFld = form.addField('custpage_bulk_action','text','',null,'custpage_bulk_filter_group');
    objFld.setDefaultValue('PROCESS');
    objFld.setDisplayType('hidden');
    
    filterGroup.setShowBorder(true);

    var objBulkApproval = getAPBulkApprovalList(request);
    var intColCount = objBulkApproval.columns.length;
    var arrColumns = objBulkApproval.columns;
    var intSearchCount = objBulkApproval.searchCount;
    var intTotalPage = Math.ceil( intSearchCount / INT_TXNPERPAGE);
    intTotalPage = (intTotalPage < 0) ? 0 : intTotalPage;

    if(intColCount > 0){
        
        objFld = form.addSubTab("custpage_tab1", "List");
            
        objFld = form.addField('custpage_bulk_curpage','select','Navigate To Page');
        objFld.set
        for (var intPg = 1; intPg <= intTotalPage; intPg++){
            var bIsSelected = false;

            if(intCurPage == intPg){
                bIsSelected = true;
            }
            var stToRange = (intPg == intTotalPage)? intSearchCount : (intPg * INT_TXNPERPAGE);
            var stStartToRange = ((intPg * INT_TXNPERPAGE) - INT_TXNPERPAGE) +1 ;
            objFld.addSelectOption(intPg ,  stStartToRange + ' to ' + stToRange,bIsSelected);
        }

        objFld.setLayoutType('startrow');

        var objSublist = form.addSubList('custpage_bulk_sublist','list','','custpage_tab1');
        objSublist.addMarkAllButtons();
        
        var intPageHolderNext = intCurPage-1;
        var intPageHolderPrev = intCurPage+1;
        
        var btnPrev = objSublist.addButton('custpage_prev', 'Previous', 'gotoPage(' +  intPageHolderNext + ');');
        var btnNext = objSublist.addButton('custpage_next', 'Next', 'gotoPage(' + intPageHolderPrev +');');
        
        if(intPageHolderNext < 1){
            btnPrev.setDisabled(true);
        }
       
        objSublist.addField('custpage_bulk_sub_select','checkbox','Select');
        objSublist.addField('custpage_bulk_sub_view','url').setLinkText('View'); 
        
        if(isEmptyVariantVar(objBulkApproval.data) || objBulkApproval.data.length < INT_TXNPERPAGE  || intTotalPage == intCurPage){
            btnNext.setDisabled(true);
        }
        
        for (var icol = 0; icol < intColCount; icol++) {
            var objCol = arrColumns[icol];
            
            var stLabel = objCol.label;
            var stDisplayType = "inline";
            if(stLabel.indexOf("<hidden>")>=0){
                stDisplayType = "hidden";
            }
            var obkFld = null;
            stLabel = stLabel.replace(/<hidden>|<getvalue>/g,"");
            if(objCol.name == 'transactionnumer'){
                obkFld = objSublist.addField(objCol.name, "textarea", objCol.label, '')
                obkFld.setDisplayType(stDisplayType);
            }else if(objCol.name == 'recordtype'){
                obkFld = objSublist.addField(objCol.name, "text", objCol.label, '')
                obkFld.setDisplayType('hidden');
            }else{
                obkFld = objSublist.addField(objCol.name, 'text', objCol.label);
                obkFld.setDisplayType(stDisplayType);
            }
            
            
        }

        var objReason = objSublist.addField('custpage_bulk_sub_reason','textarea','Reason').setDisplayType('entry');
        //REJECT
        (stSelAct == '3') ? objReason.setMandatory(true) : objReason.setDisplayType('hidden');
        var arrSublistData = objBulkApproval.data;
        if(!isEmptyVariantVar(arrSublistData)){
            objSublist.setLineItemValues(arrSublistData);
            
        }
    }else{
        if(!isEmptyVariantVar(stSelAct)){
            var filterGroup = form.addFieldGroup('custpage_bulk_Error_group','Error');    
            objFld = form.addField('custpage_bulk_savesearchmissingcolumn','text','',null,'custpage_bulk_Error_group');
            objFld.setDefaultValue("<b style='color:red;'>The Save Search is Missing a Required columns check for Internalid or Type if not exist!</b>");
            objFld.setDisplayType("inline");
        }
    }

    //show buttons
    form.addSubmitButton('Submit');
    form.addButton('custpage_search','Search','execSearch()');
    
    var url = nlapiResolveURL('SUITELET','customscript_nsts_gaw_adv_bulk_approval','customdeploy_nsts_gaw_adv_bulk_approval');
    form.addButton('custpage_reset','Reset',"execReset('" + url + "')");

    return form;
}


function bulkApprovalSubmit(request)
{
	try{
	    var SUBMIT        = '1';
	    var APPROVE       = '2';
	    var REJECT        = '3';
	    var SUPER         = '4';
	    
	    var count = request.getLineItemCount('custpage_bulk_sublist');
	    var stSelAct = request.getParameter('custpage_bulk_select');
	    var arrProcessed = [];

	    var arrSelTran = []
	    for(var i=1; i<=count; i++){
	        var isSelect            = request.getLineItemValue('custpage_bulk_sublist','custpage_bulk_sub_select',i);      
	        var stIntId             = request.getLineItemValue('custpage_bulk_sublist','internalid',i);
	        if(isSelect=='T'){
	            arrSelTran.push(stIntId);
	        }
	    }
	    var arrSelectedTrans = [];
	    var arrRes = getArrPendingForMyAction(request,arrSelTran);
	    
	    if(!isEmptyVariantVar(arrRes)){
	        var selCount = arrRes.length;
	        for(var i=0; i< selCount; i++){
	            var rec = arrRes[i];
	            arrSelectedTrans.push(rec.getValue('internalid',null,"GROUP"));
	        }
	    }

	    
	    for(var i=1; i<=count; i++)
	    {
	        var isSelect  			= request.getLineItemValue('custpage_bulk_sublist','custpage_bulk_sub_select',i);
	        var stRecType 			= request.getLineItemValue('custpage_bulk_sublist','type',i);  
	        var stBaseRecType 		= request.getLineItemValue('custpage_bulk_sublist','recordtype',i);  
	        var stRecTypeText       = stRecType;
	        var stIntId   			= request.getLineItemValue('custpage_bulk_sublist','internalid',i);
	        var sttransactionnumber   = request.getLineItemValue('custpage_bulk_sublist','transactionnumber',i);
	        var stNextApprovers   	= getApprovers(request.getLineItemValue('custpage_bulk_sublist',FLD_NXT_APPRVRS,i));
	        var stRoleApprover   	= getApprovers(request.getLineItemValue('custpage_bulk_sublist',FLD_NXT_ROLE_APPRVRS,i));
	        
	        stRecType = getWFSupportedType(stRecType,stBaseRecType);

	        if(isSelect=='T')
	        {
	            var isOnMyAction = true;
	            var stStatus = "SUCCESS";
	            if(arrSelectedTrans.indexOf(stIntId) < 0 ){
	                isOnMyAction = false
	                stStatus = "<b style='color:red'>FAILED<b>";
	            }
	            
	            var objProcData = {
	              recordtype : stRecTypeText,
	              sttransactionnumber : sttransactionnumber,
	              internalid: stIntId,
	              status: stStatus,
	            };
	            
	            if(isOnMyAction){
	                if(stSelAct==SUBMIT)
	                {
	                	try{
		                    nlapiSubmitField(stRecType,stIntId,FLD_CUSTBODY_CLK_TRIG_SUBMIT,'T'); //TODO
	                	}catch(error){
	                		if(stRecType == 'journalentry'){
	                			nlapiSubmitField('intercompanyjournalentry',stIntId,FLD_CUSTBODY_CLK_TRIG_SUBMIT,'T'); 
	                		}
	                	}
	                }
	                else if(stSelAct==APPROVE)
	                {
	                	try{
	                		nlapiSubmitField(stRecType,stIntId,FLD_CUSTBODY_CLK_TRIG_APPROVE,'T'); //TODO
		                    //arrProcessed.push(objProcData);
	                	}catch(error){
	                		if(stRecType == 'journalentry'){
	                			nlapiSubmitField('intercompanyjournalentry',stIntId,FLD_CUSTBODY_CLK_TRIG_APPROVE,'T'); //TODO
	                		}
	                	}
	                }
	                else if(stSelAct==REJECT)
	                {
	                    var arrAppList = searchApprovers(stIntId,stNextApprovers);                
	                    var sToday = nlapiDateToString(new Date(),'datetimetz');
	                    var stReason = request.getLineItemValue('custpage_bulk_sublist','custpage_bulk_sub_reason',i);
	                    stReason = stReason.trim();
	                    if(!isEmptyVariantVar(stReason)){
	                        try{
	                            for(var icount=0;icount < arrAppList.length;icount++){       
	                                nlapiSubmitField(REC_APPROVER_LIST, arrAppList[icount].getId(),     [FLD_LIST_APPROVER_LINE_STATUS, FLD_LIST_APPROVER_DATE, FLD_LIST_TRAN_APPROVER, FLD_LIST_REJECTION_REASON],
	                                                                                                    [HC_STATUS_REJECTED, sToday, nlapiGetContext().getUser(), stReason]);                       
	                            }
	    	                	try{
		                            nlapiSubmitField(stRecType, stIntId, [FLD_CUSTBODY_CLK_TRIG_REJECT, FLD_REJECTION_REASON], ['T',  stReason]);
	    		                    //arrProcessed.push(objProcData);
	    	                	}catch(error){
	    	                		if(stRecType == 'journalentry'){
	    	                            nlapiSubmitField('intercompanyjournalentry', stIntId, [FLD_CUSTBODY_CLK_TRIG_REJECT, FLD_REJECTION_REASON], ['T',  stReason]);
	    	                		}
	    	                	}
	                        }catch(e){
	                            objProcData.status = "<b style='color:red'>FAILED<b>";
	                        }
	                    }else{
	                        objProcData.status = "<b style='color:red'>Reason for Rejection is Missing!<b>";
	                    }
	                }
	                else if(stSelAct==SUPER)
	                {
	                	try{
		                    nlapiSubmitField(stRecType,stIntId,FLD_CUSTBODY_CLK_TRIG_SUPER,'T');
		                    //arrProcessed.push(objProcData);
	                	}catch(error){
	                		if(stRecType == 'journalentry'){
	                			nlapiSubmitField('intercompanyjournalentry',stIntId,FLD_CUSTBODY_CLK_TRIG_SUPER,'T');
	                		}
	                	}
	                } 
	            }
	            arrProcessed.push(objProcData);
	        }
	    }
	    
	    //set the form
	    var form = nlapiCreateForm('Advanced Bulk Approval',false);
	    var objSublist = form.addSubList('custpage_bulk_summ','list','Summary');  
	    objSublist.addField('custpage_bulk_colsumm','text','');
	    var objFldLabel = form.addField('custpage_label', "text", "");
	    
	    objSublist.addField("recordtype", "text", "Record Type");
	    objSublist.addField("sttransactionnumber", "text", "transaction Number");
	    objSublist.addField("status", "text", "status");
	    objSublist.addField("internalid", "text", "id");
	    
	    if(stSelAct==SUBMIT) {
	        objFldLabel.setDefaultValue(arrProcessed.length + ' Transaction/s Submitted');
	        objFldLabel.setDisplayType('inline');
	    }
	    if(stSelAct==APPROVE) {
	        objFldLabel.setDefaultValue(arrProcessed.length + ' Transaction/s Approved');
	        objFldLabel.setDisplayType('inline');
	    }
	    if(stSelAct==REJECT) {
	        objFldLabel.setDefaultValue(arrProcessed.length + ' Transaction/s Rejected');
	        objFldLabel.setDisplayType('inline');
	        //objSublist.setLineItemValue('custpage_bulk_colsumm',1,arrProcessed.length + ' Transactions Rejected');
	    }
	    if(stSelAct==SUPER) {
	        objFldLabel.setDefaultValue(arrProcessed.length + ' Transaction/s Super Approved');
	        objFldLabel.setDisplayType('inline');
	        //objSublist.setLineItemValue('custpage_bulk_colsumm',1,arrProcessed.length + ' Transactions Super Approved');
	    }
	    objSublist.setLineItemValues(arrProcessed);
	    //show buttons
	    form.addButton('custpage_main_menu','Return To Main Page', "document.location='" + nlapiResolveURL('SUITELET','customscript_nsts_gaw_adv_bulk_approval','customdeploy_nsts_gaw_adv_bulk_approval') + "'; window.ischanged=false;");	    
	    return form;
	}catch(error){
		defineError('bulkApprovalSubmit',error);
		return null;
	}
}

function getAPBulkApprovalList(request){
    var stLogTitle = "GETAPBULKAPPROVALLIST";
    var SUBMIT = '1';
    var APPROVE = '2';
    var REJECT = '3';
    var SUPER = '4';
    
    var stTranType = request.getParameter('custpage_bulk_trantypetxt');
    stTranType = (stTranType != '' && stTranType != null && stTranType != undefined) ? stTranType : null;
    var stTranNo = request.getParameter('custpage_bulk_tranno');
    stTranNo = (stTranNo != '' && stTranNo != null && stTranNo != undefined) ? stTranNo.trim() : null;
    var stActSel = request.getParameter('custpage_bulk_select');
    stActSel = (stActSel != '' && stActSel != null && stActSel != undefined) ? stActSel : null;
    
    var intCurPage   = request.getParameter('custpage_bulk_curpage');
    intCurPage       = (isEmptyVariantVar(intCurPage) || parseInt(intCurPage)<=0) ? 1: parseInt(intCurPage);
    
    var arrRes = null;
    var arrFil = new Array();
    
    if (!isEmptyVariantVar(stTranNo)){
        arrFil.push(new nlobjSearchFilter('transactionnumber', null, 'is', stTranNo));    
    }
    
    stTranType = getWFSupportedType(stTranType);
    var intPageHolder = intCurPage-1;
    var intStartRes = intPageHolder * INT_TXNPERPAGE;
    var intEndRes = intStartRes + INT_TXNPERPAGE
    
    intStartRes = (intStartRes)?intStartRes: 0 ;
    intEndRes = (intEndRes)?intEndRes : INT_TXNPERPAGE ;
    
    //check all for submit
    var objSearch = null
    var objSearchRS = null;
    
    var intsearchCount = 0;
    
    if (stActSel == SUBMIT) {
        objSearch = nlapiLoadSearch(stTranType, SS_ADVANCE_BULK_APPROVAL_SUBMIT);
        if(!isEmptyVariantVar(arrFil)){
            objSearch.addFilters(arrFil);
        }
        if(stRequisitionEnabled){
        	var objColumns = objSearch.getColumns();
        	objColumns = objColumns.concat(objColRequisitionEstimateTotal);
        	objSearch.setColumns(objColumns);
        }
        objSearchRS = objSearch.runSearch();
        arrRes = objSearchRS.getResults(intStartRes, intEndRes);
        //arrRes = nlapiSearchRecord(null, SS_ADVANCE_BULK_APPROVAL_SUBMIT);
    }
    
    //check all for approve or reject    
    if (stActSel == APPROVE || stActSel == REJECT) {
        objSearch = nlapiLoadSearch(stTranType, SS_ADVANCE_BULK_APPROVAL);
        if(!isEmptyVariantVar(arrFil)){
            objSearch.addFilters(arrFil);
        }
        if(stRequisitionEnabled){
        	var objColumns = objSearch.getColumns();
        	objColumns = objColumns.concat(objColRequisitionEstimateTotal);
        	objSearch.setColumns(objColumns);
        }
        objSearchRS = objSearch.runSearch();
        arrRes = objSearchRS.getResults(intStartRes, intEndRes);
         
    }
    
    if (stActSel == SUPER) {
        objSearch = nlapiLoadSearch(stTranType, SS_ADVANCE_BULK_APPROVAL_SUBMIT_SUPERAPROVER);
        if(!isEmptyVariantVar(arrFil)){
            objSearch.addFilters(arrFil);
        }
        if(stRequisitionEnabled){
        	var objColumns = objSearch.getColumns();
        	objColumns = objColumns.concat(objColRequisitionEstimateTotal);
        	objSearch.setColumns(objColumns);
        }
        objSearchRS = objSearch.runSearch();
        arrRes = objSearchRS.getResults(intStartRes, intEndRes);
    }

    var arrData = [];
    var objColumns = [];
    
    var isRequiredColumnExist = 0; //if this is = to 2 the the save search Is Good
    if(!isEmptyVariantVar(objSearch)){
        var arrColumns = objSearch.getColumns();
        var intColCount = arrColumns.length;
        for (var icol = 0; icol < intColCount; icol++) {
            var objSearchCol = arrColumns[icol];
            var stColName   = objSearchCol.getName();
            var stColSum    = objSearchCol.getSummary();
            var stColJoin   = objSearchCol.getJoin();
            var stLabel     = objSearchCol.getLabel();

            stColName   = isEmptyVariantVar(stColName)? "" : stColName.toLowerCase();
            stColSum    = isEmptyVariantVar(stColSum)? null : stColSum.toUpperCase();
            stColJoin   = isEmptyVariantVar(stColJoin)? null : stColJoin.toLowerCase();
            stLabel     = isEmptyVariantVar(stLabel)? "" : stLabel;

            var intAllIndex = objColumns.map(function(obj) { 
                return obj.name}).indexOf(stColName);

            if(intAllIndex < 0){
                objColumns.push({
                    name : stColName,
                    summary : stColSum,
                    join : stColJoin,
                    label : stLabel,
                });
            }
            
            if(stColName == 'internalid' || stColName == 'type'){
                isRequiredColumnExist ++;
            }

        }
        
        if(isRequiredColumnExist < 2){
            return {
                columns: [], 
                data:  []
                };
        }
        
        intColCount = objColumns.length;

        for (var i = 0; arrRes && i < arrRes.length; i++) {            
            var arrList = {};
            var stInternalid = null;
            var stTransactionType = null;
            var stBaseTranType = null;
            for (var icol = 0; icol < intColCount; icol++) {
                var objCol = objColumns[icol];
                var value = "";
                if(objCol.name == "internalid"){
                    value = arrRes[i].getValue(objCol.name,objCol.join,objCol.summary);
                    stInternalid = value;
                }else{
                    var stLabel = objCol.label;
                    var isGetValue = false
                    if(stLabel.indexOf('<getvalue>')>0){
                        isGetValue = true;
                    }
                    
                    if (objCol.name == 'type') {
                        value = arrRes[i].getText(objCol.name, objCol.join,objCol.summary);
                        stBaseTranType = arrRes[i].getValue("recordtype", null,'GROUP');
                        var stTranType = value;
                        stTranType = (stTranType=='Journal') ? 'Journal Entry' : stTranType;
                        stTranType = (stTranType=='Requisition') ? 'Purchase Requisition' : stTranType;
                        value = stTranType;
                        stTransactionType = value;
                    }else if(objCol.name == 'transactionnumber'){
                        value = arrRes[i].getValue(objCol.name, objCol.join,objCol.summary);
                        if(isEmptyVariantVar(stInternalid)){
                            stInternalid = arrRes[i].getValue('internalid',null,'GROUP');
                        }
                        if(isEmptyVariantVar(stTransactionType)){
                            var stTranType = arrRes[i].getText("type", null,'GROUP');
                            stBaseTranType = arrRes[i].getValue("recordtype", null,'GROUP');
                            stTranType = (stTranType=='Journal') ? 'Journal Entry' : stTranType;
                            stTranType = (stTranType=='Requisition') ? 'Purchase Requisition' : stTranType;
                            stTransactionType = stTranType;
                        }
                        var stRecType = getWFSupportedType(stTransactionType,stBaseTranType)
                        //var stUrl = nlapiResolveURL("record", stRecType, stInternalid);
                        var stUrl = nlapiResolveURL('SUITELET','customscript_nsts_gaw_set_nxt_apprvrbulk','customdeploy_nsts_gaw_set_next_apprvr');
                        	stUrl = stUrl + '&recordtype='+stRecType;
                        	stUrl = stUrl + '&recordid='+stInternalid;
                        	stUrl = stUrl + '&action='+stActSel;
                        value = '<a href=' + stUrl + ' target="_blank">' + value + '</a>';
                    }else{
                        if(isGetValue){
                            value = arrRes[i].getValue(objCol.name, objCol.join,objCol.summary);
                        }else{
                            value = arrRes[i].getText(objCol.name, objCol.join,objCol.summary);
                            if(isEmptyVariantVar(value)){
                                value = arrRes[i].getValue(objCol.name,objCol.join,objCol.summary);    
                            }
                        }
                    }
                }
                arrList[objCol.name] = value;
            }
            
            
            arrData.push(arrList);
        }
    }
    
    //Get the total Count of the Search
    if(!isEmptyVariantVar(objSearch)){
        objSearch.setColumns([new nlobjSearchColumn("internalid", null, "COUNT")]);
        var resItemCount = objSearch.runSearch().getResults(0, 1);
        if(!isEmptyVariantVar(resItemCount)){
            intsearchCount = resItemCount[0].getValue("internalid",null,'COUNT');
            intsearchCount = parseInt(intsearchCount);
        }
    }

    return {
            columns: objColumns, 
            data:  arrData,
            searchCount : intsearchCount
            };
            
}

function getArrPendingForMyAction(request,arrSelTran){
    
    var SUBMIT = '1';
    var APPROVE = '2';
    var REJECT = '3';
    var SUPER = '4';
    
    var stActSel = request.getParameter('custpage_bulk_select');
    stActSel = (stActSel != '' && stActSel != null && stActSel != undefined) ? stActSel : null;
    
    var stTranType = null
    var stActSel = request.getParameter('custpage_bulk_select');
    stActSel = (stActSel != '' && stActSel != null && stActSel != undefined) ? stActSel : null;
    
    var arrRes = null;
    var arrFil = new Array();
    
    
    if(!isEmptyVariantVar(arrSelTran)){
        arrFil.push(new nlobjSearchFilter('internalid', null, 'anyof', arrSelTran));    
    }

    var objSearch = null
    var objSearchRS = null;
    
    if (stActSel == SUBMIT) {
        objSearch = nlapiLoadSearch(stTranType, SS_ADVANCE_BULK_APPROVAL_SUBMIT);
        if(!isEmptyVariantVar(arrFil)){
            arrFil  = arrFil.concat(objSearch.getFilters());
            objSearch.setFilters(arrFil);
        }

        if(stRequisitionEnabled){
        	var objColumns = objSearch.getColumns();
        	objColumns = objColumns.concat(objColRequisitionEstimateTotal);
        	objSearch.setColumns(objColumns);
        }
        objSearchRS = objSearch.runSearch();
        arrRes = objSearchRS.getResults(0, 1000);
        //arrRes = nlapiSearchRecord(null, SS_ADVANCE_BULK_APPROVAL_SUBMIT);
    }else if (stActSel == APPROVE || stActSel == REJECT) {
        objSearch = nlapiLoadSearch(stTranType, SS_ADVANCE_BULK_APPROVAL);
        if(!isEmptyVariantVar(arrFil)){
            arrFil  = arrFil.concat(objSearch.getFilters());
            objSearch.setFilters(arrFil);
        }
        	

        if(stRequisitionEnabled){
        	var objColumns = objSearch.getColumns();
        	objColumns = objColumns.concat(objColRequisitionEstimateTotal);
        	objSearch.setColumns(objColumns);
        }	
        objSearchRS = objSearch.runSearch();
        arrRes = objSearchRS.getResults(0, 1000);
        //arrRes = nlapiSearchRecord(null,SS_ADVANCE_BULK_APPROVAL);
    }else if (stActSel == SUPER) {
        objSearch = nlapiLoadSearch(stTranType, SS_ADVANCE_BULK_APPROVAL_SUBMIT_SUPERAPROVER);
        if(!isEmptyVariantVar(arrFil)){
            arrFil  = arrFil.concat(objSearch.getFilters());
            objSearch.setFilters(arrFil);
        }

        if(stRequisitionEnabled){
        	var objColumns = objSearch.getColumns();
        	objColumns = objColumns.concat(objColRequisitionEstimateTotal);
        	objSearch.setColumns(objColumns);
        }
        objSearchRS = objSearch.runSearch();
        arrRes = objSearchRS.getResults(0, 1000);
        //arrRes = nlapiSearchRecord(stRecType, SS_ADVANCE_BULK_APPROVAL_SUBMIT_SUPERAPROVER);
    }
    
    return arrRes;
}

function getWFSupportedType(recordName,stBaseRecType)
{
    try{
        
        recordName = isEmptyVariantVar(recordName)? "" : recordName;
        var stRecName = recordName.toLowerCase().trim();
        var recordType = '';
            
        switch(stRecName)
        {
            case 'journal entry'  : recordType = 'journalentry'; break;
            case 'cash sale'  : recordType = 'cashsale'; break;
            case 'estimate'  : recordType = 'estimate'; break;
            case 'invoice'  : recordType = 'invoice'; break;
            case 'customer payment'  : recordType = 'customerpayment'; break;
            case 'credit memo' : recordType = 'creditmemo'; break;
            case 'purchase order' : recordType = 'purchaseorder'; break;
            case 'item receipt' : recordType = 'itemreceipt'; break;
            case 'bill' : recordType = 'vendorbill'; break;
            case 'vendor bill' : recordType = 'vendorbill'; break;
            case 'vendor payment' : recordType = 'vendorpayment'; break;
            case 'vendor credit' : recordType = 'vendorcredit'; break;
            case 'expense report' : recordType = 'expensereport'; break;
            case 'sales order' : recordType = 'salesorder'; break;
            case 'return authorization' : recordType = 'returnauthorization'; break;
            case 'assembly build' : recordType = 'assemblybuild'; break; 
            case 'opportunity' : recordType = 'opportunity'; break;
            case 'customer deposit' : recordType = 'customerdeposit'; break;
            case 'vendor return authorization' : recordType = 'vendorreturnauthorization'; break;
            case 'Transfer Order' : recordType = 'transferorder'; break;
            case 'purchase requisition' : recordType = 'purchaserequisition'; break;
            default:
            recordType = null;
        }
        if(isEmptyVariantVar(recordType) && !isEmptyVariantVar(stBaseRecType)){
        	recordType = stBaseRecType;
        }
        return recordType;
    }catch(error){
        defineError('getWFSupportedType',error);
    }
    return null;
}


function getApprovers(stApprover){
	//Set Next Role Approver
	if(stApprover){
		stApprover = stApprover.trim().toLowerCase();
		if(stApprover == '- none -')
			return null;
		else
			return nlapiGetContext().getUser();
	}else{
		return null;
	}
}