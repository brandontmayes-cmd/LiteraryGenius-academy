# 🎯 How to Get Your Stripe Price IDs

## ⚠️ Important: Product ID vs Price ID

You provided **Product IDs** (starting with `prod_`), but the checkout system needs **Price IDs** (starting with `price_`).

### Your Products:
- **Basic ($19/month)**: `prod_TBlPB9UVSCIavx`
- **Premium ($29/month)**: `prod_TBlSyBBfJEVC27`
- **Enterprise ($49/month)**: `prod_TBlUmM1i05qqBF`

---

## 📋 Step-by-Step: Get Price IDs

### For Basic Plan ($19):
1. Go to https://dashboard.stripe.com/products/prod_TBlPB9UVSCIavx
2. Scroll to **Pricing** section
3. Find the **$19.00/month** price
4. Click on it or look for the ID starting with `price_`
5. **Copy the Price ID** (e.g., `price_1ABC123xyz...`)

### For Premium Plan ($29):
1. Go to https://dashboard.stripe.com/products/prod_TBlSyBBfJEVC27
2. Find the **$29.00/month** price
3. **Copy the Price ID**

### For Enterprise Plan ($49):
1. Go to https://dashboard.stripe.com/products/prod_TBlUmM1i05qqBF
2. Find the **$49.00/month** price
3. **Copy the Price ID**

---

## 🔧 Quick Access Links (Test Mode)

Click these direct links to view each product:

- [Basic Product](https://dashboard.stripe.com/test/products/prod_TBlPB9UVSCIavx)
- [Premium Product](https://dashboard.stripe.com/test/products/prod_TBlSyBBfJEVC27)
- [Enterprise Product](https://dashboard.stripe.com/test/products/prod_TBlUmM1i05qqBF)

---

## ✅ Once You Have the Price IDs

Reply with the three Price IDs in this format:

```
Basic: price_xxxxxxxxxxxxx
Premium: price_xxxxxxxxxxxxx
Enterprise: price_xxxxxxxxxxxxx
```

Then I'll update the code immediately!

---

## 💡 Alternative: Use Stripe CLI

If you have Stripe CLI installed:

```bash
stripe prices list --product prod_TBlPB9UVSCIavx
stripe prices list --product prod_TBlSyBBfJEVC27
stripe prices list --product prod_TBlUmM1i05qqBF
```

This will show you all Price IDs for each product.
