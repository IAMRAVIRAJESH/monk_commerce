const express = require('express');
const bodyParser = require('body-parser');

const { dbConnect } = require('./db');
const CouponController = require('./controllers/couponController');

const couponController = new CouponController();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

dbConnect();

app.post('/create-coupons', async (req, res) => {
  try {
    const call = await couponController.createCoupon(req);
    res.send(call);
  } catch (error) {
    console.error(error);
    return response(error.statusCode, { message: error.message });
  }
});

app.get('/find-all-coupons', async (req, res) => {
  try {
    const call = await couponController.findAllCoupons(req);
    res.send(call);
  } catch (error) {
    console.error(error);
    return response(error.statusCode, { message: error.message });
  }
});

app.get('/coupons/:id', async (req, res) => {
  try {
    const call = await couponController.findCouponById(req);
    res.send(call);
  } catch (error) {
    console.error(error);
    return response(error.statusCode, { message: error.message });
  }
});

app.put('/update-coupon/:id', async (req, res) => {
  try {
    const call = await couponController.updateCoupon(req);
    res.send(call);
  } catch (error) {
    console.error(error);
    return response(error.statusCode, { message: error.message });
  }
});

app.delete('/delete/:id', async (req, res) => {
  try {
    const call = await couponController.deleteCoupon(req);
    res.send(call);
  } catch (error) {
    console.error(error);
    return response(error.statusCode, { message: error.message });
  }
});

app.post('/applicable-coupons', async (req, res) => {
  try {
    const call = await couponController.getApplicableCoupons(req);
    res.send(call);
  } catch (error) {
    console.error(error);
    return response(error.statusCode, { message: error.message });
  }
});

app.post('/apply-coupon/:id', async (req, res) => {
  try {
    const call = await couponController.applyCoupon(req);
    res.send(call);
  } catch (error) {
    console.error(error);
    return response(error.statusCode, { message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;