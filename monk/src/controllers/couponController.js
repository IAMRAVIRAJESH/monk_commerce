const { Sequelize, Op } = require('sequelize');
const { CouponSchema } = require('../models/couponModel');

class CouponController {
  async createCoupon(req) {
    try {
      const newCoupon = await CouponSchema.create(req.body);
      return newCoupon;
    } catch (error) {
      throw new Error('Cannot create coupon', error.message);
    }
  };

  async findAllCoupons() {
    try {
      const coupons = await CouponSchema.findAll();
      return coupons;
    } catch (error) {
      throw new Error('Cannot fetch coupons', error.message);
    }
  };

  async findCouponById(req) {
    try {
      const coupon = await CouponSchema.findByPk(req.params.id);
      if (!coupon) {
        throw new Error();
      }
      return coupon;
    } catch (error) {
      throw new Error('Cannot fetch coupon', error.message);
    }
  };

  async updateCoupon(req) {
    try {
      const form = req.body;
      const id = req.params.id;

      const oldCoupon = await CouponSchema.findByPk(id);
      if (!oldCoupon) {
        throw new Error('Coupon not found');
      }

      const type = form.type || oldCoupon.type;
      const discount_details = form.discount_details || oldCoupon.discount_details;
      const conditions = form.conditions || oldCoupon.conditions;
      const updatedValue = {
        type,
        discount_details,
        conditions
      }
      const [updated] = await CouponSchema.update(updatedValue, {
        where: { id: id }
      });
      if (updated) {
        const updatedCoupon = await CouponSchema.findByPk(id);
        return updatedCoupon;
      }
    } catch (error) {
      throw new Error('Cannot update coupon', error.message);
    }
  };

  async deleteCoupon(req) {
    try {
      const deleted = await CouponSchema.destroy({
        where: { id: req.params.id }
      });
      if (deleted) {
        return { message: 'Coupon deleted successfully' };
      }
      throw new Error();
    } catch (error) {
      throw new Error('Cannot delete coupon', error.message);
    }
  };

  async getApplicableCoupons(req) {
    try {
      const form = req.body;
      let priceCoupon = 0;
      let id = [];
      for (const item of form.cart.items) {
        priceCoupon += item.price;
        id.push(item.productId);
      }

      const applicableCoupons = await CouponSchema.findAll({
        where: {
          [Op.or]: [
            {
              conditioning: {
                minCartValue: { [Op.lte]: priceCoupon },
              },
            },
            Sequelize.literal(`JSON_CONTAINS(conditioning->'$.productIds', CAST(:id AS JSON))`),
            Sequelize.literal(`JSON_CONTAINS(discount_details->'$.buyIds', CAST(:id AS JSON))`),
          ],
        },
        replacements: { id: JSON.stringify(id) },
      });

      const couponDiscounts = applicableCoupons.map(coupon => {
        let discountAmount = 0;
        if (coupon.type == 'cart-wise') {
          discountAmount = priceCoupon * (coupon.discount_details.value / 100);
          discountAmount = Math.min(discountAmount, coupon.discount_details.discountAmountMax);
        } else if (coupon.type == 'product-wise') {
          let curr = 0;
          for (const item of form.cart.items) {
            if (item.productId in coupon.conditioning.productIds)
              curr += item.price;
          }
          discountAmount = curr * (coupon.discount_details.value / 100);
          discountAmount = Math.min(discountAmount, coupon.discount_details.discountAmountMax);
        } else {
          let curr = 0;
          let buyCount = 0;
          let getCount = 0;
          let freeItemsAvailable = 0;
          let discountAmount = 0;

          for (const item of form.cart.items) {
            if (coupon.discount_details.buyIds.includes(item.productId)) {
              buyCount += 1;
            }
          }

          freeItemsAvailable = Math.min(Math.floor(buyCount / coupon.conditioning.buy), coupon.discount_details.maxRedemption);

          buyCount = 0;
          getCount = 0;

          for (const item of form.cart.items) {
            if (coupon.discount_details.buyIds.includes(item.productId)) {
              buyCount += 1;
            }

            if (coupon.discount_details.getIds.includes(item.productId)) {
              if (freeItemsAvailable > 0 && getCount < freeItemsAvailable) {
                getCount += 1;
                curr += item.price;
              }
            }
          }

          if (buyCount >= coupon.conditioning.buy) {
            discountAmount = priceCoupon - curr;
          }
        }
        return {
          couponId: coupon.id,
          couponType: coupon.type,
          discount: discountAmount.toFixed(2)
        };
      });

      return couponDiscounts;
    } catch (error) {
      throw new Error('Cannot fetch applicable coupons', error.message);
    }
  };

  async applyCoupon(req) {
    try {
      const coupon = await CouponSchema.findByPk(parseInt(req.params.id));
      const form = req.body;

      if (!coupon || !coupon.isActive) {
        throw new Error();
      }

      let priceCoupon = 0;
      let id = [];
      for (const item of form.cart.items) {
        priceCoupon += item.price;
        id.push(item.productId);
      }

      let discountAmount = 0;
      if (coupon.type == 'cart-wise') {
        discountAmount = priceCoupon * (coupon.discount_details.value / 100);
        discountAmount = Math.min(discountAmount, coupon.discount_details.discountAmountMax);
      } else if (coupon.type == 'product-wise') {
        let curr = 0;
        for (const item of form.cart.items) {
          if (item.productId in coupon.conditioning.productIds)
            curr += item.price;
        }
        discountAmount = curr * (coupon.discount_details.value / 100);
        discountAmount = Math.min(discountAmount, coupon.discount_details.discountAmountMax);
      } else {
        let curr = 0;
        let buyCount = 0;
        let getCount = 0;
        let freeItemsAvailable = 0;

        for (const item of form.cart.items) {
          if (coupon.discount_details.buyIds.includes(item.productId)) {
            buyCount += 1;
          }
        }

        freeItemsAvailable = Math.min(Math.floor(buyCount / coupon.conditioning.buy), coupon.discount_details.maxRedemption);

        buyCount = 0;
        getCount = 0;

        for (const item of form.cart.items) {
          if (coupon.discount_details.buyIds.includes(item.productId)) {
            buyCount += 1;
          }

          if (coupon.discount_details.getIds.includes(item.productId)) {
            if (freeItemsAvailable > 0 && getCount < freeItemsAvailable) {
              getCount += 1;
              curr += item.price;
            }
          }
        }

        if (buyCount >= coupon.conditioning.buy) {
          discountAmount = priceCoupon - curr;
        }
      }

      return {
        couponId: coupon.id,
        couponType: coupon.type,
        discount: discountAmount.toFixed(2)
      };
    } catch (error) {
      throw new Error('Cannot apply coupon', error.message);
    }
  };
}

module.exports = CouponController;