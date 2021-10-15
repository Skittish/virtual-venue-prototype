// import {stripe} from "./stripe";
//
// export const fetchStripePrice = async () => {
//
//     const price = await stripe.prices.retrieve('price_1J7vSKC6vzEP3KZcaEJnBAlD')
//
//     console.log('price', JSON.stringify(price))
//
// }
//
// // const example = {
// //     "id": "price_1J7vSKC6vzEP3KZcaEJnBAlD",
// //     "object": "price",
// //     "active": true,
// //     "billing_scheme": "tiered",
// //     "created": 1625028924,
// //     "currency": "usd",
// //     "livemode": false,
// //     "lookup_key": null,
// //     "metadata": {},
// //     "nickname": null,
// //     "product": "prod_JjBsq1GL2zECbd",
// //     "recurring": {
// //         "aggregate_usage": "sum",
// //         "interval": "month",
// //         "interval_count": 1,
// //         "trial_period_days": null,
// //         "usage_type": "metered",
// //     },
// //     "tiers_mode": "graduated",
// //     "transform_quantity": null,
// //     "type": "recurring",
// //     "unit_amount": null,
// //     "unit_amount_decimal": null,
// // }
//
//
// export const createStripeCommunityPrice = async () => {
//     console.log('createStripeCommunityPrice')
//
//     const price = await stripe.prices.create({
//         nickname: 'Community Plan Pricing',
//         product: 'prod_JjBsq1GL2zECbd',
//         currency: 'usd',
//         recurring: {
//             interval: 'month',
//             usage_type: 'metered',
//         },
//         billing_scheme: 'tiered',
//         tiers_mode: 'graduated',
//         tiers: [
//             {
//                 flat_amount: 20,
//                 up_to: 50,
//             }, {
//                 unit_amount: 0.5,
//                 up_to: 'inf',
//             },
//         ],
//         transform_quantity: {
//           divide_by: 60,
//           round: 'up',
//         },
//         expand: ['tiers'],
//     });
//
//     console.log('price', JSON.stringify(price))
//
//
// }