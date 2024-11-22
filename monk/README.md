# monk_commerce
Setting up database - 
I have deployed local db using mysql workbench, I have added all the configurations needed in the .env file you can setup local db from that configuration and use the data that I have provided in the data.sql file to test the application.

To run this application-
move inside monk directory
Run npm i
Run npm start

APIs-
I have added postman request file to this project which contains all teh APIs with sample request, you can import, edit and test APIs from there.

In this assignment I have covered all the conditions asked, apart from that I have added some conditions.
Implemented cases (not mentioned in the assignment)
I have added isActive column to check whether coupon is active or expired.
I have added code column so the end user can directly use that code on checkout page.
For any coupon I have added 3 things in the discount_details column, namely - type, value and max discount that can be applied on the whole cart.

Unimplemented cases (not mentioned in the assignment (with limitations and assumptions))
We can also add a expiry date column of timestamp, so on a fixe date it will expire automatically.
We can partner with debit/credit card and paylater providers, and give discount coupons on using certain payment methods, and in return we can charge from those payment method providers.
We can also add discount coupons for our loyal customers by offering them extra discount once in a while.
Coupons can be also be applied to any customer, city or state depending on thier loyalty or interest in our product.
We can give coupons to customers according to their regional festivals too, as everyone spend a lot in shopping on festivals no matter rich or poor.
Coupons can also be given to customers who have signed up but not using our product that much, means they show up once in a while to keep thier interest in our product.
Coupons can be given in parts, like 25% on 1st 2 orders and 50% on 3rd order.
There should be small coupons on daily basis, kind of deal of the day, these will keep the customers interest in our product.
However in giving away the coupons we have to be very careful to which set of customer we are targetting, is giving away the coupons even worth it.
Coupons should be given in such a way that the seller also contributes to part of it.