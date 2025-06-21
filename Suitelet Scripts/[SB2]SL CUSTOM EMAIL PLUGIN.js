/*******************************************************************
 *
 * Name: SL CUSTOM EMAIL PLUGIN.js
 *
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @version: 1.4.0
 *
 * Author: NSC Cosulting[BP].
 * Purpose: 
 * Script: 
 * Deploy: 
 *   
 * ******************************************************************* */

define(['N/record', 'N/ui/serverWidget', 'N/https', 'N/email', 'N/workflow', 'N/runtime' ,'../lib/crypto-js_3.1.9-1_min'], 
function (record, serverWidget, https, email, workflow, runtime, CryptoJS) {

    function onRequest(scriptContext) {

        const title = 'onRequest';

        try {
            log.debug({ title, details: "called" });

            if (scriptContext.request.method === 'GET') {

                var type = scriptContext.request.parameters['type'];
                log.debug({ title, details: type });

                var recid = scriptContext.request.parameters['recid'];
                log.debug({ title, details: recid });

                var recordType = scriptContext.request.parameters['rec'];
                log.debug({ title, details: "recordType::" + recordType });

                var approvalId = scriptContext.request.parameters['user'];
                log.debug({ title, details: approvalId });

                if (type == '' || recid == '' || recordType == '' || approvalId == '') {
                    log.debug({ title, details: "Invalid URL" });
                    scriptContext.response.write("Invalid URL attempt, Please contact to NetSuite Administrator");
                } else {

                    var userObj = runtime.getCurrentUser();
                                    // Add additional code  
                                    log.debug({ title: title, details: {userObj: userObj}});

                                    
                    var decodeURI = decodeURIComponent(recid);
                    log.debug({ title, details: { decodeURI: decodeURI } });
                    //decodeURI = 'U2FsdGVkX1+grkl2rLoVteiDRWFPSXV0qPqHRMndW3Y=';
                    var decryptId = CryptoJS.AES.decrypt(decodeURI.toString(), 'recordid').toString(CryptoJS.enc.Utf8);
                    log.debug({ title, details: { decryptId: decryptId } });

                    if (decryptId && decryptId != '') {
                        var recid = decryptId.split('ID_').join(''); //ID_229013
                        log.debug({ title, details: { recid: recid } });

                        var poRecord = null;
                        if (recordType == 'purchaseorder') {
                            poRecord = record.load({
                                type: record.Type.PURCHASE_ORDER,
                                id: recid,
                                isDynamic: true
                            });
                        }
                        if (recordType == 'purchaserequisition') {
                            poRecord = record.load({
                                type: record.Type.PURCHASE_REQUISITION,
                                id: recid,
                                isDynamic: true
                            });
                        }
                        if (recordType == 'vendorbill') {
                            log.debug({ title, details: { recordType } });
                            poRecord = record.load({
                                type: record.Type.VENDOR_BILL,
                                id: recid,
                                isDynamic: true
                            });
                            log.debug({ title, details: { poRecord } });
                        }


                        var nextApproval = poRecord.getValue({ fieldId: "nextapprover" });
                        log.debug({ title, details: { nextApproval: nextApproval } });
                        var tranid = poRecord.getValue({ fieldId: "tranid" });
                        var currentStatus = poRecord.getValue({ fieldId: "approvalstatus" });

                        if (nextApproval == approvalId){ //if match then approve and reject
                        //if (nextApproval) {

                            if (type == 'approve') {

                                if (currentStatus != "2") {
                                //if (currentStatus) {

                                    var empRecord = record.load({
                                        type: record.Type.EMPLOYEE,
                                        id: nextApproval,
                                        isDynamic: false
                                    });
                                    var nextApprovalSupervisor = empRecord.getValue({ fieldId: "supervisor" });
                                    log.debug({ title: title, details: { nextApprovalSupervisor: nextApprovalSupervisor, nextApproval: nextApproval } });
                                    
                                    

                                    if(recordType == 'vendorbill'){

                                        if (nextApproval) {
                                            var wfActionId = "workflowaction_approve_by_script"; 
                                       
                                            var wfid = workflow.trigger({
                                                recordType: 'vendorbill',
                                                recordId: recid,
                                                workflowId: 'customworkflow_vb_approval_wf',//'customworkflow_vb_approval_wf_2',                                        
                                                actionId: wfActionId
                                            });
                                            log.debug({ title: 'title', details: { wfid: wfid } });
    
                                            log.debug({ title, details: { "saved": "yes" } });
                                            scriptContext.response.write("*** This Vendor Bill has been approved. ***");
                                            /*
                                            var emailFirstApprover = poRecord.getValue({ fieldId: "custbody_first_approver" });
                                            if(emailFirstApprover == ''){
                                                poRecord.setValue({ fieldId: 'custbody_first_approver', value: nextApproval });
                                            }else{
                                                poRecord.setValue({ fieldId: 'custbody_last_approver', value: nextApproval });
                                            }
                                            
                    
                                            log.debug({ title: title, details: { nextApproval: nextApproval } });
                                            var poid = poRecord.save();
                                            log.debug({ title: title, details: { poid: poid } });
                                            */
                                           // *** This Vendor Bill has been approved. ***
                                           // scriptContext.response.write("Thanks for this " + recordType + " #" + tranid + " for your Approval.");
    
                                        }
                                    } 
                                
                                }
                                else {
                                    scriptContext.response.write("Either you've already submitted OR you're not authorize to process this order now, Please contact to NetSuite Administrator");
                                }
                            }

                            if (type == 'reason') {

                                if (currentStatus != "3") {


                                    const nsForm = serverWidget.createForm({ title: 'Rejection Reason', hideNavBar: true });
                                    //nsForm.clientScriptModulePath = './plnt.cs.emailplugin.js';

                                    var reasonField = nsForm.addField({
                                        id: 'cust_reason',
                                        type: serverWidget.FieldType.TEXT,
                                        label: 'Reason',
                                    });

                                    var recordidField = nsForm.addField({
                                        id: 'cust_recordid',
                                        type: serverWidget.FieldType.TEXT,
                                        label: 'RecordId',
                                    });
                                    recordidField.updateDisplayType({
                                        displayType: serverWidget.FieldDisplayType.HIDDEN
                                    })

                                    var recordTypeField = nsForm.addField({
                                        id: 'cust_recordtype',
                                        type: serverWidget.FieldType.TEXT,
                                        label: 'Record Type',
                                    });
                                    recordTypeField.updateDisplayType({
                                        displayType: serverWidget.FieldDisplayType.HIDDEN
                                    })
                                    recordidField.defaultValue = recid;
                                    recordTypeField.defaultValue = recordType;

                                    nsForm.addSubmitButton({ label: 'Reject' });
                                    scriptContext.response.writePage(nsForm);
                                }
                                else {
                                    scriptContext.response.write("Either you've already submitted OR you're not authorize to process this order now, Please contact to NetSuite Administrator");

                                }
                            }

                        } else {
                            log.debug({ title, details: "Nextapproval is not matching" });
                            scriptContext.response.write("Either you've already submitted OR you're not authorize to process this order now, Please contact to NetSuite Administrator");
                        }

                    } else {
                        log.debug({ title, details: "Invalid Record Id" });
                        scriptContext.response.write("Invalid Record Id, Please contact to NetSuite Administrator");
                    }
                }
            }

            if (scriptContext.request.method == "POST") {


                log.debug({ title, details: "POST" });
                var reason = scriptContext.request.parameters['cust_reason'];
                var recid = scriptContext.request.parameters['cust_recordid'];
                var recordType = scriptContext.request.parameters['cust_recordtype'];

                log.debug({ title, details: { "reason": reason, "id": recid, "type": recordType } });

                if (recid != '' || recordType != '') {
                    var poRecord = null;
                   
                    if (recordType == 'vendorbill') {
                        log.debug({ title, details: {  "typeinside": recordType } });
                        poRecord = record.load({
                            type: record.Type.VENDOR_BILL,
                            id: recid,
                            isDynamic: true
                        });
                    }



                    poRecord.setValue({ fieldId: 'custbody_reject_reason', value: reason });
                    //poRecord.setValue({ fieldId: 'approvalstatus', value: "3" });//rejected
                    var poid = poRecord.save();
                    log.debug({ title, details: { "poid": poid } });

                    if (recordType == 'vendorbill') {

                        var wfid = workflow.trigger({
                            recordType: 'vendorbill',
                            recordId: recid,
                            workflowId: 'customworkflow_vb_approval_wf',                                        
                            actionId: "workflowaction_remove_by_script"
                        });
                        log.debug({ title: 'title', details: { wfid: wfid } });
                       
                    }

                    if (recordType == 'vendorbill') {
                        scriptContext.response.write("*** This Vendor Bill has been rejected. ***");
                    }else{
                        scriptContext.response.write("We'll update your rejected reason and get back you soon for this " + recordType);
                    }                    

                }
            }

        } catch (err) {
            log.error({ title: 'onRequest', details: {message: err}  });
            scriptContext.response.write("Invalid request, Please contact to NetSuite Administrator OR "+ err.message);
            //throw err.message;
        }
    }

    return {
        onRequest: onRequest
    };
});