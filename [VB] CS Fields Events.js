/*******************************************************************
 *
 *
 * Name: [VB] CS Fields Events.js
 * Script Type: ClientScript
 * @version 1.3.1
 *
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 *
 * Author: NSC Consulting[BP]
 * Purpose:  .
 * Script:
 * Deploy:
 *
 *
 * ******************************************************************* */

define(['N/error', 'N/record', 'N/runtime', 'N/search'], client);

function client(error, record, runtime, search) {

   
    function pageInit(context) {
        //debugger;
        try {
            var currentRecord = context.currentRecord;
            var sublistName = 'item';
            var itemCount = currentRecord.getLineCount('item');

            for (var line = 0; line < itemCount; line++) {

                //var line = currentRecord.getCurrentSublistIndex({ sublistId: sublistName });

                var cust_amount = currentRecord.getSublistField({
                    sublistId: sublistName,
                    fieldId: 'amount',
                    line: line
                });
                cust_amount.isDisabled = true;


            }
            
            return true;

        } catch (err) {
            console.log(err.message);            
        }
    }

    function lineInit(context) {
        debugger;
        try {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;

            if (sublistName == "item") {
                
                var cust_amount = currentRecord.getSublistField({
                    sublistId: sublistName,
                    fieldId: 'amount',
                    line: line
                });
                cust_amount.isDisabled = true;
                //console.log(estimatedrate);
            }

            return true;

        } catch (err) {
            console.log(err.message);            
        }
    }


    return {
        pageInit : pageInit,
        lineInit: lineInit,
        //validateLine: validateLine
    };
}