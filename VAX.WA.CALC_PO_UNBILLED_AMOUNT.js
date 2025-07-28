/*******************************************************************
 *
 *
 * Name: VAX.WA.CALC_PO_UNBILLED_AMOUNT.js
 * Script Type: WorkflowActionScript
 * @version 1.0.4
 *
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 * @NModuleScope SameAccount
 *
 * Author: NSC Consulting[BP] Date: 5/18/2025
 * Purpose: 
 * Script: 
 * Deploy: 
 *
 * ******************************************************************* */

define(['N/record', 'N/search'],
  function (record, search) {

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
        
        log.debug({ title: title, details: { type: scriptContext, workflowId: scriptContext.workflowId, newRecord: scriptContext.newRecord } });

        //var recordType = scriptContext.newRecord.type;
        //var recordId    = scriptContext.newRecord.id;

        var poId = scriptContext.newRecord.getValue({ fieldId: "podocnum" });        
        log.debug({ title: title, details: { poId: poId } });

        var poAmount = scriptContext.newRecord.getValue({ fieldId: "usertotal" });
        log.debug({ title: title, details: { poAmount: poAmount } });

        if( poAmount == '' || isNaN(poAmount)){
           poAmount = fetchPOAmount(poId);
           log.debug({ title: title, details: {"userTotal" : "blank", poAmount: poAmount } });
        }

        if (poId && poId != '' && parseFloat(poAmount) > 0) {
          var totalBillAmount = fetchAllBillsAmount(poId);
          log.debug({ title: title, details: {"line" : "55", totalBillAmount, poAmount, poId } });

          var unBilledAmount = 0.00;
          unBilledAmount = parseFloat(poAmount) - parseFloat(totalBillAmount);

          //var unBilledAmount = fetchUnbilledPOAmount(poId, poAmount);
          log.debug({ title: title, details: { unBilledAmount: unBilledAmount } });

          scriptContext.newRecord.setValue({ fieldId: 'custbody_po_unbilled_amount', value: unBilledAmount.toFixed(2) });
        }

      } catch (err) {
        log.error({ title: 'onAction', details: err });
        throw err.message;
      }
    }

    function fetchUnbilledPOAmount(poId, poAmountTotal) {

      var title = 'fetchUnbilledPOAmount';
      var unBilledAmount = 0.00;
      var poAmount = 0.00; var totalBillAmount = 0.00;

      try {
        log.debug({ title: title, details: { poId: poId } });
        if (poId != '') {


          var poSearchObj = search.create({
            type: 'purchaseorder',
            filters: [
              ['type', 'anyof', 'PurchOrd'],
              'AND',
              ['applyingtransaction.type', 'anyof', 'VendBill'],
              'AND',
              ['applyingtransaction.status', 'anyof', 'VendBill:A', 'VendBill:B', 'VendBill:D', 'VendBill:F'],
              'AND',
              ['internalid', 'anyof', poId],
              'AND',
              ['mainline', 'is', 'F']

            ],
            columns:
              [
                 search.createColumn({ name : "internalid", join : "applyingtransaction", summary : search.Summary.GROUP, sort: search.Sort.ASC}),
               // search.createColumn({ name : "tranid", join : "applyingtransaction", summary : search.Summary.GROUP, sort: search.Sort.ASC}),
              //  search.createColumn({ name: 'total', summary : search.Summary.AVG }),
              //  search.createColumn({ name: 'total', join: 'applyingtransaction', summary: search.Summary.MIN }),

                // search.createColumn({ name: 'formulacurrency', formula: '{fxamount}'}),
                // search.createColumn({ name: 'total', join: 'applyingtransaction'}),

              ]
          });
          var searchResultCount = poSearchObj.runPaged().count;
          log.debug("poSearchObj result count", searchResultCount);
          var billList = [];

          if (searchResultCount > 0) {
            poSearchObj.run().each(function (result) {
              // .run().each has a limit of 4,000 results

              billList.push({
                //billId : result.getValue({ name : "tranid", join : "applyingtransaction" , summary : search.Summary.GROUP, sort: search.Sort.ASC})
                billId : result.getValue({ name : "internalid", join : "applyingtransaction" , summary : search.Summary.GROUP, sort: search.Sort.ASC})
              })
              /*
              poAmount = result.getValue({ name: 'total', summary : search.Summary.AVG });
              log.debug("poSearchObj result poAmount==", poAmount);
              totalBillAmount += (result.getValue({ name: 'total', join: 'applyingtransaction', summary: search.Summary.MIN }) != '') ? Number(result.getValue({ name: 'total', join: 'applyingtransaction', summary: search.Summary.MIN })) : 0.00;
              // totalBillAmount += totalBillAmount;
              log.debug("poSearchObj result totalBillAmount==", totalBillAmount);
              //unBilledAmount = result.getValue({ name: 'fxamountunbilled', join: 'createdfrom' });
              */

              return true;
            });
          } 
          /*else{
            totalBillAmount = 0;
            poAmount = poAmount0;
            log.debug("poSearchObj result poAmount0==", poAmount0);
            unBilledAmount = poAmount0.toFixed(2);
          }*/
        }
        /*
        if (poAmount && totalBillAmount) {
          unBilledAmount = (poAmount - totalBillAmount).toFixed(2);
          log.debug("poSearchObj result poAmount==", unBilledAmount);
        }
        */

        //var billAmount = 0;

        log.debug({ title:"136", details : {billList}})

        if(billList && billList.length > 0){

          for(var i = 0; i < billList.length; i++){
            if(billList[i].billId != ''){
            
               var billLookupData = search.lookupFields({
                      type: search.Type.VENDOR_BILL,
                      id: billList[i].billId,
                      columns: ["custbody_bill_total_amount"]
                });

                log.debug({ title, details : {billLookupData}});

                if(billLookupData){
                     totalBillAmount += parseFloat(billLookupData.custbody_bill_total_amount); //billLookupData[0].value;
                     log.debug("poSearchObj result totalBillAmount==", totalBillAmount);
                }
            }
          }            
        }

        if(poAmountTotal > 0){
          unBilledAmount = (poAmountTotal - totalBillAmount).toFixed(2);
          log.debug("poSearchObj result poAmount==", unBilledAmount);
        }
        return unBilledAmount;

      } catch (err) {
        log.error({ title: 'error fetchUnbilledPOAmount', details: JSON.stringify(err) });
        return unBilledAmount;
      }
    }

    function fetchPOAmount(poId) {

      var title = 'fetchPOAmount';     
      var poAmount = 0.00;

      try {
        log.debug({ title: title, details: { poId: poId } });
        if (poId != '') {

          var poSearchObj = search.create({
            type: 'purchaseorder',
            filters: [
              ['type', 'anyof', 'PurchOrd'],
              "AND", 
              ["mainline","is","T"], 
               "AND", 
             ["internalidnumber","equalto", poId]
            ],
            columns:
              [
                search.createColumn({
                  name: "formulacurrency",
                  formula: "{fxamount}",
                  label: "PO FX Amount"
               })

              ]
          });
          var searchResultCount = poSearchObj.runPaged().count;
          log.debug("poSearchObj result count", searchResultCount);
          var billList = [];

          if (searchResultCount > 0) {
            poSearchObj.run().each(function (result) {              // .run().each has a limit of 4,000 results

              poAmount = result.getValue({  name: "formulacurrency",
                formula: "{fxamount}",
                label: "PO FX Amount"
              });             

              return false;
            });
          }
        }
      
        return poAmount;

      } catch (err) {
        log.error({ title: 'error fetchPOAmount', details: JSON.stringify(err) });
        return poAmount;
      }
    }

    function fetchAllBillsAmount(poId) {

      var title = 'fetchAllBillsAmount';     
      var billAmount = 0.00;

      try {
        log.debug({ title: title, details: { poId: poId } });
        if (poId != '') {

          var poSearchObj = search.create({
            type: "vendorbill",
   settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
   filters:
   [
      ["type","anyof","VendBill"], 
      "AND", 
      ["mainline","is","T"], 
      'AND',
      ['status', 'anyof', 'VendBill:A', 'VendBill:B', 'VendBill:D', 'VendBill:F'],
      "AND", 
      ["createdfrom.internalidnumber","equalto",poId]
   ],
            columns:
              [
                search.createColumn({
                  name: "formulacurrency",
                  formula: "{fxamount}",
                  label: "Bill FX Amount"
               })

              ]
          });
          var searchResultCount = poSearchObj.runPaged().count;
          log.debug("poSearchObj result count", searchResultCount);
          //var billList = [];

          if (searchResultCount > 0) {
            poSearchObj.run().each(function (result) {              // .run().each has a limit of 4,000 results

              billAmount += parseFloat( result.getValue({  name: "formulacurrency",
                formula: "{fxamount}",
                label: "Bill FX Amount"
              }));             

              return true;
            });
          }
        }
      
        return billAmount;

      } catch (err) {
        log.error({ title: 'error fetchAllBillsAmount', details: JSON.stringify(err) });
        return billAmount;
      }
    }

    

    return {
      onAction: onAction
    }
  });