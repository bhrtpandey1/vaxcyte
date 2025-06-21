/*******************************************************************
 *
 *
 * Name: VAX.WA.CALC_PO_UNBILLED_AMOUNT.js
 * Script Type: WorkflowActionScript
 * @version 1.0.1
 *
 * @NApiVersion 2.x
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

        if (poId && poId != '') {
          var unBilledAmount = fetchUnbilledPOAmount(poId, poAmount);
          log.debug({ title: title, details: { unBilledAmount: unBilledAmount } });

          scriptContext.newRecord.setValue({ fieldId: 'custbody_po_unbilled_amount', value: unBilledAmount });
        }

      } catch (err) {
        log.error({ title: 'onAction', details: err });
        throw err.message;
      }
    }

    function fetchUnbilledPOAmount(poId, poAmount0) {

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
                search.createColumn({ name: 'total' }),
                search.createColumn({ name: 'total', join: 'applyingtransaction' }),

                // search.createColumn({ name: 'formulacurrency', formula: '{fxamount}'}),
                // search.createColumn({ name: 'total', join: 'applyingtransaction'}),

              ]
          });
          var searchResultCount = poSearchObj.runPaged().count;
          log.debug("poSearchObj result count", searchResultCount);

          if (searchResultCount > 0) {
            poSearchObj.run().each(function (result) {
              // .run().each has a limit of 4,000 results

              poAmount = result.getValue({ name: 'total' });
              log.debug("poSearchObj result poAmount==", poAmount);
              totalBillAmount += (result.getValue({ name: 'total', join: 'applyingtransaction' }) != '') ? Number(result.getValue({ name: 'total', join: 'applyingtransaction' })) : 0.00;
              // totalBillAmount += totalBillAmount;
              log.debug("poSearchObj result totalBillAmount==", totalBillAmount);
              //unBilledAmount = result.getValue({ name: 'fxamountunbilled', join: 'createdfrom' });

              return false;
            });
          } else{
            totalBillAmount = 0;
            poAmount = poAmount0;
            log.debug("poSearchObj result poAmount0==", poAmount0);
            unBilledAmount = poAmount0.toFixed(2);
          }
        }

        if (poAmount && totalBillAmount) {
          unBilledAmount = (poAmount - totalBillAmount).toFixed(2);
          log.debug("poSearchObj result poAmount==", unBilledAmount);
        }

        return unBilledAmount;

      } catch (err) {
        log.error({ title: 'error fetchUnbilledPOAmount', details: JSON.stringify(err) });
        return unBilledAmount;
      }
    }


    /*
    function fetchUnbilledPOAmount(poId) {

      var title = 'fetchUnbilledPOAmount';
      var unBilledAmount = 0;

      try {
        log.debug({ title: title, details: { billid: billid } });
        if (billid != '') {


          var poSearchObj = search.create({
            type: 'vendorbill',
            filters: [
              ['type', 'anyof', 'VendBill'],
              'AND',
              ['internalid', 'anyof', poId],
              'AND',
              ['mainline', 'is', 'T'],              
            ],
            columns:
              [
                search.createColumn({ name: 'createdfrom' }),
                search.createColumn({ name: 'amountunbilled', join: 'createdfrom' }),
                search.createColumn({ name: 'fxamountunbilled', join: 'createdfrom' })
              ]
          });
          var searchResultCount = poSearchObj.runPaged().count;
          log.debug("poSearchObj result count", searchResultCount);
          poSearchObj.run().each(function (result) {
            // .run().each has a limit of 4,000 results
            unBilledAmount = result.getValue({ name: 'fxamountunbilled', join: 'createdfrom' });
            
            return false;
          });
        }
        return unBilledAmount;

      } catch (err) {
        log.error({ title: 'error fetchUnbilledPOAmount', details: JSON.stringify(err) });
        return unBilledAmount;
      }
    }
    */

    return {
      onAction: onAction
    }
  });