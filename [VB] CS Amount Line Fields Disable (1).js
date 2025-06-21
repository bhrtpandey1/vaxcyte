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

    function fieldChanged(context) {
        try{
            var currentRecord = context.currentRecord;
        var sublistName = context.sublistId;
        var sublistFieldName = context.fieldId;
        var line = context.line;
        if (sublistName === 'item' && sublistFieldName === 'item'){         
        
            var sublistName = currentRecord.getSublist({sublistId: "item"});
            var cust_amount = sublistName.getColumn({ fieldId: "amount" });
            cust_amount.isDisabled = true;
        }
        }catch (err) {
            console.log(err.message);            
        }        
    }

    

    function lineInit(context) {
        
        try {
            var currentRecord = context.currentRecord;
            var sublistName = context.sublistId;
            var line = context.line;
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
        fieldChanged: fieldChanged,
       // validateLine: validateLine
    };
}