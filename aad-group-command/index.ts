import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createLogObject } from "../shared/createLogObject";
import { storeLogBlob } from "../shared/storeLogBlob";
import { createCallbackMessage } from "../shared/createCallbackMessage";
import { createEvent } from "../shared/createEvent";
import { storeQueueMessage } from "../shared/storeQueueMessage";

const aadGroupCommand: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const functionInvocationID = context.executionContext.invocationId;
    const functionInvocationTime = new Date();
    const functionInvocationTimestamp = functionInvocationTime.toJSON();  // format: 2012-04-23T18:25:43.511Z

    const functionName = context.executionContext.functionName;
    const functionEventType = 'WRDSB.HAGAR.AAD.Group.Command';
    const functionEventID = `hagar-functions-${functionName}-${functionInvocationID}`;
    const functionLogID = `${functionInvocationTime.getTime()}-${functionInvocationID}`;

    const logStorageAccount = process.env['storageAccount'];
    const logStorageKey = process.env['storageKey'];
    const logStorageContainer = 'function-aad-group-command-logs';

    const eventLabel = '';
    const eventTags = [
        "hagar", 
    ];

    const request = req;

    const queueStorageAccount = process.env['storageAccount'];
    const queueStorageKey = process.env['storageKey'];
    const operation = request.body.operation;
    const payload = request.body.payload;

    let result;

    switch (operation) {
        case 'create':
            result = await queueCreate(payload);
            context.log(result);
            break;
        case 'patch':
            result = await queuePatch(payload);
            context.log(result);
            break;
        case 'replace':
            result = await queueReplace(payload);
            context.log(result);
            break;
        case 'delete':
            result = await queueDelete(payload);
            context.log(result);
            break;
        default:
            break;
    }

    context.bindings.recordOut = result.newRecord;

    const logPayload = result.event;

    const logObject = await createLogObject(functionInvocationID, functionInvocationTime, functionName, logPayload);
    const logBlob = await storeLogBlob(logStorageAccount, logStorageKey, logStorageContainer, logObject);
    context.log(logBlob);

    const callbackMessage = await createCallbackMessage(logObject, 200);
    context.bindings.callbackMessage = JSON.stringify(callbackMessage);
    context.log(callbackMessage);

    const invocationEvent = await createEvent(
        functionInvocationID,
        functionInvocationTime,
        functionInvocationTimestamp,
        functionName,
        functionEventType,
        functionEventID,
        functionLogID,
        logStorageAccount,
        logStorageContainer,
        eventLabel,
        eventTags
    );
    context.bindings.flynnEvent = JSON.stringify(invocationEvent);
    context.log(invocationEvent);

    context.done(null, logBlob);


    async function queueCreate(payload) {
        const queueName = 'aad-group-create';
        const queueMessage = 'aad-group-create';

        let status = {
            code: 202,
            statusMessage: 'Success: Group created.'
        }

        const result = await storeQueueMessage(queueStorageAccount, queueStorageKey, queueName, queueMessage);
        return result;
    }

    async function queuePatch(payload) {
        const queueName = 'aad-group-update';
        const queueMessage = 'aad-group-update';

        let status = {
            code: 202,
            statusMessage: 'Success: Group patched.'
        }

        const result = await storeQueueMessage(queueStorageAccount, queueStorageKey, queueName, queueMessage);
        return result;
    }

    async function queueReplace(payload) {
        const queueName = 'add-group-update';
        const queueMessage = 'add-group-update';

        let status = {
            code: 202,
            statusMessage: 'Success: Group replaced.'
        }

        const result = await storeQueueMessage(queueStorageAccount, queueStorageKey, queueName, queueMessage);
        return result;
    }

    async function queueDelete(payload) {
        const queueName = 'aad-group-delete';
        const queueMessage = 'aad-group-delete';

        let status = {
            code: 202,
            statusMessage: 'Success: Group deleted.'
        }

        const result = await storeQueueMessage(queueStorageAccount, queueStorageKey, queueName, queueMessage);
        return result;
    }

};

export default aadGroupCommand;