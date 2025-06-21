/*******************************************************************
 *
 * Name: vax.wa.approval.js
 *
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 * @version: 1.1.0
 *
 * Author: RGP PVT LMT.
 * Purpose: Get employee id for record approval.
 * Script: customscript_vax_wa_approval
 * Deploy: customdeploy_vax_wa_approval_po
 *
 * ******************************************************************* */

define(['N/record', 'N/runtime'], (record, runtime) => {

    const nsScript = runtime.getCurrentScript();

    /**
     * Defines the WorkflowAction script trigger point.
     * 
     * @param {Object} scriptContext
     * @param {Object} scriptContext.newRecord - New record
     * @param {Object} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.workflowId - Internal ID of workflow which triggered this action
     * @param {string} scriptContext.type - Event type
     * @param {Object} scriptContext.form - Current form that the script uses to interact with the record
     * @since 2016.1
     */
    const onAction = (scriptContext) => {

        const title = 'onAction';

        try {

            const nsNewRecord = scriptContext.newRecord;

            let nextApprover = nsScript.getParameter({ name: 'custscript_vax_wa_next_approver' });
            log.debug({ title, details: { nextApprover } });

            if (nextApprover) {

                const nsRecordEmp = record.load({ type: record.Type.EMPLOYEE, id: nextApprover, isDynamic: false });
                let isDelegationActive = nsRecordEmp.getValue({ fieldId: 'custentity_delegation_active' });
                isDelegationActive = isDelegationActive && isDelegationActive.toUpperCase() === 'YES' ? true : false;
                const delegationEmp = nsRecordEmp.getValue({ fieldId: 'custentity_nsts_gaw_delegate_emp' });
                log.debug({ title, details: { isDelegationActive, delegationEmp } });

                if (nextApprover && isDelegationActive && delegationEmp) {

                    nextApprover = delegationEmp;
                }
                log.debug({ title: title + ' - After', details: { nextApprover } });

                nsNewRecord.setValue({ fieldId: 'nextapprover', value: nextApprover, ignoreFieldChange: false });
            }

            return nextApprover;
        } catch (err) {
            log.error({ title: 'onAction', details: err });
            throw err;
        }
    }

    return {
        onAction
    };
});
