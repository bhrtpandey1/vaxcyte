/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/record', 'N/search'],
    /**
     * @param{log} log
     * @param{record} record
     * @param{search} search
     */
    function (log, record, search) {

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
        function fieldChanged(scriptContext) {
            var currentRecord = scriptContext.currentRecord;
            var fieldId = scriptContext.fieldId;
            if (fieldId === 'custentity_fst_order_type') {
                checkAndUpdateSublistUnit(currentRecord);
            }
            log.debug({ title: 'fieldId', details: custentity_fst_order_type });

        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {

            try {
                var currentRecord = scriptContext.currentRecord;
                var sublistId = scriptContext.sublistId;
                var sublistFieldName = scriptContext.fieldId;
                var line = scriptContext.line;

                // Check if the sublist is 'item' and the field is 'units'
                if (sublistId === 'item') {

                    var customer = currentRecord.getValue({ fieldId: 'entity' });
                    var itemId = currentRecord.getCurrentSublistValue({ sublistId: 'item', fieldId: 'item' });
                    // checkAndUpdateSublistUnit(currentRecord, line);
                    //  alert('customerId'+customer)
                    //  alert('itemId'+itemId)
                    if (customer != '') {

                        var custOrderType = search.lookupFields({
                            type: search.Type.CUSTOMER,
                            id: customer,
                            columns: 'custentity_fst_order_type'
                        })
                        var custOrderTypeValue = custOrderType.custentity_fst_order_type;
                        if (custOrderTypeValue && custOrderTypeValue.length > 0) {
                            var custOrderTypeId = custOrderTypeValue[0].value;

                            var custItemType = search.lookupFields({
                                type: search.Type.ITEM,
                                id: itemId,
                                columns: 'custitem_fst_shopify_type' //['custitem_fst_shopify_type','custitem_fst_target_unit_type']
                            })
                            var custItemTypeValue = custItemType.custitem_fst_shopify_type;

                            if (custItemTypeValue && custItemTypeValue.length > 0) {
                                var custShopifyOrderTypeId = custItemTypeValue[0].value;

                                //var custItemTypeValue2 = custItemType.custitem_fst_target_unit_type;
                                //var custTargetOrderTypeId = custItemTypeValue2[0].value;

                                //alert('custShopifyOrderTypeId'+custShopifyOrderTypeId);
                                //alert('custTargetOrderTypeId'+custTargetOrderTypeId);

                                if (custShopifyOrderTypeId != '') {
                                    var jsonObj = {
                                        "custId": customer,
                                        "custOrderTypeValue": custOrderTypeId,
                                        "itemId": itemId,
                                        "custOrderItemType": custShopifyOrderTypeId
                                    }

                                    var unitVal = listCustomUnitType(jsonObj);

                                    currentRecord.setCurrentSublistValue({ sublistId: 'item', fieldId: 'units', value: unitVal });
                                    // alert(unitVal);
                                }
                            }
                        }



                    }

                }
                return true;
            } catch (err) {
                console.log(err.message);
            }
        }

        function listCustomUnitType(dataObj) {

            var title = 'listCustomUnitType';
            var unitType = "";

            try {
                log.debug({ title: title, details: { dataObj: dataObj } });

                if (dataObj) {

                    var unitSearchObj = search.create({
                        type: 'customrecord_fst_unit_assignment',
                        filters: [
                            ['isinactive', 'is', 'F'],
                            'AND',
                            ['custrecord_fst_order_type', 'anyof', dataObj.custOrderTypeValue],
                            'AND',
                            ['custrecord_fst_pri_type', 'anyof', dataObj.custOrderItemType]
                        ],
                        columns:
                            [
                                search.createColumn({ name: 'internalid' }),
                                search.createColumn({ name: 'custrecord_fst_unit_type_value' })
                            ]
                    });
                    var searchResultCount = unitSearchObj.runPaged().count;
                    log.debug("unitSearchObj result count", searchResultCount);
                    unitSearchObj.run().each(function (result) {
                        // .run().each has a limit of 4,000 results
                        unitType = result.getValue({ name: 'custrecord_fst_unit_type_value' });
                        //return true;
                        return false;
                    });
                }
                return unitType;

            } catch (err) {
                log.error({ title: 'error unittypefunction', details: JSON.stringify(err) });
                return unitType;
            }
        }

        function checkAndUpdateSublistUnit(currentRecord, line) {
            var isShopifyCustomer = (customer === 'custscript_fst_shopify_script'); // Replace with the actual Shopify customer ID
            log.debug({ title: 'customer', details: customer });

            var customField = currentRecord.getValue({ fieldId: 'custentity_fst_order_type' });
            var isShopifyCustomField = (customField === 'Shopify');

            if (isShopifyCustomer && isShopifyCustomField) {
                var item = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: line
                });

                // Call a function to check and set the Sublist Unit to 'CT'
                setSublistUnitToCT(currentRecord, item, line);
            }
        }

        function setSublistUnitToCT(currentRecord, itemId, line) {
            var unitTypeShopify = getShopifyUnitType(itemId);
            log.debug({ title: 'unitTypeShopify', details: unitTypeShopify });

            if (unitTypeShopify) {
                // Fetch the primary unit type of the item on the Cash Sale
                var primaryUnitType = currentRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'units',
                    line: line
                });

                currentRecord.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'units',
                    line: i,
                    value: uom_CT
                });

                if (primaryUnitType === unitTypeShopify) {
                    // If primary unit type matches Shopify unit type, set Sublist Unit to 'CT'
                    currentRecord.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'units',
                        line: line,
                        value: 'CT'
                    });
                }
            }
        }

        function getShopifyUnitType(itemId) {
            // Fetch Shopify unit type from the item record
            var unitTypeSearch = search.create({
                type: search.Type.ITEM,
                filters: [
                    search.createFilter({
                        name: 'internalid',
                        operator: search.Operator.ANYOF,
                        values: [itemId]
                    })
                ],
                columns: ['unitstype']
            });

            var results = unitTypeSearch.run().getRange({ start: 0, end: 1 });

            if (results.length > 0) {
                return results[0].getValue({ name: 'unitstype' });
            }

            return null;

        }

        return {
            //   fieldChanged: fieldChanged,
            validateLine: validateLine,
        };

    });
