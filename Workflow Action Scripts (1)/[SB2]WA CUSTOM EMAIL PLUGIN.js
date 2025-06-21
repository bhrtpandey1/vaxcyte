/*******************************************************************
 *
 *
 * Name: WA CUSTOM EMAIL PLUGIN.js
 * Script Type: WorkflowActionScript
 * @version 1.0.4
 *
 * @NApiVersion 2.x
 * @NScriptType WorkflowActionScript
 * @NModuleScope SameAccount
 *
 * Author: NSC Consulting[BP]
 * Purpose: 
 * Script: 
 * Deploy: 
 *
 *
 * ******************************************************************* */

define(['N/record', 'N/workflow', 'N/search', 'N/email', 'N/runtime', 'N/render', 'N/file', '../lib/crypto-js_3.1.9-1_min'],
  function (record, workflow, search, email, runtime, render, file, CryptoJS) {

    /**
     * Entry Point for Workflow Action script.
     * @param {object} scriptContext - Script context object.
     * @param {object} scriptContext.newRecord - The new record. record.Record.save() is not permitted.
     * @param {object} scriptContext.oldRecord - The old record. record.Record.save() is not permitted.
     * @param {object} [scriptContext.form] - The form through which the script interacts with the record. This parameter is available only in the beforeLoad context.
     * @param {string} [scriptContext.type] - An event type, such as create, edit, view, or delete.
     * @param {number} [scriptContext.workflowId] - The internal ID of the workflow that calls the script.
     */
    function onAction(scriptContext) {

      var title = 'onAction';

      try {
0
        log.debug({ title: title, details: { type: scriptContext.type, workflowId: scriptContext.workflowId, newRecord: scriptContext.newRecord } });

        sendCustomMailforPlugin(scriptContext.newRecord);

      } catch (err) {
        log.error({ title: 'onAction', details: err });
        throw err.message;
      }
    }

    function sendCustomMailforPlugin(newRecord) {

      var title = "sendCustomMailforPlugin";
      log.debug({ title: title, details: { "sendCustomMailforPlugin": newRecord } });

      var scriptObj = runtime.getCurrentScript();      
      var scriptUrl = scriptObj.getParameter({name: 'custscript_suitelet_url'});
      log.debug({ title: title, details: { "scriptUrl": scriptUrl } });
 
      try {
        if (newRecord) {
          
          var baseURL = scriptObj.getParameter({name: 'custscript_base_url'}); //"https://5408351-sb1.app.netsuite.com";
          log.debug({ title: title, details: { "baseURL": baseURL } });
          
          var recordType = newRecord.type;
          var recordTypeText = recordType;

          if (recordType == 'vendorbill') {
            recordTypeText = "Bill";
          } else{
            recordTypeText = '';
          } 
          log.debug({ title: title, details: { "recordType": recordType, "recordTypeText" : recordTypeText } });

          if (recordTypeText != '') {

            var recordId = newRecord.id;
            var approvalId = (newRecord.getValue({ fieldId: 'nextapprover' }) != '' ? newRecord.getValue({ fieldId: 'nextapprover' }) : '');
            
            log.debug({ title: title, details: { "recordType": recordType, "recordTypeText": recordTypeText, approvalId: approvalId, recordId: recordId } });

            if (approvalId && approvalId != '') {

              var empRecord = record.load({
                type: record.Type.EMPLOYEE,
                id: approvalId,
                isDynamic: false
              });
              var approvalReceiverMail = empRecord.getValue({ fieldId: "email" });
              log.debug({ title: title, details: { approvalReceiverMail: approvalReceiverMail } });


              var encyptRecordId = CryptoJS.AES.encrypt('ID_' + recordId, 'recordid').toString(); //CryptoJS.SHA256(recordId).toString(CryptoJS.enc.Hex);
              //log.debug({ title: title, details: { "recid": encyptRecordId } });
              var encodeRecId = encodeURIComponent(encyptRecordId); //encodeURI(encyptRecordId);
              //log.debug({ title: title, details: { "encodeRecId": encodeRecId } });


              var rejectURL = scriptUrl + "&type=reason&recid=" + encodeRecId + "&rec=" + recordType + "&user=" + approvalId;
              var approveURL = scriptUrl + "&type=approve&recid=" + encodeRecId + "&rec=" + recordType + "&user=" + approvalId;

              log.debug({ title: title, details: recordId });
              var amount = 0;//(12345.67).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  // 12,345.67

              var vendorName = newRecord.getText({ fieldId: 'entity' });

              var emailData = {
                "nextapproverName": newRecord.getText({ fieldId: 'nextapprover' }),
                "nextapproverId": newRecord.getValue({ fieldId: 'nextapprover' }),
                "tranid": newRecord.getValue({ fieldId: 'tranid' }),
                "custbody_created_by": newRecord.getText({ fieldId: 'custbody_created_by' }),
                "trandate": newRecord.getText({ fieldId: 'trandate' }),
                "currency": newRecord.getText({ fieldId: 'currency' }),
                "estimatedtotal": amountReform(newRecord.getText({ fieldId: 'total' }), newRecord.getText({ fieldId: 'currency' })),
                "user": newRecord.getText({ fieldId: 'employee' }),
              };
              log.debug({ title: title, details: { emailData: emailData } });

              var subject = "";

              var emailBody = emailBody = "Dear " + emailData.nextapproverName + ",<br/><br/>";
              
              if (recordType == 'vendorbill') {

                //emailBody = '<span style="color:red"><br/>';
                emailBody = ''; var ponumber = '';
                var poCount = newRecord.getLineCount({ "sublistId": "purchaseorders" });
                if (poCount && poCount != '') {
                  newRecord.selectLine({
                    "sublistId": "purchaseorders",
                    "line": 0
                  });
                  ponumber = newRecord.getCurrentSublistValue({
                    sublistId: "purchaseorders",
                    fieldId: "poid"
                  });
                  log.debug({ title: title, details: { ponumber: ponumber } });
                }

               // emailBody += '<b>Payment Terms:</b> ' + newRecord.getText({ fieldId: 'terms' }) + ' <br/>';
               // emailBody += '<b>PO #:</b> ' + ponumber + ' <br/><br/>';
                //emailBody += emailData.nextapproverName + ",<br/><br/>";

                emailBody += 'Dear ' + emailData.nextapproverName + ",<br/><br/>";
                emailBody += vendorName + ' Invoice # ' + emailData.tranid + ' is waiting for your approval.  This Invoice was entered on ' + newRecord.getText({ fieldId: 'trandate' }) + ' in the ';
                emailBody += ' amount of ' + emailData.estimatedtotal + '.  Click the link below to view the record in NetSuite.<br/><br/>';

                var sublistId = 'item';
                var lineCount = newRecord.getLineCount({ sublistId: sublistId });
                log.debug({ title: title, details: { lineCount: lineCount } });

                emailBody += '<table width="90%" border="1"> <style>';
              //  emailBody += 'table {font-family: Arial, sans-serif;  border-collapse: collapse;  width: 100%;  }';
        
              //  emailBody += 'th, td {border: 1px solid #dddddd;   text-align: left; padding: 8px; }';
        
               // emailBody += ' th {background-color: #f2f2f2;}';
                emailBody += '</style>';

                emailBody += ' <thead> <tr><th style="text-align: left" colspan="2">PO #'+ponumber+'</th> <th colspan="3"></th> </tr><tr><th>&nbsp;&nbsp;</th> <th></th> <th></th> <th></th> <th></th></tr>';
                emailBody += ' <tr>  <th>Item</th> <th>GL Account</th> <th>Department</th> <th>Program</th> <th>Amount</th> </tr></thead> ';
                emailBody += ' <tbody>';
            
                var toralAmount =0;
                for (var line = 0; line < lineCount; line++) {

                  //newRecord.getValue({ fieldId: 'tranid' }),

                  var itemId = newRecord.getSublistValue({ sublistId: sublistId, line: line, fieldId: 'item' });
                  var itemName = newRecord.getSublistText({ sublistId: sublistId, line: line, fieldId: 'item' });
                  var amount = newRecord.getSublistText({ sublistId: sublistId, line: line, fieldId: 'amount' });
                  toralAmount += parseFloat(amount);
                  var glAccount = newRecord.getSublistText({ sublistId: sublistId, line: line, fieldId: 'custcol_item_gl_account' });
                  var arrglAccount = glAccount.split(':');
                  var printGLAccount = "";
                  if(arrglAccount && arrglAccount.length > 0){
                    printGLAccount = arrglAccount[arrglAccount.length-1].trim();
                    log.debug({ title: title, details: { printGLAccount: printGLAccount}});
                  }
                  var department = newRecord.getSublistText({ sublistId: sublistId, line: line, fieldId: 'department' });
                  var arrdepartment = department.split(':');
                  var printDepartment = "";
                  if(arrdepartment && arrdepartment.length > 0){
                    printDepartment = arrdepartment[arrdepartment.length-1].trim();
                    log.debug({ title: title, details: { printDepartment: printDepartment}});
                  }
                  var class2 = newRecord.getSublistText({ sublistId: sublistId, line: line, fieldId: 'class' });
                  log.debug({ title: title, details: { itemId: itemId, amount:amount, glAccount:glAccount, department:department, class2:class2} });
                //  var rate = newRecord.getSublistValue({ sublistId: sublistId, line: line, fieldId: 'rate' });
                //  log.debug({ title: title, details: { rate: rate } });
                emailBody += '<tr>';
                emailBody += '<td>'+itemName+'</td>';
                emailBody += '<td>'+printGLAccount+'</td>';
                emailBody += '<td>'+printDepartment+'</td>';
                emailBody += '<td>'+class2+'</td>';
                emailBody += '<td style="text-align: right;">'+amountReform(amount,newRecord.getText({ fieldId: 'currency' })) +'</td>';
                emailBody += '</tr>';

                }

                emailBody += '</tbody>';
                emailBody += '<tfoot>';
                emailBody += ' <tr>';
                emailBody += '<td colspan="4" style="text-align: right;"><b>Total:</b></td>';
                emailBody += '<td style="text-align: right;"><b>'+ emailData.estimatedtotal  +'</b></td>';// amountReform(toralAmount.toFixed(2),newRecord.getText({ fieldId: 'currency' }))
                emailBody += '</tr>';
                emailBody += ' </tfoot>';
                emailBody += ' </table>';

                //emailBody += 'l has submitted Bill #' + emailData.tranid + ' referencing PO for payment of ';
                // emailBody += 'amount ' + emailData.estimatedtotal + '<br/><br/>'; //'$10,000.00 Hourly rate: $10.00';

                //emailBody += ' <b>View Record</b> link below.<br/><br/>";

                emailBody += "<a href=" + baseURL + "/app/accounting/transactions/vendbill.nl?id=" + recordId + "&whence='>View Record</a><br/><br/>";


              }
              emailBody += "Otherwise, please click the <b>Approve Bill</b> or <b>Reject Bill</b> button below.  If you need to reject this transaction, please enter a <b>Rejection Reason</b> after clicking the <b>Reject Bill</b> button.<br/><br/>";

              emailBody += "<div style='width:100%;text-align: left;'>";
              emailBody += "<a style='display: inline-block; width: 115px;height: 25px;background: green;padding: 10px;text-align: center;border-radius: 5px;color: white;font-weight: bold;line-height: 25px;text-decoration: none !important;' href='" + approveURL + "' target='_blank'>Approve Bill</a> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;			";
              emailBody += "<a style='display: inline-block; width: 115px;height: 25px;background: red;padding: 10px;text-align: center;border-radius: 5px;color: white;font-weight: bold;line-height: 25px; text-decoration: none !important;' href='" + rejectURL + "' target='_blank'>Reject Bill</a><br/><br/>";
              emailBody += "</div><br/>";
              //emailBody += "Rejection Reason<br/>";

              //emailBody += "[ Long Text box ]<br/><br/>";
             
              emailBody += "Thank you,<br/><br/>";
              emailBody += "Accounts Payable<br/><br/>";


              var sendUser = emailData.user;
              if (!(newRecord.getValue({ fieldId: 'custbody_controller_approval' }))) {

                //if( newRecord.getValue({ fieldId: 'employee' }) != ''){
                if (newRecord.getValue({ fieldId: 'custbody_submitting_on_behalf_of' }) != '') {
                  //sendUser = emailData.user;
                  sendUser = newRecord.getText({ fieldId: 'custbody_submitting_on_behalf_of' });
                  if (newRecord.getValue({ fieldId: 'custbody_submitting_on_behalf_of' }) == newRecord.getValue({ fieldId: 'nextapprover' })) {
                    sendUser = emailData.user;
                  }

                } else {
                  sendUser = emailData.user;
                  //sendUser = newRecord.getText({ fieldId: 'custbody_submitting_on_behalf_of' });
                }
              } else {
                sendUser = newRecord.getText({ fieldId: 'custbody_last_approver' });
              }

              var receiverMail = [approvalId]; //[approvalReceiverMail];
              var sendEmailId = scriptObj.getParameter({name: 'custscript_author_email_id'});//runtime.getCurrentScript().getParameter({ name: "custscript_createdby" });
              log.debug({ title: title, details: { sendEmailId: sendEmailId, transactionId: parseInt(recordId) } });
              
              //Solution change the author id dynamically
              //Date: 2/18/2024
              var newAuthorCreatedBy = newRecord.getValue({ fieldId: 'custbody_createdby' });
              var newAuthorNextApprovar = newRecord.getValue({ fieldId: 'custbody_vendor_bill_approver' });
              var nextapproverSender = newRecord.getValue({ fieldId: 'nextapprover' });
              var custbody_send_email_id = newRecord.getValue({ fieldId: 'custbody_send_email_id' });
              
              log.debug({ title: title, details: { sendEmailId: sendEmailId, custbody_send_email_id: custbody_send_email_id, nextapproverSender:nextapproverSender, newAuthorCreatedBy: newAuthorCreatedBy,  newAuthorNextApprovar: newAuthorNextApprovar} }); 
              if (custbody_send_email_id != ''){
                sendEmailId = custbody_send_email_id;
              }else{
                sendEmailId = newAuthorCreatedBy;
              }
              
              log.debug({ title: title, details: { sendEmailId: sendEmailId }});
              newRecord.setValue({ fieldId: 'custbody_send_email_id', value: nextapproverSender });
              log.debug({ title: title, details: { 'custbody_send_email_id': 'setValue' }});
              

              
              if (recordType == 'vendorbill') {

               // sendEmailId =  scriptObj.getParameter({name: 'custscript_author_email_id'});
               // sendUser = newRecord.getText({ fieldId: 'custbody_created_by' });
                
                subject = vendorName + ' Invoice #'+ emailData.tranid +  ' for '+emailData.estimatedtotal+' Is Pending Approval';
                //attach transaction
                /*var recPDF = render.transaction({
                  entityId: parseInt(recordId),
                  printMode: render.PrintMode.PDF,

                });*/
                
                var fileObj = listFilesinBill(recordId);
                log.debug({ title: title, details: { fileObj: fileObj } });
                var att_fileObj = [];
                if (fileObj && fileObj.length > 0) {
                  for (var f = 0; f < fileObj.length; f++) {
                    var fobj = file.load({
                      id: fileObj[f]
                    });
                    log.debug({ title: title, details: { fobj: fobj } });
                    att_fileObj.push(fobj);
                  }
                }
                log.debug({ title: title, details: { att_fileObj: att_fileObj } });
                
                //emailBody += sendUser + "<br/>";

                var emailObj = null;
                if (att_fileObj && att_fileObj.length > 0) 
                {
                  emailObj = email.send({
                    author: sendEmailId,
                    recipients: receiverMail,
                    subject: subject,//recordTypeText + ' # ' + emailData.tranid + ' Is Pending Approval',
                    body: emailBody,
                    attachments: att_fileObj,
                    //attachments: [recPDF],
                     relatedRecords: {
                       transactionId: parseInt(recordId),
                     }
                    //attachments: [fileObj]
                  });
                }else{
                  emailObj = email.send({
                    author: sendEmailId,
                    recipients: receiverMail,
                    subject: subject,//recordTypeText + ' # ' + emailData.tranid + ' Is Pending Approval',
                    body: emailBody,
                    //attachments: att_fileObj,
                    //attachments: [recPDF],
                     relatedRecords: {
                       transactionId: parseInt(recordId),
                     }
                    //attachments: [fileObj]
                  });
                } 


                log.debug({ title: title, details: { emailObj: emailObj } });

              } 

            }
          }
        }

      } catch (err) {
        log.error({ title: title, details: err.message });
        // throw err.message;
      }
    }

    function listFilesinBill(billid) {

      var title = 'listFilesinBill';
      var fileObj = [];

      try {
        log.debug({ title: title, details: { billid: billid } });
        if (billid != '') {


          var fileSearchObj = search.create({
            type: 'vendorbill',
            filters: [
              ['type', 'anyof', 'VendBill'],
              'AND',
              ['internalid', 'anyof', billid],
              'AND',
              ['mainline', 'is', 'F'],
              'AND',
              ['file.internalidnumber', 'isnotempty', ''],
              'AND',
              ['file.folder', 'anyof', '98']//Account Payble
            ],
            columns:
              [
                search.createColumn({ name: 'internalid', join: 'file' }),
                search.createColumn({ name: 'created', join: 'file', sort: search.Sort.DESC })
              ]
          });
          var searchResultCount = fileSearchObj.runPaged().count;
          log.debug("fileSearchObj result count", searchResultCount);
          fileSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            var fileId = result.getValue({ name: 'internalid', join: 'file' });
            if (fileId && fileId != '') {
              log.debug("fileSearchObj result count", fileId);
              fileObj.push(fileId);
            }
            //return true;
            return false;
          });
        }
        return fileObj;

      } catch (err) {
        log.error({ title: 'error listFilesinBill', details: JSON.stringify(err) });
        return fileObj;
      }
    }

  
    function amountReform(amount, currency) {
      if (currency == 'USD') {
        // return '$'+ (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  // 12,345.67
        return '$' + amount;//.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  // 12,345.67
      } else if (currency == 'GBP') {
        // return '$'+ (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  // 12,345.67
        return '£' + amount;//.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  // 12,345.67
      } else if (currency == 'CAD') {
        // return '$'+ (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  // 12,345.67
        return '$' + amount;//.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  // 12,345.67
      } else if (currency == 'EUR') {
        // return '$'+ (amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  // 12,345.67
        return '€' + amount;//.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  // 12,345.67
      } else {
        return currency + ' ' + amount;//.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');  // 12,345.67
      }
    }

    return {
      onAction: onAction
    }
  });