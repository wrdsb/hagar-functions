import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { createLogObject } from "../shared/createLogObject";
import { storeLogBlob } from "../shared/storeLogBlob";
import { createCallbackMessage } from "../shared/createCallbackMessage";
import { createEvent } from "../shared/createEvent";

const aadGroupMemberQuery: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const functionInvocationID = context.executionContext.invocationId;
    const functionInvocationTime = new Date();
    const functionInvocationTimestamp = functionInvocationTime.toJSON();  // format: 2012-04-23T18:25:43.511Z

    const functionName = context.executionContext.functionName;
    const functionEventType = 'WRDSB.HAGAR.AAD.GroupMember.Query';
    const functionEventID = `hagar-functions-${functionName}-${functionInvocationID}`;
    const functionLogID = `${functionInvocationTime.getTime()}-${functionInvocationID}`;

    const logStorageAccount = process.env['storageAccount'];
    const logStorageKey = process.env['storageKey'];
    const logStorageContainer = 'function-aad-group-member-query-logs';

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
        case 'get':
            result = queueGet(payload);
            context.log(result);
            break;
        case 'list':
            result = queueList(payload);
            context.log(result);
            break;
        default:
            break;
    }

    const logPayload = result;

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


    function queueGet(payload) {
        const queueName = 'aad-group-member-get';
        const queueMessage = 'aad-group-member-get';

        let status = {
            code: 202,
            statusMessage: 'Success: Got group member.'
        }

        context.bindings.aadGroupMemberGet = queueMessage;
        return queueMessage;
    }

    function queueList(payload) {
        const queueName = 'aad-group-members-list';
        const queueMessage = 'aad-group-members-list';

        let status = {
            code: 202,
            statusMessage: 'Success: Listed group members.'
        }

        context.bindings.aadGroupMembersList = queueMessage;
        return queueMessage;
    }

};

export default aadGroupMemberQuery;