/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/log', 'N/record', 'N/search'],
    /**
     * @param{currentRecord} currentRecord
     * @param{log} log
     * @param{record} record
     * @param{search} search
     */
    function (currentRecord, log, record, search) {

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */

        function validateLine(scriptContext) {
            try {

                var currentRecord = scriptContext.currentRecord;            
                var sublistName = scriptContext.sublistId;
                var sublistFieldName = scriptContext.fieldId;

                //if (sublistName === 'expense' && sublistFieldName === 'customer') {
                if (sublistName === 'expense') {
                    
                    var strProject = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'customer' });
                    var projectBillable = getProjectRecord(strProject);
                    console.log(JSON.stringify(projectBillable));
                    currentRecord.setCurrentSublistValue({ sublistId: sublistName, fieldId: 'isbillable', value: projectBillable });
                }
                return true;
              
            } catch (err) {
                log.error({title: 'error validateLine', details: err.message});
            }

        }

        function fieldChanged(scriptContext) {
            try {

                var currentRecord = scriptContext.currentRecord;            
                var sublistName = scriptContext.sublistId;
                var sublistFieldName = scriptContext.fieldId;

                if (sublistName === 'expense' && sublistFieldName === 'customer') {                
                   
                    var strProject = currentRecord.getCurrentSublistValue({ sublistId: sublistName, fieldId: 'customer' });
                    var projectBillable = getProjectRecord(strProject);
                    console.log(JSON.stringify(projectBillable));
                    currentRecord.setCurrentSublistValue({ sublistId: sublistName, fieldId: 'isbillable', value: projectBillable });
                }
                return true;
              
            } catch (err) {
                log.error({title: 'error validateLine', details: err.message});
            }

        }

        function getProjectRecord(projectValue) {

            try{
                var projInternal = false;
                var projLookup = search.lookupFields({
                    type: search.Type.JOB,
                    id: projectValue,
                    columns: ['custentity_int_prj']
                })
                if (projLookup) {                    
                    log.debug({ title: 'inside project function', details: ' internal proj: ' + projLookup.custentity_int_prj });    
                    projInternal = projLookup.custentity_int_prj;  
                }
                return projInternal;

            }catch(err){
                log.error({title: 'error getProjectRecord', details: err.message});
            }
        }

        return {
            validateLine: validateLine,
            fieldChanged : fieldChanged

        };

    });