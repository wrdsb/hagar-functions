import {
    StorageSharedKeyCredential,
    QueueServiceClient
} from "@azure/storage-queue";

async function storeQueueMessage(storageAccount, storageKey, queueName, queueMessage)
{
    const queueSharedKeyCredential = new StorageSharedKeyCredential(storageAccount, storageKey);
    const queueServiceClient = new QueueServiceClient(
        `https://${storageAccount}.queue.core.windows.net`,
        queueSharedKeyCredential
    );
    const queueClient = queueServiceClient.getQueueClient(queueName);

    const sendMessageResponse = await queueClient.sendMessage(queueMessage);

    return sendMessageResponse;
}

export { storeQueueMessage };
