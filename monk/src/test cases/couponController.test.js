const { CouponSchema } = require('../models/couponModel');
const CouponController = require('../controllers/couponController');

describe('createCoupon', () => {
  let req;
  let couponController;

  beforeEach(() => {
    couponController = new CouponController();
    req = {
      body: {
        type: 'cart-wise',
        discount_details: '{"type": "percentage", "value": 10, "discountAmountMax": "50"}',
        conditioning: '{"minCartValue": 100}',
        isActive: true,
        code: 'CART100',
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create a new coupon', async () => {
    const mockCoupon = {
      id: 1,
      ...req.body,
      createdAt: '2024-11-22T00:00:00.000Z',
      updatedAt: '2024-11-22T00:00:00.000Z',
    };

    CouponSchema.create = jest.fn().mockResolvedValueOnce(mockCoupon);

    const result = await couponController.createCoupon(req);

    expect(CouponSchema.create).toHaveBeenCalledWith(req.body);
    expect(result).toEqual(mockCoupon);
  });

  it('should throw an error when creation fails', async () => {
    const mockError = new Error('Database error');
    CouponSchema.create = jest.fn().mockRejectedValueOnce(mockError);

    await expect(couponController.createCoupon(req)).rejects.toThrow('Cannot create coupon');
    expect(CouponSchema.create).toHaveBeenCalledWith(req.body);
  });

  it('should handle validation errors gracefully', async () => {
    const mockValidationError = new Error('Validation failed: type is required');
    CouponSchema.create = jest.fn().mockRejectedValueOnce(mockValidationError);

    await expect(couponController.createCoupon(req)).rejects.toThrow('Cannot create coupon');
    expect(CouponSchema.create).toHaveBeenCalledWith(req.body);
  });
});


describe('findAllCoupons', () => {
  let req;
  let couponController;

  beforeEach(() => {
    couponController = new CouponController();
    req = { body: {}, serviceContext: {} };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of all coupons', async () => {
    const mockCoupons = [
      { id: 1, type: 'cart-wise', discount_details: { value: 10 }, isActive: true },
      { id: 2, type: 'product-wise', discount_details: { value: 20 }, isActive: true }
    ];
    CouponSchema.findAll = jest.fn().mockResolvedValueOnce(mockCoupons);

    const result = await couponController.findAllCoupons(req);

    expect(CouponSchema.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockCoupons);
  });

  it('should throw an error if coupons cannot be fetched', async () => {
    CouponSchema.findAll = jest.fn().mockRejectedValueOnce(new Error('Database error'));

    await expect(couponController.findAllCoupons(req)).rejects.toThrow('Cannot fetch coupons');
  });
});


describe('findCouponById', () => {
  let req;
  let couponController;

  beforeEach(() => {
    couponController = new CouponController();
    req = { params: { id: 1 }, body: {}, serviceContext: {} };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a coupon by ID', async () => {
    const mockCoupon = { id: 1, type: 'cart-wise', discount_details: { value: 10 }, isActive: true };
    CouponSchema.findByPk = jest.fn().mockResolvedValueOnce(mockCoupon);

    const result = await couponController.findCouponById(req);

    expect(CouponSchema.findByPk).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockCoupon);
  });

  it('should throw an error if coupon not found', async () => {
    CouponSchema.findByPk = jest.fn().mockResolvedValueOnce(null);

    await expect(couponController.findCouponById(req)).rejects.toThrow('Cannot fetch coupon');
  });

  it('should throw an error if there is a problem fetching the coupon', async () => {
    CouponSchema.findByPk = jest.fn().mockRejectedValueOnce(new Error('Database error'));

    await expect(couponController.findCouponById(req)).rejects.toThrow('Cannot fetch coupon');
  });
});

describe('updateCoupon', () => {
  let req;
  let couponController;

  beforeEach(() => {
    couponController = new CouponController();
    req = {
      params: { id: 1 },
      body: { type: 'product-wise', discount_details: { value: 15 }, conditions: { minCartValue: 100 } },
      serviceContext: {}
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update and return the updated coupon', async () => {
    const mockOldCoupon = { id: 1, type: 'cart-wise', discount_details: { value: 10 }, conditions: {} };
    const mockUpdatedCoupon = { id: 1, type: 'product-wise', discount_details: { value: 15 }, conditions: { minCartValue: 100 } };

    CouponSchema.findByPk = jest.fn().mockResolvedValueOnce(mockOldCoupon).mockResolvedValueOnce(mockUpdatedCoupon);
    CouponSchema.update = jest.fn().mockResolvedValueOnce([1]);

    const result = await couponController.updateCoupon(req);

    expect(CouponSchema.findByPk).toHaveBeenCalledWith(1);
    expect(CouponSchema.update).toHaveBeenCalledWith(
      { type: 'product-wise', discount_details: { value: 15 }, conditions: { minCartValue: 100 } },
      { where: { id: 1 } }
    );
    expect(result).toEqual(mockUpdatedCoupon);
  });

  it('should throw an error if coupon not found for update', async () => {
    CouponSchema.findByPk = jest.fn().mockResolvedValueOnce(null);

    await expect(couponController.updateCoupon(req)).rejects.toThrow('Cannot update coupon');
  });
});


describe('deleteCoupon', () => {
  let req;
  let couponController;

  beforeEach(() => {
    couponController = new CouponController();
    req = { params: { id: 1 }, body: {}, serviceContext: {} };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a coupon and return success message', async () => {
    CouponSchema.destroy = jest.fn().mockResolvedValueOnce(1);

    const result = await couponController.deleteCoupon(req);

    expect(CouponSchema.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual({ message: 'Coupon deleted successfully' });
  });

  it('should throw an error if coupon not found for deletion', async () => {
    CouponSchema.destroy = jest.fn().mockResolvedValueOnce(0);

    await expect(couponController.deleteCoupon(req)).rejects.toThrow('Cannot delete coupon');
  });

  it('should throw an error if there is a problem deleting the coupon', async () => {
    CouponSchema.destroy = jest.fn().mockRejectedValueOnce(new Error('Database error'));

    await expect(couponController.deleteCoupon(req)).rejects.toThrow('Cannot delete coupon');
  });
});


describe('getApplicableCoupons', () => {
  let req;
  let couponController;

  beforeEach(() => {
    couponController = new CouponController();
    req = {
      body: {
        cart: { items: [{ price: 100, productId: 1 }] }
      },
      serviceContext: {}
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return applicable coupons with discounts', async () => {
    const mockCoupons = [
      {
        id: 1,
        type: 'cart-wise',
        discount_details: { value: 10, discountAmountMax: 20 },
        conditioning: { minCartValue: 50 },
        isActive: true
      }
    ];

    CouponSchema.findAll = jest.fn().mockResolvedValueOnce(mockCoupons);

    const result = await couponController.getApplicableCoupons(req);

    expect(CouponSchema.findAll).toHaveBeenCalled();
    expect(result).toEqual([
      { couponId: 1, couponType: 'cart-wise', discount: '10.00' }
    ]);
  });

  it('should throw an error if applicable coupons cannot be fetched', async () => {
    CouponSchema.findAll = jest.fn().mockRejectedValueOnce(new Error('Database error'));

    await expect(couponController.getApplicableCoupons(req)).rejects.toThrow('Cannot fetch applicable coupons');
  });
});

describe('applyCoupon', () => {
  let req;
  let couponController;

  beforeEach(() => {
    couponController = new CouponController();
    req = {
      params: { id: 1 },
      body: {
        cart: { items: [{ price: 100, productId: 1 }] }
      },
      serviceContext: {}
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should apply the coupon and return the discount', async () => {
    const mockCoupon = {
      id: 1,
      type: 'cart-wise',
      discount_details: { value: 10, discountAmountMax: 20 },
      isActive: true
    };

    CouponSchema.findByPk = jest.fn().mockResolvedValueOnce(mockCoupon);

    const result = await couponController.applyCoupon(req);

    expect(CouponSchema.findByPk).toHaveBeenCalledWith(1);
    expect(result).toEqual({ couponId: 1, couponType: 'cart-wise', discount: '10.00' });
  });

  it('should throw an error if coupon is invalid or inactive', async () => {
    const mockCoupon = {
      id: 1,
      type: 'cart-wise',
      discount_details: { value: 10, discountAmountMax: 20 },
      isActive: false
    };

    CouponSchema.findByPk = jest.fn().mockResolvedValueOnce(mockCoupon);

    await expect(couponController.applyCoupon(req)).rejects.toThrow('Cannot apply coupon');
  });

  it('should throw an error if coupon is not found', async () => {
    CouponSchema.findByPk = jest.fn().mockResolvedValueOnce(null);

    await expect(couponController.applyCoupon(req)).rejects.toThrow('Cannot apply coupon');
  });

  it('should throw an error if there is an issue applying the coupon', async () => {
    CouponSchema.findByPk = jest.fn().mockRejectedValueOnce(new Error('Database error'));

    await expect(couponController.applyCoupon(req)).rejects.toThrow('Cannot apply coupon');
  });

  it('should apply a product-wise coupon and return the discount', async () => {
    const mockCoupon = {
      id: 2,
      type: 'product-wise',
      discount_details: { value: 20, discountAmountMax: 30 },
      isActive: true,
      conditioning: { productIds: [1] }
    };

    CouponSchema.findByPk = jest.fn().mockResolvedValueOnce(mockCoupon);

    const result = await couponController.applyCoupon(req);

    expect(CouponSchema.findByPk).toHaveBeenCalledWith(1);
    expect(result).toEqual({ couponId: 2, couponType: 'product-wise', discount: '0.00' });
  });

  it('should apply a buy-x-get-y coupon and return the discount', async () => {
    const mockCoupon = {
      id: 3,
      type: 'buy-x-get-y',
      discount_details: { buyIds: [1], getIds: [2], value: 0, maxRedemption: 3 },
      isActive: true,
      conditioning: { buy: 1, productIds: [1] }
    };

    req.body.cart.items = [
      { price: 100, productId: 1 },
      { price: 200, productId: 2 },
      { price: 300, productId: 2 }
    ];

    CouponSchema.findByPk = jest.fn().mockResolvedValueOnce(mockCoupon);

    const result = await couponController.applyCoupon(req);

    expect(CouponSchema.findByPk).toHaveBeenCalledWith(1);
    expect(result).toEqual({ couponId: 3, couponType: 'buy-x-get-y', discount: '400.00' });
  });
});
