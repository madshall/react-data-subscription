import { createConfig, createDataSubscription } from "react-data-subscription";

const config = createConfig();
export const { withDataSubscription, dataSubscriptionRequest } = createDataSubscription(config);