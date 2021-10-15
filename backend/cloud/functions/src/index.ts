/* eslint-disable no-void */
import * as functions from 'firebase-functions';
import * as admin from "firebase-admin"
import {createNewEvent, createNewEventRoom, generateEventJwt} from "./events/events";
import {
    channelMembersTrigger, handleConvertEventHifiSpaceSizes, handleCreateNewChannel,
    handleJoinChannel,
    handleLeaveChannel,
    manualChannelMembersTrigger,
} from "./events/channels";
import {handleUserCreated, manualUserOfflineTrigger, userOfflineTrigger} from "./events/users";
import {handleJoinGlobalChannel, handleLeaveGlobalChannel} from "./events/globalChannels";
import {handleEnterGlobalStage, handleLeaveGlobalStage} from "./events/globalStage";
import {handleJoinEvent, handleSetEventPassword} from "./events/eventAccess";
import {handleVerifyEmailIsApprovedInSheet, testSheet} from "./events/googleSheets";
import {
    OLDprocessEventsPerMinuteUsage,
    processMinutes,
    processPendingRawEventData, processSubscriptionsAudioUsage,
    processUnprocessedAudioUsage,
} from "./scheduledTasks";
import {handleCreateUserStripeCustomerAndStoreIt} from "./stripe/customer";
import {
    handleCreateCustomerSetupIntent, handleDetachPaymentMethod,
    handleGetCustomerPaymentMethods,
    handleSetCustomerDefaultPaymentMethod,
} from "./stripe/payment";
import {handleStripeWebhook} from "./stripe/webhook";
import {
    handleCancelSubscription,
    handleCreateStripeSubscription,
    handleFetchCustomerSubscriptions,
    handleFetchSubscription,
    handleFetchSubscriptionInvoices,
    handleUndoCancelSubscription, handleUpdateSubscriptionPaymentMethod,
} from "./stripe/subscription";
import {handleAddEventToSubscription, handleDisconnectEventFromSubscription} from "./firestore/subscriptions";
import {
    handleDeleteInvitation,
    handleGenerateEmailInvitationCodes, handleRedeemInvitationCode,
    handleSendAllPendingInvites,
    handleSendInvitation,
} from "./users/invitations";
import {handleSaveEventRoomSceneryAsTemplate} from "./firestore/event";
const express = require('express');
const cookieParser = require('cookie-parser')();
const bodyParser = require('body-parser');
const cors = require('cors')({origin: true});
const app = express();

admin.initializeApp();

const validateFirebaseIdToken = async (req: any, res: any, next: any) => {

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        res.status(403).send('Unauthorized');
        return;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else if(req.cookies) {
        idToken = req.cookies.__session;
    } else {
        // No cookie
        res.status(403).send('Unauthorized');
        return;
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedIdToken;
        next();
        return;
    } catch (error) {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
        return;
    }
};

app.use(cors);
app.use(cookieParser);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validateFirebaseIdToken);

app.post('/createEventRoom', createNewEventRoom);

app.post('/createEvent', createNewEvent);

app.post('/getJwt', generateEventJwt)

app.post('/joinChannel', handleJoinChannel)

app.post('/leaveChannel', handleLeaveChannel)

app.post('/createNewChannel', handleCreateNewChannel)

app.post('/joinGlobalChannel', handleJoinGlobalChannel)
app.post('/leaveGlobalChannel', handleLeaveGlobalChannel)

app.post('/enterGlobalStage', handleEnterGlobalStage)
app.post('/leaveGlobalStage', handleLeaveGlobalStage)

app.post('/channelMembersTrigger', manualChannelMembersTrigger)
app.post('/userOfflineTrigger', manualUserOfflineTrigger)

app.post('/joinEvent', handleJoinEvent)
app.post('/setEventPassword', handleSetEventPassword)

app.post('/convertEventHifiSpaceSizes', handleConvertEventHifiSpaceSizes)

app.post('/createUserStripeCustomerAndStoreIt', handleCreateUserStripeCustomerAndStoreIt)

app.post('/getCustomerPaymentMethods', handleGetCustomerPaymentMethods)

app.post('/createStripeSubscription', handleCreateStripeSubscription)

app.post('/createCustomerSetupIntent', handleCreateCustomerSetupIntent)

app.post('/setCustomerDefaultPaymentMethod', handleSetCustomerDefaultPaymentMethod)

app.post('/fetchCustomerSubscriptions', handleFetchCustomerSubscriptions)

// app.post('/deleteCustomerCard', handleDeleteCustomerCard)

app.post('/detachPaymentMethod', handleDetachPaymentMethod)

app.post('/cancelSubscription', handleCancelSubscription)

app.post('/undoCancelSubscription', handleUndoCancelSubscription)

app.post('/fetchSubscription', handleFetchSubscription)

app.post('/fetchSubscriptionInvoices', handleFetchSubscriptionInvoices)

app.post('/updateSubscriptionPaymentMethod', handleUpdateSubscriptionPaymentMethod)

app.post('/addEventToSubscription', handleAddEventToSubscription)

app.post('/disconnectEventFromSubscription', handleDisconnectEventFromSubscription)

app.post('/generateEmailInvitationCodes', handleGenerateEmailInvitationCodes)

app.post('/deleteInvitation', handleDeleteInvitation)

app.post('/sendInvitation', handleSendInvitation)

app.post('/sendAllPendingInvites', handleSendAllPendingInvites)

app.post('/redeemInvitationCode', handleRedeemInvitationCode)

app.post('/saveEventRoomSceneryAsTemplate', handleSaveEventRoomSceneryAsTemplate)

exports.app = functions.https.onRequest(app);

exports.processEventsPerMinuteUsage = functions.https.onRequest(async (req, resp) => {
    await OLDprocessEventsPerMinuteUsage()
    resp.send(200)
});

exports.processPendingRawEventData = functions.https.onRequest(async (req, resp) => {
    await processPendingRawEventData()
    resp.send(200)
});

exports.scheduledProcessEventsPerMinuteUsage = functions.pubsub.schedule('* * * * *').onRun(async (context) => {
    await processMinutes()
    return null;
});

exports.scheduledProcessPendingRawEventData = functions.pubsub.schedule('*/5 * * * *').onRun(async (context) => {
    await processUnprocessedAudioUsage()
    return null;
});

exports.scheduledProcessPendingRawEventData = functions.pubsub.schedule('*/20 * * * *').onRun(async (context) => {
    await processSubscriptionsAudioUsage()
    return null;
});

exports.testSheet = functions.https.onRequest(testSheet);
exports.verifyEmailIsApprovedInSheet = functions.https.onRequest(handleVerifyEmailIsApprovedInSheet);

exports.stripeWebhook = functions.https.onRequest(handleStripeWebhook);

exports.channelMembersTrigger = channelMembersTrigger
exports.userOfflineTrigger = userOfflineTrigger

exports.userCreated = functions.auth.user().onCreate((user) => {
    void handleUserCreated(user)
});