import { NextFunction, Request, Response } from 'express'
import Stripe from 'stripe'
import { Plan } from '../models/Plan'
import { planToPriceId, priceIdToPlan } from '../models/PlanInfo'
import { SubscriptionStatus } from '../models/SubscriptionStatus'
import { UserType } from '../models/User'
import {
  findOrganizationByIdOrFail,
  updateOrganizationByIdOrFail,
  updateSubscriptionStatus,
} from './organizationController'

const stripe = new Stripe(process.env.STRIPE_API_KEY ?? '', {
  apiVersion: '2020-08-27',
})

export const postCheckoutPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const organizationId: string = req.params.organizationId
  const plan: Plan = req.body.plan
  const successUrl: string = req.body.successUrl
  const cancelUrl: Plan = req.body.cancelUrl

  try {
    if (!user.customerId) {
      throw new Error('User does not have a customer ID')
    }

    const { data } = await stripe.subscriptions.list({
      customer: user.customerId,
      status: 'active',
    })
    const subscriptions = data.filter(
      (item) => item.metadata.organizationId === organizationId
    )

    if (subscriptions.length > 0) {
      throw new Error('Organization already has an active subscription')
    }

    const priceId = planToPriceId(plan)
    const session = await stripe.checkout.sessions.create({
      customer: user.customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          organizationId: organizationId,
        },
      },
      metadata: {
        organizationId: organizationId,
      },
    })

    const organization = await findOrganizationByIdOrFail(organizationId)
    organization.plan = plan
    organization.subscription = {
      status: SubscriptionStatus.PENDING,
    }
    await organization.save()

    res.send({
      sessionId: session.id,
    })
  } catch (err: any) {
    next(err)
  }
}

export const postRefreshPlanSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const organizationId: string = req.params.organizationId

  try {
    const organization = await findOrganizationByIdOrFail(organizationId)

    const { data } = await stripe.subscriptions.list({
      customer: user.customerId,
      status: 'active',
    })
    const subscriptions = data.filter(
      (item) => item.metadata.organizationId === organizationId
    )

    if (subscriptions.length === 0) {
      organization.plan = Plan.FREE
      organization.subscription = undefined
      await organization.save()
      res.send({
        plan: organization.plan,
        subscription: organization.subscription,
      })
      return
    }

    const subscription = subscriptions[0]
    if (subscription.status === 'canceled') {
      organization.plan = Plan.FREE
      organization.subscription = undefined
      await organization.save()
      res.send({
        plan: organization.plan,
        subscription: organization.subscription,
      })
      return
    }
    const plan = priceIdToPlan(subscription.items.data[0].price.id)
    organization.plan = plan
    if (subscription.status === 'active') {
      organization.subscription = {
        subscriptionId: subscription.id,
        status: SubscriptionStatus.PAID,
      }
    }
    if (
      subscription.status === 'incomplete' ||
      subscription.status === 'incomplete_expired' ||
      subscription.status === 'past_due' ||
      subscription.status === 'unpaid'
    ) {
      organization.subscription = {
        subscriptionId: subscription.id,
        status: SubscriptionStatus.PAYMENT_FAILED,
      }
    }
    await organization.save()
    res.send({
      plan: organization.plan,
      subscription: organization.subscription,
    })
  } catch (err: any) {
    next(err)
  }
}

export const putChangePlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const organizationId: string = req.params.organizationId
  const plan: Plan = req.body.plan

  try {
    if (!user.customerId) {
      throw new Error('User does not have a customer ID')
    }

    const organization = await findOrganizationByIdOrFail(organizationId)
    const subscriptionId = organization.subscription?.subscriptionId

    if (!subscriptionId) {
      throw new Error('Organization does not have a subscription ID')
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    await stripe.subscriptions.update(subscriptionId, {
      proration_behavior: 'create_prorations',
      items: [
        {
          id: subscription.items.data[0].id,
          price: planToPriceId(plan),
        },
      ],
    })

    organization.plan = plan
    await organization.save()

    res.status(204).send()
  } catch (err: any) {
    next(err)
  }
}

export const putCancelPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const organizationId: string = req.params.organizationId

  try {
    const organization = await findOrganizationByIdOrFail(organizationId)
    const subscriptionId = organization.subscription?.subscriptionId

    if (!subscriptionId) {
      next(new Error('Organization does not have a subscription ID'))
      return
    }

    await stripe.subscriptions.del(subscriptionId)

    organization.plan = Plan.FREE
    organization.subscription = undefined
    await organization.save()

    res.status(204).send()
  } catch (err: any) {
    next(err)
  }
}

export const postStripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const signature = req.headers['stripe-signature']

  let event: Stripe.Event | undefined = undefined
  let data: Stripe.Event.Data | undefined = undefined
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (signature && webhookSecret) {
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
    } catch (err) {
      next(err)
      return
    }
    data = event.data
  } else {
    data = req.body.data
  }

  if (!event) {
    next(new Error('Stripe event is undefined'))
    return
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const checkoutSession = data?.object as Stripe.Checkout.Session
      if (!checkoutSession) {
        next(new Error('Checkout session is undefined'))
        return
      }
      const subscriptionId = checkoutSession.subscription as string
      const organizationId = checkoutSession.metadata?.[
        'organizationId'
      ] as string
      try {
        await updateOrganizationByIdOrFail(organizationId, {
          subscription: {
            subscriptionId: subscriptionId,
            status: SubscriptionStatus.PENDING,
          },
        })
      } catch (err: any) {
        next(err)
        return
      }
      break
    }
    case 'invoice.paid': {
      const invoicePaid = data?.object as Stripe.Invoice
      if (!invoicePaid || !invoicePaid.subscription) {
        next(new Error('Invoice paid data is undefined'))
        return
      }
      const subscriptionId = invoicePaid.subscription as string
      try {
        await updateSubscriptionStatus(subscriptionId, SubscriptionStatus.PAID)
      } catch (err: any) {
        next(err)
        return
      }
      break
    }
    case 'invoice.payment_failed': {
      const invoicePaymentFailed = data?.object as Stripe.Invoice
      if (!invoicePaymentFailed || invoicePaymentFailed.subscription) {
        next(new Error('Invoice payment failed data id undefined'))
        return
      }
      const subscriptionId = invoicePaymentFailed.subscription as string
      try {
        await updateSubscriptionStatus(
          subscriptionId,
          SubscriptionStatus.PAYMENT_FAILED
        )
      } catch (err: any) {
        next(err)
        return
      }
      break
    }
    default:
    // Unhandled event type
  }

  res.json({ received: true })
}

export const postCustomerPortal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user as UserType
  const returnUrl: string = req.body.returnUrl

  try {
    if (!user.customerId) {
      throw new Error('Stripe customer ID is undefined')
    }

    const portalsession = await stripe.billingPortal.sessions.create({
      customer: user.customerId,
      return_url: returnUrl,
    })

    res.send({
      url: portalsession.url,
    })
  } catch (err: any) {
    next(err)
  }
}
