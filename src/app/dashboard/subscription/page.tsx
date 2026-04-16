import { getSubscriptionPlansAction } from "../../actions/subscription";
import SubscriptionManager from "./SubscriptionManager";

export default async function SubscriptionPage() {
  const plansRes = await getSubscriptionPlansAction();
  const plans = Array.isArray(plansRes?.data) ? plansRes.data : [];

  return <SubscriptionManager plans={plans} />;
}
